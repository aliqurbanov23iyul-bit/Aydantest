import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

export const googleAvailable = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.DATABASE_URL);
export const googleIdentity = z.object({
  sub: z.string().regex(/^\d{1,64}$/),
  email: z.email().max(254).transform(value => value.toLowerCase()),
  email_verified: z.literal(true),
  name: z.string().optional(),
});

export async function findOrCreateGoogleAccount(profile: z.infer<typeof googleIdentity>) {
  const id = "google:" + profile.sub;
  const existing = await db.user.findUnique({where:{id},select:{id:true,name:true,email:true,sessionVersion:true}});
  if (existing) return existing;
  return db.user.upsert({
    where:{id},
    update:{},
    create:{
      id,email:profile.email,name:profile.name?.trim().slice(0,60) || profile.email.split("@")[0].slice(0,60),
      password:await bcrypt.hash(randomBytes(32).toString("base64url"),12),
    },
    select:{id:true,name:true,email:true,sessionVersion:true},
  });
}
