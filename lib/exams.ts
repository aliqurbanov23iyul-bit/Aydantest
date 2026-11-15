import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { chargeAI, gemini } from "@/lib/gemini";
import { checkArithmetic, distribute, kinds, levels, matches, normalize, questionData, shuffled, type ExamConfig, type QuestionData, type Snapshot } from "@/lib/exam-rules";

export async function createExam(userId:string, config:ExamConfig) {
  const key = { userId, requestId:config.requestId };
  const existing = await db.exam.findUnique({where:{userId_requestId:key}});
  if (existing?.status === "GENERATING") throw new Error("Bu test zaten hazırlanıyor. İşlem yarım kaldıysa yeni bir test oluşturun.");
  if (existing?.status === "FAILED") throw new Error("Yeni bir test isteği başlatın.");
  if (existing) return existing.id;
  const courses = await db.course.findMany({where:{id:{in:config.courseIds}},include:{topics:true}});
  if (courses.length !== config.courseIds.length) throw new Error("Geçersiz ders seçimi.");
  const material = config.materialId && await db.studyMaterial.findFirst({where:{id:config.materialId,userId}});
  if (config.materialId && (!material || config.source !== "AI" || courses.length !== 1 || courses[0].id !== material.courseId)) {
    throw new Error("Ders notu için ilgili tek dersi ve Yapay Zekâ kaynağını seçin.");
  }

  const history = await db.examQuestion.findMany({
    where:{exam:{userId,status:"COMPLETE"},question:{courseId:{in:config.courseIds}}},
    select:{question:{select:{topicId:true,prompt:true}},correct:true,response:true},
    orderBy:{exam:{completedAt:"desc"}},take:2000,
  });
  const seen = new Set(history.map(item => normalize(item.question.prompt)));
  const wrong = new Set(history.filter(item => item.correct===false && item.response).map(item=>item.question.topicId));
  const studied = new Set(history.filter(item => item.response).map(item=>item.question.topicId));
  const quota = config.distribution ?? distribute(config.courseIds,config.count);
  const order = config.courseIds.map(id => courses.find(course=>course.id===id)!);
  const selectedCourses = order.map(course => ({
    ...course,
    topics:course.topics.filter(topic => {
      if (config.topicMode==="selected") return config.topicIds.includes(topic.id);
      if (config.topicMode==="wrong" || config.mode==="retry") return wrong.has(topic.id);
      if (config.topicMode==="new") return !studied.has(topic.id);
      return true;
    }),
  }));
  if (selectedCourses.some(course=>!course.topics.length)) throw new Error("Her seçili ders için uygun en az bir konu gerekli.");
  if (config.source==="AI" && !process.env.GEMINI_API_KEY) throw new Error("Gemini anahtarı eksik. Soru Bankası kaynağını seçebilir veya GEMINI_API_KEY ekleyebilirsiniz.");
  let exam;
  try {
    exam = await db.exam.create({data:{...key,mode:config.mode,source:config.source,configuration:config}});
  } catch(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code==="P2002") throw new Error("Bu istek zaten gönderildi.");
    throw error;
  }
  try {
    const deadline = Date.now()+255000;
    if (config.source==="AI") await chargeAI(userId, config.count);
    const generated: { existingId?:string; snapshot:Snapshot }[] = [];
    const current = new Set<string>();
    for (const course of selectedCourses) {
      const count = quota[course.id];
      const topics = course.topics.map(({id,name})=>({id,name}));
      const save = (question:QuestionData, origin:string, existingId?:string) => {
        const topic = topics.find(topic=>topic.id===question.topicId)!;
        current.add(normalize(question.prompt));
        generated.push({existingId,snapshot:{...question,courseId:course.id,course:course.name,topic:topic.name,origin}});
      };
      if (config.source==="BANK") {
        const bank = await db.question.findMany({where:{
          courseId:course.id, topicId:{in:topics.map(topic=>topic.id)}, active:true, ownerId:null, origin:"BANK",
          ...(config.kind==="mixed"?{}:{kind:config.kind}), ...(config.difficulty==="mixed"?{}:{difficulty:config.difficulty}),
        }});
        const ordered = shuffled(bank).sort((a,b)=> config.avoidRepeats ? Number(seen.has(normalize(a.prompt)))-Number(seen.has(normalize(b.prompt))) : 0);
        if (ordered.length<count) throw new Error(course.name + " için " + ordered.length + " uygun banka sorusu var. Soru sayısını azaltın veya filtreleri genişletin.");
        for (const question of ordered.slice(0,count)) save(questionData.parse(question),"BANK",question.id);
        continue;
      }
      const batches = Array.from({length:Math.ceil(count/8)},(_,index)=>Math.min(8,count-index*8));
      for (const batch of batches) {
        let remaining = batch;
        let lastError:unknown;
        for (let attempt=0; attempt<3 && remaining; attempt++) {
          try {
            const pages = material ? material.content as {page:number;text:string}[] : [];
            if (Date.now() >= deadline) throw new Error("Test oluşturma süresi doldu. Daha az soruyla tekrar deneyin.");
            const raw = await gemini(JSON.stringify({
              görev:"Belirtilen sayıda Türkçe soru üret. Yalnızca JSON dizisi döndür. Her nesnede topicId, kind, difficulty, prompt, options, answer, explanation, source alanları olsun. Doğru cevap şık metniyle birebir eşleşsin. Boolean şıkları Doğru ve Yanlış olsun. Boşluk doldurma için options boş. Kaynak verilmişse yalnız kaynaktan soru üret ve source alanına 'Sayfa N' yaz. Aksi halde source null.",
              count:remaining, course:course.name, topics,
              kinds:config.kind==="mixed"?kinds:[config.kind], difficulties:config.difficulty==="mixed"?levels:[config.difficulty],
              avoid:[...current,...(config.avoidRepeats ? [...seen].slice(0,45) : [])].slice(-120),
              pages, prior:generated.filter(item=>item.snapshot.courseId===course.id).map(item=>({kind:item.snapshot.kind,difficulty:item.snapshot.difficulty})),
              variety:"Karma tür ve zorluk seçeneklerinde önceki soruları dikkate alarak çeşitliliği sağla.",
            }),true,Math.min(35000,deadline-Date.now()));
            const parsed:unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) continue;
            for (const input of parsed) {
              const result = questionData.safeParse(input);
              if (!result.success) continue;
              const question = result.data;
              const normalized = normalize(question.prompt);
              if (!topics.some(topic=>topic.id===question.topicId) || current.has(normalized) ||
                  (config.avoidRepeats && seen.has(normalized)) ||
                  (config.kind!=="mixed" && config.kind!==question.kind) ||
                  (config.difficulty!=="mixed" && config.difficulty!==question.difficulty) ||
                  (course.id==="matematik" && !checkArithmetic(question))) continue;
              if (material && !pages.some(page=>question.source==="Sayfa "+page.page)) continue;
              save(question,"AI");
              if (!--remaining) break;
            }
          } catch(error) { lastError=error; }
        }
        if (remaining) throw lastError instanceof Error && !(lastError instanceof SyntaxError) ? lastError : new Error("Gemini geçerli soru sayısını tamamlayamadı. Daha az soruyla tekrar deneyin.");
      }
    }
    const items = config.shuffleQuestions ? shuffled(generated) : generated;
    await db.$transaction(async tx=>{
      const created = await tx.question.createManyAndReturn({data:items.filter(item=>!item.existingId).map(({snapshot})=>({
        ownerId:userId,courseId:snapshot.courseId,topicId:snapshot.topicId,kind:snapshot.kind,difficulty:snapshot.difficulty,
        prompt:snapshot.prompt,options:snapshot.options,answer:snapshot.answer,explanation:snapshot.explanation,source:snapshot.source,origin:snapshot.origin,
      })),select:{id:true,prompt:true}});
      const ids = new Map(created.map(question=>[question.prompt,question.id]));
      await tx.examQuestion.createMany({data:items.map(({snapshot,existingId},position)=>({
        examId:exam.id,questionId:existingId ?? ids.get(snapshot.prompt)!,position,
        snapshot:{...snapshot,options:config.shuffleOptions ? shuffled(snapshot.options) : snapshot.options},
      }))});
      const startedAt = new Date();
      await tx.exam.update({where:{id:exam.id},data:{status:"ACTIVE",startedAt,expiresAt:config.mode==="timed" ? new Date(+startedAt+config.minutes*60000) : null}});
    }, {timeout:15000});
    return exam.id;
  } catch(error) {
    await db.exam.update({where:{id:exam.id},data:{status:"FAILED"}});
    throw error;
  }
}

