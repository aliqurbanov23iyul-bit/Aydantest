import Image from "next/image";
import { Brand } from "@/components/ui";
import { AccountForm } from "@/components/account-form";
import { GoogleButton } from "@/components/google-button";

export function AuthScreen({mode,error,accountReady=true}:{mode:"login"|"register";error?:string;accountReady?:boolean}) {
  const register = mode === "register";
  return <main className="auth-page landing">
    <div className="auth-visual">
      <p>Derslerine<br/> AI gücüyle hazırlan!</p>
      <div className="auth-illustration"><Image src="/art/study-desk.webp" alt="" fill unoptimized preload/></div>
    </div>
    <div className="auth-column stack">
      <Brand/>
      <section className="card stack auth-panel">
        <header><h1>{register ? "Hesap Oluştur" : "Hesabına Giriş Yap"}</h1><p>{register ? "Derslerini seç ve ilk testini hazırla." : "Testlerine devam etmek için giriş yap."}</p></header>
        {!accountReady && <p className="note muted">Hesap sistemi için veritabanı ve oturum ayarları bekleniyor.</p>}
        {error && <p className="error" role="alert">{error === "GoogleEmailInUse" ? "Bu e-posta ile daha önce şifreli bir hesap oluşturulmuş. Mevcut şifrenizle giriş yapın." : "Google oturumu açılamadı. Tekrar deneyin veya şifrenizle giriş yapın."}</p>}
        <AccountForm mode={mode}/>
        <GoogleButton/>
      </section>
    </div>
  </main>;
}
