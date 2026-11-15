import {db} from "@/lib/db";
import type {Snapshot} from "@/lib/exam-rules";
export const dateLabel=(date:Date)=>new Intl.DateTimeFormat("tr-TR",{dateStyle:"medium",timeZone:"Europe/Istanbul"}).format(date);
export const dayKey=(date:Date)=>new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Istanbul"}).format(date);
export function summary(items:{correct:boolean|null;response:string|null}[]){
 const right=items.filter(item=>item.correct===true).length;
 const wrong=items.filter(item=>item.correct===false).length;
 return {right,wrong,blank:items.length-right-wrong,total:items.length,percent:items.length?Math.round(right/items.length*100):0};
}
export function breakdown(items:{correct:boolean|null;response:string|null;snapshot:unknown}[],key:"course"|"topic"|"difficulty"){
 const groups=new Map<string,typeof items>();
 for(const item of items){
  const snapshot=item.snapshot as Snapshot;
  const label=key==="topic"?snapshot.course+" · "+snapshot.topic:snapshot[key];
  const list=groups.get(label)??[];
  list.push(item);groups.set(label,list);
 }
 return [...groups].map(([label,items])=>({label,...summary(items)})).sort((a,b)=>b.total-a.total);
}
export async function progress(userId:string){
 const exams=await db.exam.findMany({where:{userId,status:"COMPLETE"},include:{items:true},orderBy:{completedAt:"desc"}});
 const items=exams.flatMap(exam=>exam.items);
 const days=new Map<string,number>();
 for(const exam of exams){
  if(!exam.completedAt)continue;
  const day=dayKey(exam.completedAt);
  days.set(day,(days.get(day)??0)+exam.items.filter(item=>item.response).length);
 }
 const dateAt=(offset:number)=>new Date(Date.now()+offset*86400000);
 const week=Array.from({length:7},(_,index)=>{
  const date=dateAt(index-6);
  return {day:new Intl.DateTimeFormat("tr-TR",{weekday:"short",timeZone:"Europe/Istanbul"}).format(date),count:days.get(dayKey(date))??0};
 });
 const today=days.get(dayKey(dateAt(0)))??0;
 let streak=0;
 for(let offset=today?0:-1;(days.get(dayKey(dateAt(offset)))??0)>0;offset--)streak++;
 const stats=summary(items);
 const xp=stats.right*10+stats.wrong*2+exams.length*5;
 const perfect=exams.filter(exam=>exam.items.length>0&&exam.items.every(item=>item.correct)).length;
 const math=items.filter(item=>(item.snapshot as unknown as Snapshot).courseId==="matematik"&&item.correct).length;
 return {exams,items,week,today,streak,xp,level:Math.floor(xp/150)+1,stats,perfect,math,
  weak:breakdown(items.filter(item=>item.response),"topic").filter(item=>item.wrong>0).sort((a,b)=>a.percent-b.percent),};
}
