import {Header} from "@/components/ui";
import {ThemeButton} from "@/components/nav";
import {AccountSettings} from "@/components/profile-forms";
import {logout} from "@/app/actions";
export default function Settings(){return <div className="stack"><Header title="Ayarlar" detail="Görünüm ve hesap güvenliği."/><div className="row"><ThemeButton/><form action={logout}><button className="btn">Çıkış yap</button></form></div><div className="grid"><AccountSettings mode="password"/><AccountSettings mode="delete"/></div></div>;}
