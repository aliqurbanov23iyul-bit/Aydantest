import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Bar, CourseIcon } from "@/components/ui";
import { catalog } from "@/lib/catalog";

type Course = {id:string; name:string; icon:string; color:string};
const illustratedCourses = new Set(catalog.map(course => course.id));

export function CourseCard({course, href, detail, action, progress, compact=false}:{
  course:Course;
  href:string;
  detail:string;
  action?:string;
  progress?:number;
  compact?:boolean;
}) {
  const hasArt = illustratedCourses.has(course.id);
  return <Link href={href} data-color={course.color} className={"card course-cover" + (compact ? " course-cover-compact" : "")}>
    <div className="course-visual">
      {hasArt ? <Image src={`/art/courses/${course.id}.webp`} alt="" fill unoptimized/> : <CourseIcon {...course}/>}
    </div>
    <div className="course-cover-body">
      <h3>{course.name}</h3>
      <small>{detail}</small>
      {progress !== undefined && <Bar value={progress}/>}
      {action && <span className="course-card-action">{action}<ArrowUpRight size={17} aria-hidden="true"/></span>}
    </div>
  </Link>;
}
