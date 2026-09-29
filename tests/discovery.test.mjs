import test from 'node:test';
import assert from 'node:assert/strict';
import {parseProgress,nearbySecret,secrets,postcardSvg} from '../components/campus/discovery.ts';
import {blocked} from '../components/campus/world.ts';
test('progress accepts only known game values and handles corrupted storage',()=>{assert.deepEqual(parseProgress('{').visited,[]);const p=parseProgress(JSON.stringify({visited:['welcome','fake','welcome'],secrets:['night','fake'],owls:[0,0,8],night:true,email:'private'}));assert.deepEqual(p.visited,['welcome']);assert.deepEqual(p.owls,[0]);assert.equal(p.night,true);assert.equal('email' in p,false);assert.equal(parseProgress('{"night":true}').night,true)});
test('secret interaction points are walkable and bounded',()=>{for(const s of secrets){assert.equal(blocked(s.x,s.z),false,s.id);assert.equal(nearbySecret(s)?.id,s.id)}assert.equal(nearbySecret({x:0,z:30}),undefined)});
test('postcard escapes labels and has a standalone SVG',()=>{const svg=postcardSvg(['A & B < C'],2);assert.match(svg,/A &amp; B &lt; C/);assert.match(svg,/xmlns=/);assert.match(svg,/2 \/ 3/)});
