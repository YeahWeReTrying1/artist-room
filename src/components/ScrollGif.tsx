"use client";
import {useEffect,useRef,useState} from "react";
import {scrollFrames,frameImageProps} from "@/lib/scrollFrames";
export function ScrollGif({src,alt}:{src:string;alt:string}){
 const frames=scrollFrames(src);const ref=useRef<HTMLDivElement>(null);const [frame,setFrame]=useState(0);
 useEffect(()=>{const el=ref.current;const root=el?.closest('.artistProjectScroll');if(!el||!root)return;let raf=0;const update=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const rect=el.getBoundingClientRect();const bounds=root.getBoundingClientRect();const p=Math.max(0,Math.min(1,(bounds.top-rect.top)/(rect.height-root.clientHeight)));setFrame(Math.min(frames.length-1,Math.floor(p*frames.length)));});};update();root.addEventListener('scroll',update,{passive:true});return()=>{cancelAnimationFrame(raf);root.removeEventListener('scroll',update);};},[src,frames.length]);
 useEffect(()=>{[frames[frame+1],frames[frame-1]].filter(Boolean).forEach(src=>{const img=new Image();img.sizes="(max-width:900px) 100vw, 1160px";img.srcset=frameImageProps(src).srcSet;img.src=src;});},[src,frame]);
 return <div ref={ref} className="projectScrollSequence"><div className="projectScrollSequenceSticky"><img {...frameImageProps(frames[frame])} sizes="(max-width:900px) 100vw, 1160px" alt={alt}/></div></div>;
}
