import test from 'node:test';
import assert from 'node:assert/strict';
import { createLife, normalizeState, ageUp, resolveEvent, customizeCharacter, continueLegacy } from '../src/engine.js';
import { ensureCharacter, overallHealth } from '../src/character.js';

const nextYear=state=>{if(state.pendingEvent)state=resolveEvent(state,0);return ageUp(state);};
test('new lives accept historical dates, custom appearance, attributes, personality, health and parent descriptions',()=>{
  const state=createLife({seed:11,birthYear:-44,age:18,appearance:{hairColor:'red',eyeColor:'green'},attributes:{iq:145,strength:65},personality:{domains:{openness:80}},parents:{mother:{appearance:{description:'Long red hair and green eyes.'}},father:{appearance:{description:'Short black hair and brown eyes.'}}},healthProfile:{cardiovascular:70},stats:{smarts:35,happiness:88}});
  assert.equal(state.birthYear,-44);assert.equal(state.year,-26);assert.equal(state.attributes.iq,145);assert.equal(state.stats.smarts,35);
  assert.equal(state.personality.domains.openness,80);assert.equal(state.appearance.hairColor,'red');
  assert.equal(state.relationships[0].appearance.description,'Long red hair and green eyes.');assert.equal(state.relationships[1].appearance.description,'Short black hair and brown eyes.');
  for(const entity of [state,...state.relationships]){assert.equal(Object.keys(entity.personality.facets).length,30);assert.ok(entity.body.heightCm>0);assert.ok(entity.attributes.iq>0);}
});

test('birth year 1 BCE advances directly to 1 CE and retains BCE journal entries after save import',()=>{
  let state=createLife({seed:20,birthYear:-1});state=nextYear(state);
  assert.equal(state.year,1);assert.equal(state.age,1);assert.equal(state.birthYear,-1);
  const restored=normalizeState(state);assert.equal(restored.year,1);assert.ok(restored.journal.some(j=>j.year===-1));
  assert.deepEqual(restored.personality,state.personality);assert.deepEqual(restored.body,state.body);
});

test('remote historical dates do not pass through JavaScript Date or clamp to the modern era',()=>{
  const s=createLife({seed:3,birthYear:-100000000000,age:18});assert.equal(s.year,-99999999982);assert.equal(normalizeState(s).year,s.year);
  assert.throws(()=>createLife({birthYear:0}));assert.throws(()=>createLife({birthYear:1.5}));
});

test('old saves deterministically gain complete profiles without changing their game RNG, money or age',()=>{
  const raw=createLife({seed:7,age:30});const expected={age:raw.age,year:raw.year,rng:raw.rng,cash:raw.cash};
  delete raw.birthYear;for(const entity of [raw,...raw.relationships])for(const key of ['appearance','body','attributes','healthProfile','personality'])delete entity[key];
  const upgraded=normalizeState(raw),again=normalizeState(raw);
  for(const [key,value] of Object.entries(expected))assert.equal(upgraded[key],value);
  assert.deepEqual(upgraded.personality,again.personality);
  for(const person of upgraded.relationships){assert.equal(Object.keys(person.personality.facets).length,30);assert.ok(person.birthYear<upgraded.birthYear);}
});

test('character edits are immutable, whitelisted, persistent, and recalculate health components',()=>{
  const original=createLife({seed:17,age:18,birthYear:1500}),snapshot=structuredClone(original);
  const changed=customizeCharacter(original,{attributes:{iq:160,strength:80},appearance:{hairStyle:'bald'},healthProfile:{mental:20,sleep:30},parents:{mother:{appearance:{description:'Short blonde hair and blue eyes.'}}},cash:999999999,age:99,birthYear:-200});
  assert.deepEqual(original,snapshot);assert.equal(changed.cash,original.cash);assert.equal(changed.age,18);assert.equal(changed.birthYear,1500);
  assert.equal(changed.attributes.iq,160);assert.equal(changed.healthProfile.mental,20);assert.equal(changed.healthProfile.sleep,30);assert.equal(changed.stats.health,overallHealth(changed));
  const restored=normalizeState(changed);assert.deepEqual(restored.attributes,changed.attributes);assert.equal(restored.relationships[0].appearance.description,'Short blonde hair and blue eyes.');
});

test('human NPC bodies grow on birthdays without personality rerolls',()=>{
  const state=createLife({seed:2,age:18});const child={id:'young-child',name:'Robin Reed',role:'child',age:4,bond:80,alive:true,gender:'neutral',birthYear:2022};ensureCharacter(child);state.relationships.push(child);
  const aged=nextYear(state),after=aged.relationships.find(p=>p.id===child.id);
  assert.equal(after.age,5);assert.ok(after.body.heightCm>child.body.heightCm);assert.deepEqual(after.personality,child.personality);assert.equal(after.attributes.iq,child.attributes.iq);
});

test('newborn knowledge is not confused with IQ and NPC health affects their survival',()=>{
  const baby=createLife({seed:10});assert.equal(baby.stats.smarts,0);assert.ok(baby.attributes.iq>=40);
  const state=createLife({seed:12,age:18});for(const key of Object.keys(state.relationships[0].healthProfile))state.relationships[0].healthProfile[key]=0;
  const aged=nextYear(state);assert.equal(aged.relationships[0].alive,false);
});

test('continuing a legacy carries the selected human profile and historical birth year',()=>{
  const state=createLife({seed:4,age:70,birthYear:-200});state.alive=false;state.causeOfDeath='natural causes';
  const child={id:'heir-person',name:'River Reed',role:'child',age:30,gender:'neutral',alive:true,bond:90,birthYear:-160};ensureCharacter(child,{attributes:{iq:149,strength:70},appearance:{hairColor:'auburn'},personality:{domains:{openness:81}}});state.relationships.push(child);
  const next=continueLegacy(state,child.id);
  assert.equal(next.birthYear,-160);assert.equal(next.year,-130);assert.equal(next.attributes.iq,149);assert.deepEqual(next.personality,child.personality);assert.deepEqual(next.body,child.body);assert.equal(next.appearance.hairColor,'auburn');assert.equal(next.generation,2);
});
