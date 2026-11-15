import {Trophy} from "lucide-react";
import {requireUser} from "@/lib/user";
import {progress,dayKey} from "@/lib/stats";
import {Header} from "@/components/ui";
export default async function Achievements(){
 const user=await requireUser(),data=await progress(user.id);
 const night=data.exams.some(exam=>exam.completedAt&&Number(new Intl.DateTimeFormat("tr-TR",{hour:"2-digit",hourCycle:"h23",timeZone:"Europe/Istanbul"}).format(exam.completedAt))>=22);
 const records=[["İlk Sınavım",data.exams.length>=1],["100 Soru Çözdüm",data.stats.right+data.stats.wrong>=100],["Matematik Ustası",data.math>=25],["7 Günlük Seri",data.streak>=7],["Hatasız Sınav",data.perfect>0],["Gece Kuşu",night]] as const;
 const weekly=data.exams.filter(exam=>exam.completedAt&&dayKey(exam.completedAt)>=dayKey(new Date(Date.now()-6*86400000))).length;
 return <div className="stack"><Header title="Başarılar" detail={data.xp+" XP · Seviye "+data.level}/><div className="grid"><div className="card"><h3>Günlük görev</h3><p>{data.today} / {user.goal} soru</p></div><div className="card"><h3>Haftalık hedef</h3><p>{weekly} / 5 sınav</p></div><div className="card"><h3>Kişisel rekor</h3><p>{data.perfect} hatasız sınav</p></div></div><div className="grid">{records.map(([name,earned])=><article className="card course" key={name}><Trophy color={earned?"#e4aa5a":"#8d879d"}/><h3>{name}</h3><small>{earned?"Kazanıldı":"Kilitli"}</small></article>)}</div></div>;
}
