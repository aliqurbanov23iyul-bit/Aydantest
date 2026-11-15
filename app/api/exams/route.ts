import { examConfig } from "@/lib/exam-rules";
import { createExam } from "@/lib/exams";
import { getUser } from "@/lib/user";

export const maxDuration = 300;
export async function POST(request:Request) {
  const user = await getUser();
  if (!user) return Response.json({error:"Giriş yapın."},{status:401});
  const parsed = examConfig.safeParse(await request.json().catch(()=>null));
  if (!parsed.success) return Response.json({error:parsed.error.issues[0]?.message ?? "Ayarları kontrol edin."},{status:400});
  try {
    return Response.json({id:await createExam(user.id,parsed.data)});
  } catch(error) {
    return Response.json({error:error instanceof Error && !("code" in error) ? error.message : "Test oluşturulamadı."},{status:422});
  }
}
