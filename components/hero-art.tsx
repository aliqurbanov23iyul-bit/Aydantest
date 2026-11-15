"use client";
import {motion,useReducedMotion} from "framer-motion";
import {GraduationCap} from "lucide-react";
export function HeroArt(){
 const reduced=useReducedMotion();
 return <div className="hero-graphic" aria-hidden><motion.div initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.45}}><GraduationCap strokeWidth={1}/></motion.div></div>;
}
