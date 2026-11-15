import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/user";
import { chargeAI,gemini } from "@/lib/gemini";
const schema=z.object({message:z.string().trim().min(2).max(1500),contextId:z.string().max(80).optional(),conversationId:z.string().max(80).optional()});
export async function POST(request:Request){
 const user=await getUser();
 if(!user)return Response.json({error:"Giriş yapın."},{status:401});
 if(!process.env.GEMINI_API_KEY)return Response.json({error:"AI Öğretmen için GEMINI_API_KEY yapılandırılmalı."},{status:503});
 const result=schema.safeParse(await request.json().catch(()=>null));
 if(!result.success)return Response.json({error:"Mesajı kontrol edin."},{status:400});
 const {message,contextId,conversationId}=result.data;
 const existing=conversationId?await db.aIConversation.findFirst({where:{id:conversationId,userId:user.id},include:{messages:{orderBy:{createdAt:"desc"},take:12}}}):null;
 if(conversationId&&!existing)return Response.json({error:"Konuşma bulunamadı."},{status:404});
 const context=existing?.contextId??contextId;
 const item=context?await db.examQuestion.findFirst({where:{id:context,exam:{userId:user.id,status:"COMPLETE"}},select:{snapshot:true,response:true}}):null;
 if(context&&!item)return Response.json({error:"Soru bulunamadı."},{status:404});
 try{
  await chargeAI(user.id,1);
  const answer=await gemini(JSON.stringify({görev:"Eğitim sorusunu Türkçe, anlaşılır ve gerekirse adım adım açıkla. Emin olmadığın bilgiyi belirt. Geçmişi ve ilgili soruyu dikkate al.",item,history:existing?.messages.slice().reverse().map(({role,text})=>({role,text})),message}));
  const messages={create:[{role:"user",text:message},{role:"assistant",text:answer}]};
  const conversation=existing?await db.aIConversation.update({where:{id:existing.id},data:{messages,updatedAt:new Date()}}):await db.aIConversation.create({data:{userId:user.id,contextId:context,messages}});
  return Response.json({id:conversation.id,answer});
 }catch(error){return Response.json({error:error instanceof Error&&!('code' in error)?error.message:"AI Öğretmen yanıt veremedi."},{status:422});}
}
