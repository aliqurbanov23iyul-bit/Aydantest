import {Brand,Header} from "@/components/ui";
import {AccountForm} from "@/components/account-form";
export default function Login(){return <main className="landing"><Brand/><section className="authbox stack"><Header title="Giriş yap" detail="Çalışmana kaldığın yerden devam et."/> {(!process.env.DATABASE_URL||!process.env.AUTH_SECRET)&&<p className="note muted">Hesap sistemi için veritabanı ve oturum ayarları bekleniyor.</p>}<AccountForm mode="login"/></section></main>}
