import Link from "next/link";
import {db} from "@/lib/db";
import {requireUser} from "@/lib/user";
import {Header,Empty} from "@/components/ui";
import {Review} from "@/components/review";
export default async function Wrong(){
 const user=await requireUser();
 const [items,favorites,reports]=await Promise.all([
  db.examQuestion.findMany({where:{exam:{userId:user.id,status:"COMPLETE"},correct:false},distinct:["questionId"],orderBy:{exam:{completedAt:"desc"}},take:100}),
  db.favoriteQuestion.findMany({where:{userId:user.id}}),db.questionReport.findMany({where:{userId:user.id}}),
 ]);
 return <div className="stack"><Header title="Yanlışlarım" detail="Yanlış cevapladığın soruları açıklamalarıyla tekrar et.">{items.length>0&&<Link className="btn primary" href="/exam/create?retry=all">Tekrar testi oluştur</Link>}</Header>{items.length?items.map(item=><Review key={item.id} item={item} saved={favorites.some(entry=>entry.questionId===item.questionId)} reported={reports.some(entry=>entry.questionId===item.questionId)}/>):<Empty>Henüz yanlış cevap yok.</Empty>}</div>;
}