export function withExamLock<T>(userId:string,id:string,work:(tx:Prisma.TransactionClient)=>Promise<T>) {
  return db.$transaction(async tx=>{
    const rows = await tx.$queryRaw<{id:string}[]>`SELECT id FROM "Exam" WHERE id = ${id} AND "userId" = ${userId} FOR UPDATE`;
    if (!rows.length) throw new Error("Sınav bulunamadı.");
    return work(tx);
  });
}
export async function finishExam(tx:Prisma.TransactionClient,id:string) {
  const exam = await tx.exam.findUniqueOrThrow({where:{id},include:{items:true}});
  if (exam.status!=="ACTIVE") return;
  const right:string[] = [], wrong:string[] = [], blank:string[] = [];
  for (const item of exam.items) {
    const snapshot = item.snapshot as unknown as Snapshot;
    (item.response ? matches(item.response,snapshot.answer) ? right : wrong : blank).push(item.id);
  }
  for (const [ids,correct] of [[right,true],[wrong,false],[blank,null]] as const) {
    if (ids.length) await tx.examQuestion.updateMany({where:{id:{in:ids}},data:{correct,locked:true}});
  }
  await tx.exam.update({where:{id},data:{status:"COMPLETE",completedAt:exam.expiresAt && exam.expiresAt<new Date() ? exam.expiresAt : new Date()}});
}
export async function getExam(userId:string,id:string) {
  const exam = await db.exam.findFirst({where:{id,userId},include:{items:{orderBy:{position:"asc"}}}});
  if (exam?.status==="ACTIVE" && exam.expiresAt && +exam.expiresAt<=Date.now()) {
    await withExamLock(userId,id,tx=>finishExam(tx,id));
    return db.exam.findFirst({where:{id,userId},include:{items:{orderBy:{position:"asc"}}}});
  }
  return exam;
}
