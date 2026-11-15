import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getUser = cache(async () => {
  if (!process.env.DATABASE_URL || !process.env.AUTH_SECRET) return null;
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id:true, name:true, email:true, role:true, goal:true, avatar:true, sessionVersion:true },
  });
  return user && "sessionVersion" in session && session.sessionVersion===user.sessionVersion ? user : null;
});
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
