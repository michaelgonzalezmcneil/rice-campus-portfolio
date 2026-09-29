/** Campus axes follow the printable Rice map: +x toward Main Street, -z toward Rice Blvd.
 * Distances are deliberately compressed; this is not a navigation map. */
export type Point = { x: number; z: number };
export type Obstacle = Point & { w: number; d: number };
export const START: Point = { x: 20, z: 10 };
export const bounds = { left: -45, right: 49, top: -59, bottom: 31 };
export const exhibits = [
  { id: 'welcome', name: 'Lovett Hall', topic: 'Welcome', x: 20, z: 10, number: '01' },
  { id: 'engineering', name: 'Duncan Hall', topic: 'Projects & experience', x: 20, z: -8, number: '02' },
  { id: 'library', name: 'Fondren Library', topic: 'Education & skills', x: -3, z: 10, number: '03' },
  { id: 'yardos', name: 'Brochstein Pavilion', topic: 'YardOS · fictional concept', x: -30, z: 18, number: '04' },
  { id: 'duncan', name: 'Duncan College', topic: 'College community', x: 37, z: -40, number: '05' },
] as const;
export type ExhibitId = typeof exhibits[number]['id'];
export const owls: Point[] = [{ x: 8, z: 21 }, { x: -32, z: -1 }, { x: 32, z: -30 }];
export const trees: Point[] = [
  ...[-36,-26,-16,-6,4,14,24,34,44].map(x=>({x,z:27})),
  ...[-38,-29,-20,0,10].map(x=>({x,z:-5})),
  ...[-50,-40,-30,-20,-10,0,10,20].map(z=>({x:z===-50?47:45,z})),
  ...[-50,-40,-30,-20,0,20].map(z=>({x:-41,z})),
  {x:3,z:18},{x:13,z:18},{x:23,z:18},{x:3,z:2},{x:13,z:2},{x:23,z:2},{x:33,z:-51},{x:28,z:-25},
];
// Furnishings are set back from paths; their footprints also drive collisions.
export const benches = [
 {x:3,z:6.3,rotation:Math.PI},{x:13,z:6.3,rotation:Math.PI},
 {x:3,z:13.7,rotation:0},{x:13,z:13.7,rotation:0},
 {x:-3,z:4,rotation:Math.PI/2},{x:-3,z:16,rotation:Math.PI/2},
 {x:33,z:-46,rotation:-Math.PI/2},{x:41,z:-46,rotation:Math.PI/2},
];
export const lamps:Point[]=[{x:0,z:5.5},{x:20,z:5.5},{x:0,z:14.5},{x:20,z:14.5},{x:33,z:-12},{x:33,z:-25},{x:34,z:-37}];
export const cafeTables:Point[]=[{x:-35,z:16},{x:-25,z:16},{x:-35,z:4.6},{x:-25,z:4.6}];
export const buildings: (Obstacle & { kind: string; name: string })[] = [
  { kind:'lovett',name:'Lovett Hall',x:28,z:10,w:5,d:26 },
  { kind:'fondren',name:'Fondren Library',x:-12,z:10,w:10,d:24 },
  { kind:'pavilion',name:'Brochstein Pavilion',x:-30,z:10,w:12,d:8 },
  { kind:'hall',name:'Duncan Hall',x:20,z:-17,w:16,d:10 },
  { kind:'engineering',name:'O’Connor Building',x:18,z:-32,w:16,d:13 },
  { kind:'college',name:'Duncan College',x:37,z:-49,w:16,d:14 },
  { kind:'context',name:'Anderson Hall',x:-5,z:-1,w:14,d:4 },
  { kind:'context',name:'Herzstein Hall',x:16,z:-1,w:13,d:4 },
  { kind:'context',name:'Rayzor Hall',x:-5,z:23,w:13,d:4 },
  { kind:'context',name:'Sewall Hall',x:19,z:23,w:12,d:4 },
];
export const obstacles: Obstacle[] = [
  ...buildings.filter(b=>b.kind!=='lovett' && b.kind!=='college'),
  { x:28,z:1.75,w:5,d:9.5 }, { x:28,z:18.25,w:5,d:9.5 },
  { x:30,z:-49,w:2,d:14 },{ x:44,z:-49,w:2,d:14 },{x:37,z:-55,w:16,d:2},
  ...trees.map(t=>({...t,w:1.3,d:1.3})),
  ...benches.map(b=>({x:b.x,z:b.z,w:Math.abs(Math.cos(b.rotation))> .5?2:.8,d:Math.abs(Math.cos(b.rotation))>.5?.8:2})),
  ...lamps.map(p=>({...p,w:.4,d:.4})),
  ...cafeTables.map(p=>({...p,w:2.6,d:1.1})),
  {x:-36,z:2.8,w:1.1,d:2},{x:-24,z:2.8,w:1.1,d:2},
  {x:-30,z:2.8,w:10,d:1.2},
];
const radius=.55;
export function blocked(x:number,z:number) {
 return x<bounds.left+radius || x>bounds.right-radius || z<bounds.top+radius || z>bounds.bottom-radius || obstacles.some(o=>{
 const dx=Math.max(Math.abs(x-o.x)-o.w/2,0),dz=Math.max(Math.abs(z-o.z)-o.d/2,0);
 return dx*dx+dz*dz<radius*radius-1e-8;
 });
}
export function move(p:Point,dx:number,dz:number):Point {
 // Circle against rectangles: rounded corners and normal projection preserve sliding.
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));let {x,z}=p;
 for(let i=0;i<count;i++){
 let nx=Math.max(bounds.left+radius,Math.min(bounds.right-radius,x+dx/count));
 let nz=Math.max(bounds.top+radius,Math.min(bounds.bottom-radius,z+dz/count));
 for(let pass=0;pass<4;pass++)for(const o of obstacles){
 const cx=Math.max(o.x-o.w/2,Math.min(o.x+o.w/2,nx)),cz=Math.max(o.z-o.d/2,Math.min(o.z+o.d/2,nz));
 const ax=nx-cx,az=nz-cz,d=Math.hypot(ax,az);
 if(d>1e-8&&d<radius){nx=cx+ax/d*(radius+1e-5);nz=cz+az/d*(radius+1e-5);}
 }
 if(!blocked(nx,nz)){x=nx;z=nz;}else{if(!blocked(nx,z))x=nx;if(!blocked(x,nz))z=nz;}
 }
 return {x,z};
}
export function nearest(p:Point){return exhibits.find(e=>Math.hypot(p.x-e.x,p.z-e.z)<3.7);}
