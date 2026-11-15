import { Header } from "@/components/ui";
import { ExamBuilder } from "@/components/exam-builder";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/user";

export default async function Create({searchParams}:{searchParams:Promise<{course?:string;retry?:string}>}) {
 const user=await requireUser();
 const {course,retry}=await searchParams;
 const [courses,materials,wrong]=await Promise.all([
  db.course.findMany({include:{topics:true},orderBy:{name:"asc"}}),
  db.studyMaterial.findMany({where:{userId:user.id},select:{id:true,name:true,courseId:true}}),
  retry?db.examQuestion.findMany({where:{exam:{userId:user.id,status:"COMPLETE",...(retry==="all"?{}:{id:retry})},correct:false},select:{question:{select:{courseId:true}}}}):[],
 ]);
 const initial=course?courses.filter(item=>item.id===course).map(item=>item.id):[...new Set(wrong.map(item=>item.question.courseId))];
 return <div className="stack"><Header title="Yeni test oluştur" detail="Derslerini seç ve testin nasıl hazırlanacağını belirle."/><ExamBuilder courses={courses} initial={initial} materials={materials} hasAI={Boolean(process.env.GEMINI_API_KEY)} retry={Boolean(retry)}/></div>;
}
