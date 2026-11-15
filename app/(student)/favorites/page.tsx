import {db} from "@/lib/db";
import {requireUser} from "@/lib/user";
import {Header,Empty} from "@/components/ui";
import {Review} from "@/components/review";
export default async function Favorites(){
 const user=await requireUser();
 const [items,reports]=await Promise.all([
  db.examQuestion.findMany({where:{exam:{userId:user.id,status:"COMPLETE"},question:{favorites:{some:{userId:user.id}}}},distinct:["questionId"],orderBy:{exam:{completedAt:"desc"}},take:100}),
  db.questionReport.findMany({where:{userId:user.id}}),
 ]);
 return <div className="stack"><Header title="Favoriler" detail="Daha sonra tekrar etmek istediğin sorular." />{items.length?items.map(item=><Review key={item.id} item={item} saved reported={reports.some(entry=>entry.questionId===item.questionId)}/>):<Empty>Bir sınav sonucundan soru ekleyebilirsin.</Empty>}</div>;
}
