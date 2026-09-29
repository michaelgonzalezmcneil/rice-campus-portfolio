'use client';
import { useState } from 'react';
import { ActivityFrame } from './ActivityFrame';
const stops=[{id:'coffee',name:'Coffee',symbol:'☕',time:4},{id:'library',name:'Library',symbol:'▤',time:5},{id:'garden',name:'Garden detour',symbol:'✿',time:6}];
function RouteRound(){const [route,setRoute]=useState<string[]>([]),[message,setMessage]=useState(''),[done,setDone]=useState(false);const total=route.reduce((n,id)=>n+stops.find(s=>s.id===id)!.time,0);return <>
 <p><b>Your fictional morning:</b> grab coffee before studying at the library. You have a 10-minute budget. Each card adds its shown demo cost.</p>
 <div className="route-budget"><span>Start · residence</span><b>{total} / 10 demo minutes</b></div>
 <ol className="route-slots" aria-label="Your ordered route">{[0,1,2].map(i=><li key={i}>{route[i]?<><b>{stops.find(s=>s.id===route[i])!.name}</b><button aria-label={`Remove ${stops.find(s=>s.id===route[i])!.name}`} disabled={done} onClick={()=>{setRoute(r=>r.filter((_,n)=>n!==i));setMessage('')}}>×</button></>:<span>{i+1}. Add a stop</span>}</li>)}</ol>
 <div className="activity-options" aria-label="Available stops">{stops.map(s=><button key={s.id} disabled={done||route.includes(s.id)} onClick={()=>{setRoute(r=>[...r,s.id]);setMessage('')}}>Add {s.name} · {s.time} min</button>)}</div>
 <button className="campus-button activity-check" disabled={done} onClick={()=>{if(!route.includes('coffee')||!route.includes('library'))setMessage('Include both Coffee and Library.');else if(route.indexOf('coffee')>route.indexOf('library'))setMessage('Order matters: remove stops and put Coffee before Library.');else if(total>10)setMessage('Over budget. Remove the optional Garden detour.');else{setDone(true);setMessage('Route ready: Coffee → Library, 9 demo minutes. Both requirements fit the budget.')}}}>Check my route</button>
 <div role="status" className="activity-feedback">{message}</div>{done&&<p className="content-note"><b>The engineering idea:</b> represent a trip as an ordered list, then validate required stops, ordering, and cost. These costs are fictional game values, not walking directions or Rice travel times.</p>}
 </>}
export function RouteActivity(){return <ActivityFrame title="RiceWalk morning planner" description="Arrange a short route that satisfies an order and a time budget."><RouteRound/></ActivityFrame>}
