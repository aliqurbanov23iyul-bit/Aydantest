import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/admin";
import {Header} from "@/components/ui";
export default async function Analytics(){
 await requireAdmin();
 const [statuses,usage,sources]=await Promise.all([db.exam.groupBy({by:["status"],_count:{_all:true}}),db.aIUsageLog.groupBy({by:["day"],_sum:{units:true},orderBy:{day:"desc"},take:30}),db.exam.groupBy({by:["source"],where:{status:"COMPLETE"},_count:{_all:true}})]);
 return <div className="stack"><Header title="Sistem analizi"/><div className="grid"><section className="card stack"><h2>Test durumları</h2>{statuses.map(row=><p key={row.status}>{(({ACTIVE:"Sürüyor",COMPLETE:"Tamamlandı",FAILED:"Başarısız",GENERATING:"Hazırlanıyor"}) as Record<string,string>)[row.status] ?? row.status} · {row._count._all}</p>)}{sources.map(row=><p key={row.source}>{row.source==="AI"?"Yapay zekâ":"Soru bankası"} · {row._count._all} tamamlanan test</p>)}</section><section className="card stack"><h2>AI kullanımı</h2>{usage.length?usage.map(row=><p key={row.day}>{row.day} · {row._sum.units??0} birim</p>):<p className="muted">Henüz kullanım kaydı yok.</p>}</section></div></div>;
}
