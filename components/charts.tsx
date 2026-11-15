"use client";

import { useId } from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export function WeekChart({data}:{data:{day:string;count:number}[]}) {
  const gradient = useId();
  return <div className="week-chart" aria-label="Son yedi günde çözülen sorular">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--wash)"/><stop offset="100%" stopColor="var(--primary)"/>
        </linearGradient></defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 6"/>
        <XAxis dataKey="day" tick={{fill:"var(--muted)"}} axisLine={false} tickLine={false}/>
        <YAxis allowDecimals={false} width={28} tick={{fill:"var(--muted)"}} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={{background:"var(--menu)",borderColor:"var(--field-border)",borderRadius:12,color:"var(--ink)"}} itemStyle={{color:"var(--ink)"}} cursor={{fill:"var(--dot)",opacity:.18}}/>
        <Bar dataKey="count" name="Çözülen soru" fill={`url(#${gradient})`} radius={[6,6,0,0]} isAnimationActive={false}/>
      </BarChart>
    </ResponsiveContainer>
  </div>;
}
