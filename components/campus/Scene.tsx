'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useLayoutEffect, createContext, useContext, memo, type ReactNode, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { advance, turnTowards } from './motion';
import { buildings, trees, benches, lamps, cafeTables, exhibits, owls, move, type Point } from './world';
export type Controls = { keys:Set<string>; stick:Point; paused:boolean; position:Point; reset:number; reduced:boolean; velocity:Point; running:boolean; heading:number; step:(running:boolean)=>void };
type Props = { night:boolean; controls:MutableRefObject<Controls>; collected:number[]; onPosition:(p:Point)=>void; onReady:()=>void; onFail:()=>void; onStats:(s:string)=>void };
const playerUniform={value:new THREE.Vector3(20,1.25,10)};
// Dithered cutaway only along the camera-to-player sightline; preserves instancing and depth.
function cutaway(shader:THREE.WebGLProgramParametersWithUniforms){
 shader.uniforms.campusPlayer=playerUniform;
 shader.vertexShader='varying vec3 campusWorld;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
 vec4 campusPosition=vec4(transformed,1.0);
 #ifdef USE_INSTANCING
 campusPosition=instanceMatrix*campusPosition;
 #endif
 campusWorld=(modelMatrix*campusPosition).xyz;`);
 shader.fragmentShader='uniform vec3 campusPlayer; varying vec3 campusWorld;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
 vec3 sight=normalize(cameraPosition-campusPlayer);
 vec3 offset=campusWorld-campusPlayer;
 float along=dot(offset,sight);
 float distanceToSight=length(offset-sight*along);
 if(campusWorld.y>.8 && along>.7 && distanceToSight<1.65){
 float keep=mix(.16,1.,smoothstep(1.1,1.65,distanceToSight));
 float pattern=fract(dot(floor(gl_FragCoord.xy),vec2(.754877,.569841)));
 if(pattern>keep)discard;
 }`);
}
type BoxProps={p:[number,number,number];s:[number,number,number];c?:string};
const BoxContext=createContext<{items:Map<THREE.Object3D,string>;dirty:boolean}|null>(null);
function BoxBatch({children,night}:{children:ReactNode;night:boolean}){
 const mesh=useRef<THREE.InstancedMesh>(null),glow=useRef<THREE.InstancedMesh>(null);const registry=useMemo(()=>({items:new Map<THREE.Object3D,string>(),dirty:true}),[]);
 useLayoutEffect(()=>{registry.dirty=true},[night,registry]);
 useFrame(()=>{if(!registry.dirty||!mesh.current||!glow.current)return;let i=0,j=0;registry.items.forEach((color,object)=>{object.updateWorldMatrix(true,false);const lit=night&&['#476c70','#719799','#f4dfaa'].includes(color);const target=lit?glow.current!:mesh.current!;const index=lit?j++:i++;target.setMatrixAt(index,object.matrixWorld);target.setColorAt(index,new THREE.Color(lit?'#f9cb82':color))});mesh.current.count=i;glow.current.count=j;for(const target of [mesh.current,glow.current]){target.instanceMatrix.needsUpdate=true;if(target.instanceColor)target.instanceColor.needsUpdate=true;target.computeBoundingSphere()}registry.dirty=false},-2);
 return <BoxContext.Provider value={registry}><instancedMesh ref={mesh} args={[undefined,undefined,4096]} castShadow receiveShadow><boxGeometry/><meshStandardMaterial roughness={.9} onBeforeCompile={cutaway}/></instancedMesh><instancedMesh ref={glow} args={[undefined,undefined,512]}><boxGeometry/><meshBasicMaterial onBeforeCompile={cutaway}/></instancedMesh>{children}</BoxContext.Provider>
}
function Box({p,s,c='#c68f6c'}:BoxProps){const ref=useRef<THREE.Group>(null);const registry=useContext(BoxContext)!;useLayoutEffect(()=>{const object=ref.current!;registry.items.set(object,c);registry.dirty=true;return()=>{registry.items.delete(object);registry.dirty=true}},[registry,c,p[0],p[1],p[2],s[0],s[1],s[2]]);return <group ref={ref} position={p} scale={s}/>}
function SolidBox({p,s,c='#c68f6c'}:BoxProps){return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.9}/></mesh>}
// Repeated masonry and roof details share the static box instance buffer.
function Arch({x,y,z,r=1,rotation=0,base=0,c='#f2dabb',thickness=.22}:{x:number;y:number;z:number;r?:number;rotation?:number;base?:number;c?:string;thickness?:number}){
 return <group position={[x,y,z]} rotation={[0,rotation,0]}>
 {Array.from({length:12},(_,i)=>{const a=(i+.5)*Math.PI/12;return <group key={i} position={[Math.cos(a)*r,Math.sin(a)*r,0]} rotation={[0,0,a-Math.PI/2]}><Box p={[0,0,0]} s={[Math.PI*r/12+.05,thickness,.3]} c={c}/></group>})}
 {[-1,1].map(side=><Box key={side} p={[side*r,-(y-base)/2,0]} s={[thickness,y-base,.3]} c={c}/>)}</group>
}
function Roof({x=0,y,z=0,w,d,c='#a9674d'}:{x?:number;y:number;z?:number;w:number;d:number;c?:string}){const span=Math.min(w,d),length=Math.max(w,d),rise=span/4*Math.tan(.23);return <group position={[x,y,z]} rotation={[0,w>d?Math.PI/2:0,0]}>{[-1,1].map(side=><group key={side} position={[side*span/4,rise,0]} rotation={[0,0,-side*.23]}><Box p={[0,0,0]} s={[span/2/Math.cos(.23)+.12,.18,length]} c={c}/></group>)}<Box p={[0,rise*2,0]} s={[.2,.2,length+.1]} c={c}/></group>}
function Label({text,x,z,y=1.4,mounted=false,rotation=0}:{text:string;x:number;z:number;y?:number;mounted?:boolean;rotation?:number}) {
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d')!;ctx.fillStyle='#f9f4e9';ctx.beginPath();ctx.roundRect(2,2,508,76,16);ctx.fill();ctx.fillStyle='#273d37';ctx.font='600 25px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,40);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[text]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 if(mounted)return <mesh position={[x,y,z]} rotation={[0,rotation,0]}><planeGeometry args={[4.5,.7]}/><meshBasicMaterial map={texture}/></mesh>;
 return <sprite position={[x,y,z]} scale={[10,1.56,1]}><spriteMaterial map={texture} depthTest={false}/></sprite>;
}
function Building({b}:{b:typeof buildings[number]}){
 const {w,d,kind}=b;const brick='#c99573',trim='#f1dcc0',glass='#476c70';
 return <group position={[b.x,0,b.z]}>
 {kind==='lovett'?<>
 {/* Central Sallyport remains an open, collidable passage through both facades. */}
 {[-1,1].map(side=><group key={side}><Box p={[0,3.5,side*8.25]} s={[w,7,9.5]} c={brick}/><Roof y={7.05} z={side*8.25} w={w+.6} d={9.8}/></group>)}
 <Box p={[0,7.6,0]} s={[w,4.6,7]} c={brick}/><Box p={[0,10,0]} s={[w+.25,.4,7.4]} c={trim}/>
 {[-1,1].map(side=><group key={side}>
 <Arch x={side*2.58} y={2.5} z={0} r={3.1} rotation={Math.PI/2} thickness={.4}/><Arch x={side*2.78} y={2.5} z={0} r={2.7} rotation={Math.PI/2} thickness={.16}/>
 {[-3.35,3.35].map(z=><group key={z}><Box p={[side*2.64,7.1,z]} s={[.35,6,.35]} c={trim}/><Box p={[side*2.64,10.5,z]} s={[.5,.85,.5]} c={trim}/></group>)}
 {[-1.65,0,1.65].map(z=><group key={z}><Box p={[side*2.53,7.7,z]} s={[.12,2.2,1.05]} c={glass}/><Arch x={side*2.66} y={8.35} z={z} r={.58} rotation={Math.PI/2} base={6.6}/></group>)}
 {[-11.5,-9.1,-6.7,6.7,9.1,11.5].map(z=><group key={z}>
 <Box p={[side*2.53,4.8,z]} s={[.12,2.9,1.9]} c="#4b554a"/>
 {[-.5,.5].map(offset=><Arch key={offset} x={side*2.67} y={5.75} z={z+offset} r={.47} base={3.35} rotation={Math.PI/2} thickness={.13}/>)}
 <Box p={[side*2.6,1.65,z]} s={[.16,1.5,.75]} c={glass}/><Arch x={side*2.69} y={2.12} z={z} r={.43} base={.9} rotation={Math.PI/2} thickness={.13}/>
 </group>)}
 {[-8.25,8.25].map(z=><group key={z}>{[.4,2.8,3.1,6.9].map(y=><Box key={y} p={[side*2.61,y,z]} s={[.2,.16,9.5]} c={trim}/>)}</group>)}
 </group>)}
 </>:kind==='fondren'?<>
 <Box p={[-.6,3.4,0]} s={[8.8,6.8,d]} c={brick}/><Box p={[-.6,7.1,0]} s={[8.8,5.8,7.2]} c={brick}/>
 {[-1,1].map(side=><group key={side}><Box p={[-.6,6.85,side*7.8]} s={[9,.3,8.5]} c={trim}/><Box p={[-.6,6.65,side*7.8]} s={[8.7,.12,8.5]} c="#a67654"/></group>)}
 <Box p={[-.6,10.1,0]} s={[9.2,.35,7.7]} c={trim}/>
 {/* Recessed arcade has dark backing and cream voussoirs, not arches pasted on brick. */}
 <Box p={[4.05,1.8,0]} s={[.1,3.6,23.5]} c="#4b5149"/>
 <Box p={[4.6,4,0]} s={[1.4,.6,24.4]} c={trim}/>
 {[-10.2,-6.8,-3.4,0,3.4,6.8,10.2].map(z=><Arch key={z} x={5} y={1.9} z={z} r={1.5} rotation={Math.PI/2} thickness={.3}/>)}
 {[-2.25,0,2.25].map(z=><group key={z}><Box p={[3.84,7.2,z]} s={[.14,4.5,1.1]} c={glass}/>{[-.65,.65].map(v=><Box key={v} p={[3.98,7.2,z+v]} s={[.2,4.7,.2]} c={trim}/>)}{[5.6,6.7,7.8,8.9].map(y=><Box key={y} p={[3.94,y,z]} s={[.12,.12,1.15]} c={trim}/>)}</group>)}
 {[-10,-7,-4.7,4.7,7,10].map(z=><Box key={z} p={[3.84,5.5,z]} s={[.13,1.35,.85]} c={glass}/>)}
 </>:kind==='pavilion'?<>
 <Box p={[0,1.6,0]} s={[w,3.2,d]} c="#719799"/><Box p={[0,.18,0]} s={[w+.3,.22,d+.3]} c={trim}/>
 <Box p={[0,3.3,0]} s={[w+.3,.16,d+.3]} c="#eff0db"/>
 {Array.from({length:19},(_,i)=><Box key={i} p={[-8+i*.89,3.52,0]} s={[.12,.28,d+4]} c="#fff4de"/>)}
 {Array.from({length:14},(_,i)=><Box key={i} p={[0,3.42,-6+i*.92]} s={[w+4,.13,.13]} c="#fff4de"/>)}
 {[-5.8,-2.9,0,2.9,5.8].flatMap(x=>[-4.06,4.06].map(z=><group key={`${x}-${z}`}><Box p={[x,1.65,z]} s={[.1,3.3,.1]} c="#eee5cb"/><Box p={[x,2.9,z]} s={[2.9,.09,.1]} c={trim}/></group>))}
 {[-3,0,3].flatMap(x=>[-1.6,1.6].map(z=><group key={`${x}-${z}`}><Box p={[x,3.75,z]} s={[1.35,.5,1.15]} c="#faf1db"/><Box p={[x,4.01,z]} s={[.85,.08,.7]} c="#b4c9bd"/></group>))}
 </>:kind==='college'?<>
 {[[-7,0,2,14],[7,0,2,14],[0,-6,16,2]].map(([x,z,bw,bd],i)=><group key={i}><Box p={[x,4.6,z]} s={[bw,9.2,bd]} c="#b58168"/><Box p={[x,9.2,z]} s={[bw+.45,.3,bd+.45]} c="#e4d9ba"/><Roof x={x} y={9.4} z={z} w={bw+.5} d={bd+.5} c="#718477"/></group>)}
 {[-4.5,-1.5,1.5,4.5].flatMap(z=>[3.2,5,6.8,8.6].map(y=><group key={`${z}-${y}`}>{[-1,1].map(side=><group key={side}><Box p={[side*5.94,y,z]} s={[.13,1.3,1.5]} c="#e0cda9"/><Box p={[side*5.85,y,z]} s={[.12,1.05,1.1]} c={glass}/><Box p={[side*5.76,y,z]} s={[.12,1.05,.08]} c={trim}/><Box p={[side*8.03,y,z]} s={[.12,1.15,1.25]} c={glass}/></group>)}</group>))}
 {[-1,1].map(side=><group key={side}><Box p={[side*5.9,1.1,0]} s={[.15,2.2,13.5]} c="#4b6057"/>{[-6,-3,0,3,6].map(z=><Box key={z} p={[side*5.75,1.1,z]} s={[.4,2.2,.4]} c={trim}/>) }<Box p={[side*5.75,2.35,0]} s={[.45,.3,14]} c={trim}/></group>)}
 {[-4.5,-1.5,1.5,4.5].flatMap(x=>[3.2,5,6.8,8.6].map(y=><group key={`back-${x}-${y}`}><Box p={[x,y,-4.94]} s={[1.5,1.3,.13]} c="#e0cda9"/><Box p={[x,y,-4.85]} s={[1.1,1.05,.12]} c={glass}/><Box p={[x,y,-4.76]} s={[.08,1.05,.12]} c={trim}/></group>))}
 <Box p={[0,.04,0]} s={[11,.08,10]} c="#b0bd8b"/><Box p={[0,.09,0]} s={[2,.1,11]} c="#e1d3ae"/>
 </> :kind==='hall'?<><Box p={[0,3.7,0]} s={[w,7.4,d]} c="#cc927f"/><Box p={[0,7.5,0]} s={[w+1,.5,d+1]} c="#6c8a8d"/>{[-6,-3,0,3,6].map(x=><group key={x}><Box p={[x,2.2,5.4]} s={[.7,4.4,.7]} c="#e5c18b"/><Box p={[x,4.5,5.4]} s={[1.2,.7,1.2]} c="#5f97a6"/><Box p={[x,5.8,5.02]} s={[1.3,1.4,.13]} c={glass}/></group>)}<Box p={[0,6,5.5]} s={[5,1.2,.8]} c="#b56553"/></>
 :kind==='engineering'?<><Box p={[0,4.4,0]} s={[w,8.8,d]} c="#b47c5b"/><Box p={[0,5,d/2+.02]} s={[w,.9,.1]} c={glass}/><Box p={[0,2.4,d/2+.02]} s={[w,1.7,.1]} c={glass}/><Box p={[0,8.9,0]} s={[w+1,.3,d+1]} c={trim}/>{[-7,-5,-3,-1,1,3,5,7].map(x=><Box key={x} p={[x,5,6.7]} s={[.3,7.4,.5]} c={trim}/>)}</>
 :<><Box p={[0,1.7,0]} s={[w,3.4,d]} c="#cfa987"/><Box p={[0,3.5,0]} s={[w+.4,.5,d+.5]} c="#ae7556"/>{Array.from({length:5},(_,i)=><Box key={i} p={[-w/2+2+i*2.2,1.6,d/2+.02]} s={[.8,1.5,.1]} c={glass}/>)}</>}
 </group>
}
function Trees(){
 const trunks=useRef<THREE.InstancedMesh>(null),leaves=useRef<THREE.InstancedMesh>(null),branches=useRef<THREE.InstancedMesh>(null);
 useEffect(()=>{const o=new THREE.Object3D();trees.forEach((t,i)=>{
 o.rotation.set(0,0,0);o.position.set(t.x,1.4,t.z);o.scale.set(1,1,1);o.updateMatrix();trunks.current!.setMatrixAt(i,o.matrix);
 for(let j=0;j<3;j++){const a=j*Math.PI*2/3+i*.7;o.rotation.set(0,a,0);o.position.set(t.x+Math.cos(a)*1.05,3.8+(j===0?.4:0),t.z+Math.sin(a)*1.05);o.scale.set(2.25,1.05,1.9);o.updateMatrix();leaves.current!.setMatrixAt(i*3+j,o.matrix);leaves.current!.setColorAt(i*3+j,new THREE.Color(['#58775a','#6f8b60','#7e9666'][(i+j)%3]));
 o.position.set(t.x+Math.cos(a)*.55,2.45,t.z+Math.sin(a)*.55);o.scale.set(.17,1.7,.17);o.rotation.set(Math.sin(a)*.8,0,-Math.cos(a)*.8);o.updateMatrix();branches.current!.setMatrixAt(i*3+j,o.matrix);}
 });for(const m of [trunks,leaves,branches]){m.current!.instanceMatrix.needsUpdate=true;m.current!.computeBoundingSphere()}if(leaves.current!.instanceColor)leaves.current!.instanceColor.needsUpdate=true;},[]);
 return <><instancedMesh ref={trunks} args={[undefined,undefined,trees.length]} castShadow><cylinderGeometry args={[.26,.42,2.8,6]}/><meshStandardMaterial color="#79634c" onBeforeCompile={cutaway}/></instancedMesh><instancedMesh ref={branches} args={[undefined,undefined,trees.length*3]} castShadow><cylinderGeometry args={[1,1,1,5]}/><meshStandardMaterial color="#79634c" onBeforeCompile={cutaway}/></instancedMesh><instancedMesh ref={leaves} args={[undefined,undefined,trees.length*3]} castShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial roughness={1} onBeforeCompile={cutaway}/></instancedMesh></>
}
function Furnishings(){return <>
 {benches.map((b,i)=><group key={`bench${i}`} position={[b.x,0,b.z]} rotation={[0,b.rotation,0]}>{[-.25,0,.25].map(z=><Box key={z} p={[0,.65,z]} s={[2,.12,.18]} c="#9a7650"/>)}{[.95,1.2].map(y=><Box key={y} p={[0,y,-.32]} s={[2,.14,.12]} c="#9a7650"/>)}{[-.75,.75].map(x=><Box key={x} p={[x,.37,0]} s={[.13,.7,.65]} c="#344e47"/>)}</group>)}
 {lamps.map((p,i)=><group key={`lamp${i}`} position={[p.x,0,p.z]}><Box p={[0,1.65,0]} s={[.12,3.3,.12]} c="#304a42"/><Box p={[0,.2,0]} s={[.32,.4,.32]} c="#304a42"/><Box p={[0,3.45,0]} s={[.45,.55,.45]} c="#f4dfaa"/><Box p={[0,3.77,0]} s={[.65,.13,.65]} c="#304a42"/></group>)}
 {cafeTables.map((p,i)=><group key={`table${i}`} position={[p.x,0,p.z]}><Box p={[0,.85,0]} s={[1.1,.1,1.1]} c="#eee0bf"/><Box p={[0,.4,0]} s={[.1,.8,.1]} c="#667c67"/>{[-1,1].map(x=><group key={x}><Box p={[x,.45,0]} s={[.55,.12,.6]} c="#a6b58b"/><Box p={[x,.8,-.3]} s={[.55,.65,.1]} c="#a6b58b"/><Box p={[x,.2,0]} s={[.1,.4,.45]} c="#526e55"/></group>)}</group>)}
 {/* Low planting borders and fountain sit outside the main walking axis. */}
 {[-36,-24].map(x=><group key={x}><Box p={[x,.17,2.8]} s={[1.1,.3,2]} c="#b69d76"/><Box p={[x,.45,2.8]} s={[.8,.5,1.6]} c="#6a855b"/></group>)}
 <Box p={[-30,1.22,2.8]} s={[9.65,.04,.85]} c="#7eacaa"/>
 </>}
