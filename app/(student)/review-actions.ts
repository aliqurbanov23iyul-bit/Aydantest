"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/user";

export async function favorite(id:string,enable:boolean){
 const user=await requireUser();
 if(!z.string().min(1).max(80).safeParse(id).success||typeof enable!=="boolean")return;
 if(enable){
  const item=await db.examQuestion.findFirst({where:{questionId:id,exam:{userId:user.id,status:"COMPLETE"}}});
  if(!item)return;
  await db.favoriteQuestion.upsert({where:{userId_questionId:{userId:user.id,questionId:id}},update:{},create:{userId:user.id,questionId:id}});
 }else await db.favoriteQuestion.deleteMany({where:{userId:user.id,questionId:id}});
 revalidatePath("/","layout");
}
export async function report(id:string,form:FormData){
 const user=await requireUser();
 const text=z.string().trim().min(5).max(500).safeParse(form.get("report"));
 if(!text.success)return;
 const item=await db.examQuestion.findFirst({where:{questionId:id,exam:{userId:user.id,status:"COMPLETE"}}});
 if(!item)return;
 const key={userId:user.id,questionId:id};
 await db.questionReport.upsert({where:{userId_questionId:key},create:{...key,text:text.data},update:{text:text.data,resolved:false}});
 revalidatePath("/","layout");
}
