import { db } from "@/lib/db";
import { CourseCard } from "@/components/course-card";
import { Header } from "@/components/ui";

export default async function Courses() {
  const courses = await db.course.findMany({include:{_count:{select:{topics:true}}},orderBy:{name:"asc"}});
  return <div className="stack">
    <Header title="Dersler" detail="Konuları, ilerlemeyi ve soru bankasını incele."/>
    <div className="course-gallery">{courses.map(course => <CourseCard key={course.id} course={course} href={"/courses/" + course.id} detail={course._count.topics + " konu"} action="Dersi Aç"/>)}</div>
  </div>;
}
