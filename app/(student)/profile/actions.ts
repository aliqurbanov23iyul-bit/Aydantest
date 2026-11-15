"use server";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {revalidatePath} from "next/cache";
import {db} from "@/lib/db";
import {requireUser} from "@/lib/user";
import {rateLimit} from "@/lib/access";
import {logout} from "@/app/actions";
type State={error?:string;success?:string};
const password=z.string().min(8).max(72).refine(value=>Buffer.byteLength(value)<=72);

export async function updateAccount(mode:"profile"|"password"|"delete",_previous:State,form:FormData):Promise<State>{
 const user=await requireUser();
 if(mode==="profile"){
  const result=z.object({name:z.string().trim().min(2).max(60),avatar:z.enum(["🎓","📚","🧠","🚀","🌙"]),goal:z.coerce.number().int().min(1).max(200)}).safeParse({name:form.get("name"),avatar:form.get("avatar"),goal:form.get("goal")});
  if(!result.success)return {error:"Ad, avatar ve günlük hedefi kontrol edin."};
  await db.user.update({where:{id:user.id},data:result.data});revalidatePath("/","layout");return {success:"Profil kaydedildi."};
 }
 if(!await rateLimit("account:"+user.id,10))return {error:"Biraz sonra tekrar deneyin."};
 const current=password.safeParse(form.get("current"));
 const account=await db.user.findUniqueOrThrow({where:{id:user.id}});
 if(!current.success||!await bcrypt.compare(current.data,account.password))return {error:"Mevcut şifre hatalı."};
 if(mode==="delete"){
  if(form.get("confirm")!=="HESABIMI SİL")return {error:"Onay metnini kontrol edin."};
  await db.$transaction([db.questionReport.deleteMany({where:{userId:user.id}}),db.user.delete({where:{id:user.id}})]);
  await logout();return {};
 }
 const next=password.safeParse(form.get("next"));
 if(!next.success)return {error:"Yeni şifre 8–72 bayt olmalı."};
 await db.user.update({where:{id:user.id},data:{password:await bcrypt.hash(next.data,12),sessionVersion:{increment:1}}});
 await logout();return {success:"Şifre güncellendi."};
}
