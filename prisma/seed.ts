import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { catalog, topicId } from "../lib/catalog";

import { starterBank } from "./bank";
const db = new PrismaClient();
async function seed() {
  for (const { topics, ...course } of catalog) {
    await db.course.upsert({ where:{ id:course.id }, create:course, update:{} });
    for (const [index,name] of topics.entries()) {
      const id = topicId(course.id, index);
      await db.topic.upsert({ where:{ id }, create:{ id, name, courseId:course.id }, update:{} });
    }
  }
  for (const [courseId,topic,prompt,answer,b,c,d,explanation] of starterBank) {
    const id = "ornek-" + courseId;
    await db.question.upsert({ where:{ id }, update:{}, create:{
      id, courseId, topicId:topicId(courseId,topic), prompt, answer, explanation,
      options:[answer,b,c,d], kind:"choice4", difficulty:"easy", origin:"BANK",
    } });
  }
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email || password) {
    if (!email || !password || password.length < 14 || Buffer.byteLength(password) > 72) {
      throw new Error("ADMIN_EMAIL ve 14–72 bayt uzunluğunda ADMIN_PASSWORD gerekli.");
    }
    const current = await db.user.findUnique({ where:{ email } });
    if (current && current.role !== "ADMIN") throw new Error("Yönetici için kullanılmayan bir e-posta seçin.");
    if (!current) await db.user.create({ data:{ email, name:"Yönetici", password:await bcrypt.hash(password,12), role:"ADMIN" } });
  }
}
seed().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
