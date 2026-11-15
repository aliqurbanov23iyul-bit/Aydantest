import {HeroArt} from "@/components/hero-art";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Brand, CourseIcon } from "@/components/ui";
import { catalog } from "@/lib/catalog";
import { getUser } from "@/lib/user";
export default async function Home() {
  const user=await getUser();
  return <main className="landing stack" style={{gap:28}}>
    <header className="between"><Brand/><div className="row"><Link className="btn" href={user?"/dashboard":"/login"}>{user?"Çalışma paneli":"Giriş yap"}</Link></div></header>
    <section className="hero card"><HeroArt/><div className="stack">
      <span className="eyebrow">Üniversite sınavlarına hazırlık</span><h1>Dersine özel bir testle başla.</h1>
      <p>Derslerini, konularını ve zorluk seviyeni seç. Yapay zekâyla yeni sorular çöz, açıklamaları incele ve ilerlemeni takip et.</p>
      <div className="row"><Link className="btn primary" href={user?"/exam/create":"/register"}><Sparkles size={16}/>{user?"Yeni test oluştur":"Hesap oluştur"}<ArrowRight size={16}/></Link><Link className="btn" href="/ornek-sinav">Örnek testi çöz</Link></div>
    </div></section>
    <section className="stack"><h2>Dersler</h2><div className="grid">{catalog.map(course=><article className="card course" key={course.id}><CourseIcon {...course}/><h3>{course.name}</h3><small>{course.topics.length} başlangıç konusu</small></article>)}</div></section>
  </main>;
}
