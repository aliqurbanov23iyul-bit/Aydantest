import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/admin";
import {Header} from "@/components/ui";
import {dateLabel} from "@/lib/stats";
export default async function Admin(){
 await requireAdmin();
 const [users,courses,questions,exams,logs]=await Promise.all([db.user.count(),db.course.count(),db.question.count({where:{active:true}}),db.exam.count({where:{status:"COMPLETE"}}),db.adminAuditLog.findMany({orderBy:{createdAt:"desc"},take:15})]);
 return <div className="stack"><Header title="Yönetim paneli" detail="Ders, soru bankası ve kullanıcı yönetimi."/><div className="grid">{[["Kullanıcı",users],["Ders",courses],["Aktif soru",questions],["Tamamlanan sınav",exams]].map(([label,value])=><div className="card" key={label}><small>{label}</small><div className="metric">{value}</div></div>)}</div><section className="card stack"><h2>Son yönetim işlemleri</h2>{logs.length?logs.map(log=><p className="listrow" key={log.id}>{log.action} · {log.target} · {dateLabel(log.createdAt)}</p>):<p className="muted">Henüz kayıt yok.</p>}</section></div>;
}
