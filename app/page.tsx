import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { HeroArt } from "@/components/hero-art";
import { Brand, CourseIcon } from "@/components/ui";
import { catalog } from "@/lib/catalog";
import { getUser } from "@/lib/user";

export default async function Home() {
  const user=await getUser();
  return <main className="landing home-landing stack">
    <header className="home-nav between"><Brand/><Link className="btn" href={user?"/dashboard":"/login"}>{user?"Çalışma paneli":"Giriş yap"}<ArrowRight size={15}/></Link></header>
    <section className="hero card home-hero"><HeroArt/><div className="stack home-copy">
      <span className="eyebrow"><Sparkles size={15}/> Üniversite sınavlarına hazırlık</span>
      <h1>Bir konu seç.<br/><span>Kendini test et.</span></h1>
      <p>Yedi ders arasından seçim yap, yapay zekâyla yeni sorular oluştur ve yanlışlarını açıklamalarıyla tekrar et.</p>
      <div className="row"><Link className="btn primary" href={user?"/exam/create":"/register"}>{user?"Yeni test oluştur":"Hesap oluştur"}<ArrowRight size={17}/></Link><Link className="btn" href="/ornek-sinav"><Play size={15}/> Örnek testi çöz</Link></div>
    </div></section>
    <section className="stack home-courses"><h2>Dersler</h2><div className="grid">{catalog.map((course,index)=><article className="card course" style={{animationDelay:index*65+"ms"}} key={course.id}><CourseIcon {...course}/><h3>{course.name}</h3><small>{course.topics.length} başlangıç konusu</small></article>)}</div></section>
  </main>;
}
