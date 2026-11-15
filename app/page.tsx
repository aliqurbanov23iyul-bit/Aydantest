import { CourseCard } from "@/components/course-card";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, BookOpen, Play, Rocket, Sparkles, Trophy, Zap } from "lucide-react";
import { Brand } from "@/components/ui";
import { catalog } from "@/lib/catalog";
import { getUser } from "@/lib/user";

const features = [
  [BookOpen, "7 Ders", "Üniversite müfredatına uygun"],
  [Zap, "AI ile Yeni Testler", "Her seferinde yeni sorular"],
  [BarChart3, "Detaylı Analiz", "Gelişimini takip et"],
  [Trophy, "Rozet ve Seviye", "Çalıştıkça ilerle"],
] as const;

export default async function Home() {
  const user = await getUser();
  return <main className="landing home-landing stack">
    <header className="home-nav between">
      <Brand/>
      <nav className="home-menu row" aria-label="Ana menü">
        <Link href="/">Ana Sayfa</Link><a href="#dersler">Dersler</a>
        <a href="#ozellikler">Özellikler</a><a href="#hakkinda">Hakkında</a>
      </nav>
      <div className="row">
        {user ? <Link className="btn primary" href="/dashboard">Çalışma Paneli</Link> : <>
          <Link className="btn outline" href="/login">Giriş Yap</Link>
          <Link className="btn primary" href="/register">Hesap Oluştur</Link>
        </>}
      </div>
    </header>
    <section className="home-stage" aria-labelledby="home-heading">
      <div className="home-intro">
        <div className="stack home-copy">
          <span className="eyebrow"><Sparkles size={15}/> AI Destekli Test Platformu</span>
          <h1 id="home-heading">Üniversite Derslerine<br/> Akıllı Hazırlık</h1>
          <p>Yapay zekâ ile dilediğin dersten, dilediğin zorlukta test oluştur, eksiklerini gör ve sınavlarına hazırlan.</p>
          <div className="row"><Link className="btn primary" href={user ? "/exam/create" : "/register"}><Rocket size={18}/> Hemen Başla</Link><Link className="btn outline" href="/ornek-sinav"><Play size={16}/> Örnek Testi Çöz</Link></div>
        </div>
        <div className="home-illustration"><span className="hero-orbit" aria-hidden="true"/><span className="hero-glint" aria-hidden="true"/><Image src="/art/ai-study.webp" alt="" fill unoptimized preload/></div>
      </div>
      <div className="feature-grid" id="ozellikler">{features.map(([Icon, title, detail]) => <div className="card feature" key={title}><span className="iconbox"><Icon size={24}/></span><div><strong>{title}</strong><small>{detail}</small></div></div>)}</div>
    </section>
    <section className="stack home-courses" id="dersler" aria-labelledby="course-heading"><div className="between course-gallery-heading"><h2 id="course-heading">Dersler</h2><Link className="text-link" href={user ? "/courses" : "/ornek-sinav"}>{user ? "Tüm Dersler" : "Tüm Örnek Sorular"} <span aria-hidden="true">→</span></Link></div><div className="course-gallery">{catalog.map(course => <CourseCard key={course.id} course={course} href={user ? "/courses/" + course.id : "/ornek-sinav?ders=" + course.id} detail={course.topics.length + " başlangıç konusu"} action={user ? "Dersi Aç" : "Örnek Soru Çöz"}/>)}</div></section>
  </main>;
}
