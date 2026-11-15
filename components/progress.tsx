import Link from "next/link";
import {Bar,Empty} from "@/components/ui";
import {dateLabel,summary} from "@/lib/stats";
import {levelNames,modeNames} from "@/lib/labels";
export function Breakdown({title,rows}:{title:string;rows:{label:string;percent:number;right:number;total:number}[]}){
 return <section className="card stack"><h2>{title}</h2>{rows.length?rows.map(row=><div key={row.label} className="stack" style={{gap:5}}><div className="between"><span>{levelNames[row.label as keyof typeof levelNames]??row.label}</span><small>{row.right}/{row.total} · %{row.percent}</small></div><Bar value={row.percent}/></div>):<p className="muted">Henüz veri yok.</p>}</section>;
}
export function ExamRows({exams}:{exams:{id:string;mode:string;status:string;createdAt:Date;items:{correct:boolean|null;response:string|null}[]}[]}){
 return exams.length?<div className="card stack">{exams.map(exam=><Link className="between listrow" key={exam.id} href={"/exam/"+exam.id+(exam.status==="COMPLETE"?"/result":"")}><div><strong>{modeNames[exam.mode as keyof typeof modeNames]??"Sınav"}</strong><p className="muted">{dateLabel(exam.createdAt)} · {exam.items.length} soru</p></div><span className="pill">{exam.status==="COMPLETE"?"%"+summary(exam.items).percent:"Devam et"}</span></Link>)}</div>:<Empty>Henüz sınav yok. <Link href="/exam/create">Yeni test oluştur →</Link></Empty>;
}
