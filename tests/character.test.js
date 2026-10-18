import test from 'node:test';
import assert from 'node:assert/strict';
import { PERSONALITY_DOMAINS, HEALTH_COMPONENTS, ensureCharacter, normalizePersonality, overallHealth, reconcileCharacter, ageCharacter, applyCharacterAction, personalityCompatibility, personalityModifier, physicalCapacity, describeAppearance } from '../src/character.js';

const human=(id='one',age=18)=>ensureCharacter({id,age,gender:'neutral',seed:7,stats:{health:80,smarts:45}});
const allFacets=PERSONALITY_DOMAINS.flatMap(d=>d.facets);

test('each human has five derived personality domains and thirty distinct finite facets',()=>{
  const entity=human();
  assert.equal(allFacets.length,30);assert.equal(new Set(allFacets.map(f=>f.id)).size,30);
  for(const domain of PERSONALITY_DOMAINS){assert.equal(domain.facets.length,6);const mean=domain.facets.reduce((sum,f)=>sum+entity.personality.facets[f.id],0)/6;assert.ok(Math.abs(mean-entity.personality.domains[domain.id])<1e-9);}
  assert.ok(new Set(Object.values(entity.personality.facets)).size>20);
  for(const value of Object.values(entity.personality.facets))assert.ok(value>=0&&value<=100);
});

test('profile generation is deterministic, idempotent and does not consume game RNG',()=>{
  const entity={id:'deterministic',seed:9,rng:12345,age:18,gender:'neutral',stats:{health:78}};
  ensureCharacter(entity);const before=structuredClone(entity);ensureCharacter(entity);
  assert.deepEqual(entity,before);assert.equal(entity.rng,12345);
  assert.deepEqual(human('same'),human('same'));assert.notDeepEqual(human('same').personality,human('different').personality);
});

test('generated aptitude has broad natural variation rather than uniform or identical values',()=>{
  const values=Array.from({length:500},(_,i)=>human(`sample-${i}`).attributes.iq);
  const mean=values.reduce((n,v)=>n+v,0)/values.length;
  const sd=Math.sqrt(values.reduce((n,v)=>n+(v-mean)**2,0)/values.length);
  assert.ok(mean>96&&mean<104);assert.ok(sd>12&&sd<18);
});

test('personality domain edits fill missing facets, while explicit facets remain authoritative',()=>{
  const p=normalizePersonality({domains:{openness:90},facets:{imagination:20,anxiety:500,anger:NaN}},'edited');
  assert.equal(p.facets.imagination,20);assert.equal(p.facets.artisticInterests,90);
  assert.equal(p.domains.openness,(20+90*5)/6);assert.equal(p.facets.anxiety,100);
  assert.ok(Number.isFinite(p.facets.anger));
});

test('all health components contribute and legacy scalar effects reconcile only once',()=>{
  const entity=human();assert.equal(overallHealth(entity),80);
  for(const c of HEALTH_COMPONENTS)assert.ok(Number.isFinite(entity.healthProfile[c.id]));
  const original=structuredClone(entity.stats);entity.stats.health-=12;
  reconcileCharacter(entity,original);assert.equal(overallHealth(entity),68);
  const after=structuredClone(entity);ensureCharacter(entity);assert.deepEqual(entity,after);
  entity.stats.health=0;reconcileCharacter(entity,after.stats);assert.equal(overallHealth(entity),0);
});

test('custom childhood size converges to chosen adult targets without rewriting IQ or temperament',()=>{
  const child=human('growth',0);ensureCharacter(child,{body:{heightCm:50,weightKg:3.5,adultHeightCm:200,adultWeightKg:100}});
  const personality=structuredClone(child.personality),iq=child.attributes.iq;
  for(let age=1;age<=18;age++){child.age=age;ageCharacter(child,age-1);assert.ok(child.body.heightCm>0&&child.body.weightKg>0);}
  assert.equal(child.body.heightCm,200);assert.equal(child.body.weightKg,100);
  assert.equal(child.attributes.iq,iq);assert.deepEqual(child.personality,personality);
});

