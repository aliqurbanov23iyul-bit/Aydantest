import {notFound} from "next/navigation";
import Link from "next/link";
import {db} from "@/lib/db";
import {requireUser} from "@/lib/user";
import {breakdown} from "@/lib/stats";
import {Breakdown,ExamRows} from "@/components/progress";
import {Header} from "@/components/ui";
export default async function CoursePage({params}:{params:Promise<{id:string}>}){
 const [{id},user]=await Promise.all([params,requireUser()]);
 const course=await db.course.findUnique({where:{id},include:{topics:true,_count:{select:{questions:{where:{active:true,origin:"BANK"}}}}}});
 if(!course)notFound();
 const exams=await db.exam.findMany({where:{userId:user.id,status:"COMPLETE",items:{some:{question:{courseId:id}}}},include:{items:{where:{question:{courseId:id}}}},orderBy:{createdAt:"desc"},take:50});
 return <div className="stack"><Header title={course.name} detail={course._count.questions+" soru bankası sorusu"}><Link className="btn primary" href={"/exam/create?course="+id}>Test oluştur</Link></Header><div className="grid">{course.topics.map(topic=><div className="card" key={topic.id}>{topic.name}</div>)}</div><Breakdown title="Konu ilerlemesi" rows={breakdown(exams.flatMap(exam=>exam.items),"topic")}/><h2>Geçmiş sınavlar</h2><ExamRows exams={exams}/></div>;
}
