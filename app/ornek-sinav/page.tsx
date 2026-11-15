import Link from "next/link";
import { Brand, Header } from "@/components/ui";
import { Practice } from "@/components/practice";
import { catalog, sampleQuestions } from "@/lib/catalog";

export default async function Sample({searchParams}:{searchParams:Promise<{ders?:string}>}) {
  const {ders} = await searchParams;
  const course = catalog.find(item => item.id === ders);
  const questions = course ? sampleQuestions.filter(([id]) => id === course.id) : sampleQuestions;
  return <main className="landing stack">
    <Brand/>
    <Header title={course ? course.name : "Örnek test"} detail={course ? "Bu dersten bir örnek soru." : "Yedi dersten, elle hazırlanmış birer soru. Cevaplar bu oturumda tutulur."}/>
    <Practice key={course?.id ?? "all"} questions={questions}/>
    {course && <div><Link className="btn" href="/ornek-sinav">Tüm örnek soruları çöz</Link></div>}
  </main>;
}