test('brief parent descriptions inform explicit appearance fields and are bounded safely',()=>{
  const parent=human('parent',42);
  ensureCharacter(parent,{appearance:{description:'Tall, curly red hair, green eyes, and a warm smile.'}});
  assert.equal(parent.appearance.hairStyle,'curly');assert.equal(parent.appearance.hairColor,'red');assert.equal(parent.appearance.eyeColor,'green');
  assert.equal(parent.body.heightCm,185);
  assert.equal(describeAppearance(parent),'Tall, curly red hair, green eyes, and a warm smile.');
  ensureCharacter(parent,{appearance:{hairColor:'url(evil)',description:'a'.repeat(500)}});
  assert.equal(parent.appearance.description.length,300);assert.notEqual(parent.appearance.hairColor,'url(evil)');
});

test('appearance and demographic labels cannot change intelligence or personality',()=>{
  const first=human('same-person',25),second=human('same-person',25);
  second.name='A different name';second.country='another-place';second.gender='female';
  ensureCharacter(second,{appearance:{skinTone:'deep',hairStyle:'bald',eyeColor:'blue'}});
  assert.equal(first.attributes.iq,second.attributes.iq);assert.deepEqual(first.personality,second.personality);
});

test('exercise changes strength, endurance, body composition and component health without adding IQ',()=>{
  const entity=human('training'),before=structuredClone(entity);
  applyCharacterAction(entity,'activities:gym');
  assert.ok(entity.attributes.strength>before.attributes.strength);assert.ok(entity.attributes.stamina>before.attributes.stamina);
  assert.ok(entity.body.bodyFatPercent<before.body.bodyFatPercent);assert.ok(entity.healthProfile.cardiovascular>before.healthProfile.cardiovascular);
  assert.equal(entity.attributes.iq,before.attributes.iq);assert.equal(entity.stats.smarts,before.stats.smarts);
  assert.equal(entity.stats.health,overallHealth(entity));
});

test('size, weight, composition and component health affect physical capacity independently of abilities',()=>{
  const entity=human('capacity');for(const key of ['strength','stamina','agility','coordination'])entity.attributes[key]=60;
  entity.body={heightCm:175,weightKg:75,bodyFatPercent:20,adultHeightCm:175,adultWeightKg:75};
  const baseline=physicalCapacity(entity);
  const changed=structuredClone(entity);changed.body.bodyFatPercent=50;assert.ok(physicalCapacity(changed)<baseline);
  changed.body.weightKg=100;assert.notEqual(physicalCapacity(changed),baseline);
  changed.body.heightCm=210;assert.notEqual(physicalCapacity(changed),baseline);
  for(const c of HEALTH_COMPONENTS)changed.healthProfile[c.id]=20;assert.ok(physicalCapacity(changed)<baseline);
});

test('traits softly influence several contexts and do not impose inevitable outcomes',()=>{
  const first=human('one'),second=human('two');
  const compatibility=personalityCompatibility(first,second);assert.ok(compatibility>=0&&compatibility<=100);
  for(const context of ['learning','work','social','risk','recovery']){const factor=personalityModifier(first,context);assert.ok(factor>=.85&&factor<=1.15);}
  const low=structuredClone(first),high=structuredClone(first);low.personality=normalizePersonality({domains:{conscientiousness:0}},'low');high.personality=normalizePersonality({domains:{conscientiousness:100}},'high');
  assert.ok(personalityModifier(high,'work')>personalityModifier(low,'work'));
});

test('pets keep their species wellbeing model instead of receiving a human psychological assessment',()=>{
  const pet={id:'pet',role:'pet',species:'dog',age:2,health:85};ensureCharacter(pet);
  assert.equal(pet.personality,undefined);assert.equal(overallHealth(pet),85);
});
