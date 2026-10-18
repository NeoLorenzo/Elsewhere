import test from 'node:test';
import assert from 'node:assert/strict';
import { createLife, ageUp, resolveEvent, normalizeState, netWorth, random, continueLegacy, checkAchievements } from '../src/engine.js';
import { COUNTRIES, ACHIEVEMENTS } from '../src/data.js';
import { getActions, performAction } from '../src/systems.js';

const life = (options = {}) => createLife({ seed: 901, firstName: 'Alex', lastName: 'River', ...options });
const finishEvent = state => state.pendingEvent ? resolveEvent(state, 0) : state;

test('seeded lives and random streams are reproducible, without shared mutable state', () => {
  const first = life(), second = life();
  assert.deepEqual(first, second);
  assert.equal(random(first), random(second));
  assert.ok(random(first) >= 0 && random(first) < 1);
  first.relationships[0].bond = 1;
  assert.notEqual(first.relationships[0].bond, second.relationships[0].bond);
});

test('a birthday is immutable and event decisions must be settled before the next birthday', () => {
  const original = life(), saved = structuredClone(original);
  const next = ageUp(original);
  assert.deepEqual(original, saved);
  assert.equal(next.age, 1);
  assert.equal(next.year, original.year + 1);
  assert.ok(next.pendingEvent);
  assert.deepEqual(ageUp(next), next);
  const decided = resolveEvent(next, 0);
  assert.equal(decided.pendingEvent, null);
  assert.equal(ageUp(decided).age, 2);
});

test('secondary school starts and completes automatically while birthdays progress', () => {
  let state = life({ age: 4 });
  state = ageUp(state);
  assert.equal(state.education.enrolled, 'primary');
  state = life({ age: 17 });
  const next = ageUp(state);
  assert.equal(next.education.level, 'secondary');
  assert.equal(next.education.enrolled, null);
  assert.ok(next.journal.some(j => j.title === 'School graduation'));
});

test('university, graduate and trade courses take the enrolled years and award the right qualification', () => {
  for (const level of ['university', 'graduate', 'trade']) {
    const state = life({ age: 22 });
    state.education = { level: 'secondary', enrolled: level, yearsLeft: 1, grades: 80, major: 'Engineering' };
    const next = ageUp(state);
    assert.equal(next.education.level, level);
    assert.equal(next.education.yearsLeft, 0);
    assert.equal(next.education.enrolled, null);
  }
  const graduate = life({ age: 30 });
  graduate.education = { level: 'graduate', enrolled: 'trade', yearsLeft: 1, grades: 80, major: 'Skilled trades' };
  assert.equal(ageUp(graduate).education.level, 'graduate', 'A later trade course must not erase an advanced degree.');
});

test('salary, tax and expenses balance cash and annual figures', () => {
  const state = life({ age: 25 });
  state.cash = 20000;
  state.job = { id: 'test-job', title: 'Tester', salary: 60000, performance: 60, years: 0 };
  const next = ageUp(state);
  assert.equal(next.annual.income, 60000);
  assert.ok(next.annual.tax > 0);
  assert.ok(next.annual.expenses > 0);
  assert.equal(next.annual.net, next.annual.income - next.annual.tax - next.annual.expenses);
  assert.equal(next.cash, state.cash + next.annual.net);
  assert.equal(next.job.years, 1);
});

test('unfunded living costs become debt, never negative spendable cash', () => {
  const next = ageUp(life({ age: 20 }));
  assert.equal(next.cash, 0);
  assert.ok(next.debt > 0);
  assert.equal(next.debt, -next.annual.net);
});

test('asset mortgages are deducted from net worth and annual repayments reduce principal', () => {
  const state = life({ age: 35 });
  state.cash = 100000;
  state.assets = [{ id: 'home', name: 'Home', type: 'property', value: 250000, mortgage: 100000, condition: 90, rented: true }];
  state.investments = [{ id: 'index', name: 'Index', type: 'stock', value: 20000, cost: 15000 }];
  state.debt = 10000;
  assert.equal(netWorth(state), 260000);
  const next = ageUp(state);
  assert.ok(next.assets[0].mortgage < state.assets[0].mortgage);
  assert.ok(next.annual.income > 0);
  assert.ok(next.assets[0].condition < state.assets[0].condition);
  assert.ok(Number.isFinite(next.investments[0].value));
});

test('businesses and special careers contribute yearly proceeds', () => {
  const state = life({ age: 28 });
  state.business = { name: 'River Works', type: 'software', value: 120000, capital: 50000, employees: 3, performance: 90, profit: 0 };
  state.specialCareer = { id: 'musician', title: 'Musician', level: 2, performance: 80, earnings: 100000 };
  const next = ageUp(state);
  assert.ok(next.annual.income > 10000);
  assert.ok(next.business.profit > 0);
  assert.ok(next.specialCareer.earnings > 0);
  assert.ok(next.stats.fame > state.stats.fame);
});

