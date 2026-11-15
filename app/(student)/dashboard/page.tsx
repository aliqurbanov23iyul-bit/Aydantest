import {HeroArt} from "@/components/hero-art";
import Link from "next/link";
import {Sparkles} from "lucide-react";
import {requireUser} from "@/lib/user";
import {breakdown,progress} from "@/lib/stats";
import {Bar} from "@/components/ui";
import {Breakdown,ExamRows} from "@/components/progress";
import {WeekChart} from "@/components/charts";
export default async function Dashboard(){
 const user=await requireUser(),data=await progress(user.id);
 const values=[["Çözülen soru",data.stats.right+data.stats.wrong],["Genel başarı","%"+data.stats.percent],["Günlük seri",data.streak+" gün"],["Toplam XP",data.xp],["Seviye",data.level]];
 return <div className="stack"><section className="hero card"><HeroArt/><div className="stack"><span className="eyebrow">Çalışma paneli</span><h1>Merhaba, {user.name}!</h1><p>{data.weak[0]?"Tekrar için önerilen konu · "+data.weak[0].label:"İlk testini çöz ve derslerdeki ilerlemeni gör."}</p><div><Link className="btn primary" href="/exam/create"><Sparkles size={16}/>Yeni test oluştur</Link></div></div></section>
 <div className="grid">{values.map(([label,value])=><div className="card" key={label}><small>{label}</small><div className="metric">{value}</div></div>)}</div>
 <div className="split"><section className="card stack"><h2>Haftalık çalışma</h2><WeekChart data={data.week}/></section><section className="card stack"><h2>Bugünkü hedef</h2><p>{data.today} / {user.goal} soru</p><Bar value={Math.min(100,Math.round(data.today/user.goal*100))}/><Link className="muted" href="/study-plan">Çalışma planını aç →</Link></section></div>
 <div className="split"><Breakdown title="Derslere göre başarı" rows={breakdown(data.items,"course")}/><section className="stack"><h2>Son sınavlar</h2><ExamRows exams={data.exams.slice(0,4)}/></section></div></div>;
}
