import { z } from "zod";
import { normalize } from "./exam-core";
export { distribute,normalize,matches,shuffled,checkArithmetic } from "./exam-core";

export const modes = ["learn","exam","timed","quick","retry"] as const;
export const kinds = ["choice4","choice5","boolean","fill"] as const;
export const levels = ["easy","medium","hard","expert","university"] as const;
export const examConfig = z.object({
  requestId:z.uuid(),
  courseIds:z.array(z.string().min(1)).min(1).max(30).refine(ids => new Set(ids).size === ids.length),
  count:z.int().min(1).max(100),
  distribution:z.record(z.string(),z.int().min(1).max(100)).optional(),
  topicIds:z.array(z.string()).max(120).default([]),
  topicMode:z.enum(["all","selected","wrong","new"]).default("all"),
  difficulty:z.enum([...levels,"mixed"]),
  kind:z.enum([...kinds,"mixed"]),
  mode:z.enum(modes),
  minutes:z.int().min(1).max(240),
  shuffleQuestions:z.boolean(),
  shuffleOptions:z.boolean(),
  avoidRepeats:z.boolean(),
  source:z.enum(["AI","BANK"]),
  materialId:z.string().optional(),
}).superRefine((config,ctx) => {
  if (config.count < config.courseIds.length) ctx.addIssue({code:"custom",message:"Her ders için en az bir soru gerekir."});
  if (config.mode === "quick" && config.count > 10) ctx.addIssue({code:"custom",message:"Hızlı test en fazla 10 soru olabilir."});
  if (config.topicMode === "selected" && !config.topicIds.length) ctx.addIssue({code:"custom",message:"En az bir konu seçin."});
  if (config.distribution) {
    const keys = Object.keys(config.distribution);
    if (keys.length !== config.courseIds.length || !config.courseIds.every(id => keys.includes(id)) ||
        Object.values(config.distribution).reduce((a,b) => a+b,0) !== config.count) {
      ctx.addIssue({code:"custom",message:"Derslere dağıtılan soru sayılarının toplamını kontrol edin."});
    }
  }
});
export type ExamConfig = z.infer<typeof examConfig>;
export const questionData = z.object({
  topicId:z.string(), kind:z.enum(kinds), difficulty:z.enum(levels), prompt:z.string().trim().min(8).max(1800),
  options:z.array(z.string().trim().min(1).max(400)).max(5),
  answer:z.string().trim().min(1).max(400),
  explanation:z.string().trim().min(10).max(2000),
  source:z.string().max(300).nullable(),
}).superRefine((data,ctx) => {
  const length = {choice4:4,choice5:5,boolean:2,fill:0}[data.kind];
  if (data.options.length !== length || new Set(data.options.map(normalize)).size !== length ||
      (length > 0 && !data.options.includes(data.answer)) ||
      (data.kind === "boolean" && !(data.options.includes("Doğru") && data.options.includes("Yanlış")))) {
    ctx.addIssue({code:"custom",message:"Soru seçenekleri veya cevap geçersiz."});
  }
});
export type QuestionData = z.infer<typeof questionData>;
export type Snapshot = QuestionData & { courseId:string; course:string; topic:string; origin:string };
