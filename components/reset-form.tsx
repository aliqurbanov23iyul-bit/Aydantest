"use client";
import {useActionState} from "react";
import Link from "next/link";
import {resetPassword} from "@/app/reset-password/actions";
export function ResetForm({token}:{token?:string}){
 const [state,action,pending]=useActionState(resetPassword.bind(null,token?"reset":"request"),{});
 return <form className="card stack" action={action}>{token?<><input type="hidden" name="token" value={token}/><label>Yeni şifre<input type="password" name="password" minLength={8} maxLength={72} autoComplete="new-password" required/></label></>:<label>E-posta<input type="email" name="email" autoComplete="email" required/></label>}{state.error&&<p className="error" role="alert">{state.error}</p>}{state.success&&<p className="good" role="status">{state.success}</p>}<button className="btn primary" disabled={pending}>{token?"Şifreyi kaydet":"Bağlantı gönder"}</button><Link href="/login">Girişe dön</Link></form>;
}
