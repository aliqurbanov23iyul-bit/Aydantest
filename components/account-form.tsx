"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { accountAction } from "@/app/actions";

export function AccountForm({mode}:{mode:"login"|"register"}) {
  const [state, action, pending] = useActionState(accountAction.bind(null, mode), {});
  const [visible, setVisible] = useState(false);
  const register = mode === "register";
  return <form action={action} className="stack account-form">
    {register && <label>Adınız<input name="name" required maxLength={60} autoComplete="name"/></label>}
    <label className="auth-field"><span className="sr-only">E-posta adresi</span><Mail size={16}/><input type="email" name="email" placeholder="E-posta adresi" required maxLength={254} autoComplete="email"/></label>
    <div className="password-field">
      <label className="auth-field"><span className="sr-only">Şifre</span><LockKeyhole size={16}/><input type={visible ? "text" : "password"} name="password" placeholder="Şifre" required minLength={8} maxLength={72} autoComplete={register ? "new-password" : "current-password"}/></label>
      <button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
    </div>
    {!register && <Link href="/reset-password" className="forgot-link">Şifremi unuttum</Link>}
    {state.error && <p role="alert" className="error">{state.error}</p>}
    <button className="btn primary" disabled={pending}>{pending ? "İşleniyor…" : register ? "Hesap Oluştur" : "Giriş Yap"}</button>
    <p className="auth-switch">{register ? "Zaten hesabın var mı?" : "Hesabın yok mu?"} <Link href={register ? "/login" : "/register"}>{register ? "Giriş Yap" : "Hesap Oluştur"}</Link></p>
  </form>;
}
