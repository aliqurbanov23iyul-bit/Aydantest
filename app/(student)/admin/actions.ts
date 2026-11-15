"use server";
import {z} from "zod";
import {revalidatePath} from "next/cache";
import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/admin";
import {checkArithmetic,questionData} from "@/lib/exam-rules";
type State={error?:string;success?:string};
const identifier=z.string().min(1).max(80);
const read=(form:FormData,key:string)=>String(form.get(key)??"").trim();

export async function adminAction(kind:"course"|"topic"|"question"|"questionState"|"report"|"limit"|"role",_previous:State,form:FormData):Promise<State>{
 const admin=await requireAdmin();
 const id=read(form,"id");
 try{
  await db.$transaction(async tx=>{
   let target=id;
   if(kind==="course"){
    const data=z.object({name:z.string().min(2).max(100),icon:z.enum(["Users","GraduationCap","Landmark","Monitor","Calculator","BookOpen","Map"]),color:z.enum(["violet","blue","rose","cyan","amber","pink","green"])}).parse({name:read(form,"name"),icon:read(form,"icon"),color:read(form,"color")});
    if(id)await tx.course.update({where:{id:identifier.parse(id)},data});
    else target=(await tx.course.create({data:{...data,id:crypto.randomUUID()}})).id;
   }
   if(kind==="topic"){
    const name=z.string().min(2).max(100).parse(read(form,"name"));
    if(id)await tx.topic.update({where:{id:identifier.parse(id)},data:{name}});
    else target=(await tx.topic.create({data:{id:crypto.randomUUID(),name,courseId:identifier.parse(read(form,"course"))}})).id;
   }
   if(kind==="question"){
    const data=questionData.parse({topicId:read(form,"topic"),kind:read(form,"kind"),difficulty:read(form,"difficulty"),prompt:read(form,"prompt"),options:read(form,"options").split(/\r?\n/).map(value=>value.trim()).filter(Boolean),answer:read(form,"answer"),explanation:read(form,"explanation"),source:read(form,"source")||null});
    const topic=await tx.topic.findUniqueOrThrow({where:{id:data.topicId}});
    if(topic.courseId==="matematik"&&!checkArithmetic(data))throw new Error("Matematik cevabı işlemle eşleşmiyor.");
    if(id)await tx.question.update({where:{id:identifier.parse(id)},data:{...data,courseId:topic.courseId}});
    else target=(await tx.question.create({data:{...data,courseId:topic.courseId,origin:"BANK"}})).id;
   }
   if(kind==="questionState"){
    await tx.question.update({where:{id:identifier.parse(id)},data:{active:read(form,"active")==="true"}});
   }
   if(kind==="report"){
    await tx.questionReport.update({where:{id:identifier.parse(id)},data:{resolved:true}});
   }
   if(kind==="limit"){
    const value=z.coerce.number().int().min(1).max(5000).parse(read(form,"limit"));
    target="dailyAi";await tx.systemSetting.upsert({where:{key:target},create:{key:target,value},update:{value}});
   }
   if(kind==="role"){
    if(id===admin.id)throw new Error("Kendi rolünüzü değiştiremezsiniz.");
    await tx.user.update({where:{id:identifier.parse(id)},data:{role:z.enum(["ADMIN","STUDENT"]).parse(read(form,"role"))}});
   }
   await tx.adminAuditLog.create({data:{actorId:admin.id,action:kind,target}});
  });
 }catch(error){return {error:error instanceof z.ZodError ? "Form bilgilerini ve seçenekleri kontrol edin." : error instanceof Error&&!("code" in error)?error.message:"İşlem tamamlanamadı. Kayıt ve ilişkileri kontrol edin."};}
 revalidatePath("/admin","layout");return {success:"Değişiklik kaydedildi."};
}
