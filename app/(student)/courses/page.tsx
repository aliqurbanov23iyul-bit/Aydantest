import Link from "next/link";
import {db} from "@/lib/db";
import {CourseIcon,Header} from "@/components/ui";
export default async function Courses(){
 const courses=await db.course.findMany({include:{_count:{select:{topics:true}}},orderBy:{name:"asc"}});
 return <div className="stack"><Header title="Dersler" detail="Konuları, ilerlemeyi ve soru bankasını incele."/><div className="grid">{courses.map(course=><Link href={"/courses/"+course.id} key={course.id} className="card course"><CourseIcon {...course}/><h3>{course.name}</h3><small>{course._count.topics} konu</small></Link>)}</div></div>;
}
