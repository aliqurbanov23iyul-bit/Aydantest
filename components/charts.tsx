"use client";
import { ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip } from "recharts";
export function WeekChart({data}:{data:{day:string;count:number}[]}){
 return <div style={{height:205,minWidth:0}} aria-label="Son yedi günde çözülen sorular"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><XAxis dataKey="day" tick={{fill:"#9690a9"}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} width={28} tick={{fill:"#9690a9"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#211c32",borderColor:"#4d3b6c",borderRadius:10,color:"white"}} cursor={{fill:"#8564d521"}}/><Bar dataKey="count" name="Çözülen soru" fill="#9170f4" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>;
}
