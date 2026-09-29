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
