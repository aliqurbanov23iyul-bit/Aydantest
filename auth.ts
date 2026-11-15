import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/access";
import { findOrCreateGoogleAccount, googleAvailable, googleIdentity } from "@/lib/google-account";

export const credentials = z.object({ email: z.email().max(254).transform(v => v.toLowerCase()), password: z.string().min(8).max(72).refine(v => Buffer.byteLength(v) <= 72) });
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
  providers: [
    ...(googleAvailable ? [Google] : []),
    Credentials({
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
    }),
  ],
  callbacks: {
    async signIn({account,profile}) {
      if (account?.provider!=="google") return true;
      const identity=googleIdentity.safeParse(profile);
      if (!identity.success) return false;
      const id="google:"+identity.data.sub;
      if (await db.user.findUnique({where:{id},select:{id:true}})) return true;
      const collision=await db.user.findUnique({where:{email:identity.data.email},select:{id:true}});
      return collision?"/login?error=GoogleEmailInUse":true;
    },
    async jwt({token,user,account,profile}) {
      if (account?.provider==="google") {
        const identity=googleIdentity.parse(profile);
        const local=await findOrCreateGoogleAccount(identity);
        token.sub=local.id;
        token.name=local.name;
        token.email=local.email;
        token.sessionVersion=local.sessionVersion;
      } else if (user && "sessionVersion" in user) token.sessionVersion=user.sessionVersion;
      return token;
    },
    session({session,token}) {
      if(token.sub) session.user.id=token.sub;
      return Object.assign(session,{sessionVersion:token.sessionVersion});
    },
  },
});
