"use client";
import {useState} from "react";
import type {sampleQuestions} from "@/lib/catalog";
export function Practice({questions}:{questions:ReadonlyArray<(typeof sampleQuestions)[number]>}){
 const [index,setIndex]=useState(0),[answers,setAnswers]=useState<Record<number,string>>({});
 const [,prompt,answer,b,c,d,explanation]=questions[index];
 const options=[answer,b,c,d];const offset=(index+1)%4;const displayed=[...options.slice(offset),...options.slice(0,offset)];
 return <section className="card stack"><div className="between"><span className="pill">Soru {index+1} / {questions.length}</span><span className="pill">{Object.entries(answers).filter(([i,value])=>questions[Number(i)][2]===value).length} doğru</span></div><h2>{prompt}</h2>{displayed.map(value=><button key={value} className={"btn option "+(answers[index]===value?"selected":"")} disabled={Boolean(answers[index])} onClick={()=>setAnswers({...answers,[index]:value})}>{value}</button>)}{answers[index]&&<p className="note" role="status"><strong>{answers[index]===answer?"Doğru":"Doğru cevap · "+answer}</strong><br/>{explanation}</p>}<div className="between"><button className="btn" disabled={!index} onClick={()=>setIndex(index-1)}>Önceki</button>{index<questions.length-1?<button className="btn primary" onClick={()=>setIndex(index+1)}>Sonraki</button>:<button className="btn" onClick={()=>{setIndex(0);setAnswers({});}}>Yeniden başla</button>}</div></section>;
}
