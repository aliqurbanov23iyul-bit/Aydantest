import Link from "next/link";
import {favorite,report} from "@/app/(student)/review-actions";
import type {Snapshot} from "@/lib/exam-rules";
export function Review({item,saved=false,reported=false}:{item:{id:string;questionId:string;response:string|null;correct:boolean|null;snapshot:unknown};saved?:boolean;reported?:boolean}){
 const question=item.snapshot as Snapshot;
 return <article className="card stack"><div className="between"><span className="eyebrow">{question.course} · {question.topic}</span><span className={"pill "+(item.correct?"good":"")}>{item.correct?"Doğru":item.response?"Yanlış":"Boş"}</span></div><h3>{question.prompt}</h3>
 <p className="muted">Cevabınız · {item.response??"Boş"}</p><p className="good">Doğru cevap · {question.answer}</p><p>{question.explanation}</p>
 {question.source&&<small>Kaynak · {question.source}</small>}{question.origin==="AI"&&<small>Yapay zekâ sorusu. Şüpheli bir yanıtı bildirebilirsiniz.</small>}
 <div className="row"><form action={favorite.bind(null,item.questionId,!saved)}><button className="btn">{saved?"Favoriden çıkar":"Favoriye ekle"}</button></form><Link className="btn" href={"/ai-teacher?item="+item.id}>AI öğretmene sor</Link></div>
 <details><summary>{reported?"Bildirim alındı · düzenle":"Soru hatası bildir"}</summary><form className="stack" action={report.bind(null,item.questionId)}><input aria-label="Sorunun açıklaması" name="report" minLength={5} maxLength={500} required/><div><button className="btn">Bildir</button></div></form></details></article>;
}
