import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/access";

export const credentials = z.object({ email: z.email().max(254).transform(v => v.toLowerCase()), password: z.string().min(8).max(72).refine(v => Buffer.byteLength(v) <= 72) });
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(input, request) {
      const parsed = credentials.safeParse(input);
      if (!parsed.success || !process.env.DATABASE_URL) return null;
      const { email, password } = parsed.data;
      const ip=request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "unknown";
      if (!await rateLimit("login-ip:"+ip,60) || !await rateLimit("login:" + email, 12)) return null;
      const user = await db.user.findUnique({ where: { email } });
      const hash = user?.password ?? "$2b$12$C6UzMDM.H6dfI/f/IKcEe.5wC6e0hSBLBHDkTP93TBRev.YxH6bcS";
      const valid = await bcrypt.compare(password, hash);
      return user && valid ? { id: user.id, name: user.name, email: user.email, sessionVersion:user.sessionVersion } : null;
    },
  })],
  callbacks: {
    jwt({token,user}) {
      if(user && "sessionVersion" in user) token.sessionVersion=user.sessionVersion;
      return token;
    },
    session({session,token}) {
      if(token.sub) session.user.id=token.sub;
      return Object.assign(session,{sessionVersion:token.sessionVersion});
    },
  },
});
