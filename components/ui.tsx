import { BookOpen, Calculator, GraduationCap, Landmark, Map, Monitor, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
const icons:Record<string,LucideIcon>={BookOpen,Calculator,GraduationCap,Landmark,Map,Monitor,Users};
export function Brand(){return <Link href="/" className="brand"><span><GraduationCap size={31}/></span>AydanTest</Link>}
export function CourseIcon({icon,color}:{icon:string;color:string}){const Icon=icons[icon]??BookOpen;return <span className="iconbox" data-color={color}><Icon size={20}/></span>}
export function Header({title,detail,children}:{title:string;detail?:string;children?:React.ReactNode}) {
  return <header className="between page-heading"><div className="stack"><h1>{title}</h1>{detail&&<p className="muted">{detail}</p>}</div>{children}</header>;
}
export function Empty({children}:{children:React.ReactNode}){return <div className="card muted">{children}</div>}
export function Bar({value}:{value:number}){return <div className="bar" role="progressbar" aria-label="İlerleme" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{width:value+"%"}}/></div>}
