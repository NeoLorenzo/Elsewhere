import test from 'node:test';
import assert from 'node:assert/strict';
import { createLife, ageUp, normalizeState } from '../src/engine.js';
import { beginMiniGame, advanceMiniGame, currentGame } from '../src/game-session.js';
import { solveEscape } from '../src/minigames.js';
import { getActions, performAction } from '../src/systems.js';

function player(rng = 0, options = {}) {
  const state = createLife({ seed: 1, age: 25, firstName: 'Alex', lastName: 'River', ...options });
  state.cash = 1000;
  state.rng = rng;
  return state;
}

function prisoner(health = 90) {
  const state = player();
  state.prison = { years: 5, record: 1, heat: 20 };
  state.stats.health = health;
  return state;
}

test('starting through performAction escrows a blackjack stake exactly once', () => {
  const state = player();
  const original = structuredClone(state);
  const result = performAction(state, 'finance:blackjack', { amount: 100 });
  assert.equal(result.ok, true);
  assert.equal(result.settled, false);
  assert.equal(result.state.cash, 900);
  assert.equal(result.state.actionCounts['finance:blackjack'], 1);
  assert.equal(result.state.actionCounts.__total, 1);
  assert.deepEqual(state, original, 'Beginning a game must not mutate the original life.');
  const hit = advanceMiniGame(result.state, 'hit');
  assert.equal(hit.ok, true);
  assert.equal(hit.settled, false);
  assert.equal(hit.state.cash, 900, 'A hit must not charge another stake.');
  const duplicate = beginMiniGame(hit.state, 'blackjack', { amount: 100 });
  assert.equal(duplicate.ok, false);
  assert.deepEqual(duplicate.state, hit.state);
});

test('known seeded hands settle losses, ordinary wins and pushes at the correct amounts', () => {
  // These fixed RNG states deal independently checked hands against a standard deck.
  for (const fixture of [
    { rng: 0, result: 'lose', cash: 900, player: ['2', '8'] },
    { rng: 2, result: 'push', cash: 1000, player: ['J', 'Q'] },
    { rng: 4, result: 'win', cash: 1100, player: ['8', '2'] },
  ]) {
    const start = beginMiniGame(player(fixture.rng), 'blackjack', { amount: 100 });
    assert.equal(start.settled, false);
    assert.deepEqual(start.game.player.map(card => card.rank), fixture.player);
    const finish = advanceMiniGame(start.state, 'stand');
    assert.equal(finish.ok, true);
    assert.equal(finish.settled, true);
    assert.equal(finish.game.result, fixture.result);
    assert.equal(finish.state.cash, fixture.cash);
    assert.equal(finish.state.minigame, null);
    assert.equal(finish.state.actionCounts['finance:blackjack'], 1);
    const repeated = advanceMiniGame(finish.state, 'stand');
    assert.equal(repeated.ok, false);
    assert.deepEqual(repeated.state, finish.state, 'A finished hand cannot pay out twice.');
  }
});

test('opening naturals pay 3:2 profit immediately, while double naturals push', () => {
  const natural = beginMiniGame(player(8), 'blackjack', { amount: 100 });
  assert.equal(natural.ok, true);
  assert.equal(natural.settled, true);
  assert.deepEqual(natural.game.player.map(card => card.rank), ['A', '10']);
  assert.equal(natural.state.cash, 1150);
  assert.equal(natural.state.flags.gamblingWins, 1);
  assert.equal(natural.state.minigame, null);
  const push = beginMiniGame(player(981), 'blackjack', { amount: 100 });
  assert.equal(push.settled, true);
  assert.equal(push.game.result, 'push');
  assert.equal(push.state.cash, 1000);
  const dealerNatural = beginMiniGame(player(166), 'blackjack', { amount: 100 });
  assert.equal(dealerNatural.settled, true);
  assert.equal(dealerNatural.game.result, 'lose');
  assert.equal(dealerNatural.state.cash, 900);
});

