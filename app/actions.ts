"use server";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { credentials, signIn, signOut } from "@/auth";
import { rateLimit } from "@/lib/access";

type State={error?:string;success?:string};
export async function accountAction(mode:"login"|"register",_previous:State,form:FormData):Promise<State>{
  if (!process.env.DATABASE_URL || !process.env.AUTH_SECRET) return {error:"Giriş için DATABASE_URL ve AUTH_SECRET yapılandırılmalı."};
  const input=credentials.safeParse({email:form.get("email"),password:form.get("password")});
  if (!input.success) return {error:"Geçerli e-posta ve en az 8 karakterli (en fazla 72 bayt) şifre girin."};
  try {
    if (mode==="register") {
      const name=z.string().trim().min(2).max(60).safeParse(form.get("name"));
      if (!name.success) return {error:"Adınız 2–60 karakter olmalı."};
      const requestHeaders=await headers();
      const origin=requestHeaders.get("x-real-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "unknown";
      if (!await rateLimit("register:"+origin,15)) return {error:"Çok fazla kayıt isteği gönderildi. Biraz sonra tekrar deneyin."};
      await db.user.create({data:{email:input.data.email,name:name.data,password:await bcrypt.hash(input.data.password,12)}});
    }
    await signIn("credentials",{...input.data,redirectTo:"/dashboard"});
    return {};
  } catch(error) {
    if (error instanceof AuthError) return {error:"E-posta veya şifre hatalı. Biraz sonra tekrar deneyin."};
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code==="P2002") return {error:"Bu e-posta ile kayıt tamamlanamadı. Giriş ekranını deneyin."};
    if (error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientKnownRequestError) return {error:"Veritabanına erişilemiyor. Bağlantıyı ve migration kurulumunu kontrol edin."};
    throw error;
  }
}
export async function logout(){await signOut({redirectTo:"/"});redirect("/");}
