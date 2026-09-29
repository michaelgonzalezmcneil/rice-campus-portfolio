'use client';
import { useState } from 'react';
import { ActivityFrame } from './ActivityFrame';
type OwlRecord={id:string;name:string;place:string};
const existing:OwlRecord={id:'owl-17',name:'Pip',place:'Oak walk'},target:OwlRecord={id:'owl-23',name:'Pip',place:'Library lawn'};
function MemoryRound(){const [database,setDatabase]=useState<Record<string,OwlRecord>>({'owl-17':existing}),[key,setKey]=useState(''),[query,setQuery]=useState(''),[message,setMessage]=useState(''),[done,setDone]=useState(false);const saved=!!database['owl-23'];return <>
 <p><b>Keep the right owl.</b> Two fictional owls share a name. Save the Pip from the Library lawn, then retrieve that exact record.</p>
 <div className="record-card"><small>NEW RECORD · FICTIONAL</small><b>Pip · Library lawn</b><code>ID: owl-23</code></div>
 <div className="record-shelf" aria-label="Stored records"><h4>Memory shelf</h4>{Object.entries(database).map(([id,r])=><div key={id}><code>{id}</code><span>{r.name} · {r.place}</span></div>)}</div>
 <fieldset disabled={saved}><legend>1. Choose a unique storage key</legend><div className="activity-options">{['Pip','owl-23'].map(value=><button key={value} aria-pressed={key===value} onClick={()=>{setKey(value);setMessage('')}}>Use key {value}</button>)}</div></fieldset>
 <button className="campus-button" disabled={saved} onClick={()=>{if(key!=='owl-23'){setMessage('Names can repeat. Pip already exists; use the new owl’s unique ID, owl-23.');return}setDatabase(d=>({...d,[key]:target}));setMessage('Stored owl-23 without replacing owl-17. Now retrieve the Library lawn record.')}}>Store record</button>
 {saved&&<><fieldset disabled={done}><legend>2. Retrieve the Library lawn owl by key</legend><div className="activity-options">{['owl-17','Pip','owl-23'].map(value=><button key={value} aria-pressed={query===value} onClick={()=>{setQuery(value);setMessage('')}}>Lookup {value}</button>)}</div></fieldset><button className="campus-button" disabled={done} onClick={()=>{const found=database[query];if(!found)setMessage('No record at that key. Use the unique ID, not a display name.');else if(found.place!==target.place)setMessage(`Found ${found.name} at ${found.place}. That is the other Pip; try the Library lawn owl’s ID.`);else{setDone(true);setMessage('Exact match: owl-23 → Pip → Library lawn. The other Pip is still safely stored.')}}}>Retrieve record</button></>}
 <div role="status" className="activity-feedback">{message}</div>{done&&<p className="content-note"><b>The engineering idea:</b> unique keys keep identity separate from display names. This activity stores and retrieves records in a local JavaScript object. It does not run a database server or represent an OwlDB production system.</p>}
 </>}
export function MemoryActivity(){return <ActivityFrame title="Campus memory lab" description="Store a fictional owl record and retrieve it by a unique key."><MemoryRound/></ActivityFrame>}
