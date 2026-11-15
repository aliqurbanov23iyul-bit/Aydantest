import Link from "next/link";
import {db} from "@/lib/db";
import {requireUser} from "@/lib/user";
import {Header} from "@/components/ui";
import {Teacher} from "@/components/teacher";
import type {Snapshot} from "@/lib/exam-rules";
export default async function TeacherPage({searchParams}:{searchParams:Promise<{item?:string;chat?:string}>}){
 const [{item,chat},user]=await Promise.all([searchParams,requireUser()]);
 const [selected,history]=await Promise.all([
  chat?db.aIConversation.findFirst({where:{id:chat,userId:user.id},include:{messages:{orderBy:{createdAt:"asc"},select:{role:true,text:true}}}}):null,
  db.aIConversation.findMany({where:{userId:user.id},orderBy:{updatedAt:"desc"},take:20,include:{messages:{where:{role:"user"},take:1,orderBy:{createdAt:"asc"},select:{text:true}}}}),
 ]);
 const context=selected?.contextId??item;
 const question=context?await db.examQuestion.findFirst({where:{id:context,exam:{userId:user.id,status:"COMPLETE"}},select:{snapshot:true}}):null;
 const detail=question?(question.snapshot as unknown as Snapshot).prompt:"Bir konu sor veya bir sınav sonucundan soru seç.";
 return <div className="stack"><Header title="AI Öğretmen" detail={detail}/><div className="split"><Teacher key={selected?.id??context??"new"} initial={selected?.messages??[]} id={selected?.id} context={question?context:undefined} available={Boolean(process.env.GEMINI_API_KEY)}/><aside className="card stack"><h2>Konuşmalar</h2><Link className="btn" href="/ai-teacher">Yeni konuşma</Link>{history.map(row=><Link className="listrow" key={row.id} href={"/ai-teacher?chat="+row.id}>{row.messages[0]?.text.slice(0,65)??"Konuşma"}</Link>)}</aside></div></div>;
}
