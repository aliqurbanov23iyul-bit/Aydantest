import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/admin";
import {Header} from "@/components/ui";
import {AdminForm} from "@/components/admin-form";
const icons=["Users","GraduationCap","Landmark","Monitor","Calculator","BookOpen","Map"];
const colors={violet:"Mor",blue:"Mavi",rose:"Gül",cyan:"Camgöbeği",amber:"Kehribar",pink:"Pembe",green:"Yeşil"};
function CourseFields({course}:{course?:{id:string;name:string;icon:string;color:string}}){
 return <AdminForm kind="course" label={course?"Dersi güncelle":"Ders ekle"}>{course&&<input name="id" type="hidden" value={course.id}/>}<div className="grid"><label>Ders adı<input name="name" minLength={2} maxLength={100} defaultValue={course?.name} required/></label><label>Simge<select name="icon" defaultValue={course?.icon}>{icons.map((value,index)=><option key={value} value={value}>{["Toplum","Eğitim","Tarih","Bilgisayar","Hesap","Kitap","Harita"][index]}</option>)}</select></label><label>Renk<select name="color" defaultValue={course?.color}>{Object.entries(colors).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label></div></AdminForm>;
}
export default async function ManageCourses(){
 await requireAdmin();
 const courses=await db.course.findMany({include:{topics:true},orderBy:{name:"asc"}});
 return <div className="stack"><Header title="Ders yönetimi"/><section className="card stack"><h2>Yeni ders</h2><CourseFields/></section>{courses.map(course=><details className="card" key={course.id}><summary>{course.name} · {course.topics.length} konu</summary><div className="stack"><CourseFields course={course}/><h3>Konular</h3><div className="grid">{course.topics.map(topic=><AdminForm key={topic.id} kind="topic" label="Konuyu güncelle"><input type="hidden" name="id" value={topic.id}/><label>Konu adı<input name="name" defaultValue={topic.name} minLength={2} maxLength={100} required/></label></AdminForm>)}<AdminForm kind="topic" label="Konu ekle"><input type="hidden" name="course" value={course.id}/><label>Yeni konu<input name="name" minLength={2} maxLength={100} required/></label></AdminForm></div></div></details>)}</div>;
}
