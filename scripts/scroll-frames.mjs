import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const projects=JSON.parse(await fs.readFile('data/projects.json','utf8'));
const sources=[...new Set(projects.flatMap(p=>[p.preview,...p.media.map(m=>m.src)]).filter(s=>/\.gif$/i.test(s)))];
const manifest={};
await fs.mkdir('public/uploads/scroll-frames',{recursive:true});
for(const src of sources){
 const file=path.join(root,'public',src); const meta=await sharp(file,{animated:true}).metadata(); const count=meta.pages||1; const frames=[];
 for(let i=0;i<count;i++){
  const dest=`/uploads/scroll-frames/${path.basename(src,'.gif')}-${i}.webp`;
  try{await fs.access('public'+dest)}catch{await sharp(file,{page:i,pages:1}).resize({width:1400,withoutEnlargement:true}).webp({quality:84}).toFile('public'+dest)}
  const small=dest.replace('.webp','-small.webp');
  try{await fs.access('public'+small)}catch{await sharp(file,{page:i,pages:1}).resize({width:700,withoutEnlargement:true}).webp({quality:78}).toFile('public'+small)}
  frames.push(dest);
 }
 manifest[src]={frames,width:meta.width,height:meta.pageHeight||meta.height}; console.log(path.basename(src),count);
}
await fs.writeFile('data/scroll-frames.json',JSON.stringify(manifest,null,2)+'\n');
