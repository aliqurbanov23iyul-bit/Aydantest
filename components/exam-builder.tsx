"use client";
import {useRef,useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {BookOpen,FileText,Sparkles} from "lucide-react";
import {distribute,examConfig,type ExamConfig} from "@/lib/exam-rules";
import {modeNames,levelNames,kindNames,topicNames} from "@/lib/labels";


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
 return <form onSubmit={submit} className="builder">
  <fieldset className="builder-sources"><legend className="sr-only">Soru kaynağı</legend>
   <label className="builder-choice"><input type="radio" name="source" checked={source==="AI"} onChange={()=>setSource("AI")}/><Sparkles size={17}/> AI ile Test Oluştur</label>
   <Link href="/study-plan#ders-notlari" className="builder-choice"><FileText size={17}/> PDF ile Test Oluştur</Link>
   <label className="builder-choice"><input type="radio" name="source" checked={source==="BANK"} onChange={()=>setSource("BANK")}/><BookOpen size={17}/> Soru Bankası</label>
  </fieldset>
  <section className="card stack builder-settings">
   <h2>Ders Seçimi</h2>
   <fieldset className="row"><legend className="sr-only">Ders sayısı</legend>
    <label className="check"><input type="radio" name="mix" checked={!mixed} onChange={()=>{setMixed(false);setIds(ids.length?ids.slice(0,1):courses.slice(0,1).map(course=>course.id));setTopics([]);setManual(false);setMaterial("");}}/>Tek Ders</label>
    <label className="check"><input type="radio" name="mix" checked={mixed} onChange={()=>setMixed(true)}/>Karma Ders</label>
    {mixed&&<button type="button" className="btn" onClick={()=>{setIds(courses.map(course=>course.id));setTopics([]);setMaterial("");}}>Tümünü Seç</button>}
   </fieldset>
   {mixed ? <div className="builder-course-list">{courses.map(course=><label className="check" key={course.id}><input type="checkbox" checked={ids.includes(course.id)} onChange={()=>pick(course.id)}/>{course.name}</label>)}</div> :
    <label><span className="sr-only">Ders</span><select value={ids[0]??""} onChange={event=>pick(event.target.value)}>{courses.map(course=><option key={course.id} value={course.id}>{course.name}</option>)}</select></label>}
   <fieldset className="stack"><legend>Soru Sayısı</legend>
    <div className="row builder-pills">{presets.map(preset=><button key={preset} type="button" aria-pressed={count===preset} className={"btn "+(count===preset?"selected":"")} onClick={()=>setCount(preset)}>{preset}</button>)}</div>
    <label>Özel soru sayısı<input min={1} max={100} type="number" value={count||""} required onChange={event=>setCount(Number(event.target.value))}/></label>
   </fieldset>
   <fieldset><legend>Zorluk Seviyesi</legend><div className="row builder-pills">{Object.entries(levelNames).map(([value,label])=><label className="builder-choice" key={value}><input type="radio" name="difficulty" checked={level===value} onChange={()=>setLevel(value as ExamConfig["difficulty"])}/>{label}</label>)}</div></fieldset>
   {ids.length>1&&<><label className="check"><input type="checkbox" checked={manual} onChange={event=>{setManual(event.target.checked);setQuota(distribute(ids,count));}}/>Soru dağılımını elle ayarla</label>{manual&&<div className="grid">{selected.map(course=><label key={course.id}>{course.name}<input min={1} max={100} type="number" required value={distribution[course.id]||""} onChange={event=>setQuota({...quota,[course.id]:Number(event.target.value)})}/></label>)}</div>}</>}
  </section>
  <section className="card stack builder-settings">
   <label>Konu Seçimi<select value={topicMode} onChange={event=>setTopicMode(event.target.value as ExamConfig["topicMode"])}>{Object.entries(topicNames).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
   {topicMode==="selected"&&<div className="builder-course-list">{selected.flatMap(course=>course.topics.map(topic=><label className="check" key={topic.id}><input type="checkbox" checked={topics.includes(topic.id)} onChange={event=>setTopics(event.target.checked?[...topics,topic.id]:topics.filter(id=>id!==topic.id))}/>{course.name} · {topic.name}</label>))}</div>}
   <label>Soru Türü<select value={kind} onChange={event=>setKind(event.target.value as ExamConfig["kind"])}>{Object.entries(kindNames).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
   <fieldset className="stack builder-modes"><legend>Test Modu</legend>{Object.entries(modeNames).map(([value,label])=><label className="check builder-mode" key={value}><input type="radio" name="mode" checked={mode===value} onChange={()=>{const next=value as ExamConfig["mode"];setMode(next);if(next==="quick")setCount(Math.min(count,10));if(next==="retry")setTopicMode("wrong");}}/>{label}</label>)}</fieldset>
   {mode==="timed"&&<label>Süre (dakika)<input type="number" min={1} max={240} required value={minutes||""} onChange={event=>setMinutes(Number(event.target.value))}/></label>}
   {source==="AI"&&<div className="stack">
    {availableMaterials.length>0&&<label>Ders notu<select value={materialId} onChange={event=>setMaterial(event.target.value)}><option value="">Genel sorular</option>{availableMaterials.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
    <Link href="/study-plan#ders-notlari" className="text-link">PDF veya ders notu yükle →</Link>
    {!hasAI&&<p className="note">Gemini anahtarı henüz yapılandırılmadı. Soru bankasını seçerek devam edebilirsiniz.</p>}
   </div>}
  </section>
  <section className="card stack builder-options"><h2>Ek Seçenekler</h2><div className="row">
   <label className="check"><input type="checkbox" checked={shuffleQuestions} onChange={event=>setShuffleQuestions(event.target.checked)}/>Soruları karıştır</label>
   <label className="check"><input type="checkbox" checked={shuffleOptions} onChange={event=>setShuffleOptions(event.target.checked)}/>Şıkları karıştır</label>
   <label className="check"><input type="checkbox" checked={avoidRepeats} onChange={event=>setAvoidRepeats(event.target.checked)}/>Önceki soruların tekrarını azalt</label>
  </div></section>
  <div className="stack builder-submit">
   <details className="card builder-summary"><summary>Test özeti · {count} soru</summary>{selected.map(course=><div className="between listrow" key={course.id}><span>{course.name}</span><strong>{distribution[course.id]??0}</strong></div>)}</details>
   {manual&&total!==count&&<p className="error">Dağıtılan {total} / {count} soru.</p>}
   {error&&<p className="error" role="alert">{error}</p>}
   {pending&&<p className="note" role="status">Sorular hazırlanıyor. Büyük testler birkaç dakika sürebilir.</p>}
   <button className="btn primary" disabled={pending||!ids.length||total!==count}><Sparkles size={17}/>{pending?"Hazırlanıyor…":"Testi Oluştur"}</button>
  </div>
 </form>;
}
