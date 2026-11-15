import Link from "next/link";
import { Brand } from "@/components/ui";
import { Nav, ThemeButton } from "@/components/nav";
import { Theme } from "@/components/theme";
import { requireUser } from "@/lib/user";
import { logout } from "@/app/actions";
export const dynamic = "force-dynamic";

export default async function StudentLayout({children}:{children:React.ReactNode}) {
 const user=await requireUser();
 return <div className="shell"><Theme/><aside className="sidebar"><Brand/><Nav admin={user.role==="ADMIN"}/><form className="footer" action={logout}><button className="btn">Çıkış yap</button></form></aside>
 <main className="main"><div className="top between"><Link href="/dashboard" className="muted">Çalışma Alanı</Link><div className="row"><ThemeButton/><Link href="/profile" className="pill">{user.avatar} {user.name}</Link></div></div>{children}</main></div>;
}
