"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid,BookOpen,Sparkles,History,RotateCcw,Bookmark,Bot,CalendarDays,Trophy,BarChart3,UserRound,Settings,Shield } from "lucide-react";
const links=[
 ["/dashboard","Genel Bakış",LayoutGrid],["/courses","Dersler",BookOpen],["/exam/create","Yeni Test",Sparkles],["/history","Sınav Geçmişi",History],["/wrong-answers","Yanlışlarım",RotateCcw],["/favorites","Favoriler",Bookmark],["/ai-teacher","AI Öğretmen",Bot],["/study-plan","Çalışma Planı",CalendarDays],["/achievements","Başarılar",Trophy],["/statistics","İstatistikler",BarChart3],["/profile","Profil",UserRound],["/settings","Ayarlar",Settings],["/admin","Yönetim",Shield],
] as const;
export function Nav({admin}:{admin:boolean}) {
 const path=usePathname();
 return <nav className="navlist" aria-label="Ana menü">{links.filter(([href])=>href!=="/admin"||admin).map(([href,text,Icon])=><Link key={href} href={href} className="navlink" aria-current={path===href||path.startsWith(href+"/")?"page":undefined}><Icon size={16}/>{text}</Link>)}</nav>;
}
export function ThemeButton(){
 return <button className="btn" type="button" onClick={()=>{const theme=document.body.dataset.theme==="light"?"dark":"light";document.body.dataset.theme=theme;localStorage.setItem("akademi-theme",theme);}}>Temayı değiştir</button>;
}
