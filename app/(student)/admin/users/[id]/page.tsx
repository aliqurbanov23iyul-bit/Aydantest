import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Header, Empty } from "@/components/ui";
import { dateLabel, summary } from "@/lib/stats";
import { modeNames } from "@/lib/labels";
import type { Snapshot } from "@/lib/exam-rules";

export default async function UserResults({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{exam?:string;page?:string}>}) {
 await requireAdmin();
 const [{id},{exam,page}]=await Promise.all([params,searchParams]);
 const offset=Math.max(0,Math.min(10000,Number.parseInt(page??"0",10)||0));
 const [student,exams,selected]=await Promise.all([
  db.user.findUnique({where:{id},select:{name:true,email:true,_count:{select:{exams:{where:{status:"COMPLETE"}}}}}}),
  db.exam.findMany({where:{userId:id,status:"COMPLETE"},orderBy:{completedAt:"desc"},skip:offset*20,take:21,include:{items:{select:{response:true,correct:true}}}}),
  exam?db.exam.findFirst({where:{id:exam,userId:id,status:"COMPLETE"},include:{items:{orderBy:{position:"asc"}}}}):null,
 ]);
 if(!student || (exam&&!selected))notFound();
 const base="/admin/users/"+encodeURIComponent(id);
 return <div className="stack"><Header title={student.name} detail={student.email+" · "+student._count.exams+" tamamlanan sınav"}><Link className="btn" href="/admin/users">Kullanıcılara dön</Link></Header>
  <section className="card stack"><h2>Sınav sonuçları</h2>
   {exams.length?exams.slice(0,20).map(row=>{const result=summary(row.items);return <Link className="between listrow" key={row.id} href={base+"?page="+offset+"&exam="+row.id}>
    <div><strong>{modeNames[row.mode as keyof typeof modeNames]??"Sınav"}</strong><p className="muted">{dateLabel(row.completedAt??row.createdAt)} · {result.right} doğru / {result.wrong} yanlış / {result.blank} boş</p></div><span className="pill">%{result.percent}</span>
   </Link>}):<Empty>Bu kullanıcının tamamladığı sınav yok.</Empty>}
   <div className="row">{offset>0&&<Link className="btn" href={base+"?page="+(offset-1)}>Önceki</Link>}{exams.length>20&&<Link className="btn" href={base+"?page="+(offset+1)}>Sonraki</Link>}</div>
  </section>
  {selected&&<section className="stack"><h2>Sınav ayrıntıları · {dateLabel(selected.completedAt??selected.createdAt)}</h2>{selected.items.map((item,index)=>{
   const snapshot=item.snapshot as unknown as Snapshot;
   return <article className="card stack" key={item.id}><span className="eyebrow">{snapshot.course} · {snapshot.topic}</span><h3>{index+1}. {snapshot.prompt}</h3><p>Kullanıcının cevabı · {item.response??"Boş"}</p><p className={item.correct?"good":"muted"}>Doğru cevap · {snapshot.answer}</p></article>;
  })}</section>}
 </div>;
}
