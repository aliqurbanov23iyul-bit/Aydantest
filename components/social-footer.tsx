import Link from "next/link";
import { Heart, Instagram } from "lucide-react";
import { Brand } from "@/components/ui";

function TikTok() {
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 0h-3.9v16.4a3.45 3.45 0 1 1-3-3.42V8.99a7.42 7.42 0 1 0 6.96 7.41V8.06A10.34 10.34 0 0 0 22.7 10V6a6.04 6.04 0 0 1-6.1-6Z"/></svg>;
}

export function SocialFooter() {
  return <footer className="social-footer" id="hakkinda"><div className="social-inner">
    <div><Brand/><p>Üniversite derslerine AI destekli test platformu.</p></div>
    <nav className="footer-links" aria-label="Hızlı erişim"><strong>Hızlı Erişim</strong><Link href="/">Ana Sayfa</Link><Link href="/#dersler">Dersler</Link><Link href="/exam/create">Test Oluştur</Link></nav>
    <nav className="footer-links" aria-label="Hesap"><strong>Hesap</strong><Link href="/login">Giriş Yap</Link><Link href="/register">Hesap Oluştur</Link><Link href="/reset-password">Şifreyi Sıfırla</Link></nav>
    <div className="footer-links"><strong>Bizi Takip Et</strong><div className="row footer-icons">
      <a href="https://www.instagram.com/ok4nnerr/" aria-label="Instagram @ok4nnerr" target="_blank" rel="noopener noreferrer"><Instagram size={23}/></a>
      <a href="https://www.tiktok.com/@ok4nnerr" aria-label="TikTok @ok4nnerr" target="_blank" rel="noopener noreferrer"><TikTok/></a>
    </div><small>@ok4nnerr</small></div>
    <div className="footer-credit"><Heart size={24}/><p>Powered by <strong>ok4nnerr</strong></p></div>
  </div></footer>;
}
