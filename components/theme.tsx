"use client";
import {useEffect} from "react";
export function Theme(){useEffect(()=>{document.body.dataset.theme=localStorage.getItem("akademi-theme")??"dark";},[]);return null;}
