import Link from "next/link";
import {requireAdmin} from "@/lib/admin";
const links=[["","Özet"],["/users","Kullanıcılar"],["/courses","Dersler"],["/questions","Sorular"],["/analytics","Analiz"],["/settings","Ayarlar"]];
export default async function AdminLayout({children}:{children:React.ReactNode}){
 await requireAdmin();
 return <div className="stack"><nav className="row admin-menu" aria-label="Yönetim menüsü">{links.map(([path,label])=><Link className="btn" key={path} href={"/admin"+path}>{label}</Link>)}</nav>{children}</div>;
}
