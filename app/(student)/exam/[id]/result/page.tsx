import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {db} from "@/lib/db";
import {getExam} from "@/lib/exams";
import {breakdown,summary} from "@/lib/stats";
import {requireUser} from "@/lib/user";
import {Header} from "@/components/ui";
import {Breakdown} from "@/components/progress";
import {Review} from "@/components/review";
export default async function Result({params}:{params:Promise<{id:string}>}){
 const [{id},user]=await Promise.all([params,requireUser()]);
 const exam=await getExam(user.id,id);
 if(!exam)notFound();
 if(exam.status!=="COMPLETE")redirect("/exam/"+id);
 const data=summary(exam.items);
 const seconds=Math.max(0,Math.floor((+(exam.completedAt??exam.createdAt) - +(exam.startedAt??exam.createdAt))/1000));
 const ids=exam.items.map(item=>item.questionId);
 const [favorites,reports]=await Promise.all([db.favoriteQuestion.findMany({where:{userId:user.id,questionId:{in:ids}}}),db.questionReport.findMany({where:{userId:user.id,questionId:{in:ids}}})]);
 const metrics=[["Toplam",data.total],["Doğru",data.right],["Yanlış",data.wrong],["Boş",data.blank],["Başarı","%"+data.percent],["Süre",Math.floor(seconds/60)+" dk "+seconds%60+" sn"]];
 return <div className="stack"><Header title="Sınav sonucu" detail="Cevaplarını ve konu dağılımını incele."/><div className="grid">{metrics.map(([label,value])=><div className="card" key={label}><small>{label}</small><div className="metric">{value}</div></div>)}</div>
 <div className="grid"><Breakdown title="Ders bazında" rows={breakdown(exam.items,"course")}/><Breakdown title="Konu bazında" rows={breakdown(exam.items,"topic")}/><Breakdown title="Zorluk bazında" rows={breakdown(exam.items,"difficulty")}/></div>
 <div className="row"><Link className="btn" href="/history">Sınav geçmişi</Link>{data.wrong>0&&<Link className="btn primary" href={"/exam/create?retry="+exam.id}>Yanlışlarımdan yeni test oluştur</Link>}</div>
 {([[ "Yanlış cevaplar",false],["Boş sorular",null],["Doğru cevaplar",true]] as const).map(([title,correct])=>{
  const items=exam.items.filter(item=>item.correct===correct);
  return items.length>0&&<section className="stack" key={title}><h2>{title}</h2>{items.map(item=><Review key={item.id} item={item} saved={favorites.some(entry=>entry.questionId===item.questionId)} reported={reports.some(entry=>entry.questionId===item.questionId)}/>)}</section>;
 })}
 </div>;
}
