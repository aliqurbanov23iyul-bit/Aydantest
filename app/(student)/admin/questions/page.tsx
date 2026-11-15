import Link from "next/link";
import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/admin";
import {Header} from "@/components/ui";
import {AdminForm} from "@/components/admin-form";
import {kinds,levels} from "@/lib/exam-rules";
import {kindNames,levelNames} from "@/lib/labels";
type Topic={id:string;name:string;course:{name:string}};
type Question={id:string;topicId:string;kind:string;difficulty:string;prompt:string;options:string[];answer:string;explanation:string;source:string|null};
function Fields({topics,q}:{topics:Topic[];q?:Question}){
 return <AdminForm kind="question" label={q?"Soruyu güncelle":"Soruyu ekle"}>{q&&<input type="hidden" name="id" value={q.id}/>}<div className="grid"><label>Konu<select name="topic" defaultValue={q?.topicId} required>{topics.map(topic=><option key={topic.id} value={topic.id}>{topic.course.name} · {topic.name}</option>)}</select></label><label>Tür<select name="kind" defaultValue={q?.kind}>{kinds.map(kind=><option key={kind} value={kind}>{kindNames[kind]}</option>)}</select></label><label>Zorluk<select name="difficulty" defaultValue={q?.difficulty}>{levels.map(level=><option key={level} value={level}>{levelNames[level]}</option>)}</select></label></div><label>Soru<textarea name="prompt" minLength={8} maxLength={1800} required defaultValue={q?.prompt}/></label><label>Şıklar (her satıra bir şık)<textarea name="options" rows={4} defaultValue={q?.options.join("\n")}/></label><label>Doğru cevap<input name="answer" maxLength={400} required defaultValue={q?.answer}/></label><label>Açıklama<textarea name="explanation" minLength={10} maxLength={2000} required defaultValue={q?.explanation}/></label><label>Kaynak<input name="source" maxLength={300} defaultValue={q?.source??""}/></label></AdminForm>;
}
export default async function Questions({searchParams}:{searchParams:Promise<{source?:string;page?:string;q?:string}>}){
 await requireAdmin();
 const {source,page,q}=await searchParams;
 const offset=Math.max(0,Math.min(10000,Number.parseInt(page??"0",10)||0));
 const origin=source==="AI"||source==="BANK"?source:undefined;
 const [topics,questions,reports]=await Promise.all([
  db.topic.findMany({include:{course:{select:{name:true}}}}),
  db.question.findMany({where:{origin,...(q?{id:q}:{})},include:{course:{select:{name:true}}},orderBy:{createdAt:"desc"},skip:q?0:offset*20,take:21}),
  db.questionReport.findMany({where:{resolved:false},include:{question:{select:{prompt:true}}},take:30}),
 ]);
 return <div className="stack"><Header title="Soru yönetimi"/><div className="row"><Link className="btn" href="/admin/questions">Tümü</Link><Link className="btn" href="/admin/questions?source=BANK">Soru bankası</Link><Link className="btn" href="/admin/questions?source=AI">AI soruları</Link></div>
 <details className="card"><summary>Manuel soru ekle</summary><Fields topics={topics}/></details>
 <section className="card stack"><h2>Açık bildirimler</h2>{reports.length?reports.map(report=><div className="listrow stack" key={report.id}><Link href={"/admin/questions?q="+report.questionId}>{report.question.prompt} →</Link><p>{report.text}</p><AdminForm kind="report" label="Çözüldü olarak işaretle"><input type="hidden" name="id" value={report.id}/></AdminForm></div>):<p className="muted">Açık bildirim yok.</p>}</section>
 {questions.slice(0,20).map(question=><details className="card" key={question.id}><summary>{question.active?"":"[Arşiv] "}{question.course.name} · {question.prompt}</summary><div className="stack"><Fields topics={topics} q={question}/><AdminForm kind="questionState" label={question.active?"Arşivle":"Yeniden etkinleştir"}><input name="id" type="hidden" value={question.id}/><input name="active" type="hidden" value={String(!question.active)}/></AdminForm></div></details>)}
 <div className="row">{!q&&offset>0&&<Link className="btn" href={"/admin/questions?source="+(origin??"")+"&page="+(offset-1)}>Önceki</Link>}{!q&&questions.length>20&&<Link className="btn" href={"/admin/questions?source="+(origin??"")+"&page="+(offset+1)}>Sonraki</Link>}</div></div>;
}
