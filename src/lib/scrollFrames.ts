import manifest from "../../data/scroll-frames.json";
import { getSiteBasePath, publicUrl } from "@/lib/siteAssets";
export function scrollFrames(src:string){const base=getSiteBasePath();const data=manifest as Record<string,{frames:string[]}>;return data[base&&src.startsWith(base+'/')?src.slice(base.length):src]?.frames.map(publicUrl)||[];}

export function frameImageProps(src:string) {
 return {src, srcSet:`${src.replace(/\.webp$/, '-small.webp')} 700w, ${src} 1400w`};
}
