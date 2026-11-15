"use client";
import {useActionState,useState} from "react";
import {useRouter} from "next/navigation";
import {savePlan} from "@/app/(student)/study-plan/actions";
type Course={id:string;name:string};
export function PlanForm({courses,date,chosen}:{courses:Course[];date?:string;chosen:string[]}){
 const [state,action,pending]=useActionState(savePlan,{});
 return <form action={action} className="card stack"><h2>Sınav planı</h2><label>Sınav tarihi<input type="date" name="date" defaultValue={date} required/></label><div className="grid">{courses.map(course=><label key={course.id} className="check"><input type="checkbox" name="courses" value={course.id} defaultChecked={chosen.includes(course.id)}/>{course.name}</label>)}</div>{state.error&&<p role="alert" className="error">{state.error}</p>}{state.success&&<p className="good">{state.success}</p>}<div><button className="btn primary" disabled={pending}>Planı kaydet</button></div></form>;
}
export function UploadForm({courses}:{courses:Course[]}){
 const router=useRouter();
 const [status,setStatus]=useState(""),[error,setError]=useState(""),[pending,setPending]=useState(false);
 return <form className="stack" onSubmit={async event=>{
  event.preventDefault();const form=event.currentTarget;const data=new FormData(form);setPending(true);setError("");setStatus("");
  try{const response=await fetch("/api/materials",{method:"POST",body:data});const result=await response.json();if(!response.ok)throw new Error(result.error);form.reset();setStatus("Ders notu yüklendi.");router.refresh();}
  catch(cause){setError(cause instanceof Error?cause.message:"Dosya yüklenemedi.");}finally{setPending(false);}
 }}><div className="grid"><label>Ders<select name="course" required>{courses.map(course=><option key={course.id} value={course.id}>{course.name}</option>)}</select></label><label>PDF veya TXT<input name="file" type="file" accept=".pdf,.txt" required/></label></div><small>En fazla 4 MB, 30 PDF sayfası veya 60.000 metin karakteri.</small>{error&&<p className="error" role="alert">{error}</p>}{status&&<p className="good" role="status">{status}</p>}<div><button className="btn" disabled={pending}>{pending?"Yükleniyor…":"Ders notu yükle"}</button></div></form>;
}