test('business payroll and retained earnings do not double count company capital', () => {
  const state = life({ age: 30 });
  state.cash = 100000;
  state.business = { name: 'River Works', type: 'software', value: 80000, capital: 60000, employees: 2, performance: 90, profit: 0 };
  const next = ageUp(state);
  assert.ok(next.business.profit > 0);
  const distributed = Math.round(next.business.profit * .35);
  assert.equal(next.business.capital, state.business.capital + next.business.profit - distributed);
  assert.equal(next.business.value, state.business.value + next.business.profit - distributed);
  assert.equal(netWorth(next), netWorth(state) + next.business.profit - next.annual.tax - next.annual.expenses);
});

test('retirement pensions, dependent upkeep, and healthy diets carry into the annual simulation', () => {
  const state = life({ age: 65 });
  state.flags.retired = true;
  state.flags.retirementSalary = 24000;
  state.flags.healthyDiet = true;
  state.relationships = [{ id: 'child', name: 'Jamie River', age: 5, role: 'child', alive: true, bond: 90, gender: 'neutral' }];
  const baseline = structuredClone(state);
  baseline.relationships = [];
  baseline.flags.healthyDiet = false;
  const next = ageUp(state), withoutDependents = ageUp(baseline);
  assert.equal(next.annual.income, 24000);
  assert.ok(next.annual.expenses > withoutDependents.annual.expenses);
  assert.ok(next.stats.health >= state.stats.health - 2);
});

test('pet species and health survive save import, and pets have appropriate lifespans', () => {
  const state = life({ age: 30 });
  state.relationships.push({ id: 'pet', name: 'Mochi', role: 'pet', species: 'cat', health: 80, age: 21, bond: 90, alive: true, gender: 'female' });
  const imported = normalizeState(state);
  assert.equal(imported.relationships.at(-1).species, 'cat');
  assert.equal(imported.relationships.at(-1).health, 80);
  const next = ageUp(imported);
  assert.equal(next.relationships.at(-1).alive, false);
  assert.ok(next.journal.some(entry => entry.text.includes('Mochi') && entry.text.includes('died')));
});

test('prison blocks salary for the final year and releases after the sentence is served', () => {
  const state = life({ age: 30 });
  state.prison = { years: 1, record: 1, heat: 60 };
  state.job = { id: 'job', title: 'Tester', salary: 100000, performance: 60, years: 0 };
  const next = ageUp(state);
  assert.equal(next.annual.income, 0);
  assert.equal(next.prison.years, 0);
  assert.equal(next.flags.released, true);
  assert.equal(next.prison.heat, 52);
});

test('event choices clamp stats, turn a cash shortage into debt, and cannot be replayed', () => {
  const state = life({ age: 20 });
  state.pendingEvent = { id: 'test', title: 'A bill', text: '', category: 'finance', choices: [
    { label: 'Pay', effects: { cash: -500, happiness: 200, health: -5 }, result: 'I paid the bill.' },
  ] };
  const next = resolveEvent(state, 0);
  assert.equal(next.cash, 0);
  assert.equal(next.debt, 500);
  assert.equal(next.stats.happiness, 100);
  assert.equal(next.stats.health, 85);
  assert.deepEqual(resolveEvent(next, 0), next);
  assert.equal(state.debt, 0);
  assert.deepEqual(resolveEvent(state, -1), state);
});

test('health reaching zero ends a life and death prevents future actions and aging', () => {
  const state = life({ age: 45 });
  state.pendingEvent = { id: 'crisis', title: 'Crisis', choices: [{ label: 'Continue', effects: { health: -100 }, result: '' }] };
  const next = resolveEvent(state, 0);
  assert.equal(next.alive, false);
  assert.ok(next.causeOfDeath);
  assert.equal(next.pendingEvent, null);
  assert.deepEqual(ageUp(next), next);
});

