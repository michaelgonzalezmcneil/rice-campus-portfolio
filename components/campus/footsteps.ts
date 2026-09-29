/** Quiet synthesized footfalls; no downloaded audio or background playback. */
export class Footsteps {
 private context:AudioContext|null=null;
 private volume:GainNode|null=null;
 muted=false;
 unlock(){try{if(!this.context){this.context=new AudioContext();this.volume=this.context.createGain();this.volume.gain.value=this.muted?0:.045;this.volume.connect(this.context.destination)}if(this.context.state==='suspended')void this.context.resume().catch(()=>{});}catch{/* Audio is optional. */}}
 setMuted(value:boolean){this.muted=value;if(this.context&&this.volume)this.volume.gain.setTargetAtTime(value?0:.045,this.context.currentTime,.015);}
 step(running:boolean){const c=this.context;if(!c||c.state!=='running'||this.muted||!this.volume)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type='sine';o.frequency.setValueAtTime(running?150:120,t);o.frequency.exponentialRampToValueAtTime(48,t+.065);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(1,t+.007);g.gain.exponentialRampToValueAtTime(.001,t+.085);o.connect(g);g.connect(this.volume);o.start(t);o.stop(t+.09);o.onended=()=>{o.disconnect();g.disconnect()};}
 dispose(){if(this.context)void this.context.close().catch(()=>{});this.context=null;this.volume=null;}
 get state(){return this.context?.state||'locked';}
}
