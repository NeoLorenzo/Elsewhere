import test from 'node:test';
import assert from 'node:assert/strict';
import { createLife, ageUp, resolveEvent, netWorth } from '../src/engine.js';
import { getActions, performAction } from '../src/systems.js';
import { ASSETS, JOBS, MAJORS, SPECIAL_CAREERS } from '../src/data.js';

function adult(overrides = {}) {
  return { ...createLife({ age: 25, seed: 742 }), cash: 1000000, ...overrides };
}

function take(state, id, payload) {
  const result = performAction(state, id, payload);
  assert.equal(result.ok, true, result.message);
  return result.state;
}

function nextYear(state) {
  let next = ageUp(state);
  if (next.pendingEvent) next = resolveEvent(next, 0);
  return next;
}

test('action discovery is read-only, serializable, unique, and covers all eight categories', () => {
  const state = adult();
  const before = structuredClone(state);
  const ids = new Set();
  for (const category of ['education', 'career', 'relationships', 'activities', 'assets', 'finance', 'crime', 'special']) {
    const actions = getActions(state, category);
    assert.ok(actions.length > 0, category);
    for (const action of actions) {
      assert.ok(!ids.has(action.id), action.id);
      ids.add(action.id);
      assert.equal(typeof action.title, 'string');
      assert.equal(typeof action.description, 'string');
      assert.ok(!('execute' in action));
      assert.ok(!('gate' in action));
      assert.deepEqual(JSON.parse(JSON.stringify(action)), action);
    }
  }
  assert.ok(ids.size > 200);
  assert.deepEqual(state, before);
  assert.deepEqual(getActions(state, 'unknown'), []);
});

test('actions revalidate age, balances, dead lives, pending events and invented ids', () => {
  const child = createLife({ age: 6, seed: 1 });
  for (const id of ['finance:loan', 'crime:bank', 'special:business', 'assets:buy:mansion']) {
    const result = performAction(child, id);
    assert.equal(result.ok, false, id);
    assert.deepEqual(result.state, child);
  }
  const broke = adult({ cash: 0 });
  assert.equal(performAction(broke, 'activities:gym').ok, false);
  assert.equal(performAction(adult({ alive: false }), 'activities:walk').ok, false);
  assert.equal(performAction(adult({ pendingEvent: { id: 'decision' } }), 'activities:walk').ok, false);
  assert.equal(performAction(adult(), 'finance:buy:invented').ok, false);
  assert.equal(performAction(adult(), '__proto__').ok, false);
});

test('paid actions clone state, charge once, improve skills, and enforce a yearly cap', () => {
  let state = adult();
  const original = structuredClone(state);
  state = take(state, 'activities:gym');
  assert.equal(state.cash, original.cash - 80);
  assert.ok(state.skills.fitness > original.skills.fitness && state.skills.fitness <= original.skills.fitness + 8, 'Training improves fitness with bounded individual variation.');
  assert.equal(original.actionCounts['activities:gym'], undefined);
  state = take(state, 'activities:gym');
  state = take(state, 'activities:gym');
  const capped = performAction(state, 'activities:gym');
  assert.equal(capped.ok, false);
  assert.deepEqual(capped.state, state);
  assert.match(getActions(state, 'activities').find(a => a.id === 'activities:gym').disabled, /three|3/);
  state = nextYear(state);
  assert.equal(performAction(state, 'activities:gym').ok, true);
});

test('investment orders reject malicious amounts atomically and preserve net worth at purchase', () => {
  const state = adult();
  for (const value of [-1, 0, NaN, Infinity, 'oops', 1e20, 1000001]) {
    const result = performAction(state, 'finance:buy:index', { amount: value });
    assert.equal(result.ok, false, `${value}`);
    assert.deepEqual(result.state, state);
  }
  let invested = take(state, 'finance:buy:index', { amount: 10000 });
  assert.equal(invested.cash, state.cash - 10000);
  assert.equal(invested.investments[0].value, 10000);
  assert.equal(netWorth(invested), netWorth(state));
  invested = take(invested, `finance:sell:${encodeURIComponent(invested.investments[0].id)}`);
  assert.equal(invested.investments.length, 0);
  assert.equal(invested.cash, state.cash - 100);
});

