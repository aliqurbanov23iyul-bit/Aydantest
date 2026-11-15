import {Brand,Header} from "@/components/ui";
import {AccountForm} from "@/components/account-form";
export default function Register(){return <main className="landing"><Brand/><section className="authbox stack"><Header title="Hesap oluştur" detail="Derslerini seç ve ilk testini hazırla."/><AccountForm mode="register"/></section></main>}
