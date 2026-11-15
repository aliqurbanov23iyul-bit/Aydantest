import Link from "next/link";
import {db} from "@/lib/db";
import {requireUser} from "@/lib/user";
import {dayKey,progress} from "@/lib/stats";
import {Header} from "@/components/ui";
import {PlanForm,UploadForm} from "@/components/study-forms";
import {removeMaterial} from "./actions";
export default async function StudyPlan(){
 const user=await requireUser();
 const [courses,plan,materials,data]=await Promise.all([
  db.course.findMany({select:{id:true,name:true}}),db.studyPlan.findUnique({where:{userId:user.id}}),
  db.studyMaterial.findMany({where:{userId:user.id},select:{id:true,name:true,courseId:true},orderBy:{createdAt:"desc"}}),progress(user.id),
 ]);
 const days=plan?Math.max(0,Math.round((+new Date(dayKey(plan.examDate))-+new Date(dayKey(new Date())))/86400000)):0;
 const selected=courses.filter(course=>plan?.courseIds.includes(course.id));
 const weak=data.weak.filter(row=>selected.some(course=>row.label.startsWith(course.name+" · "))).slice(0,3);
 return <div className="stack"><Header title="Çalışma planı" detail="Sınav tarihine göre tekrar hedeflerini belirle ve ders notlarını ekle."/>
 <div className="split"><PlanForm courses={courses} date={plan?dayKey(plan.examDate):undefined} chosen={plan?.courseIds??[]}/><section className="card stack"><h2>Bugünkü plan</h2>{plan?<><div className="metric">{days} gün</div><p>{Math.max(0,user.goal-data.today)} soru ile günlük hedefe ulaş.</p>{(weak.length?weak.map(row=>row.label):selected.map(course=>course.name)).map(label=><p className="listrow" key={label}>{label}</p>)}<Link className="btn primary" href={"/exam/create"+(selected[0]?"?course="+selected[0].id:"")}>Çalışmaya başla</Link></>:<p className="muted">Bir tarih ve ders seçerek plan oluştur.</p>}</section></div>
 <section className="card stack"><h2>Ders notları</h2><UploadForm courses={courses}/>{materials.map(material=><div className="between listrow" key={material.id}><div><strong>{material.name}</strong><br/><small>{courses.find(course=>course.id===material.courseId)?.name}</small></div><form action={removeMaterial.bind(null,material.id)}><button className="btn">Sil</button></form></div>)}</section>
 </div>;
}