test('blackjack yearly and total action allowances are enforced without partial charges', () => {
  let state = player();
  for (let hand = 0; hand < 3; hand++) {
    state.rng = 0;
    const start = beginMiniGame(state, 'blackjack', { amount: 10 });
    assert.equal(start.ok, true);
    state = advanceMiniGame(start.state, 'forfeit').state;
  }
  assert.equal(state.cash, 970);
  assert.equal(state.actionCounts['finance:blackjack'], 3);
  const capped = beginMiniGame(state, 'blackjack', { amount: 10 });
  assert.equal(capped.ok, false);
  assert.deepEqual(capped.state, state);
  const totalCap = player();
  totalCap.actionCounts.__total = 100;
  const denied = beginMiniGame(totalCap, 'blackjack', { amount: 10 });
  assert.equal(denied.ok, false);
  assert.deepEqual(denied.state, totalCap);
  const newYear = ageUp(state);
  assert.equal(newYear.actionCounts['finance:blackjack'], undefined);
});

test('invalid bets and casino eligibility failures leave money and RNG unchanged', () => {
  for (const amount of [-100, 0, 9, 10.5, 1000001, Infinity, NaN, 'invalid', '', 1001]) {
    const state = player();
    const result = beginMiniGame(state, 'blackjack', { amount });
    assert.equal(result.ok, false, `Stake ${String(amount)} should be rejected.`);
    assert.deepEqual(result.state, state);
  }
  for (const state of [player(0, { age: 17 }), prisoner(), { ...player(), alive: false },
    { ...player(), pendingEvent: { id: 'waiting', choices: [{ label: 'Wait' }] } }]) {
    const result = performAction(state, 'finance:blackjack', { amount: 100 });
    assert.equal(result.ok, false);
    assert.deepEqual(result.state, state);
  }
});

test('blackjack forfeit consumes its stake and cannot be settled again', () => {
  const start = beginMiniGame(player(), 'blackjack', { amount: 200 });
  const result = advanceMiniGame(start.state, 'forfeit');
  assert.equal(result.ok, true);
  assert.equal(result.settled, true);
  assert.equal(result.state.cash, 800);
  assert.equal(result.state.minigame, null);
  assert.equal(advanceMiniGame(result.state, 'forfeit').ok, false);
});

test('an escape started through performAction can be solved to regain freedom', () => {
  const state = prisoner();
  let result = performAction(state, 'crime:escape');
  assert.equal(result.ok, true);
  assert.equal(result.settled, false);
  assert.equal(result.state.cash, state.cash);
  assert.equal(result.state.actionCounts['crime:escape'], 1);
  const solution = solveEscape(result.game);
  assert.ok(solution?.length);
  for (const move of solution) {
    result = advanceMiniGame(result.state, move);
    assert.equal(result.ok, true);
  }
  assert.equal(result.settled, true);
  assert.equal(result.game.status, 'won');
  assert.equal(result.state.prison.years, 0);
  assert.equal(result.state.prison.record, 1);
  assert.equal(result.state.prison.heat, 50);
  assert.equal(result.state.flags.released, true);
  assert.equal(result.state.flags.escaped, true);
  assert.equal(result.state.minigame, null);
  assert.equal(advanceMiniGame(result.state, 'right').ok, false);
});

test('being caught and forfeiting both add three years, charge health, and enforce the yearly escape cap', () => {
  const start = beginMiniGame(prisoner(), 'escape');
  let caught = start;
  for (let step = 0; step < 5; step++) caught = advanceMiniGame(caught.state, 'right');
  assert.equal(caught.settled, true);
  assert.equal(caught.game.status, 'lost');
  assert.equal(caught.state.prison.years, 8);
  assert.equal(caught.state.stats.health, 78);
  assert.equal(caught.state.minigame, null);
  const repeat = beginMiniGame(caught.state, 'escape');
  assert.equal(repeat.ok, false);
  assert.deepEqual(repeat.state, caught.state);
  const forfeit = advanceMiniGame(start.state, 'forfeit');
  assert.equal(forfeit.state.prison.years, 8);
  assert.equal(forfeit.state.stats.health, 78);
  assert.equal(forfeit.state.minigame, null);
  assert.deepEqual(start.state.prison, prisoner().prison, 'Settlement must not alter earlier snapshots.');
  const free = player();
  assert.equal(beginMiniGame(free, 'escape').ok, false);
});

