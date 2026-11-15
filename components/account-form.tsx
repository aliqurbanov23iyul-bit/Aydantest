"use client";
import {useActionState} from "react";
import Link from "next/link";
import {accountAction} from "@/app/actions";
export function AccountForm({mode}:{mode:"login"|"register"}){
 const [state,action,pending]=useActionState(accountAction.bind(null,mode),{});
 const register=mode==="register";
 return <form action={action} className="card stack">
  {register&&<label>Adınız<input name="name" required maxLength={60} autoComplete="name"/></label>}
  <label>E-posta<input type="email" name="email" required maxLength={254} autoComplete="email"/></label>
  <label>Şifre<input type="password" name="password" required minLength={8} maxLength={72} autoComplete={register?"new-password":"current-password"}/></label>
  {state.error&&<p role="alert" className="error">{state.error}</p>}
  <button className="btn primary" disabled={pending}>{pending?"İşleniyor…":register?"Hesap oluştur":"Giriş yap"}</button>
  {!register&&<Link href="/reset-password" className="muted">Şifremi unuttum</Link>}
  <Link href={register?"/login":"/register"} className="muted">{register?"Zaten hesabınız var mı? Giriş yapın":"Hesabınız yok mu? Kayıt olun"}</Link>
 </form>;
}
