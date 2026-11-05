"use client";
import { useEffect, useRef, useState, useMemo, useCallback, memo, type CSSProperties } from "react";
import type { AboutData, Project } from "@/lib/types";
import { ArtistProjectOverlay } from "@/components/ArtistProjectOverlay";
import { ArtistImage } from "@/components/ArtistImage";
import { SiteLogo } from "@/components/SiteNav";
import { publicUrl } from "@/lib/siteAssets";
import { mediaAsset, warmMedia } from "@/lib/mediaAssets";
import { getProjectGallery } from "@/lib/projectAccess";
import { scrollFrames, frameImageProps } from "@/lib/scrollFrames";
const palettes=[['#c5c7d5','#faedf0'],['#d3cfc3','#edf8e8'],['#c2d5c5','#eee5ff']];
const ScrollWork = memo(function ScrollWork({project,index,x,width,y,travel,onOpen}:{project:Project;index:number;x:number;width:number;y:number;travel:number;onOpen:(project:Project)=>void}){
 const parts=(project.artistAspect||'').split('/').map(Number);
 const ratio=parts.length===2&&parts.every(n=>Number.isFinite(n)&&n>0)?parts[0]/parts[1]:null;
 const photos=useMemo(()=>{
  const media=project.media.filter(item=>item.kind==='image'&&!/\.(gif|mp4|webm|mov|ogg)$/i.test(item.src)&&!mediaAsset(item.src)?.animated).map(item=>item.src);
  // Gallery order is authoritative; a standalone photo cover remains a fallback.
  return media.length?media:! /\.(gif|mp4|webm|mov|ogg)$/i.test(project.preview)&&!mediaAsset(project.preview)?.animated?[project.preview]:[];
 },[project]);
 const extracted=scrollFrames(project.preview);
 const frames=photos.length?photos:extracted;
 const photoSequence=photos.length>0;
 const screenX=x-travel;
 const near=screenX<160&&screenX+width>-60;
 const progress=Math.max(0,Math.min(1,(100-screenX)/(100+width)));
 const entry=Math.max(0,Math.min(1,(screenX-58)/65));
 const exit=Math.max(0,Math.min(1,(-screenX-width*.35)/70));
 const directions=[-1,1,-1,1,1,-1,1];
 const direction=directions[index%directions.length];
 const height=[84,64,78,57,88,69,80][index%7];
 const centerY=Math.max(height/2+2,Math.min(98-height/2,y));
 const drift=Math.sin(progress*Math.PI*2+index*.9)*5;
 const transform=`perspective(1200px) translate3d(0,calc(-50% + ${direction*(entry*48+exit*15)+drift}svh),${-entry*240-exit*120}px) rotateX(${direction*entry*38-exit*12}deg) rotateY(${(index%2?1:-1)*(entry*48-exit*22)}deg) rotateZ(${direction*(entry*15+exit*8)+(index%3-1)*1.5}deg) skewY(${direction*entry*7}deg) scale(${1-entry*.18-exit*.08})`;
 const frame=Math.min(frames.length-1,Math.floor(progress*frames.length));
 useEffect(()=>{
  if(!near || !frames.length)return;
  const timer=window.setTimeout(()=>{const src=frames[frame+1];if(src){const image=new Image();image.decoding='async';image.fetchPriority='low';image.sizes=`${width}vw`;if(photoSequence){warmMedia(src);}else{image.srcset=frameImageProps(src).srcSet;image.src=src;}}},200);
  return()=>clearTimeout(timer);
 },[frame,near,project.id,width,photoSequence]);
 return <button className="horizontalArtwork" style={{left:`${x}vw`,width:`${width}vw`,top:`${centerY}%`,height:ratio?`min(${width/(ratio||1)}vw, 84svh)`:`${height}svh`,...(ratio?{width:`min(${width}vw, ${84*ratio}svh)`,aspectRatio:String(ratio),'--art-fit':'cover'}:{}),transform,opacity:1-Math.pow(entry,3),transformOrigin:`${index%2?'20%':'80%'} ${direction<0?'100%':'0%'}` } as CSSProperties} onClick={()=>onOpen(project)} onPointerEnter={()=>warmMedia(project.media[0]?.src||project.preview)} aria-label={project.title?`Открыть проект: ${project.title}`:`Открыть работу ${index+1}`}>
 {near && (photoSequence ? <ArtistImage src={frames[frame]} alt={project.title||'Рисунок'} loading="eager" fetchPriority={index===0?"high":"auto"} sizes={`${width}vw`}/> : frames.length ? <img {...frameImageProps(frames[frame])} sizes={`${width}vw`} fetchPriority={index===0?"high":"low"} alt={project.title||'Рисунок'} decoding="async" loading={index===0?'eager':'lazy'}/> : <span className="previewUnavailable">Добавьте фотографии в проект</span>)}
 </button>;
});
export function ScrollPortfolio({projects,about}:{projects:Project[];about:AboutData}){
 const root=useRef<HTMLElement>(null);const manuscript=useRef<HTMLDivElement>(null);const [active,setActive]=useState<Project|null>(null);const [progress,setProgress]=useState(0);const [mobile,setMobile]=useState(false);
 useEffect(()=>{const query=matchMedia('(max-width:700px)');const update=()=>setMobile(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 const openProject=useCallback((project:Project)=>setActive(project),[]);
 const layout=useMemo(()=>{let cursor=mobile?8:12;return projects.map((_,index)=>{const width=mobile?[86,94,82,96,88][index%5]:[64,48,72,53,78,58,68][index%7];const y=[44,72,25,64,41,78,30,58,22,75,46][index%11];const item={x:cursor,width,y};cursor+=width+[32,58,26,46,64,35,50][index%7];return item;});},[projects,mobile]);
 const last=layout[layout.length-1];const distance=last?Math.max(0,last.x+last.width-82):0;
 // Half the scroll distance for a single image; gallery tempo stays unchanged.
 const timeline=useMemo(()=>{
  const centers=layout.map(item=>Math.max(0,Math.min(distance,item.x+item.width/2-50)));
  let scrollEnd=0;
  const segments=layout.map((_,index)=>{
   const start=index===0?0:(centers[index-1]+centers[index])/2;
   const end=index===layout.length-1?distance:(centers[index]+centers[index+1])/2;
   const single=getProjectGallery(projects[index]).length<=1&&scrollFrames(projects[index].preview).length<=1;
   const scrollStart=scrollEnd;
   scrollEnd+=(end-start)*1.8/(single?2:1);
   return {start,end,scrollStart,scrollEnd};
  });
  return {segments,length:scrollEnd};
 },[layout,projects,distance]);
 useEffect(()=>{
  let raf=0;let target=0;let current=0;let lastTime=0;let disposed=false;
  const page=document.documentElement;
  const previousColor=page.style.getPropertyValue('--artist-page-bg');
  const themeMeta=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const previousTheme=themeMeta?.content;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const render=(now:number)=>{
   const el=root.current;if(!el||disposed)return;
   const dt=Math.min(64,lastTime?now-lastTime:16);lastTime=now;
   current=reduced?target:current+(target-current)*(1-Math.exp(-dt/165));
   if(Math.abs(target-current)<.00001)current=target;
   const scrollPosition=current*timeline.length;
   const segment=timeline.segments.find(item=>scrollPosition<item.scrollEnd)||timeline.segments[timeline.segments.length-1];
   const local=segment?Math.max(0,Math.min(1,(scrollPosition-segment.scrollStart)/Math.max(.0001,segment.scrollEnd-segment.scrollStart))):0;
   const travel=segment?segment.start+(segment.end-segment.start)*local:0;
   setProgress(distance>0?travel/distance:0);
   const step=current*(palettes.length-1);const i=Math.min(palettes.length-2,Math.floor(step));const t=step-i;
   const blend=(a:string,b:string)=>'#'+[1,3,5].map(k=>Math.round(parseInt(a.slice(k,k+2),16)*(1-t)+parseInt(b.slice(k,k+2),16)*t).toString(16).padStart(2,'0')).join('');
   const background=blend(palettes[i][0],palettes[i+1][0]);
   el.style.setProperty('--scroll-bg',background);
   page.style.setProperty('--artist-page-bg',background);
   if(themeMeta&&themeMeta.content!==background)themeMeta.content=background;
   el.style.setProperty('--scroll-ink',blend(palettes[i][1],palettes[i+1][1]));
   el.style.setProperty('--text-y',`${-Math.pow(current,1.35)*Math.max(0,(manuscript.current?.offsetHeight||0)-innerHeight)}px`);
   raf=current!==target?requestAnimationFrame(render):0;
  };
  const update=()=>{const el=root.current;if(!el)return;target=Math.max(0,Math.min(1,-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight)));if(!raf){lastTime=0;raf=requestAnimationFrame(render);}};
  update();addEventListener('scroll',update,{passive:true});addEventListener('resize',update);
  return()=>{disposed=true;cancelAnimationFrame(raf);removeEventListener('scroll',update);removeEventListener('resize',update);if(previousColor)page.style.setProperty('--artist-page-bg',previousColor);else page.style.removeProperty('--artist-page-bg');if(themeMeta&&previousTheme)themeMeta.content=previousTheme;};
 },[distance,timeline]);
 return <main ref={root} className={`scrollPortfolio horizontalPortfolio${active?' isProjectOpen':''}`} style={{height:`calc(100svh + ${timeline.length}vw)`}}><div className="scrollBackdrop" aria-hidden="true"><div ref={manuscript} className="scrollManuscript">{['01','02','03','04'].map(n=><div key={n} className="scrollManuscriptSheet" style={{maskImage:`url("${publicUrl('/scroll-text/'+n+'.svg')}")`,WebkitMaskImage:`url("${publicUrl('/scroll-text/'+n+'.svg')}")`}}/>)}</div></div>
 <div className="horizontalStage"><div className="horizontalTrack" style={{transform:`translate3d(${-progress*distance}vw,0,0)`}}>{projects.map((project,index)=><ScrollWork key={project.id} project={project} index={index} {...layout[index]} travel={progress*distance} onOpen={openProject}/>)}</div></div>
 <nav className="scrollLinks" aria-label="Контакты">{about.links?.map(link=><a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}</nav>
 <a className="scrollSignature" href="#" aria-label="В начало">{about.logo&&/\.svg$/i.test(about.logo)?<span className="scrollSignatureMask" style={{maskImage:`url("${about.logo}")`,WebkitMaskImage:`url("${about.logo}")`}}/>:about.logo?<img src={about.logo} alt="Бобков"/>:<SiteLogo/>}</a>
 {active&&<ArtistProjectOverlay project={active} onClose={()=>setActive(null)}/>}
 </main>;
}