test('legacy divides the estate among living children and preserves ancestral history', () => {
  const state = life({ age: 80 });
  state.alive = false; state.causeOfDeath = 'natural causes'; state.cash = 100000;
  state.ancestors = [{ name: 'River Founder', age: 90, year: 2020, netWorth: 1000 }];
  state.relationships.push(
    { id: 'child-a', name: 'Jamie River', role: 'child', age: 30, bond: 90, alive: true, gender: 'neutral' },
    { id: 'child-b', name: 'Casey River', role: 'child', age: 28, bond: 80, alive: true, gender: 'female' },
  );
  const next = continueLegacy(state, 'child-a');
  assert.equal(next.firstName, 'Jamie');
  assert.equal(next.age, 30);
  assert.equal(next.generation, 2);
  assert.equal(next.cash, 50000);
  assert.equal(next.year, state.year);
  assert.equal(next.ancestors.at(-1).name, 'Alex River');
  assert.ok(next.relationships.some(r => r.role === 'sibling' && r.id === 'child-b'));
  next.ancestors[0].name = 'Changed in the new generation';
  assert.equal(state.ancestors[0].name, 'River Founder', 'Continuing a legacy must not share mutable ancestor records.');
  assert.throws(() => continueLegacy(life()), /life must end/);
  assert.throws(() => continueLegacy(state, 'unknown'), /living child/);
  state.flags.heir = 'child-b';
  assert.equal(continueLegacy(state).firstName, 'Casey');
  assert.equal(continueLegacy(state).cash, 100000);
  assert.equal(continueLegacy(state, 'child-a').cash, 0);
});

test('supporting a child survives save import and improves the next generation’s education', () => {
  const state = life({ age: 70 });
  state.alive = false;
  state.relationships = [
    { id: 'supported', name: 'Jamie River', role: 'child', age: 15, bond: 90, alive: true, gender: 'neutral', educationSupport: 5 },
    { id: 'parent', name: 'Casey Reed', role: 'fiancé', age: 60, bond: 80, alive: true, gender: 'female' },
  ];
  const imported = normalizeState(state);
  assert.equal(imported.relationships[0].educationSupport, 5);
  const next = continueLegacy(imported, 'supported');
  const withoutSupport = structuredClone(imported);
  withoutSupport.relationships[0].educationSupport = 0;
  const baseline = continueLegacy(withoutSupport, 'supported');
  assert.equal(next.education.grades, baseline.education.grades + 10);
  assert.equal(next.stats.smarts, Math.min(100, baseline.stats.smarts + 10));
  assert.ok(next.relationships.some(person => person.id === 'parent' && person.role === 'parent' && person.alive));
});

test('save imports validate version and sanitize hostile and out of bounds data', () => {
  const raw = life({ age: 20 });
  raw.stats.health = 100000;
  raw.cash = -500;
  raw.debt = NaN;
  raw.annual = {};
  raw.relationships = [null, { name: '<script>unsafe</script>', age: -20, bond: Infinity }];
  raw.flags = JSON.parse('{"__proto__":{"polluted":true},"safe":true}');
  const normalized = normalizeState(raw);
  assert.equal(normalized.stats.health, 100);
  assert.equal(normalized.cash, 0);
  assert.equal(normalized.debt, 0);
  assert.equal(normalized.annual.income, 0);
  assert.equal(normalized.relationships.length, 1);
  assert.equal(normalized.relationships[0].age, 0);
  assert.equal({}.polluted, undefined);
  assert.equal(normalized.flags.safe, true);
  assert.throws(() => normalizeState({ version: 99 }), /Unsupported/);
  assert.throws(() => normalizeState(null), /does not contain/);
  assert.throws(() => normalizeState({ ...raw, toJSON: () => undefined }), /valid life data/);
});

test('save import preserves a pending decision, school progress, and deterministic RNG', () => {
  const state = ageUp(life({ age: 10 }));
  const next = normalizeState(JSON.parse(JSON.stringify(state)));
  assert.equal(next.pendingEvent.id, state.pendingEvent.id);
  assert.deepEqual(next.pendingEvent.choices, state.pendingEvent.choices);
  assert.equal(next.education.yearsLeft, state.education.yearsLeft);
  assert.equal(random(next), random(state));
  assert.equal(next.country, COUNTRIES.find(c => c.id === state.country).id);
});

test('active minigames round trip through imports with only approved session fields', () => {
  for (const session of [
    { kind: 'blackjack', seed: 0xffffffff, bet: 250, moves: ['hit', 'stand'] },
    { kind: 'escape', seed: 0, bet: 0, moves: ['up', 'down', 'left', 'right'] },
  ]) {
    const state = life({ age: 25 });
    state.minigame = { ...session, injectedResult: 'win', payout: 1000000 };
    const imported = normalizeState(JSON.parse(JSON.stringify(state)));
    assert.deepEqual(imported.minigame, session);
    imported.minigame.moves.push(session.kind === 'blackjack' ? 'hit' : 'up');
    assert.equal(state.minigame.moves.length, session.moves.length, 'Imported move arrays must be independent.');
  }
  const previousVersion = life();
  delete previousVersion.minigame;
  assert.equal(normalizeState(previousVersion).minigame, null);
});