test('an unsuccessful escape can cause death and leaves no resumable session', () => {
  const start = beginMiniGame(prisoner(10), 'escape');
  const result = advanceMiniGame(start.state, 'forfeit');
  assert.equal(result.state.stats.health, 0);
  assert.equal(result.state.alive, false);
  assert.match(result.state.causeOfDeath, /escape/);
  assert.equal(result.state.minigame, null);
  assert.equal(beginMiniGame(result.state, 'escape').ok, false);
  assert.deepEqual(ageUp(result.state), result.state);
});

test('invalid inputs and blocked escape directions are atomic and do not spend turns', () => {
  const start = beginMiniGame(prisoner(), 'escape');
  const invalid = advanceMiniGame(start.state, 'teleport');
  assert.equal(invalid.ok, false);
  assert.deepEqual(invalid.state, start.state);
  const wall = advanceMiniGame(start.state, 'left');
  assert.equal(wall.ok, true);
  assert.equal(wall.settled, false);
  assert.deepEqual(wall.state, start.state);
  assert.deepEqual(wall.game, start.game);
  const blackjack = beginMiniGame(player(), 'blackjack', { amount: 100 });
  const wrongMove = advanceMiniGame(blackjack.state, 'up');
  assert.equal(wrongMove.ok, false);
  assert.deepEqual(wrongMove.state, blackjack.state);
});

test('saving and reloading reconstructs the same cards and subsequent settlement', () => {
  const start = beginMiniGame(player(), 'blackjack', { amount: 100 });
  const afterHit = advanceMiniGame(start.state, 'hit');
  assert.equal(afterHit.settled, false);
  const restored = normalizeState(JSON.parse(JSON.stringify(afterHit.state)));
  assert.equal(restored.cash, 900);
  assert.deepEqual(currentGame(restored), afterHit.game);
  assert.deepEqual(restored.minigame.moves, ['hit']);
  const first = advanceMiniGame(afterHit.state, 'stand');
  const resumed = advanceMiniGame(restored, 'stand');
  assert.equal(resumed.state.cash, first.state.cash);
  assert.deepEqual(resumed.game, first.game);
  assert.equal(resumed.state.minigame, null);
});

test('saving and reloading an escape preserves positions and the remaining winning path', () => {
  let result = beginMiniGame(prisoner(), 'escape');
  const solution = solveEscape(result.game);
  result = advanceMiniGame(result.state, solution[0]);
  const restored = normalizeState(JSON.parse(JSON.stringify(result.state)));
  assert.deepEqual(currentGame(restored), result.game);
  result = { state: restored };
  for (const move of solution.slice(1)) result = advanceMiniGame(result.state, move);
  assert.equal(result.game.status, 'won');
  assert.equal(result.state.prison.years, 0);
});

test('an active session blocks yearly updates and ordinary action APIs', () => {
  for (const start of [beginMiniGame(player(), 'blackjack', { amount: 100 }), beginMiniGame(prisoner(), 'escape')]) {
    assert.deepEqual(ageUp(start.state), start.state);
    assert.ok(getActions(start.state, 'activities').every(action => action.disabled));
    const ordinary = performAction(start.state, 'activities:walk');
    assert.equal(ordinary.ok, false);
    assert.deepEqual(ordinary.state, start.state);
    const repeated = performAction(start.state, start.kind === 'blackjack' ? 'finance:blackjack' : 'crime:escape', { amount: 100 });
    assert.equal(repeated.ok, false);
    assert.deepEqual(repeated.state, start.state);
  }
});
