"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {Flag} from "lucide-react";
import {Bar} from "@/components/ui";
type Reveal={correct:boolean;answer:string;explanation:string};
type Item={id:string;course:string;topic:string;prompt:string;kind:string;options:string[];response:string|null;marked:boolean;reveal:Reveal|null};

export function ExamPlayer({id,items:initial,expiresAt}:{id:string;items:Item[];expiresAt:string|null}) {
 const router=useRouter();
 const [items,setItems]=useState(initial),[index,setIndex]=useState(0),[draft,setDraft]=useState<string|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[confirm,setConfirm]=useState(false);
 const [now,setNow]=useState<number|null>(null);
 useEffect(()=>{
  if(!expiresAt)return;
  const interval=setInterval(()=>setNow(Date.now()),1000);
  return ()=>clearInterval(interval);
 },[expiresAt]);
 const remaining=expiresAt&&now!==null?Math.max(0,Math.ceil((+new Date(expiresAt)-now)/1000)):null;
 useEffect(()=>{if(remaining===0)router.refresh();},[remaining,router]);
 const item=items[index],answered=items.filter(value=>value.response!==null).length;
 if(!item)return null;
 function go(position:number){setDraft(null);setIndex(position);setConfirm(false);}
 async function move(action:"answer"|"mark"|"finish",value?:string|boolean|null) {
  if(busy)return;setBusy(true);setError("");
  try{
   const response=await fetch("/api/exams/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,item:item.id,value})});
   const data=await response.json();if(!response.ok)throw new Error(data.error);
   if(data.finished){router.replace("/exam/"+id+"/result");return;}
   setItems(previous=>previous.map(entry=>entry.id!==item.id?entry:action==="mark"?{...entry,marked:data.marked}:{...entry,response:data.response,reveal:data.reveal}));
   if(action==="answer")setDraft(null);
  }catch(cause){setError(cause instanceof Error?cause.message:"İşlem tamamlanamadı.");}
  finally{setBusy(false);}
 }
 return <div className="stack"><section className="card stack"><div className="between"><div><h2>{item.course}</h2><small>{item.topic}</small></div><span className="pill">{answered} / {items.length} cevaplandı</span>{remaining!==null&&<span className="pill" aria-label="Kalan süre">{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,"0")}</span>}</div><Bar value={Math.round(answered/items.length*100)}/></section>
 <div className="split"><section className="card stack">
  <div className="between"><span className="eyebrow">Soru {index+1}</span><button className={"btn "+(item.marked?"marked":"")} onClick={()=>move("mark",!item.marked)} disabled={busy}><Flag size={15}/>{item.marked?"İşaretli":"İşaretle"}</button></div><h2>{item.prompt}</h2>
  {item.kind==="fill"?<form className="row" onSubmit={event=>{event.preventDefault();move("answer",draft??item.response??"");}}><input aria-label="Cevabınız" maxLength={400} value={draft??item.response??""} onChange={event=>setDraft(event.target.value)} disabled={busy||Boolean(item.reveal)}/><button className="btn" disabled={busy||Boolean(item.reveal)}>Cevabı kaydet</button></form>:item.options.map((option,i)=><button key={option} className={"btn option "+(item.response===option?"selected":"")} aria-pressed={item.response===option} disabled={busy||Boolean(item.reveal)} onClick={()=>move("answer",option)}><strong>{String.fromCharCode(65+i)}</strong>{option}</button>)}
  {item.reveal&&<div className="note"><strong className={item.reveal.correct?"good":""}>{item.reveal.correct?"Doğru":"Doğru cevap · "+item.reveal.answer}</strong><p>{item.reveal.explanation}</p></div>}
  {item.response&&!item.reveal&&<div><button className="btn" disabled={busy} onClick={()=>move("answer",null)}>Cevabı temizle</button></div>}
  <div className="between"><button className="btn" disabled={busy||index===0} onClick={()=>go(index-1)}>Önceki</button><button className="btn" disabled={busy||index===items.length-1} onClick={()=>go(index+1)}>Sonraki</button></div>
 </section><aside className="card stack"><h3>Sorular</h3><div className="question-nav">{items.map((entry,i)=><button key={entry.id} aria-label={String(i+1)+". soru"+(entry.marked?", işaretli":"")+(entry.response?", cevaplandı":"")} className={"btn "+(i===index||entry.response?"selected ":"")+(entry.marked?"marked":"")} onClick={()=>go(i)} disabled={busy}>{i+1}</button>)}</div>
 {error&&<p role="alert" className="error">{error}</p>}{confirm?<><p>{items.length-answered} boş soru var. Sınavı bitirmek istiyor musunuz?</p><button className="btn primary" onClick={()=>move("finish")} disabled={busy}>Evet, bitir</button><button className="btn" onClick={()=>setConfirm(false)}>Devam et</button></>:<button className="btn primary" onClick={()=>setConfirm(true)} disabled={busy}>Sınavı bitir</button>}
 </aside></div></div>;
}
