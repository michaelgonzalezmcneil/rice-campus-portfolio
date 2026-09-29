import test from 'node:test';
import assert from 'node:assert/strict';
import { START, bounds, blocked, move, nearest, exhibits, owls, obstacles } from '../components/campus/world.ts';

test('spawn and every exhibit and owl are on walkable ground',()=>{
 for(const p of [START,...exhibits,...owls]) assert.equal(blocked(p.x,p.z),false,JSON.stringify(p));
 assert.equal(nearest(START)?.id,'welcome');
});
test('every exhibit and collectible is reachable from spawn through collision geometry',()=>{
 const queue=[START], seen=new Set([`${START.x},${START.z}`]);
 for(let i=0;i<queue.length;i++){
  const p=queue[i];
  for(const [dx,dz] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){
   const x=p.x+dx,z=p.z+dz,k=`${x},${z}`;
   if(!seen.has(k)&&!blocked(x,z)){seen.add(k);queue.push({x,z});}
  }
 }
 for(const p of [...exhibits,...owls])assert.ok(seen.has(`${p.x},${p.z}`),`Unreachable: ${JSON.stringify(p)}`);
});
test('walls block movement, sliding works and high deltas cannot tunnel',()=>{
 const p={x:-3,z:10};
 const result=move(p,-100,0);
 assert.ok(result.x>-6.5,'Cannot pass through Fondren');
 const slid=move({x:-6,z:10},-3,3);
 assert.ok(slid.x>-6.5); assert.ok(slid.z>12.9);
 for(const o of obstacles)assert.ok(blocked(o.x,o.z));
});
test('Sallyport passage is open and world limits contain the player',()=>{
 const p=move({x:23,z:10},12,0);assert.ok(p.x>34.9);
 const edge=move({x:40,z:10},1000,1000);assert.ok(edge.x<=bounds.right-.55&&edge.z<=bounds.bottom-.55);assert.equal(blocked(edge.x,edge.z),false);
});
test('interaction range requires proximity',()=>{
 assert.equal(nearest({x:0,z:-50}),undefined);
 for(const e of exhibits)assert.equal(nearest(e)?.id,e.id);
});

test('acceleration, braking and running are normalized and frame-rate stable',async()=>{
 const {advance,WALK_SPEED,RUN_SPEED}=await import('../components/campus/motion.ts');
 const simulate=(input,run=false,hz=60)=>{let p={x:0,z:10},v={x:0,z:0};for(let i=0;i<hz*.6;i++){const r=advance(p,v,input,run,1/hz);p=r.position;v=r.velocity;}return {p,v};};
 const straight=simulate({x:1,z:0}),diagonal=simulate({x:1,z:1});
 assert.ok(Math.abs(Math.hypot(straight.v.x,straight.v.z)-Math.hypot(diagonal.v.x,diagonal.v.z))<.001);
 assert.ok(Math.hypot(straight.v.x,straight.v.z)<WALK_SPEED+.001);
 const running=simulate({x:1,z:0},true);assert.ok(Math.hypot(running.v.x,running.v.z)>RUN_SPEED*.99);
 const initial=advance({x:0,z:10},{x:0,z:0},{x:1,z:0},false,1/60);assert.ok(Math.hypot(initial.velocity.x,initial.velocity.z)<3);
 let v=straight.v;for(let i=0;i<30;i++)v=advance({x:0,z:10},v,{x:0,z:0},false,1/60).velocity;assert.equal(Math.hypot(v.x,v.z),0);
 const slower=simulate({x:1,z:0},false,30);assert.ok(Math.hypot(slower.p.x-straight.p.x,slower.p.z-straight.p.z)<.12);
});
test('rounded collision corners slide without penetration',()=>{
 // Northwest corner of the Fondren collision rectangle.
 let p={x:-18,z:-3};for(let i=0;i<60;i++){p=move(p,.025,.04);assert.equal(blocked(p.x,p.z),false);}
 assert.ok(p.z>-1.2,'The circle should slide down the wall past the corner');
});
