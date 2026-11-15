import {db} from "@/lib/db";
import {requireUser} from "@/lib/user";
import {Header} from "@/components/ui";
import {ExamRows} from "@/components/progress";
export default async function History(){
 const user=await requireUser();
 const exams=await db.exam.findMany({where:{userId:user.id,status:{in:["ACTIVE","COMPLETE"]}},include:{items:true},orderBy:{createdAt:"desc"},take:100});
 return <div className="stack"><Header title="Sınav geçmişi" detail="Önceki sonuçlarını incele veya yarım kalan sınava dön."/><ExamRows exams={exams}/></div>;
}
