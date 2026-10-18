import test from 'node:test';
import assert from 'node:assert/strict';
import { createLife, normalizeState } from '../src/engine.js';
import { performAction } from '../src/systems.js';
import { beginMiniGame, advanceMiniGame } from '../src/game-session.js';
import { ensureCharacter, normalizePersonality, overallHealth, PERSONALITY_DOMAINS, HEALTH_COMPONENTS } from '../src/character.js';
import { calendarYearAtAge } from '../src/calendar.js';

function adult() {
  return { ...createLife({ age: 25, seed: 'character-actions', gender: 'neutral' }), cash: 1000000 };
}

function take(state, id, payload) {
  const result = performAction(state, id, payload);
  assert.equal(result.ok, true, `${id}: ${result.message}`);
  return result.state;
}

function temperament(entity, values = {}) {
  const facets = {};
  for (const domain of PERSONALITY_DOMAINS) for (const facet of domain.facets) facets[facet.id] = values[facet.id] ?? values[domain.id] ?? 50;
  entity.personality = normalizePersonality({ facets }, `${entity.id}:test`);
  return entity;
}

function complete(entity) {
  assert.ok(entity.appearance && typeof entity.appearance.hairColor === 'string');
  assert.ok(entity.body && entity.body.heightCm > 0 && entity.body.weightKg > 0);
  assert.ok(entity.attributes && entity.attributes.iq >= 40 && entity.attributes.iq <= 200);
  assert.equal(Object.keys(entity.personality.facets).length, 30);
  for (const domain of PERSONALITY_DOMAINS) {
    const expected = domain.facets.reduce((sum, facet) => sum + entity.personality.facets[facet.id], 0) / 6;
    assert.ok(Math.abs(entity.personality.domains[domain.id] - expected) < 0.11);
  }
  for (const part of HEALTH_COMPONENTS) assert.ok(Number.isFinite(entity.healthProfile[part.id]));
  assert.ok(Number.isSafeInteger(entity.birthYear) && entity.birthYear !== 0);
}

test('new friends, classmates, colleagues, partners and adopted children all have complete human profiles', () => {
  const base = adult();
  base.education.enrolled = 'university';
  base.job = { id: 'tester', title: 'Tester', salary: 40000, performance: 60, years: 1 };
  for (const id of ['relationships:friend', 'education:club', 'career:coworker', 'relationships:datingapp', 'relationships:adopt']) {
    const before = base.relationships.length;
    const state = take(base, id);
    assert.equal(state.relationships.length, before + 1, id);
    const npc = state.relationships.at(-1);
    complete(npc);
    assert.equal(calendarYearAtAge(npc.birthYear, npc.age), state.year);
    assert.equal(npc.stats, undefined, 'NPC profiles do not need player compatibility stats');
  }
});

test('newborn profiles use the named child and both parents for deterministic soft inheritance', () => {
  const base = adult();
  const partner = { id: 'co-parent', name: 'Alex Rowan', role: 'spouse', age: 25, bond: 90, alive: true, gender: 'female' };
  ensureCharacter(partner, { seed: 'parent-detail', appearance: { hairColor: 'red', eyeColor: 'green' }, body: { adultHeightCm: 185 } });
  base.relationships.push(partner);
  let born;
  for (let rng = 1; rng <= 30; rng++) {
    const result = performAction({ ...base, rng }, 'relationships:baby');
    if (result.state.relationships.some(p => p.role === 'child')) { born = result.state; break; }
  }
  assert.ok(born);
  const child = born.relationships.find(p => p.role === 'child');
  complete(child);
  assert.equal(child.birthYear, born.year);
  assert.ok(child.name.endsWith(base.lastName));
  const expected = { id: child.id, name: child.name, role: 'child', age: 0, bond: 85, alive: true, gender: child.gender, birthYear: child.birthYear };
  ensureCharacter(expected, { seed: `${base.seed}:${child.id}`, parents: [base, partner] });
  assert.deepEqual(child.appearance, expected.appearance);
  assert.deepEqual(child.personality, expected.personality);
  assert.deepEqual(child.body, expected.body);
  assert.notDeepEqual(child.personality, base.personality, 'inheritance must not clone a parent');
});

