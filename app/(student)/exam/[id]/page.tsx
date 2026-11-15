import {notFound,redirect} from "next/navigation";
import {requireUser} from "@/lib/user";
import {getExam} from "@/lib/exams";
import type {Snapshot} from "@/lib/exam-rules";
import {ExamPlayer} from "@/components/exam-player";

export default async function ExamPage({params}:{params:Promise<{id:string}>}) {
 const [{id},user]=await Promise.all([params,requireUser()]);
 const exam=await getExam(user.id,id);
 if(!exam)notFound();
 if(exam.status==="COMPLETE")redirect("/exam/"+id+"/result");
 if(exam.status!=="ACTIVE")redirect("/exam/create");
 const items=exam.items.map(item=>{
  const snapshot=item.snapshot as unknown as Snapshot;
  const {course,topic,prompt,kind,options}=snapshot;
  const reveal=exam.mode==="learn"&&item.locked?{answer:snapshot.answer,explanation:snapshot.explanation,correct:item.correct===true}:null;
  return {id:item.id,course,topic,prompt,kind,options,response:item.response,marked:item.marked,reveal};
 });
 return <ExamPlayer id={id} items={items} expiresAt={exam.expiresAt?.toISOString()??null}/>;
}
