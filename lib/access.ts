import { db } from "@/lib/db";
export async function rateLimit(key: string, limit: number) {
  const cutoff = new Date(Math.floor(Date.now() / 900000) * 900000);
  const value = await db.rateLimit.upsert({
    where: { key: key + ":" + cutoff.toISOString() },
    create: { key: key + ":" + cutoff.toISOString(), count: 1, expiresAt: new Date(+cutoff + 900000) },
    update: { count: { increment: 1 } },
  });
  return value.count <= limit;
}