test('invalid and deceased minigame imports cannot restore an active session', () => {
  const valid = { kind: 'blackjack', seed: 123, bet: 100, moves: ['hit'] };
  const invalid = [null, [], 'blackjack', {}, { ...valid, kind: 'roulette' },
    { ...valid, seed: -1 }, { ...valid, seed: 0x100000000 }, { ...valid, seed: 1.5 }, { ...valid, seed: '123' },
    { ...valid, bet: -1 }, { ...valid, bet: 1e9 + 1 }, { ...valid, bet: Infinity }, { ...valid, bet: '100' },
    { ...valid, moves: Array(201).fill('hit') }, { ...valid, moves: ['up'] }, { ...valid, moves: [null] },
    { ...valid, kind: 'escape', moves: ['stand'] }, { ...valid, moves: { 0: 'hit' } }];
  for (const minigame of invalid) assert.equal(normalizeState({ ...life(), minigame }).minigame, null);
  assert.equal(normalizeState({ ...life(), alive: false, minigame: valid }).minigame, null);
});

test('a minigame pauses yearly simulation and life-event resolution without mutating the session', () => {
  const state = ageUp(life({ age: 20 }));
  assert.ok(state.pendingEvent);
  state.minigame = { kind: 'blackjack', seed: 123, bet: 100, moves: ['hit'] };
  const original = structuredClone(state);
  assert.deepEqual(ageUp(state), original);
  assert.deepEqual(resolveEvent(state, 0), original);
  assert.deepEqual(state, original);
  state.minigame = null;
  assert.equal(resolveEvent(state, 0).pendingEvent, null);
  state.pendingEvent = null;
  state.minigame = { kind: 'escape', seed: 3, bet: 0, moves: [] };
  assert.equal(ageUp(state).age, state.age);
});

test('achievements are deduplicated and only grant authored definitions', () => {
  const state = life({ age: 100 });
  state.cash = 2000000;
  checkAchievements(state);
  checkAchievements(state);
  assert.equal(new Set(state.achievements).size, state.achievements.length);
  assert.ok(state.achievements.every(id => ACHIEVEMENTS.some(a => a.id === id)));
  if (ACHIEVEMENTS.some(a => a.id === 'millionaire')) assert.ok(state.achievements.includes('millionaire'));
  state.flags.travelCount = 3;
  state.flags.countriesVisited = 2;
  state.flags.emigrations = 2;
  checkAchievements(state);
  assert.ok(state.achievements.includes('globetrotter'), 'Holidays and emigrations should combine without double counting migrations.');
});

test('mixed live actions, save reloads and annual simulation keep lifecycle values finite', () => {
  const categories = ['education', 'career', 'relationships', 'activities', 'assets', 'finance', 'special', 'crime'];
  const assertFinite = value => {
    if (typeof value === 'number') assert.ok(Number.isFinite(value));
    if (Array.isArray(value)) value.forEach(assertFinite);
    else if (value && typeof value === 'object') Object.values(value).forEach(assertFinite);
  };
  for (let seed = 40; seed < 43; seed++) {
    let state = life({ age: 18, seed });
    state.cash = 1000000;
    state.stats.health = 100;
    state.stats.smarts = 90;
    Object.keys(state.skills).forEach(key => { state.skills[key] = 80; });
    for (let year = 0; year < 20 && state.alive; year++) {
      for (let step = 0; step < 8 && state.alive; step++) {
        const category = categories[(year + step) % categories.length];
        const actions = getActions(state, category).filter(action => !action.disabled);
        if (!actions.length) continue;
        const action = actions[Math.floor(random(state) * actions.length)];
        const result = performAction(state, action.id);
        state = result.state;
        assertFinite(state);
        assert.ok(state.cash >= 0 && state.debt >= 0);
      }
      state = normalizeState(finishEvent(ageUp(state)));
      assertFinite(state);
      assert.ok(Object.values(state.stats).every(value => value >= 0 && value <= 100));
    }
  }
});

test('many deterministic full lifetimes retain finite coherent state and eventually end', () => {
  for (let seed = 1; seed <= 10; seed++) {
    let state = life({ seed });
    for (let year = 0; year <= 121 && state.alive; year++) {
      state = finishEvent(ageUp(state));
      assert.ok(state.cash >= 0 && Number.isFinite(state.cash));
      assert.ok(state.debt >= 0 && Number.isFinite(state.debt));
      assert.ok(Object.values(state.stats).every(n => Number.isFinite(n) && n >= 0 && n <= 100));
    }
    assert.equal(state.alive, false);
    assert.ok(state.age <= 120);
  }
});
