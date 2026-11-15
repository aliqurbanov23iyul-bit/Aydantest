import {Brand,Header} from "@/components/ui";
import {AccountForm} from "@/components/account-form";
import {GoogleButton} from "@/components/google-button";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {error}=await searchParams;
 return <main className="landing"><Brand/><section className="authbox stack">
  <Header title="Giriş yap" detail="Çalışmana kaldığın yerden devam et."/>
  {(!process.env.DATABASE_URL||!process.env.AUTH_SECRET)&&<p className="note muted">Hesap sistemi için veritabanı ve oturum ayarları bekleniyor.</p>}
  {error&&<p className="error" role="alert">{error==="GoogleEmailInUse"?"Bu e-posta ile daha önce şifreli bir hesap oluşturulmuş. Mevcut şifrenizle giriş yapın.":"Google oturumu açılamadı. Tekrar deneyin veya şifrenizle giriş yapın."}</p>}
  <GoogleButton/><AccountForm mode="login"/>
 </section></main>;
}
