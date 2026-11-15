import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/admin";
import {Header} from "@/components/ui";
import {AdminForm} from "@/components/admin-form";
export default async function AdminSettings(){
 await requireAdmin();
 const limit=(await db.systemSetting.findUnique({where:{key:"dailyAi"}}))?.value??120;
 return <div className="stack"><Header title="Sistem ayarları"/><section className="card stack"><h2>Yapay zekâ kotası</h2><p className="muted">Oluşturulan her soru ve her AI Öğretmen isteği bir birim kullanır.</p><AdminForm kind="limit" label="Kotayı kaydet"><label>Kullanıcı başına günlük kota<input type="number" name="limit" min={1} max={5000} defaultValue={limit} required/></label></AdminForm></section></div>;
}
