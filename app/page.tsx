import Image from "next/image";
import Link from "next/link";
import { BarChart3, BookOpen, Play, Rocket, Sparkles, Trophy, Zap } from "lucide-react";
import { Brand, CourseIcon } from "@/components/ui";
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
        <div className="home-illustration"><Image src="/art/ai-study.webp" alt="" fill sizes="(max-width: 760px) 90vw, 48vw" preload/></div>
      </div>
      <div className="feature-grid" id="ozellikler">{features.map(([Icon, title, detail]) => <div className="card feature" key={title}><span className="iconbox"><Icon size={24}/></span><div><strong>{title}</strong><small>{detail}</small></div></div>)}</div>
    </section>
    <section className="stack home-courses" id="dersler"><h2>Dersler</h2><div className="grid">{catalog.map(course => <article className="card course" key={course.id}><CourseIcon {...course}/><h3>{course.name}</h3><small>{course.topics.length} başlangıç konusu</small></article>)}</div></section>
  </main>;
}
