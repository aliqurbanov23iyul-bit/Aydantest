import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/admin";
import {Header} from "@/components/ui";
import {AdminForm} from "@/components/admin-form";
export default async function Users(){
 const admin=await requireAdmin();
 const users=await db.user.findMany({select:{id:true,name:true,email:true,role:true,_count:{select:{exams:true}}},orderBy:{createdAt:"desc"},take:100});
 return <div className="stack"><Header title="Kullanıcılar" detail="Son kaydolan kullanıcıları ve rollerini yönet."/><div className="grid">{users.map(user=><div className="card stack" key={user.id}><h3>{user.name}</h3><small>{user.email} · {user._count.exams} sınav</small>{user.id===admin.id?<span className="pill">Yönetici · Siz</span>:<AdminForm kind="role" label="Rolü kaydet"><input name="id" type="hidden" value={user.id}/><label>Rol<select name="role" defaultValue={user.role}><option value="STUDENT">Öğrenci</option><option value="ADMIN">Yönetici</option></select></label></AdminForm>}</div>)}</div></div>;
}
