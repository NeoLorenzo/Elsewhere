import test from 'node:test';
import assert from 'node:assert/strict';
import { createLife, normalizeState, ageUp, resolveEvent, customizeCharacter, continueLegacy } from '../src/engine.js';
import { ensureCharacter, overallHealth, bodyDefaults } from '../src/character.js';
import { calendarYearAtAge } from '../src/calendar.js';

const nextYear=state=>{if(state.pendingEvent)state=resolveEvent(state,0);return ageUp(state);};
test('new lives accept dates since 1900, custom current traits, health and parent descriptions',()=>{
  const state=createLife({seed:11,birthYear:1900,age:18,appearance:{hairColor:'red',eyeColor:'green'},attributes:{iq:145,strength:65},personality:{domains:{openness:80}},parents:{mother:{appearance:{description:'Long red hair and green eyes.'}},father:{appearance:{description:'Short black hair and brown eyes.'}}},healthProfile:{cardiovascular:70},stats:{smarts:35,happiness:88}});
  assert.equal(state.birthYear,1900);assert.equal(state.year,1918);assert.equal(state.attributes.iq,145);assert.equal(state.stats.smarts,35);
  assert.equal(state.personality.domains.openness,80);assert.equal(state.appearance.hairColor,'red');
  assert.equal(state.relationships[0].appearance.description,'Long red hair and green eyes.');assert.equal(state.relationships[1].appearance.description,'Short black hair and brown eyes.');
  for(const entity of [state,...state.relationships]){assert.equal(Object.keys(entity.personality.facets).length,30);assert.ok(entity.body.heightCm>0);assert.ok(entity.attributes.iq>0);}
});

test('old BCE saves migrate exact calendar offsets, including timelines that cross year zero',()=>{
  const raw=createLife({seed:20,age:1});raw.birthYear=-1;raw.year=1;
  raw.journal=[{id:'birth',age:0,year:-1,category:'life',title:'Birth',text:'Remembered.'},{id:'birthday',age:1,year:1,category:'life',title:'One',text:'Remembered.'}];
  raw.history=[{type:'year',age:1,year:1,netWorth:400}];
  raw.relationships[0].birthYear=-31;raw.relationships[1].birthYear=-29;
  raw.ancestors=[{name:'Ancestor',age:70,year:-10,birthYear:-80,netWorth:2000}];
  const snapshot=structuredClone(raw),restored=normalizeState(raw);
  assert.equal(restored.birthYear,1900);assert.equal(restored.year,1901);assert.equal(restored.originalBirthYear,-1);
  assert.equal(restored.journal.find(j=>j.id==='birth').year,1900);assert.equal(restored.journal.find(j=>j.id==='birthday').year,1901);
  assert.equal(restored.history[0].year,1901);assert.equal(restored.relationships[0].birthYear,1870);assert.equal(restored.relationships[1].birthYear,1872);
  assert.equal(restored.ancestors[0].year,1891);assert.equal(restored.ancestors[0].birthYear,1821);
  assert.equal(restored.age,raw.age);assert.equal(restored.rng,raw.rng);assert.deepEqual(raw,snapshot);
  assert.deepEqual(restored.personality,raw.personality);assert.deepEqual(restored.body,raw.body);
  const again=normalizeState(restored);
  assert.equal(again.birthYear,1900);assert.equal(again.year,1901);assert.equal(again.originalBirthYear,-1);
  assert.equal(again.journal.filter(j=>j.title==='Calendar updated').length,1);assert.equal(again.journal.length,restored.journal.length);
  assert.deepEqual(again.relationships.map(p=>p.birthYear),restored.relationships.map(p=>p.birthYear));
});