test('learning ability and conscientious temperament affect study progress without changing IQ', () => {
  const low = adult();
  low.education.enrolled = 'university';
  low.education.grades = 30;
  low.attributes.iq = 70;
  temperament(low, { openness: 10, conscientiousness: 10 });
  const high = structuredClone(low);
  high.attributes.iq = 145;
  temperament(high, { openness: 90, conscientiousness: 90 });
  const slower = take(low, 'education:study');
  const faster = take(high, 'education:study');
  assert.ok(faster.education.grades > slower.education.grades);
  assert.equal(slower.attributes.iq, 70);
  assert.equal(faster.attributes.iq, 145);
  assert.ok(slower.stats.smarts > low.stats.smarts, 'knowledge can improve at either IQ');
  assert.ok(faster.stats.smarts > high.stats.smarts);
});

test('job effort responds to work temperament, and knowledge gates remain independent of IQ', () => {
  const low = adult();
  low.job = { id: 'tester', title: 'Tester', salary: 40000, performance: 30, years: 1 };
  temperament(low, { conscientiousness: 5 });
  const high = structuredClone(low);
  temperament(high, { conscientiousness: 95 });
  assert.ok(take(high, 'career:hardwork').job.performance > take(low, 'career:hardwork').job.performance);
  const unqualified = adult();
  unqualified.attributes.iq = 190;
  unqualified.stats.smarts = 0;
  unqualified.education.level = 'graduate';
  const result = performAction(unqualified, 'career:apply:doctor');
  assert.equal(result.ok, false, 'an IQ estimate cannot replace acquired knowledge');
  assert.match(result.message, /knowledge/i);
});

test('compatibility softly changes time together and anger changes the cost of an argument', () => {
  const calm = adult();
  temperament(calm, { anger: 0, agreeableness: 80 });
  const friend = { id: 'friend-profile', name: 'Taylor Reed', role: 'friend', age: 25, bond: 50, alive: true, gender: 'neutral' };
  ensureCharacter(friend, { seed: 'friend' });
  temperament(friend, { anger: 0, agreeableness: 80 });
  calm.relationships.push(friend);
  const angry = structuredClone(calm);
  temperament(angry.relationships.at(-1), { anger: 100, agreeableness: 10 });
  const calmResult = performAction(calm, 'relationships:friend-profile:argue');
  const angryResult = performAction(angry, 'relationships:friend-profile:argue');
  assert.ok(calmResult.ok && angryResult.ok);
  assert.ok(angryResult.state.relationships.at(-1).bond < calmResult.state.relationships.at(-1).bond);
  assert.match(angryResult.message, /temper|anger|heated|escalat/i);
  const same = structuredClone(calm);
  temperament(same, Object.fromEntries(PERSONALITY_DOMAINS.map(domain => [domain.id, 20])));
  temperament(same.relationships.at(-1), Object.fromEntries(PERSONALITY_DOMAINS.map(domain => [domain.id, 20])));
  const different = structuredClone(same);
  temperament(different.relationships.at(-1), Object.fromEntries(PERSONALITY_DOMAINS.map(domain => [domain.id, 90])));
  assert.ok(take(same, 'relationships:friend-profile:time').relationships.at(-1).bond > take(different, 'relationships:friend-profile:time').relationships.at(-1).bond);
});