test('loans create debt, obey borrowing limits, and repayments cannot exceed the balance', () => {
  let state = adult({ cash: 0 });
  const initialWorth = netWorth(state);
  state = take(state, 'finance:loan', { amount: 5000 });
  assert.equal(state.debt, 5000);
  assert.equal(state.cash, 5000);
  assert.equal(netWorth(state), initialWorth);
  state = take(state, 'finance:repay', { amount: 3000 });
  assert.equal(state.debt, 2000);
  assert.equal(state.cash, 2000);
  assert.equal(performAction(state, 'finance:repay', { amount: 2001 }).ok, false);
  assert.equal(performAction(state, 'finance:loan', { amount: 6000 }).ok, false);
});

test('variable-cost defaults remain affordable and empty balances lock paid financial actions', () => {
  const state = adult({ cash: 200 });
  assert.equal(take(state, 'finance:buy:index').cash, 0);
  assert.equal(take(state, 'finance:charity').cash, 0);
  assert.ok(performAction(adult({ cash: 25 }), 'finance:casino').ok);
  const broke = adult({ cash: 0 });
  assert.ok(getActions(broke, 'finance').find(a => a.id === 'finance:buy:index').disabled);
  assert.ok(getActions(broke, 'finance').find(a => a.id === 'finance:casino').disabled);
  assert.ok(getActions(broke, 'special').find(a => a.id === 'special:business').disabled);
});

test('university progresses over four annual turns and cannot be duplicated', () => {
  const major = MAJORS[0];
  let state = adult();
  const action = `education:university:${encodeURIComponent(major)}`;
  state = take(state, action);
  assert.equal(state.education.enrolled, 'university');
  assert.equal(state.education.yearsLeft, 4);
  assert.equal(state.cash, 988000);
  assert.equal(performAction(state, action).ok, false);
  for (let year = 0; year < 4; year++) state = nextYear(state);
  assert.equal(state.education.level, 'university');
  assert.equal(state.education.enrolled, null);
  assert.equal(state.education.major, major);
});

test('a scholarship makes tuition free and is consumed by enrolment', () => {
  let state = adult();
  state.flags.scholarship = true;
  state = take(state, `education:university:${encodeURIComponent(MAJORS[0])}`);
  assert.equal(state.cash, 1000000);
  assert.equal(state.flags.scholarship, false);
});

test('adult school leavers can regain a secondary qualification', () => {
  let state = adult();
  state.education.level = 'none';
  state = take(state, 'education:equivalency');
  assert.equal(state.education.enrolled, 'secondary');
  state = nextYear(state);
  assert.equal(state.education.level, 'secondary');
  assert.equal(state.education.enrolled, null);
});

test('job applications enforce qualifications, shared application limits, and actual employment', () => {
  let state = adult();
  const doctor = JOBS.find(j => j.education === 'graduate');
  assert.equal(performAction(state, `career:apply:${doctor.id}`).ok, false);
  state.stats.smarts = 100;
  state.stats.discipline = 100;
  const available = JOBS.filter(j => j.education === 'none').slice(0, 9);
  for (const job of available.slice(0, 8)) state = take(state, `career:apply:${job.id}`);
  assert.ok(state.job);
  const ninth = performAction(state, `career:apply:${available[8].id}`);
  assert.equal(ninth.ok, false);
  assert.deepEqual(ninth.state, state);
  const jobId = state.job.id;
  const beforeSalary = state.job.salary;
  state = take(state, 'career:hardwork');
  state = nextYear(state);
  assert.equal(state.job.id, jobId);
  assert.ok(state.annual.income >= beforeSalary);
});

