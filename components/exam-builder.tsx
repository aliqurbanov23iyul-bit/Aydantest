"use client";
import {useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {Sparkles} from "lucide-react";
import {distribute,examConfig,type ExamConfig} from "@/lib/exam-rules";
import {modeNames,levelNames,kindNames,topicNames} from "@/lib/labels";
import {CourseIcon} from "@/components/ui";

type Course={id:string;name:string;icon:string;color:string;topics:{id:string;name:string}[]};
const presets=[5,10,15,20,25,30,40,50,75,100];
export function ExamBuilder({courses,initial,materials,hasAI,retry}:{courses:Course[];initial:string[];materials:{id:string;name:string;courseId:string}[];hasAI:boolean;retry:boolean}) {
 const router=useRouter(), running=useRef(false);
 const [mixed,setMixed]=useState(initial.length>1);
 const [ids,setIds]=useState(initial.length?initial:courses.slice(0,1).map(c=>c.id));
 const [count,setCount]=useState(hasAI?10:1);
 const [source,setSource]=useState<ExamConfig["source"]>(hasAI?"AI":"BANK");
 const [mode,setMode]=useState<ExamConfig["mode"]>(retry?"retry":"exam");
 const [level,setLevel]=useState<ExamConfig["difficulty"]>(hasAI?"mixed":"easy");
 const [kind,setKind]=useState<ExamConfig["kind"]>("choice4");
 const [topicMode,setTopicMode]=useState<ExamConfig["topicMode"]>(retry?"wrong":"all");
 const [topics,setTopics]=useState<string[]>([]);
 const [manual,setManual]=useState(false),[quota,setQuota]=useState<Record<string,number>>({});
 const [minutes,setMinutes]=useState(20),[materialId,setMaterial]=useState("");
 const [shuffleQuestions,setShuffleQuestions]=useState(true),[shuffleOptions,setShuffleOptions]=useState(true),[avoidRepeats,setAvoidRepeats]=useState(true);
 const [pending,setPending]=useState(false),[error,setError]=useState("");
 const selected=courses.filter(course=>ids.includes(course.id));
 const availableMaterials=materials.filter(item=>ids.length===1&&ids[0]===item.courseId);
 const distribution=manual?Object.fromEntries(ids.map(id=>[id,quota[id]??1])):distribute(ids,count);
 const total=Object.values(distribution).reduce((a,b)=>a+b,0);
 function pick(id:string) {
  setIds(previous=>mixed?(previous.includes(id)?previous.filter(value=>value!==id):[...previous,id]):[id]);
  setTopics([]);setMaterial("");
 }
 async function submit(event:React.FormEvent){
  event.preventDefault();if(running.current)return;
  const result=examConfig.safeParse({requestId:crypto.randomUUID(),courseIds:ids,count,distribution:manual?distribution:undefined,
   topicIds:topics,topicMode,difficulty:level,kind,mode,minutes,shuffleQuestions,shuffleOptions,avoidRepeats,source,materialId:source==="AI"?materialId||undefined:undefined});
  if(!result.success){setError(result.error.issues[0].message);return;}
  running.current=true;setPending(true);setError("");
  try {
   const response=await fetch("/api/exams",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(result.data)});
   const body=await response.json();if(!response.ok)throw new Error(body.error);
   router.push("/exam/"+body.id);
  } catch(cause){setError(cause instanceof Error?cause.message:"Test hazırlanamadı.");}
  finally{running.current=false;setPending(false);}
 }
 return <form onSubmit={submit} className="split">
  <div className="stack">
   <section className="card stack"><h2>Ders seçimi</h2><div className="row">
    <button type="button" className={"btn "+(!mixed?"selected":"")} onClick={()=>{setMixed(false);setIds(ids.slice(0,1));setTopics([]);setManual(false);setMaterial("");}}>Tek ders</button>
    <button type="button" className={"btn "+(mixed?"selected":"")} onClick={()=>setMixed(true)}>Karma ders</button>
    {mixed&&<button type="button" className="btn" onClick={()=>{setIds(courses.map(course=>course.id));setTopics([]);setMaterial("");}}>Tüm dersleri seç</button>}
   </div><div className="grid">{courses.map(course=><button type="button" aria-pressed={ids.includes(course.id)} className={"btn option "+(ids.includes(course.id)?"selected":"")} key={course.id} onClick={()=>pick(course.id)}><CourseIcon {...course}/>{course.name}</button>)}</div></section>
   <section className="card stack"><h2>Soru ayarları</h2>
   <div className="row">{presets.map(preset=><button key={preset} type="button" className={"btn "+(count===preset?"selected":"")} onClick={()=>setCount(preset)}>{preset}</button>)}</div>
   <div className="grid">
    <label>Soru sayısı<input min={1} max={100} type="number" value={count||""} required onChange={event=>setCount(Number(event.target.value))}/></label>
    <label>Kaynak<select value={source} onChange={event=>setSource(event.target.value as ExamConfig["source"])}><option value="AI">Gemini AI</option><option value="BANK">Soru bankası</option></select></label>
    <label>Zorluk<select value={level} onChange={event=>setLevel(event.target.value as ExamConfig["difficulty"])}>{Object.entries(levelNames).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
    <label>Soru türü<select value={kind} onChange={event=>setKind(event.target.value as ExamConfig["kind"])}>{Object.entries(kindNames).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
    <label>Test modu<select value={mode} onChange={event=>{const next=event.target.value as ExamConfig["mode"];setMode(next);if(next==="quick")setCount(Math.min(count,10));if(next==="retry")setTopicMode("wrong");}}>{Object.entries(modeNames).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
    <label>Konular<select value={topicMode} onChange={event=>setTopicMode(event.target.value as ExamConfig["topicMode"])}>{Object.entries(topicNames).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
    {mode==="timed"&&<label>Süre (dakika)<input type="number" min={1} max={240} required value={minutes||""} onChange={event=>setMinutes(Number(event.target.value))}/></label>}
    {source==="AI"&&availableMaterials.length>0&&<label>Ders notu<select value={materialId} onChange={event=>setMaterial(event.target.value)}><option value="">Genel sorular</option>{availableMaterials.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
   </div>
   {!hasAI&&source==="AI"&&<p className="note">Gemini anahtarı henüz yapılandırılmadı. Soru bankasını seçerek devam edebilirsiniz.</p>}
   {topicMode==="selected"&&<div className="grid">{selected.flatMap(course=>course.topics.map(topic=><label className="check" key={topic.id}><input type="checkbox" checked={topics.includes(topic.id)} onChange={event=>setTopics(event.target.checked?[...topics,topic.id]:topics.filter(id=>id!==topic.id))}/>{course.name} · {topic.name}</label>))}</div>}
   {ids.length>1&&<><label className="check"><input type="checkbox" checked={manual} onChange={event=>{setManual(event.target.checked);setQuota(distribute(ids,count));}}/>Soru dağılımını elle ayarla</label>{manual&&<div className="grid">{selected.map(course=><label key={course.id}>{course.name}<input min={1} max={100} type="number" required value={distribution[course.id]||""} onChange={event=>setQuota({...quota,[course.id]:Number(event.target.value)})}/></label>)}</div>}</>}
   </section>
   <section className="card stack"><h2>Ek seçenekler</h2><label className="check"><input type="checkbox" checked={shuffleQuestions} onChange={event=>setShuffleQuestions(event.target.checked)}/>Soruları karıştır</label><label className="check"><input type="checkbox" checked={shuffleOptions} onChange={event=>setShuffleOptions(event.target.checked)}/>Şıkları karıştır</label><label className="check"><input type="checkbox" checked={avoidRepeats} onChange={event=>setAvoidRepeats(event.target.checked)}/>Önceki soruların tekrarını azalt</label><p className="muted">Açıklamalar, yanlış cevaplar ve ayrıntılı analiz sonuç ekranında bulunur.</p></section>
  </div>
  <aside className="card stack"><h2>Test özeti</h2><p className="muted">{count} soru · {modeNames[mode]}</p><p className="muted">{source==="AI"?"Gemini AI":"Soru bankası"} · {levelNames[level]} · {kindNames[kind]}</p><p className="muted">{topicNames[topicMode]}{mode==="timed"?" · "+minutes+" dakika":""}</p>
   {selected.map(course=><div className="between listrow" key={course.id}><span>{course.name}</span><strong>{distribution[course.id]??0}</strong></div>)}
   {manual&&total!==count&&<p className="error">Dağıtılan {total} / {count} soru.</p>}
   {error&&<p className="error" role="alert">{error}</p>}
   {pending&&<p className="note" role="status">Sorular hazırlanıyor. Büyük testler birkaç dakika sürebilir.</p>}
   <button className="btn primary" disabled={pending||!ids.length||total!==count}><Sparkles size={16}/>{pending?"Hazırlanıyor…":"Testi oluştur"}</button>
  </aside>
 </form>;
}
