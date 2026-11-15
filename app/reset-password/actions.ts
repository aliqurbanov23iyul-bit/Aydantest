"use server";
import {createHash,randomBytes} from "node:crypto";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {headers} from "next/headers";
import {db} from "@/lib/db";
import {rateLimit} from "@/lib/access";
type State={error?:string;success?:string};
const digest=(value:string)=>createHash("sha256").update(value).digest("hex");

export async function resetPassword(mode:"request"|"reset",_previous:State,form:FormData):Promise<State>{
 if(!process.env.DATABASE_URL)return {error:"Hesap sistemi henüz yapılandırılmadı."};
 if(mode==="request"){
  const email=z.email().max(254).safeParse(String(form.get("email")??"").trim().toLowerCase());
  if(!email.success)return {error:"Geçerli bir e-posta girin."};
  const apiKey=process.env.RESEND_API_KEY, sender=process.env.RESET_FROM_EMAIL, appUrl=process.env.NEXT_PUBLIC_APP_URL;
  if(!apiKey||!sender||!appUrl)return {error:"Şifre sıfırlama e-postaları henüz yapılandırılmadı."};
  const requestHeaders=await headers();
  const ip=requestHeaders.get("x-real-ip")??requestHeaders.get("x-forwarded-for")?.split(",").at(-1)?.trim()??"unknown";
  const message={success:"Bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderilecektir."};
  if(!await rateLimit("reset-ip:"+ip,20)||!await rateLimit("reset:"+email.data,4))return message;
  const user=await db.user.findUnique({where:{email:email.data},select:{id:true}});
  if(!user)return message;
  const token=randomBytes(32).toString("hex"),hash=digest(token);
  const link=new URL("/reset-password",appUrl);link.searchParams.set("token",token);
  await db.passwordReset.create({data:{hash,userId:user.id,expiresAt:new Date(Date.now()+1800000)}});
  try{
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+apiKey,"Content-Type":"application/json"},body:JSON.stringify({from:sender,to:[email.data],subject:"AydanTest · Şifre sıfırlama",text:"Şifrenizi 30 dakika içinde şu bağlantıdan sıfırlayın: "+link.href}),signal:AbortSignal.timeout(10000)});
   if(!response.ok)await db.passwordReset.deleteMany({where:{hash}});
  }catch{await db.passwordReset.deleteMany({where:{hash}});}
  return message;
 }
 const parsed=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),password:z.string().min(8).max(72).refine(value=>Buffer.byteLength(value)<=72)}).safeParse({token:form.get("token"),password:form.get("password")});
 if(!parsed.success)return {error:"Sıfırlama bağlantısı veya şifre geçersiz."};
 const hash=digest(parsed.data.token);
 const reset=await db.passwordReset.findUnique({where:{hash}});
 if(!reset||+reset.expiresAt<=Date.now())return {error:"Bu bağlantının süresi dolmuş veya bağlantı kullanılmış."};
 const password=await bcrypt.hash(parsed.data.password,12);
 const changed=await db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${reset.userId} FOR UPDATE`;
  const active=await tx.passwordReset.findFirst({where:{hash,expiresAt:{gt:new Date()}}});
  if(!active)return false;
  await tx.passwordReset.deleteMany({where:{userId:reset.userId}});
  await tx.user.update({where:{id:reset.userId},data:{password,sessionVersion:{increment:1}}});
  return true;
 });
 return changed?{success:"Şifre güncellendi. Yeni şifrenizle giriş yapabilirsiniz."}:{error:"Bu bağlantı artık geçerli değil."};
}
