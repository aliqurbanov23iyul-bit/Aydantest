"use client";
import {useState} from "react";
type Message={role:string;text:string};
const suggestions=["Bana basitçe anlat","Örnek ver","Neden bu cevap doğru?","Diğer seçenekler neden yanlış?","Bu konuyu özetle","Benzer bir soru sor","Adım adım çöz"];
export function Teacher({initial,id,context,available}:{initial:Message[];id?:string;context?:string;available:boolean}){
 const [messages,setMessages]=useState(initial),[conversation,setConversation]=useState(id),[message,setMessage]=useState(""),[pending,setPending]=useState(false),[error,setError]=useState("");
 async function send(text:string){
  if(pending||!text.trim())return;setError("");setPending(true);
  try{
   const response=await fetch("/api/teacher",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,contextId:context,conversationId:conversation})});
   const data=await response.json();if(!response.ok)throw new Error(data.error);
   setConversation(data.id);setMessages(previous=>[...previous,{role:"user",text},{role:"assistant",text:data.answer}]);setMessage("");
  }catch(cause){setError(cause instanceof Error?cause.message:"Mesaj gönderilemedi.");}
  finally{setPending(false);}
 }
 return <section className="card stack">{!available&&<p className="note">Gemini anahtarı henüz yapılandırılmadı.</p>}
 {messages.map((item,index)=><div className="message" data-role={item.role} key={index}><strong>{item.role==="user"?"Siz":"AI Öğretmen"}</strong><br/>{item.text}</div>)}
 <div className="row">{suggestions.map(text=><button key={text} className="btn" disabled={pending||!available} onClick={()=>context||messages.length?send(text):setMessage(text+" · ") }>{text}</button>)}</div>
 <form className="stack" onSubmit={event=>{event.preventDefault();send(message);}}><label>Mesajınız<textarea rows={3} maxLength={1500} value={message} onChange={event=>setMessage(event.target.value)}/></label><div><button className="btn primary" disabled={pending||!available}>{pending?"Yanıt hazırlanıyor…":"Gönder"}</button></div></form>
 {error&&<p role="alert" className="error">{error}</p>}</section>;
}
