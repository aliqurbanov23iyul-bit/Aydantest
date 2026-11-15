import { z } from "zod";
import { getUser } from "@/lib/user";
import { finishExam, withExamLock } from "@/lib/exams";
import { matches, type Snapshot } from "@/lib/exam-rules";

const change = z.discriminatedUnion("action",[
  z.object({action:z.literal("finish")}),
  z.object({action:z.literal("answer"), item:z.string(), value:z.string().trim().max(400).nullable()}),
  z.object({action:z.literal("mark"), item:z.string(), value:z.boolean()}),
]);
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  const user = await getUser();
  if (!user) return Response.json({error:"Giriş yapın."},{status:401});
  const {id}=await params;
  const input=change.safeParse(await request.json().catch(()=>null));
  if (!input.success) return Response.json({error:"Geçersiz işlem."},{status:400});
  const data=input.data;
  try {
    const result=await withExamLock(user.id,id,async tx=>{
      const exam=await tx.exam.findUniqueOrThrow({where:{id}});
      if (exam.status==="COMPLETE") return {finished:true};
      if (exam.status!=="ACTIVE") throw new Error("Sınav hazır değil.");
      if (data.action==="finish" || (exam.expiresAt && +exam.expiresAt<=Date.now())) {
        await finishExam(tx,id);
        return {finished:true};
      }
      const item=await tx.examQuestion.findFirst({where:{id:data.item,examId:id}});
      if (!item) throw new Error("Soru bulunamadı.");
      if (data.action==="mark") {
        await tx.examQuestion.update({where:{id:item.id},data:{marked:data.value}});
        return {marked:data.value};
      }
      if (item.locked) throw new Error("Bu sorunun cevabı kilitlendi.");
      const snapshot=item.snapshot as unknown as Snapshot;
      const value=data.value || null;
      if (value && snapshot.kind!=="fill" && !snapshot.options.includes(value)) throw new Error("Geçersiz seçenek.");
      const reveal=exam.mode==="learn" && value!==null;
      const correct=reveal && matches(value,snapshot.answer);
      await tx.examQuestion.update({where:{id:item.id},data:{response:value,locked:reveal,correct:reveal?correct:null}});
      return {response:value,reveal:reveal?{correct,answer:snapshot.answer,explanation:snapshot.explanation}:null};
    });
    return Response.json(result);
  } catch(error) {
    return Response.json({error:error instanceof Error && !("code" in error) ? error.message : "Sınav güncellenemedi."},{status:422});
  }
}