function Owl({p}:{p:Point}){return <group position={[p.x,1,p.z]}><mesh castShadow><sphereGeometry args={[.65,8,6]}/><meshStandardMaterial color="#d3a24e"/></mesh>{[-.27,.27].map(x=><group key={x}><mesh position={[x,.18,.51]}><sphereGeometry args={[.22,8,6]}/><meshStandardMaterial color="#fff2cc"/></mesh><mesh position={[x,.18,.7]}><sphereGeometry args={[.08,6,4]}/><meshStandardMaterial color="#223c3a"/></mesh><mesh position={[x,.6,0]}><coneGeometry args={[.22,.4,4]}/><meshStandardMaterial color="#b8873c"/></mesh></group>)}<mesh position={[0,.05,.7]} rotation={[Math.PI,0,0]}><coneGeometry args={[.13,.25,3]}/><meshStandardMaterial color="#df7146"/></mesh><mesh position={[0,-.8,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.85,1,24]}/><meshBasicMaterial color="#efd494" side={THREE.DoubleSide}/></mesh></group>}
function Drone({controls}:{controls:MutableRefObject<Controls>}){const ref=useRef<THREE.Group>(null);useFrame(({clock})=>{if(ref.current&&controls.current.reduced){ref.current.position.y=3.5;ref.current.rotation.y=0;}else if(ref.current&&!controls.current.paused){ref.current.position.y=3.5+Math.sin(clock.elapsedTime*1.5)*.2;ref.current.rotation.y=clock.elapsedTime*.25}});return <group ref={ref} position={[-30,3.5,20]}><SolidBox p={[0,0,0]} s={[1,.35,.7]} c="#264b49"/>{[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x}${z}`}><SolidBox p={[x*.5,0,z*.5]} s={[1.4,.12,.15]} c="#e6c786"/><mesh position={[x,0,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.3,.48,12]}/><meshStandardMaterial color="#324c45" side={THREE.DoubleSide}/></mesh></group>))}</group>}
function World({night,controls,collected,onPosition,onReady,onFail,onStats}:Props){
 const player=useRef<THREE.Group>(null),body=useRef<THREE.Group>(null),leftLeg=useRef<THREE.Group>(null),rightLeg=useRef<THREE.Group>(null),leftArm=useRef<THREE.Group>(null),rightArm=useRef<THREE.Group>(null);const phase=useRef(0),stride=useRef(0);const focus=useRef(new THREE.Vector3(20,0,10));const reset=useRef(-1);const elapsed=useRef(0);const samples=useRef<number[]>([]);const {gl,size,camera:viewportCamera}=useThree();
 useEffect(()=>{if(viewportCamera instanceof THREE.OrthographicCamera){viewportCamera.zoom=Math.min(17,size.width/(size.width<600?44:60),size.height/44);viewportCamera.updateProjectionMatrix()}},[size,viewportCamera]);
 useEffect(()=>{const canvas=gl.domElement;const lost=(e:Event)=>{e.preventDefault();onFail()};canvas.addEventListener('webglcontextlost',lost);onReady();return()=>canvas.removeEventListener('webglcontextlost',lost)},[gl,onReady,onFail]);
 useFrame(({camera},delta)=>{const c=controls.current;const dt=Math.min(delta,.04);
 if(reset.current!==c.reset){c.velocity={x:0,z:0};phase.current=0;stride.current=0;focus.current.set(c.position.x,0,c.position.z);reset.current=c.reset;}
 let distance=0;const running=c.running||c.keys.has('shift');
 if(c.paused){c.velocity={x:0,z:0};}else{
 const input={x:Number(c.keys.has('d')||c.keys.has('arrowright'))-Number(c.keys.has('a')||c.keys.has('arrowleft'))+c.stick.x,z:Number(c.keys.has('s')||c.keys.has('arrowdown'))-Number(c.keys.has('w')||c.keys.has('arrowup'))+c.stick.z};
 const result=advance(c.position,c.velocity,input,running,dt);c.position=result.position;c.velocity=result.velocity;distance=result.distance;
 }
 const p=c.position,speed=dt?distance/dt:0;
 if(speed>.1)c.heading=turnTowards(c.heading,Math.atan2(c.velocity.x,c.velocity.z),dt);
 phase.current+=distance*(running?3.8:4.7);stride.current+=distance;
 if(!c.paused&&distance>0&&stride.current>(running?1.6:1.25)){stride.current=0;c.step(running);}
 const swing=c.reduced||c.paused?0:Math.sin(phase.current)*Math.min(speed/8.5,1)*(running?.7:.48);
 if(player.current){player.current.position.set(p.x,0,p.z);player.current.rotation.y=c.heading;}
 if(body.current)body.current.position.y=c.reduced||c.paused?0:Math.abs(Math.sin(phase.current))*Math.min(speed/8.5,1)*.06;
 if(leftLeg.current)leftLeg.current.rotation.x=swing;if(rightLeg.current)rightLeg.current.rotation.x=-swing;
 if(leftArm.current)leftArm.current.rotation.x=-swing*.8;if(rightArm.current)rightArm.current.rotation.x=swing*.8;
 focus.current.lerp(new THREE.Vector3(p.x,0,p.z),c.reduced?1:1-Math.exp(-dt*8));
 // Fixed elevated orbit never enters campus geometry; no bob, zoom pulse, or camera shake.
 camera.position.set(focus.current.x+28,44,focus.current.z+28);camera.lookAt(focus.current.x,0,focus.current.z);playerUniform.value.set(p.x,1.25,p.z);
 elapsed.current+=delta;samples.current.push(delta);if(elapsed.current>.05){onPosition({...p});elapsed.current=0;}if(samples.current.length>=120){const a=samples.current;onStats(`${Math.round(a.length/a.reduce((s,v)=>s+v,0))} fps · ${gl.info.render.calls} calls · ${gl.info.render.triangles.toLocaleString()} triangles`);samples.current=[];}
 });
 return <BoxBatch night={night}><color attach="background" args={[night?'#444c65':'#dfe5d0']}/><ambientLight intensity={night?.45:1.05}/><hemisphereLight args={[night?'#b2bedf':'#fff4db','#718364',night?.7:1.65]}/><directionalLight position={[-25,60,25]} intensity={night?.8:2.5} color={night?'#b9d4ff':'#ffe1ab'} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-65} shadow-camera-right={65} shadow-camera-top={65} shadow-camera-bottom={-65} shadow-normalBias={.08}/>
 <Box p={[0,-.5,-14]} s={[101,1,96]} c="#92ac7d"/>
 {/* Main axis, the two sides of the quad, Laboratory Road and the north-college route. */}
 {[[-4,10,76,3],[9,4,37,1.8],[9,16,37,1.8],[31,-17,3,73],[-19,10,2,29],[0,-8,65,3.5],[-28,-8,3,36],[37,-37,3,24],[34,-39,9,2]].map(([x,z,w,d],i)=><Box key={i} p={[x,.02,z]} s={[w,.08,d]} c="#e1d3ae"/>)}
 <Box p={[8,.06,10]} s={[23,.1,12]} c="#a9bb89"/><Box p={[8,.13,10]} s={[23,.08,2]} c="#e6d9b8"/>
 <Box p={[-30,.05,10]} s={[18,.12,17]} c="#d7ceac"/><Box p={[-30,.6,2.8]} s={[10,1.2,1.2]} c="#647b74"/>
 {buildings.map(b=><Building key={b.name} b={b}/>)}<Trees/><Furnishings/>
 <Owl p={{x:22,z:13}}/>
 <mesh position={[13,.9,14.1]} rotation={[-Math.PI/2,0,.4]}><circleGeometry args={[.24,6]}/><meshStandardMaterial color="#e7c36c"/></mesh>
 <mesh position={[37,1.1,-43]}><torusGeometry args={[.38,.09,6,20,Math.PI*1.5]}/><meshStandardMaterial color="#e7c36c" emissive="#efbc66" emissiveIntensity={night?2:.3}/></mesh>
 {night&&<mesh position={[-9,29,-36]}><sphereGeometry args={[2,16,12]}/><meshBasicMaterial color="#fff0c7"/></mesh>}

 <Label text="LOVETT HALL" x={30.82} z={10} y={6.05} mounted rotation={Math.PI/2}/><Label text="FONDREN LIBRARY" x={-6.88} z={10} y={4.03} mounted rotation={Math.PI/2}/><Label text="BROCHSTEIN PAVILION" x={-30} z={14.12} y={2.35} mounted/><Label text="DUNCAN COLLEGE" x={44} z={-41.95} y={2.5} mounted/>
 {exhibits.map(e=><group key={e.id}><mesh position={[e.x,.13,e.z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.15,1.4,24]}/><meshBasicMaterial color="#ffe1a0"/></mesh><Box p={[e.x,.8,e.z]} s={[.13,1.6,.13]} c="#b89657"/><mesh position={[e.x,1.85,e.z]} rotation={[0,Math.PI/4,0]}><octahedronGeometry args={[.42,0]}/><meshStandardMaterial color="#efbf66" emissive="#b77d21" emissiveIntensity={.25}/></mesh><Label text={`${e.number}  ${e.name}`} x={e.x} z={e.z} y={3}/></group>)}
 <Label text="ACADEMIC QUADRANGLE" x={8} z={12} y={.4}/><Label text="O’Connor · Engineering" x={18} z={-26} y={10}/><Label text="↑ Duncan College · compressed walk" x={34} z={-28} y={2}/>
 {owls.map((p,i)=>(i===1||!collected.includes(i))&&<Owl key={i} p={p}/>)}<Drone controls={controls}/>
 <group ref={player}><mesh position={[0,.08,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.6,.8,24]}/><meshBasicMaterial color="#fff7e2"/></mesh><group ref={body}><SolidBox p={[0,.95,0]} s={[.72,.9,.48]} c="#204b60"/><mesh position={[0,1.75,0]} castShadow><sphereGeometry args={[.38,10,8]}/><meshStandardMaterial color="#d9a17b"/></mesh><mesh position={[0,1.98,-.04]}><sphereGeometry args={[.34,8,6,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#443c33"/></mesh><group ref={leftLeg} position={[-.23,.6,0]}><SolidBox p={[0,-.3,0]} s={[.25,.6,.3]} c="#31453e"/></group><group ref={rightLeg} position={[.23,.6,0]}><SolidBox p={[0,-.3,0]} s={[.25,.6,.3]} c="#31453e"/></group>{[[leftArm,-.48],[rightArm,.48]].map(([ref,x],i)=><group key={i} ref={ref as MutableRefObject<THREE.Group>} position={[x as number,1.25,0]}><SolidBox p={[0,-.28,0]} s={[.2,.62,.22]} c="#204b60"/></group>)}<SolidBox p={[0,1,-.31]} s={[.52,.6,.25]} c="#cf9a50"/></group></group>
 </BoxBatch>
}
export default memo(function Scene(props:Props){return <Canvas shadows={{type:THREE.PCFShadowMap}} dpr={[1,1.5]} orthographic camera={{zoom:15,position:[48,44,38],near:.1,far:180}} gl={{antialias:true,powerPreference:'high-performance'}}><World {...props}/></Canvas>})