test('gym and therapy actions update detailed attributes and health exactly once without altering IQ', () => {
  let state = adult();
  state.stats.health = 60;
  state = normalizeState(state);
  const before = structuredClone(state);
  const exercised = take(state, 'activities:gym');
  assert.ok(exercised.attributes.strength > before.attributes.strength);
  assert.ok(exercised.healthProfile.musculoskeletal > before.healthProfile.musculoskeletal);
  assert.ok(exercised.stats.health >= before.stats.health);
  assert.equal(exercised.stats.health, overallHealth(exercised));
  assert.equal(exercised.attributes.iq, before.attributes.iq);
  assert.equal(exercised.cash, before.cash - 80);
  assert.equal(exercised.actionCounts['activities:gym'], 1);
  assert.deepEqual(state, before, 'the input save must remain unchanged');
  const treated = take(state, 'activities:therapy');
  assert.ok(treated.healthProfile.mental > before.healthProfile.mental);
  assert.equal(treated.stats.health, overallHealth(treated));
});

test('physical fitness contributes to athletic success with the same talent and random roll', () => {
  const low = adult();
  low.specialCareer = { id: 'athlete', title: 'Professional Athlete', level: 1, performance: 35, earnings: 30000 };
  low.skills.athletics = 40;
  for (const key of ['strength', 'stamina', 'agility', 'coordination']) low.attributes[key] = 10;
  const high = structuredClone(low);
  for (const key of ['strength', 'stamina', 'agility', 'coordination']) high.attributes[key] = 90;
  let difference = false;
  for (let rng = 1; rng < 3000; rng += 13) {
    const a = take({ ...low, rng }, 'special:work:athlete');
    const b = take({ ...high, rng }, 'special:work:athlete');
    if (b.specialCareer.level > a.specialCareer.level) { difference = true; break; }
  }
  assert.ok(difference, 'physical ability should affect a borderline competition');
});

test('rich NPC overrides survive action transactions and save import', () => {
  let state = take(adult(), 'relationships:friend');
  const npc = state.relationships.at(-1);
  npc.appearance.description = 'Long auburn hair and a silver-streaked fringe.';
  npc.attributes.iq = 132;
  npc.attributes.empathy = 83;
  temperament(npc, { imagination: 87, dutifulness: 23, anxiety: 44 });
  const before = structuredClone(npc);
  state = take(state, 'activities:walk');
  const imported = normalizeState(JSON.parse(JSON.stringify(state)));
  const restored = imported.relationships.find(p => p.id === npc.id);
  for (const key of ['appearance', 'attributes', 'personality', 'body', 'healthProfile', 'birthYear']) assert.deepEqual(restored[key], before[key], key);
});

test('demographics and appearance do not alter learning outcomes when abilities and temperament match', () => {
  const one = adult();
  one.education.enrolled = 'university';
  one.education.grades = 40;
  const other = structuredClone(one);
  other.country = 'jp';
  other.gender = 'female';
  other.appearance.skinTone = 'deep';
  other.appearance.hairColor = 'white';
  const a = take(one, 'education:study');
  const b = take(other, 'education:study');
  assert.equal(a.education.grades, b.education.grades);
  assert.equal(a.attributes.iq, b.attributes.iq);
  assert.deepEqual(a.personality, b.personality);
});

test('escape injury reconciles component health and a fatal injury cannot resurrect through aggregation', () => {
  const base = adult();
  base.prison.years = 4;
  base.stats.health = 10;
  const started = beginMiniGame(base, 'escape');
  assert.ok(started.ok);
  const result = advanceMiniGame(started.state, 'forfeit');
  assert.ok(result.ok);
  assert.equal(result.state.prison.years, 7);
  assert.equal(result.state.stats.health, 0);
  assert.equal(overallHealth(result.state), 0);
  assert.equal(result.state.alive, false);
  const healthy = { ...adult(), prison: { years: 4, record: 1, heat: 0 } };
  const next = advanceMiniGame(beginMiniGame(healthy, 'escape').state, 'forfeit').state;
  assert.equal(next.stats.health, overallHealth(next));
  assert.ok(next.stats.health < healthy.stats.health);
});
