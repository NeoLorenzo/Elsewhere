import test from 'node:test';
import assert from 'node:assert/strict';
import { createLife } from '../src/engine.js';
import { getActions, performAction } from '../src/systems.js';
import { countriesForYear, countryForYear } from '../src/countries.js';
import { calendarYearAtAge } from '../src/calendar.js';

function lifeAt(year, country = 'uk') {
  const state = createLife({ age: 25, birthYear: calendarYearAtAge(year, -25), country, seed: 'country-actions' });
  state.country = country;
  state.city = countryForYear(country, year).cities[0];
  state.cash = 100000;
  return state;
}

const migrations = state => getActions(state, 'activities').filter(action => action.id.startsWith('activities:emigrate:'));

test('a life beginning in 1900 sees historical destinations while adult migration remains locked', () => {
  const state = createLife({ age: 0, birthYear: 1900, country: 'uk', seed: 'historical-beginning' });
  const actions = migrations(state);
  assert.equal(actions.length, countriesForYear(1900).length);
  assert.match(actions.find(action => action.id === 'activities:emigrate:ru').title, /Russian Empire/);
  assert.match(actions.find(action => action.id === 'activities:emigrate:mm').title, /British Burma/);
  assert.ok(actions.every(action => /age 18/.test(action.disabled)));
  assert.equal(performAction(state, 'activities:emigrate:mm').ok, false);
});

test('the migration catalogue contains every current-year geography exactly once with era-specific labels', () => {
  for (const year of [1925, 1930, 1970, 2026]) {
    const state = lifeAt(year);
    const before = structuredClone(state);
    const destinations = countriesForYear(year);
    const actions = migrations(state);
    assert.ok(actions.length >= 190, `Broad destination coverage in ${year}`);
    assert.equal(actions.length, destinations.length);
    assert.equal(new Set(actions.map(action => action.id)).size, actions.length);
    for (const destination of destinations) {
      const action = actions.find(item => item.id === `activities:emigrate:${destination.id}`);
      assert.equal(action.title, `Move to ${destination.name}`);
      assert.equal(action.cost, 5000);
      assert.ok(destination.cities.length > 0);
      if (destination.id === state.country) assert.match(action.disabled, /already live here/);
      else assert.equal(action.disabled, undefined, `${year}: ${destination.id}`);
    }
    assert.deepEqual(state, before, 'discovering destinations must not mutate a life');
  }
});

test('historical migration uses the selected geographic identity and current-era administration in its outcome', () => {
  const state = lifeAt(1925);
  state.job = { id: 'tester', title: 'Tester', salary: 40000, performance: 60, years: 2 };
  const expected = countryForYear('mm', 1925);
  assert.match(expected.name, /British Burma/);
  const result = performAction(state, 'activities:emigrate:mm');
  assert.equal(result.ok, true, result.message);
  assert.equal(result.state.country, 'mm');
  assert.equal(result.state.city, expected.cities[0]);
  assert.equal(result.state.year, 1925);
  assert.equal(result.state.cash, state.cash - 5000);
  assert.equal(result.state.job, null);
  assert.equal(result.state.flags.emigrations, 1);
  assert.ok(result.message.includes(expected.name));
  assert.ok(result.state.journal.at(-1).text.includes(expected.name));
  assert.equal(state.country, 'uk', 'the caller remains unchanged');
});

test('stable migration action IDs are resolved against the year at execution rather than a cached label', () => {
  const historical = migrations(lifeAt(1925)).find(action => action.id === 'activities:emigrate:cd');
  assert.match(historical.title, /Belgian Congo/);
  const modern = lifeAt(2026);
  const result = performAction(modern, historical.id);
  assert.equal(result.ok, true, result.message);
  const expected = countryForYear('cd', 2026);
  assert.ok(result.message.includes(expected.name));
  assert.ok(!result.message.includes('Belgian Congo'));
  assert.equal(result.state.country, 'cd');
});

test('historical parent administrations do not collapse distinct geographic destinations', () => {
  const state = lifeAt(1925, 'ru');
  const actions = migrations(state);
  const russia = actions.find(action => action.id === 'activities:emigrate:ru');
  const ukraine = actions.find(action => action.id === 'activities:emigrate:ua');
  assert.match(russia.title, /Soviet Union/);
  assert.match(ukraine.title, /Soviet Union/);
  assert.match(russia.disabled, /already live here/);
  assert.equal(ukraine.disabled, undefined);
  const result = performAction(state, ukraine.id);
  assert.equal(result.ok, true, result.message);
  assert.equal(result.state.country, 'ua');
  assert.equal(result.state.city, countryForYear('ua', 1925).cities[0]);
});

test('new destinations enforce ordinary migration affordability, age, record, and yearly limits', () => {
  const base = lifeAt(1925);
  for (const state of [{ ...base, cash: 4999 }, { ...base, age: 17 }, { ...base, prison: { years: 0, record: 3, heat: 0 } }]) {
    const before = structuredClone(state);
    const result = performAction(state, 'activities:emigrate:ar');
    assert.equal(result.ok, false);
    assert.deepEqual(result.state, before);
  }
  const first = performAction(base, 'activities:emigrate:ar');
  assert.equal(first.ok, true, first.message);
  const second = performAction(first.state, 'activities:emigrate:cl');
  assert.equal(second.ok, false);
  assert.match(second.message, /once per year/);
  assert.deepEqual(second.state, first.state);
});

test('unknown or invented migration identities are rejected atomically', () => {
  const state = lifeAt(1930);
  for (const id of ['activities:emigrate:invented-country', 'activities:emigrate:__proto__', 'activities:emigrate:British Burma']) {
    const result = performAction(state, id);
    assert.equal(result.ok, false);
    assert.deepEqual(result.state, state);
  }
});
