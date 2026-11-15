"use client";
import {useActionState} from "react";
import {updateAccount} from "@/app/(student)/profile/actions";
export function ProfileForm({name,avatar,goal}:{name:string;avatar:string;goal:number}){
 const [state,action,pending]=useActionState(updateAccount.bind(null,"profile"),{});
 return <form action={action} className="card stack"><h2>Profil bilgileri</h2><label>Adınız<input name="name" defaultValue={name} minLength={2} maxLength={60} required/></label><label>Avatar<select name="avatar" defaultValue={avatar}>{["🎓","📚","🧠","🚀","🌙"].map(value=><option key={value}>{value}</option>)}</select></label><label>Günlük soru hedefi<input name="goal" type="number" min={1} max={200} defaultValue={goal} required/></label>{state.error&&<p className="error" role="alert">{state.error}</p>}{state.success&&<p className="good">{state.success}</p>}<div><button className="btn primary" disabled={pending}>Profili kaydet</button></div></form>;
}
export function AccountSettings({mode}:{mode:"password"|"delete"}){
 const [state,action,pending]=useActionState(updateAccount.bind(null,mode),{});
 const remove=mode==="delete";
 return <form action={action} className="card stack"><h2>{remove?"Hesabı sil":"Şifre değiştir"}</h2><label>Mevcut şifre<input required name="current" type="password" autoComplete="current-password"/></label>{remove?<label>Onaylamak için HESABIMI SİL yazın<input required name="confirm"/></label>:<label>Yeni şifre<input required minLength={8} maxLength={72} name="next" type="password" autoComplete="new-password"/></label>}{state.error&&<p className="error" role="alert">{state.error}</p>}{state.success&&<p role="status" className="good">{state.success}</p>}<div><button className="btn" disabled={pending}>{remove?"Hesabımı sil":"Şifreyi değiştir"}</button></div></form>;
}
