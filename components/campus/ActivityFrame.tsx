'use client';
import { useRef, useState, type ReactNode } from 'react';
export function ActivityFrame({title,description,children}:{title:string;description:string;children:ReactNode}){
 const [open,setOpen]=useState(false),[round,setRound]=useState(0);const start=useRef<HTMLButtonElement>(null),heading=useRef<HTMLHeadingElement>(null);
 return <section className="portfolio-activity" aria-label={title}><span className="fiction-badge">OPTIONAL GAME DEMO · FICTIONAL DATA</span><h3 ref={heading} tabIndex={-1}>{title}</h3><p>{description} About 20–40 seconds; no timer.</p>{!open?<button ref={start} className="campus-button" onClick={()=>{setOpen(true);requestAnimationFrame(()=>heading.current?.focus())}}>Play {title}</button>:<><div key={round}>{children}</div><div className="activity-actions"><button onClick={()=>{setRound(n=>n+1);heading.current?.focus()}}>Replay {title}</button><button onClick={()=>{setOpen(false);requestAnimationFrame(()=>start.current?.focus())}}>Stop activity</button></div></>}</section>
}