test('pre-1900 new lives are rejected but remote old saves migrate without losing progress',()=>{
  for(const birthYear of [-100000000000,-1,1,1500,1899])assert.throws(()=>createLife({birthYear}),/1900/);
  assert.throws(()=>createLife({birthYear:0}));assert.throws(()=>createLife({birthYear:1.5}));
  const old=createLife({seed:3,age:18});old.birthYear=-100000000000;old.year=-99999999982;
  old.cash=123456;old.debt=4000;old.job={id:'test',title:'Tester',salary:30000,performance:70,years:4};old.actionCounts={'career:hardwork':2};old.prison.record=2;old.skills.coding=77;
  const restored=normalizeState(old);assert.equal(restored.birthYear,1900);assert.equal(restored.year,1918);assert.equal(restored.originalBirthYear,old.birthYear);
  for(const key of ['cash','debt','age','rng','job','actionCounts','skills','prison','education','minigame'])assert.deepEqual(restored[key],old[key],`${key} must survive calendar migration.`);
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
  const original=createLife({seed:17,age:18,birthYear:1950}),snapshot=structuredClone(original);
  const changed=customizeCharacter(original,{attributes:{iq:160,strength:80},appearance:{hairStyle:'bald'},healthProfile:{mental:20,sleep:30},parents:{mother:{appearance:{description:'Short blonde hair and blue eyes.'}}},cash:999999999,age:99,birthYear:-200});
  assert.deepEqual(original,snapshot);assert.equal(changed.cash,original.cash);assert.equal(changed.age,18);assert.equal(changed.birthYear,1950);
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

test('continuing a legacy carries the selected current profile and birth year',()=>{
  const state=createLife({seed:4,age:70,birthYear:1900});state.alive=false;state.causeOfDeath='natural causes';
  const child={id:'heir-person',name:'River Reed',role:'child',age:30,gender:'neutral',alive:true,bond:90,birthYear:1940};ensureCharacter(child,{attributes:{iq:149,strength:70},appearance:{hairColor:'auburn'},personality:{domains:{openness:81}}});state.relationships.push(child);
  const next=continueLegacy(state,child.id);
  assert.equal(next.birthYear,1940);assert.equal(next.year,1970);assert.equal(next.attributes.iq,149);assert.deepEqual(next.personality,child.personality);assert.deepEqual(next.body,child.body);assert.equal(next.appearance.hairColor,'auburn');assert.equal(next.generation,2);
});

test('any whole starting age from 0 through 120 uses traits at that current age',()=>{
  for(const age of [0,1,7,13,20,37,64,99,120]){
    const state=createLife({seed:5,age,birthYear:1900,attributes:{iq:143,strength:61},stats:{smarts:42},body:{heightCm:age>=18?190:undefined,weightKg:age>=18?90:undefined}});
    assert.equal(state.age,age);assert.equal(state.year,1900+age);assert.equal(state.attributes.iq,143);assert.equal(state.attributes.strength,61);assert.equal(state.stats.smarts,42);
    if(age>=18){assert.equal(state.body.heightCm,190);assert.equal(state.body.weightKg,90);}
  }
  assert.equal(createLife({age:'20'}).age,20);
  for(const age of [-1,121,1.5,NaN,Infinity,null,true,{},[], '', 'twenty','3.5'])assert.throws(()=>createLife({age}),/starting age/);
});

test('explicit current body measurements determine smooth growth and survive imports',()=>{
  const adult=createLife({seed:8,age:20,body:{heightCm:190,weightKg:90,bodyFatPercent:18}});
  assert.equal(adult.body.heightCm,190);assert.equal(adult.body.adultHeightCm,190);assert.equal(adult.body.weightKg,90);assert.equal(adult.body.adultWeightKg,90);
  const defaults=bodyDefaults(10,'neutral',100);
  const heightFactor=defaults.heightCm/defaults.adultHeightCm,weightFactor=defaults.weightKg/defaults.adultWeightKg;
  const child=createLife({seed:8,age:10,body:{heightCm:150,weightKg:40}});
  assert.equal(child.body.heightCm,150);assert.equal(child.body.weightKg,40);
  assert.ok(Math.abs(child.body.adultHeightCm-150/heightFactor)<.03);assert.ok(Math.abs(child.body.adultWeightKg-40/weightFactor)<.03);
  const changed=customizeCharacter(child,{body:{heightCm:155,weightKg:44}});
  assert.equal(changed.body.heightCm,155);assert.equal(changed.body.weightKg,44);assert.ok(changed.body.adultHeightCm>child.body.adultHeightCm);
  assert.deepEqual(normalizeState(changed).body,changed.body);
  const missingPotentials=structuredClone(child);delete missingPotentials.body.adultHeightCm;delete missingPotentials.body.adultWeightKg;
  const inferred=normalizeState(missingPotentials);assert.equal(inferred.body.adultHeightCm,child.body.adultHeightCm);assert.equal(inferred.body.adultWeightKg,child.body.adultWeightKg);
  const grown=nextYear(changed);assert.ok(grown.body.heightCm>155);assert.ok(grown.body.weightKg>44);
  const imported=structuredClone(adult);imported.body.adultHeightCm=180;imported.body.adultWeightKg=75;
  const restored=normalizeState(imported);assert.equal(restored.body.heightCm,190);assert.equal(restored.body.adultHeightCm,180);assert.equal(restored.body.weightKg,90);assert.equal(restored.body.adultWeightKg,75);
});

test('newborn impossible measurements stay bounded and migrated legacy children preserve shifted dates',()=>{
  const baby=createLife({seed:7,body:{heightCm:190,weightKg:90}});
  assert.ok(baby.body.heightCm<=65);assert.ok(baby.body.weightKg<=7);assert.ok(baby.body.adultHeightCm<=240);assert.ok(baby.body.adultWeightKg<=350);
  const old=createLife({seed:9,age:70});old.birthYear=1800;old.year=1870;old.alive=false;
  const child={id:'old-heir',name:'Casey Reed',role:'child',age:30,birthYear:1840,alive:true,gender:'neutral',bond:90};ensureCharacter(child);old.relationships.push(child);
  const inherited=continueLegacy(old,child.id);assert.equal(inherited.birthYear,1940);assert.equal(inherited.year,1970);assert.equal(calendarYearAtAge(inherited.birthYear,inherited.age),inherited.year);
});

test('historical country and city records follow the story year with stable location ids',()=>{
  const colonial=createLife({seed:3,birthYear:1900,age:30,country:'in',city:'Mumbai'});
  assert.equal(colonial.country,'in');assert.equal(colonial.city,'Bombay');
  const modern=createLife({seed:3,birthYear:1930,age:70,country:'in',city:'Bombay'});
  assert.equal(modern.country,'in');assert.equal(modern.city,'Mumbai');
  const empire=createLife({seed:3,birthYear:1900,country:'ru'});
  assert.equal(empire.country,'ru');assert.ok(empire.journal[0].text.includes('Russian Empire'));
  let renaming=createLife({seed:3,birthYear:1900,age:95,country:'in',city:'Bombay'});
  renaming=nextYear(renaming);assert.equal(renaming.year,1996);assert.equal(renaming.country,'in');assert.equal(renaming.city,'Mumbai');
  const imported=normalizeState({...modern,city:'An old custom town'});assert.equal(imported.city,'An old custom town');
});
