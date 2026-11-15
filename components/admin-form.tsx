"use client";
import {useActionState} from "react";
import {adminAction} from "@/app/(student)/admin/actions";
export function AdminForm({kind,label,children}:{kind:Parameters<typeof adminAction>[0];label:string;children:React.ReactNode}){
 const [state,action,pending]=useActionState(adminAction.bind(null,kind),{});
 return <form action={action} className="stack">{children}{state.error&&<p className="error" role="alert">{state.error}</p>}{state.success&&<p className="good" role="status">{state.success}</p>}<div><button className="btn" disabled={pending}>{label}</button></div></form>;
}
