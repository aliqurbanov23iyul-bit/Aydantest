"use server";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {db} from "@/lib/db";
import {requireUser} from "@/lib/user";
type State={error?:string;success?:string};

export async function savePlan(_previous:State,form:FormData):Promise<State>{
 const user=await requireUser();
 const result=z.object({date:z.iso.date(),courses:z.array(z.string()).min(1).max(30)}).safeParse({date:form.get("date"),courses:form.getAll("courses")});
 if(!result.success)return {error:"Sınav tarihi ve en az bir ders seçin."};
 const {date,courses}=result.data;
 const courseIds=[...new Set(courses)];
 const examDate=new Date(date+"T12:00:00Z");
 const total=await db.course.count({where:{id:{in:courseIds}}});
 if(total!==courseIds.length||+examDate<Date.now()-86400000)return {error:"Tarih ve dersleri kontrol edin."};
 await db.studyPlan.upsert({where:{userId:user.id},create:{userId:user.id,examDate,courseIds},update:{examDate,courseIds}});
 revalidatePath("/study-plan");return {success:"Çalışma planı güncellendi."};
}
export async function removeMaterial(id:string){
 const user=await requireUser();
 await db.studyMaterial.deleteMany({where:{userId:user.id,id}});
 revalidatePath("/study-plan");
}
