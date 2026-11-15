import { CourseCard } from "@/components/course-card";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Crown, Flame, Sparkles, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/user";
import { breakdown, progress } from "@/lib/stats";
import { db } from "@/lib/db";
import { catalog } from "@/lib/catalog";
import { Bar } from "@/components/ui";
import { Breakdown, ExamRows } from "@/components/progress";
import { WeekChart } from "@/components/charts";

export default async function Dashboard() {
  const user = await requireUser();
  const [data, courses] = await Promise.all([
    progress(user.id),
    db.course.findMany({select:{id:true,name:true,color:true,icon:true}}),
  ]);
  const stats = [
    [BookOpen, "Çözülen Soru", (data.stats.right + data.stats.wrong).toLocaleString("tr-TR")],
    [TrendingUp, "Genel Başarı", "%" + data.stats.percent],
    [Check, "Tamamlanan Test", data.exams.length],
    [Crown, "Seviye · " + data.xp + " XP", "Lv. " + data.level],
  ] as const;
  const courseStats = new Map(breakdown(data.items, "course").map(row => [row.label, row]));
  const courseOrder = new Map(catalog.map((course, index) => [course.id, index]));
  const orderedCourses = [...courses].sort((a,b) => (courseOrder.get(a.id) ?? catalog.length) - (courseOrder.get(b.id) ?? catalog.length));
  return <div className="stack dashboard">
    <header className="between dashboard-heading"><div><h1>Hoş geldin, {user.name}!</h1><p className="muted">{data.weak[0] ? "Tekrar için önerilen konu · " + data.weak[0].label : "Bugün de hedeflerine bir adım daha yaklaş."}</p></div><span className="pill streak"><Flame size={17}/> {data.streak} Günlük Seri</span></header>
    <div className="dashboard-metrics">{stats.map(([Icon,label,value]) => <div className="card feature" key={label}><span className="iconbox"><Icon size={22}/></span><div><div className="metric">{value}</div><small>{label}</small></div></div>)}</div>
    <div className="dashboard-actions">
      <section className="card stack goal-card"><div className="between"><h2>Bugünkü Hedefin</h2><Link className="muted" href="/study-plan">Planı aç <span aria-hidden="true">↗</span></Link></div><div><div className="between"><p>{user.goal} soruyu tamamla</p><small>{data.today} / {user.goal}</small></div><Bar value={Math.min(100, Math.round(data.today / user.goal * 100))}/></div></section>
      <Link href="/exam/create" className="card dashboard-create between"><div><h2><Sparkles size={22}/> AI ile Yeni Test Oluştur</h2><p>Dilediğin ders, konu ve zorlukta test hazırla.</p></div><span className="iconbox"><ArrowRight size={22}/></span></Link>
    </div>
    <section className="stack"><div className="between"><h2>Derslerim</h2><Link href="/courses" className="text-link">Tüm Dersler <span aria-hidden="true">→</span></Link></div><div className="dashboard-courses">{orderedCourses.map(course => {
      const score = courseStats.get(course.name)?.percent;
      return <CourseCard key={course.id} course={course} href={"/courses/" + course.id} detail={score === undefined ? "Henüz test yok" : "%" + score} progress={score ?? 0} compact/>;
    })}</div></section>
    <div className="split dashboard-details"><section className="card stack"><h2>Haftalık Çalışma</h2><WeekChart data={data.week}/></section><section className="card stack"><h2>Son Sınavlar</h2><ExamRows exams={data.exams.slice(0,4)}/></section></div>
    <Breakdown title="Derslere Göre Başarı" rows={breakdown(data.items, "course")}/>
  </div>;
}
