"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Sparkles, Zap } from "lucide-react";

export function HeroArt(){
 const reduced=useReducedMotion();
 return <div className="hero-art" aria-hidden="true">
   <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
   <span className="hero-spark spark-one"><Sparkles size={25}/></span>
   <span className="hero-spark spark-two"><Zap size={20}/></span>
   <motion.div className="quiz-float" initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.55}}>
    <div className="quiz-preview">
     <span className="quiz-tag"><Sparkles size={13}/> Örnek soru</span>
     <strong>Bir belgeyi nasıl kaydedersin?</strong>
     <span className="quiz-choice"><span>A</span> Ctrl + Z</span>
     <span className="quiz-choice quiz-right"><span>B</span> Ctrl + S <Check size={15}/></span>
    </div>
    <span className="quiz-result"><ArrowUpRight size={16}/> Doğru cevap!</span>
   </motion.div>
 </div>;
}
