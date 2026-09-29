/** Local static-export preview. QA fault injection is opt-in and never in the export. */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('out'),qa=process.env.CAMPUS_QA==='1';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain'};
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(qa&&url.pathname==='/__qa'){res.setHeader('Content-Type','text/html');res.end(await readFile('tests/browser-harness.html'));return;}
 if(qa&&url.pathname==='/__qa/path'){
  const {blocked}=await import('../components/campus/world.ts');
  const [x,z,tx,tz]=['x','z','tx','tz'].map(k=>Math.round(Number(url.searchParams.get(k))));
  const safe=(x,z)=>!blocked(x,z)&&[[-.85,0],[.85,0],[0,-.85],[0,.85]].every(([dx,dz])=>!blocked(x+dx,z+dz));
  const start={x,z},q=[start],seen=new Map([[`${x},${z}`,null]]);let end;
  for(let i=0;i<q.length;i++){const p=q[i];if(p.x===tx&&p.z===tz){end=p;break}for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,z:p.z+dz},key=`${n.x},${n.z}`;if(!seen.has(key)&&safe(n.x,n.z)){seen.set(key,p);q.push(n)}}}
  if(!end)throw Error('No safe test route');const route=[];while(end){route.unshift(end);end=seen.get(`${end.x},${end.z}`)}
  const corners=route.filter((p,i)=>i===0||i===route.length-1||route[i-1].x!==route[i+1].x&&route[i-1].z!==route[i+1].z);
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify(corners));return;
 }
 let name=decodeURIComponent(url.pathname);let file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return}
 let found=false;for(const candidate of [file,file+'.html',path.join(file,'index.html')]){try{if((await stat(candidate)).isFile()){file=candidate;found=true;break}}catch{}}if(!found)throw Error('Missing export');
 let data=await readFile(file);if(qa&&file.endsWith('.js')&&String(req.headers.referer).includes('fault=chunk')&&data.toString().includes('ACADEMIC QUADRANGLE')){res.writeHead(503).end('QA: 3D chunk unavailable');return;}if(qa&&url.searchParams.has('fault')&&file.endsWith('.html')){
  const fault=url.searchParams.get('fault');let script='';
  if(fault==='storage')script="Object.defineProperty(window,'localStorage',{get(){throw new DOMException('QA storage denied','SecurityError')}});";
  if(fault==='webgl')script="const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t.startsWith('webgl')?null:orig.call(this,t,...a)};";
  if(fault==='renderer')script="const orig=HTMLCanvasElement.prototype.getContext;let n=0;HTMLCanvasElement.prototype.getContext=function(t,...a){if(t.startsWith('webgl')&&++n>1)throw Error('QA renderer creation failed');return orig.call(this,t,...a)};";
  data=Buffer.from(data.toString().replace('<head>',`<head><script>${script}</script>`));
 }
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found')}});
server.listen(Number(process.env.PORT||3021),'127.0.0.1',()=>console.log(`Local preview: http://127.0.0.1:${server.address().port}/campus${qa?' (QA harness at /__qa)':''}`));