test('adoption, parenting, pets, and estate planning create persistent family records', () => {
  let state = adult();
  state = take(state, 'relationships:adopt');
  const child = state.relationships.find(p => p.role === 'child');
  assert.ok(child);
  const bond = child.bond;
  state = take(state, `relationships:${encodeURIComponent(child.id)}:support`);
  assert.ok(state.relationships.find(p => p.id === child.id).bond > bond);
  state = take(state, 'relationships:will', { heir: child.id });
  assert.equal(state.flags.heir, child.id);
  state = take(state, 'relationships:pet', { name: 'Pixel', species: 'cat' });
  const pet = state.relationships.find(p => p.role === 'pet');
  assert.equal(pet.name, 'Pixel');
  assert.equal(pet.species, 'cat');
  state = nextYear(state);
  assert.equal(state.relationships.find(p => p.id === child.id).age, child.age + 1);
});

test('partner proposal and wedding make progress while breakups apply settlements', () => {
  let state = adult();
  state.relationships.push({ id: 'partner-test', name: 'Alex Reed', role: 'partner', age: 25, bond: 100, alive: true, gender: 'neutral' });
  // Deterministically find a successful proposal without changing production randomness.
  for (let rng = 1; rng < 100; rng++) {
    const result = performAction({ ...state, rng }, 'relationships:partner-test:propose');
    if (result.state.relationships.find(p => p.id === 'partner-test').role === 'fiancé') { state = result.state; break; }
  }
  assert.equal(state.relationships.find(p => p.id === 'partner-test').role, 'fiancé');
  state = take(state, 'relationships:partner-test:marry');
  assert.equal(state.relationships.find(p => p.id === 'partner-test').role, 'spouse');
  const cash = state.cash;
  state = take(state, 'relationships:partner-test:breakup');
  assert.equal(state.relationships.find(p => p.id === 'partner-test').role, 'ex');
  assert.equal(state.cash, cash - 1000 - Math.round((cash - 1000) * 0.2));
});

test('mortgages preserve purchase equity, property rent toggles, and sale settles secured debt', () => {
  let state = adult();
  state.job = { id: 'test', title: 'Employee', salary: 50000, performance: 70, years: 3 };
  const property = ASSETS.find(a => a.type === 'property');
  const initial = netWorth(state);
  state = take(state, `assets:mortgage:${property.id}`);
  assert.equal(netWorth(state), initial);
  assert.equal(state.assets[0].mortgage, Math.round(property.value * 0.8));
  const id = encodeURIComponent(state.assets[0].id);
  state = take(state, `assets:rent:${id}`);
  assert.equal(state.assets[0].rented, true);
  state = take(state, `assets:sell:${id}`);
  assert.equal(state.assets.length, 0);
  assert.equal(state.debt, 0);
  assert.ok(state.cash < 1000000);
});

test('bicycles do not need a driving licence while cars and aircraft do', () => {
  const state = adult();
  assert.equal(performAction(state, 'assets:buy:bicycle').ok, true);
  const car = ASSETS.find(a => a.type === 'vehicle' && !['bicycle', 'scooter'].includes(a.id));
  assert.equal(performAction(state, `assets:buy:${car.id}`).ok, false);
  const aircraft = ASSETS.find(a => a.type === 'aircraft');
  assert.equal(performAction(state, `assets:buy:${aircraft.id}`).ok, false);
});

test('crime can lead to prison; prison gates normal activities and offers meaningful rehabilitation', () => {
  let state;
  for (let seed = 1; seed < 20; seed++) {
    const result = performAction(adult({ rng: seed }), 'crime:bank');
    if (result.state.prison.years > 0) { state = result.state; break; }
  }
  assert.ok(state);
  assert.equal(state.prison.years, 15);
  assert.equal(state.prison.record, 1);
  assert.equal(performAction(state, 'activities:walk').ok, false);
  assert.equal(performAction(state, 'crime:bank').ok, false);
  assert.ok(getActions(state, 'crime').every(a => !a.id.startsWith('crime:bank')));
  const intelligence = state.stats.smarts;
  state = take(state, 'crime:prisonstudy');
  assert.ok(state.stats.smarts >= intelligence);
  state = take(state, 'crime:prisonwork');
  state = take(state, 'crime:prisonwork');
  assert.equal(state.flags.goodConduct, 2);
  assert.equal(performAction(state, 'crime:parole').ok, false);
  state = nextYear(state);
  assert.equal(performAction(state, 'crime:parole').ok, true);
});

