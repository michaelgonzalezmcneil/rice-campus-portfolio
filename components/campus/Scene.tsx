'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useLayoutEffect, createContext, useContext, memo, type ReactNode, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { buildings, trees, exhibits, owls, move, type Point } from './world';
export type Controls = { keys:Set<string>; stick:Point; paused:boolean; position:Point; reset:number; reduced:boolean };
type Props = { controls:MutableRefObject<Controls>; collected:number[]; onPosition:(p:Point)=>void; onReady:()=>void; onFail:()=>void; onStats:(s:string)=>void };
type BoxProps={p:[number,number,number];s:[number,number,number];c?:string};
const BoxContext=createContext<{items:Map<THREE.Object3D,string>;dirty:boolean}|null>(null);
function BoxBatch({children}:{children:ReactNode}){
 const mesh=useRef<THREE.InstancedMesh>(null);const registry=useMemo(()=>({items:new Map<THREE.Object3D,string>(),dirty:true}),[]);
 useFrame(()=>{if(!registry.dirty||!mesh.current)return;let i=0;registry.items.forEach((color,object)=>{object.updateWorldMatrix(true,false);mesh.current!.setMatrixAt(i,object.matrixWorld);mesh.current!.setColorAt(i,new THREE.Color(color));i++});mesh.current.count=i;mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;mesh.current.computeBoundingSphere();registry.dirty=false},-2);
 return <BoxContext.Provider value={registry}><instancedMesh ref={mesh} args={[undefined,undefined,512]} castShadow receiveShadow><boxGeometry/><meshStandardMaterial roughness={.9}/></instancedMesh>{children}</BoxContext.Provider>
}
function Box({p,s,c='#c68f6c'}:BoxProps){const ref=useRef<THREE.Group>(null);const registry=useContext(BoxContext)!;useLayoutEffect(()=>{const object=ref.current!;registry.items.set(object,c);registry.dirty=true;return()=>{registry.items.delete(object);registry.dirty=true}},[registry,c,p[0],p[1],p[2],s[0],s[1],s[2]]);return <group ref={ref} position={p} scale={s}/>}
function SolidBox({p,s,c='#c68f6c'}:BoxProps){return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.9}/></mesh>}
function Arch({x,y,z,r=1,rotation=0}:{x:number;y:number;z:number;r?:number;rotation?:number}){return <group position={[x,y,z]} rotation={[0,rotation,0]}><mesh><torusGeometry args={[r,.23,5,12,Math.PI]}/><meshStandardMaterial color="#f2dabb"/></mesh><Box p={[-r,-y/2,0]} s={[.46,y,.5]} c="#f2dabb"/><Box p={[r,-y/2,0]} s={[.46,y,.5]} c="#f2dabb"/></group>}
function Label({text,x,z,y=1.4}:{text:string;x:number;z:number;y?:number}) {
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d')!;ctx.fillStyle='#f9f4e9';ctx.beginPath();ctx.roundRect(2,2,508,76,16);ctx.fill();ctx.fillStyle='#273d37';ctx.font='600 25px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,40);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t},[text]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <sprite position={[x,y,z]} scale={[10,1.56,1]}><spriteMaterial map={texture} depthTest={false}/></sprite>;
}
function Building({b}:{b:typeof buildings[number]}){
 const {w,d,kind}=b;const brick='#c99573',trim='#f1dcc0',glass='#476c70';
 return <group position={[b.x,0,b.z]}>
 {kind==='lovett'?<>
 <Box p={[0,3.2,-8.25]} s={[w,6.4,9.5]}/><Box p={[0,3.2,8.25]} s={[w,6.4,9.5]}/><Box p={[0,7,0]} s={[w,3.2,7]}/>
 <Arch x={-2.6} y={3.2} z={0} r={3.1} rotation={Math.PI/2}/><Arch x={2.6} y={3.2} z={0} r={3.1} rotation={Math.PI/2}/>
 <Box p={[0,10,-10]} s={[6,7,5]} c={brick}/><Box p={[0,13.5,-10]} s={[6.5,.6,5.5]} c={trim}/>
 <mesh position={[0,14.8,-10]} rotation={[0,Math.PI/4,0]} scale={[4.5,1.8,4]} castShadow><coneGeometry args={[1,1,4]}/><meshStandardMaterial color="#97543f"/></mesh>
 <Box p={[0,7,8.4]} s={[5.7,.5,9.8]} c="#ae684e"/>
 {[-11,-8,-5,5,8,11].map(z=><group key={z}><Arch x={-2.6} y={1.7} z={z} rotation={Math.PI/2}/><Box p={[-2.53,4.8,z]} s={[.15,1.5,.7]} c={glass}/></group>)}
 </>:kind==='fondren'?<><Box p={[0,3.5,0]} s={[w,7,d]} c={brick}/><Box p={[0,7,0]} s={[w,5,8]} c={brick}/><Box p={[0,9.6,0]} s={[w+.5,.35,8.4]} c={trim}/>{[-9,-6,-3,0,3,6,9].map(z=><group key={z}><Arch x={5.3} y={2} z={z} r={1.1} rotation={Math.PI/2}/><Box p={[5.03,5.5,z]} s={[.12,2.2,.8]} c={glass}/></group>)}{[-2,0,2].map(z=><Box key={z} p={[5.04,8,z]} s={[.14,2,.8]} c={glass}/>)}</>
 :kind==='pavilion'?<><Box p={[0,1.6,0]} s={[w,3.2,d]} c="#779ca0"/><Box p={[0,3.35,0]} s={[w+3,.25,d+3]} c="#fff3dc"/>{Array.from({length:14},(_,i)=><Box key={i} p={[-7+i*1.07,3.65,0]} s={[.15,.5,d+3]} c="#fff3dc"/>)}{[-5,0,5].map(x=><Box key={x} p={[x,1.65,4.1]} s={[.16,3.3,.16]} c={trim}/>)}</>
 :kind==='college'?<>{[[-7,0,2,14],[7,0,2,14],[0,-6,16,2]].map(([x,z,bw,bd],i)=><group key={i}><Box p={[x,4,z]} s={[bw,8,bd]} c={brick}/><Box p={[x,8.1,z]} s={[bw+.3,.3,bd+.3]} c="#668368"/></group>)}{[-4,-1,2,5].flatMap(z=>[1.8,4,6.2].map(y=><group key={`${z}-${y}`}><Box p={[-5.95,y,z]} s={[.1,1.1,1.3]} c={glass}/><Box p={[5.95,y,z]} s={[.1,1.1,1.3]} c={glass}/></group>))}<Box p={[0,.05,0]} s={[10,.1,10]} c="#b5c28b"/></>
 :kind==='hall'?<><Box p={[0,3.7,0]} s={[w,7.4,d]} c="#cc927f"/><Box p={[0,7.5,0]} s={[w+1,.5,d+1]} c="#6c8a8d"/>{[-6,-3,0,3,6].map(x=><group key={x}><Box p={[x,2.2,5.4]} s={[.7,4.4,.7]} c="#e5c18b"/><Box p={[x,4.5,5.4]} s={[1.2,.7,1.2]} c="#5f97a6"/><Box p={[x,5.8,5.02]} s={[1.3,1.4,.13]} c={glass}/></group>)}<Box p={[0,6,5.5]} s={[5,1.2,.8]} c="#b56553"/></>
 :kind==='engineering'?<><Box p={[0,4.4,0]} s={[w,8.8,d]} c="#b47c5b"/><Box p={[0,5,d/2+.02]} s={[w,.9,.1]} c={glass}/><Box p={[0,2.4,d/2+.02]} s={[w,1.7,.1]} c={glass}/><Box p={[0,8.9,0]} s={[w+1,.3,d+1]} c={trim}/>{[-7,-5,-3,-1,1,3,5,7].map(x=><Box key={x} p={[x,5,6.7]} s={[.3,7.4,.5]} c={trim}/>)}</>
 :<><Box p={[0,1.7,0]} s={[w,3.4,d]} c="#cfa987"/><Box p={[0,3.5,0]} s={[w+.4,.5,d+.5]} c="#ae7556"/>{Array.from({length:5},(_,i)=><Box key={i} p={[-w/2+2+i*2.2,1.6,d/2+.02]} s={[.8,1.5,.1]} c={glass}/>)}</>}
 </group>
}
function Trees(){const trunks=useRef<THREE.InstancedMesh>(null);const leaves=useRef<THREE.InstancedMesh>(null);useEffect(()=>{const o=new THREE.Object3D();trees.forEach((t,i)=>{o.position.set(t.x,1.1,t.z);o.scale.set(1,1,1);o.updateMatrix();trunks.current!.setMatrixAt(i,o.matrix);o.position.y=3.7;o.scale.set(2.3,1.7,2.2);o.rotation.y=i;o.updateMatrix();leaves.current!.setMatrixAt(i,o.matrix);leaves.current!.setColorAt(i,new THREE.Color(i%3===0?'#52795c':i%3===1?'#6f8d61':'#829966'));});trunks.current!.instanceMatrix.needsUpdate=true;leaves.current!.instanceMatrix.needsUpdate=true;},[]);return <><instancedMesh ref={trunks} args={[undefined,undefined,trees.length]} castShadow><cylinderGeometry args={[.23,.4,2.2,5]}/><meshStandardMaterial color="#80694d"/></instancedMesh><instancedMesh ref={leaves} args={[undefined,undefined,trees.length]} castShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={1}/></instancedMesh></>}
function Owl({p}:{p:Point}){return <group position={[p.x,1,p.z]}><mesh castShadow><sphereGeometry args={[.65,8,6]}/><meshStandardMaterial color="#d3a24e"/></mesh>{[-.27,.27].map(x=><group key={x}><mesh position={[x,.18,.51]}><sphereGeometry args={[.22,8,6]}/><meshStandardMaterial color="#fff2cc"/></mesh><mesh position={[x,.18,.7]}><sphereGeometry args={[.08,6,4]}/><meshStandardMaterial color="#223c3a"/></mesh><mesh position={[x,.6,0]}><coneGeometry args={[.22,.4,4]}/><meshStandardMaterial color="#b8873c"/></mesh></group>)}<mesh position={[0,.05,.7]} rotation={[Math.PI,0,0]}><coneGeometry args={[.13,.25,3]}/><meshStandardMaterial color="#df7146"/></mesh><mesh position={[0,-.8,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.85,1,24]}/><meshBasicMaterial color="#efd494" side={THREE.DoubleSide}/></mesh></group>}
function Drone({reduced}:{reduced:boolean}){const ref=useRef<THREE.Group>(null);useFrame(({clock})=>{if(ref.current&&!reduced){ref.current.position.y=3.5+Math.sin(clock.elapsedTime*1.5)*.2;ref.current.rotation.y=clock.elapsedTime*.25}});return <group ref={ref} position={[-30,3.5,20]}><SolidBox p={[0,0,0]} s={[1,.35,.7]} c="#264b49"/>{[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x}${z}`}><SolidBox p={[x*.5,0,z*.5]} s={[1.4,.12,.15]} c="#e6c786"/><mesh position={[x,0,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.3,.48,12]}/><meshStandardMaterial color="#324c45" side={THREE.DoubleSide}/></mesh></group>))}</group>}
function World({controls,collected,onPosition,onReady,onFail,onStats}:Props){
 const player=useRef<THREE.Group>(null);const focus=useRef(new THREE.Vector3(20,0,10));const reset=useRef(-1);const elapsed=useRef(0);const samples=useRef<number[]>([]);const {gl,size,camera:viewportCamera}=useThree();
 useEffect(()=>{if(viewportCamera instanceof THREE.OrthographicCamera){viewportCamera.zoom=Math.min(17,size.width/(size.width<600?44:60),size.height/44);viewportCamera.updateProjectionMatrix()}},[size,viewportCamera]);
 useEffect(()=>{const canvas=gl.domElement;const lost=(e:Event)=>{e.preventDefault();onFail()};canvas.addEventListener('webglcontextlost',lost);onReady();return()=>canvas.removeEventListener('webglcontextlost',lost)},[gl,onReady,onFail]);
 useFrame(({camera},delta)=>{const c=controls.current;let dx=0,dz=0;if(!c.paused){dx=Number(c.keys.has('d')||c.keys.has('arrowright'))-Number(c.keys.has('a')||c.keys.has('arrowleft'))+c.stick.x;dz=Number(c.keys.has('s')||c.keys.has('arrowdown'))-Number(c.keys.has('w')||c.keys.has('arrowup'))+c.stick.z;const n=Math.max(1,Math.hypot(dx,dz));dx/=n;dz/=n;c.position=move(c.position,(dx+dz)*.7071*9*Math.min(delta,.04),(dz-dx)*.7071*9*Math.min(delta,.04));}
 const p=c.position;if(player.current){player.current.position.set(p.x,0,p.z);if(dx||dz)player.current.rotation.y=Math.atan2(dx+dz,dz-dx);}
 if(reset.current!==c.reset){focus.current.set(p.x,0,p.z);reset.current=c.reset;}
 focus.current.lerp(new THREE.Vector3(p.x,0,p.z),c.reduced?1:1-Math.exp(-delta*5));camera.position.set(focus.current.x+28,44,focus.current.z+28);camera.lookAt(focus.current.x,0,focus.current.z);
 elapsed.current+=delta;samples.current.push(delta);if(elapsed.current>.12){onPosition({...p});elapsed.current=0;}if(samples.current.length>=120){const a=samples.current;onStats(`${Math.round(a.length/a.reduce((s,v)=>s+v,0))} fps · ${gl.info.render.calls} calls · ${gl.info.render.triangles.toLocaleString()} triangles`);samples.current=[];}
 });
 return <BoxBatch><color attach="background" args={['#d9e2cf']}/><ambientLight intensity={1.2}/><hemisphereLight args={['#fff4db','#718364',1.8]}/><directionalLight position={[-25,60,25]} intensity={2.4} color="#ffe1ab" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-65} shadow-camera-right={65} shadow-camera-top={65} shadow-camera-bottom={-65} shadow-normalBias={.08}/>
 <Box p={[0,-.5,-14]} s={[101,1,96]} c="#92ac7d"/>
 {/* Main axis, the two sides of the quad, Laboratory Road and the north-college route. */}
 {[[-4,10,76,3],[9,4,37,1.8],[9,16,37,1.8],[31,-17,3,73],[-19,10,2,29],[0,-8,65,3.5],[-28,-8,3,36],[37,-37,3,24],[34,-39,9,2]].map(([x,z,w,d],i)=><Box key={i} p={[x,.02,z]} s={[w,.08,d]} c="#e1d3ae"/>)}
 <Box p={[8,.06,10]} s={[23,.1,12]} c="#a9bb89"/><Box p={[8,.13,10]} s={[23,.08,2]} c="#e6d9b8"/>
 <Box p={[-30,.05,10]} s={[18,.12,17]} c="#d7ceac"/><Box p={[-30,.6,2.8]} s={[10,1.2,1.2]} c="#647b74"/>
 {buildings.map(b=><Building key={b.name} b={b}/>)}<Trees/>
 {exhibits.map(e=><group key={e.id}><mesh position={[e.x,.13,e.z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.15,1.4,24]}/><meshBasicMaterial color="#ffe1a0"/></mesh><Box p={[e.x,.8,e.z]} s={[.13,1.6,.13]} c="#b89657"/><mesh position={[e.x,1.85,e.z]} rotation={[0,Math.PI/4,0]}><octahedronGeometry args={[.42,0]}/><meshStandardMaterial color="#efbf66" emissive="#b77d21" emissiveIntensity={.25}/></mesh><Label text={`${e.number}  ${e.name}`} x={e.x} z={e.z} y={3}/></group>)}
 <Label text="ACADEMIC QUADRANGLE" x={8} z={12} y={.4}/><Label text="O’Connor · Engineering" x={18} z={-26} y={10}/><Label text="↑ Duncan College · compressed walk" x={34} z={-28} y={2}/>
 {owls.map((p,i)=>!collected.includes(i)&&<Owl key={i} p={p}/>)}<Drone reduced={controls.current.reduced}/>
 <group ref={player}><mesh position={[0,.08,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.6,.8,24]}/><meshBasicMaterial color="#fff7e2"/></mesh><SolidBox p={[0,.95,0]} s={[.72,.9,.48]} c="#204b60"/><mesh position={[0,1.75,0]} castShadow><sphereGeometry args={[.38,10,8]}/><meshStandardMaterial color="#d9a17b"/></mesh><mesh position={[0,1.98,-.04]}><sphereGeometry args={[.34,8,6,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#443c33"/></mesh><SolidBox p={[-.23,.3,0]} s={[.25,.6,.3]} c="#31453e"/><SolidBox p={[.23,.3,0]} s={[.25,.6,.3]} c="#31453e"/><SolidBox p={[0,1,-.31]} s={[.52,.6,.25]} c="#cf9a50"/></group>
 </BoxBatch>
}
export default memo(function Scene(props:Props){return <Canvas shadows={{type:THREE.PCFShadowMap}} dpr={[1,1.5]} orthographic camera={{zoom:15,position:[48,44,38],near:.1,far:180}} gl={{antialias:true,powerPreference:'high-performance'}}><World {...props}/></Canvas>})
