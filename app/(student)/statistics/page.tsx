import {requireUser} from "@/lib/user";
import {breakdown,progress} from "@/lib/stats";
import {Breakdown} from "@/components/progress";
import {Header} from "@/components/ui";
import {WeekChart} from "@/components/charts";
export default async function Statistics(){
 const user=await requireUser(),data=await progress(user.id);
 return <div className="stack"><Header title="İstatistikler" detail="Ders, konu ve zorluk düzeyine göre sonuçlarını karşılaştır."/><section className="card stack"><h2>Haftalık çalışma</h2><WeekChart data={data.week}/></section><div className="grid"><Breakdown title="Dersler" rows={breakdown(data.items,"course")}/><Breakdown title="Konular" rows={breakdown(data.items,"topic")}/><Breakdown title="Zorluk" rows={breakdown(data.items,"difficulty")}/></div></div>;
}
