import {db} from "@/lib/db";
import {getUser} from "@/lib/user";
import {rateLimit} from "@/lib/access";

export async function POST(request:Request){
 const user=await getUser();
 if(!user)return Response.json({error:"Giriş yapın."},{status:401});
 if(Number(request.headers.get("content-length"))>4200000)return Response.json({error:"Dosya en fazla 4 MB olabilir."},{status:413});
 if(!await rateLimit("upload:"+user.id,10))return Response.json({error:"Çok fazla yükleme isteği."},{status:429});
 const form=await request.formData().catch(()=>null);
 const file=form?.get("file"),courseId=form?.get("course");
 if(!(file instanceof File)||typeof courseId!=="string"||file.size>4000000||file.size===0)return Response.json({error:"Bir ders ve en fazla 4 MB boyutunda dosya seçin."},{status:400});
 if(!await db.course.findUnique({where:{id:courseId}}))return Response.json({error:"Geçersiz ders."},{status:400});
 if(await db.studyMaterial.count({where:{userId:user.id}})>=20)return Response.json({error:"En fazla 20 ders notu saklanabilir."},{status:400});
 try{
  let pages:{page:number;text:string}[];
  if(file.name.toLowerCase().endsWith(".pdf")){
   const bytes=new Uint8Array(await file.arrayBuffer());
   if(new TextDecoder().decode(bytes.slice(0,5))!=="%PDF-")throw new Error("Geçersiz PDF dosyası.");
   const {PDFParse}=await import("pdf-parse");
   const parser=new PDFParse({data:bytes});
   try{
    const result=await parser.getText({first:31});
    if(result.total>30)throw new Error("PDF en fazla 30 sayfa olabilir.");
    pages=result.pages.map(page=>({page:page.num,text:page.text.trim()})).filter(page=>page.text);
   }finally{await parser.destroy();}
  }else if(file.name.toLowerCase().endsWith(".txt")){
   const text=new TextDecoder("utf-8",{fatal:true}).decode(await file.arrayBuffer()).trim();
   if(text.includes("\u0000"))throw new Error("Geçerli UTF-8 metin dosyası seçin.");
   pages=text?[{page:1,text}]:[];
  }else throw new Error("PDF veya TXT dosyası seçin.");
  const length=pages.reduce((sum,page)=>sum+page.text.length,0);
  if(length<25)throw new Error("Dosyadan okunabilir metin çıkarılamadı. Taranmış PDF dosyaları desteklenmiyor.");
  if(length>60000)throw new Error("Ders notu en fazla 60.000 metin karakteri içerebilir.");
  await db.studyMaterial.create({data:{userId:user.id,courseId,name:file.name.slice(0,120),content:pages}});
  return Response.json({ok:true});
 }catch(error){return Response.json({error:error instanceof Error&&!('code' in error)?error.message:"Dosya okunamadı."},{status:422});}
}