test('special careers demand training and provide actual career progression', () => {
  let state = adult();
  const musician = SPECIAL_CAREERS.find(c => c.id === 'musician');
  assert.equal(performAction(state, 'special:start:musician').ok, false);
  state.skills[musician.skill] = 100;
  state = take(state, 'special:start:musician');
  assert.equal(state.specialCareer.id, 'musician');
  assert.ok(state.specialCareer.earnings > 0);
  state = take(state, 'special:practice');
  assert.ok(state.specialCareer.performance > 80);
  let progressed;
  for (let rng = 1; rng < 100; rng++) {
    const result = performAction({ ...state, rng }, 'special:work:musician');
    if (result.state.specialCareer.level > 1) { progressed = result.state; break; }
  }
  assert.ok(progressed);
  assert.ok(progressed.specialCareer.earnings > state.specialCareer.earnings);
  assert.ok(progressed.stats.fame > state.stats.fame);
});

test('business capital, dividends, and sale do not duplicate deposited money', () => {
  let state = adult();
  state = take(state, 'special:business', { name: 'Test Studio', type: 'Technology', amount: 25000 });
  assert.equal(state.business.name, 'Test Studio');
  assert.equal(state.cash, 975000);
  assert.equal(netWorth(state), 1000000);
  state = take(state, 'special:businessinject', { amount: 10000 });
  assert.equal(state.business.capital, 35000);
  assert.equal(netWorth(state), 1000000);
  state = take(state, 'special:businessdividend', { amount: 10000 });
  assert.equal(state.business.capital, 25000);
  assert.equal(netWorth(state), 1000000);
  const before = structuredClone(state);
  assert.equal(performAction(state, 'special:businessdividend', { amount: 25001 }).ok, false);
  assert.deepEqual(state, before);
  state = take(state, 'special:businesssell');
  assert.equal(state.business, null);
  assert.ok(state.cash >= 995000 && state.cash <= 1005000);
});

test('medical care, social publishing and emigration change the appropriate systems', () => {
  let state = adult();
  state.stats.health = 40;
  state = take(state, 'activities:doctor');
  assert.ok(state.stats.health >= 48 && state.stats.health <= 51, 'Medical treatment improves the aggregate and its component systems.');
  state = take(state, 'activities:socialjoin');
  state = take(state, 'activities:post');
  assert.ok(state.social.followers > 25);
  assert.equal(state.social.posts, 1);
  state = take(state, 'activities:emigrate:fr');
  assert.equal(state.country, 'fr');
  assert.equal(state.city, 'Paris');
  assert.equal(state.flags.emigrations, 1);
  assert.equal(performAction(state, 'activities:emigrate:de').ok, false);
});

test('every enabled catalogue action executes with defaults without leaking runtime errors', () => {
  const state = adult();
  state.cash = 1e9;
  state.stats.smarts = 100;
  state.stats.fame = 100;
  state.education.level = 'graduate';
  state.social.followers = 20000;
  state.flags.socialAccount = true;
  state.licenses = ['driving', 'pilot'];
  for (const name of Object.keys(state.skills)) state.skills[name] = 100;
  for (const category of ['education', 'career', 'relationships', 'activities', 'assets', 'finance', 'crime', 'special']) {
    for (const action of getActions(state, category).filter(a => !a.disabled)) {
      const result = performAction(state, action.id);
      assert.ok(!/undefined|is not a function|Cannot read|NaN|Infinity/.test(result.message), `${action.id}: ${result.message}`);
      assert.equal(result.ok, true, `${action.id}: ${result.message}`);
      assert.ok(Number.isFinite(result.state.cash));
      assert.ok(result.state.cash >= 0);
      for (const value of Object.values(result.state.stats)) assert.ok(value >= 0 && value <= 100);
    }
  }
});
