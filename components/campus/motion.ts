import { move, type Point } from './world.ts';
export const WALK_SPEED=8.5, RUN_SPEED=14;
export function advance(position:Point,velocity:Point,input:Point,running:boolean,dt:number){
 const step=Math.min(Math.max(dt,0),.04),length=Math.hypot(input.x,input.z),scale=Math.max(1,length);
 const speed=running?RUN_SPEED:WALK_SPEED;
 const target={x:(input.x+input.z)/scale*Math.SQRT1_2*speed,z:(input.z-input.x)/scale*Math.SQRT1_2*speed};
 const blend=1-Math.exp(-(length>.02?12:20)*step);
 const v={x:velocity.x+(target.x-velocity.x)*blend,z:velocity.z+(target.z-velocity.z)*blend};
 if(length<.02&&Math.hypot(v.x,v.z)<.04){v.x=0;v.z=0;}
 const next=move(position,v.x*step,v.z*step);
 return {position:next,velocity:v,distance:Math.hypot(next.x-position.x,next.z-position.z)};
}
export function turnTowards(angle:number,target:number,dt:number){return angle+Math.atan2(Math.sin(target-angle),Math.cos(target-angle))*(1-Math.exp(-16*Math.min(dt,.04)));}
