import { Brand,Header } from "@/components/ui";
import { ResetForm } from "@/components/reset-form";
export default async function ResetPage({searchParams}:{searchParams:Promise<{token?:string}>}){
 const {token}=await searchParams;
 return <main className="landing"><Brand/><section className="authbox stack"><Header title="Şifre sıfırla"/><ResetForm token={token}/></section></main>;
}
