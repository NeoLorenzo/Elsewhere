import test from 'node:test';
import assert from 'node:assert/strict';
import { handValue, createBlackjack, blackjackMove, createEscape, escapeMove, solveEscape } from '../src/minigames.js';

const card = rank => ({ rank: String(rank), suit: '♠', value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank) });
const hand = (...ranks) => ranks.map(card);
const blackjack = (player, dealer, deck = hand('10', '2', '5', '7')) => ({ deck, player: hand(...player), dealer: hand(...dealer), status: 'playing', result: null });

test('blackjack face cards and multiple aces use the best non-busting total', () => {
  assert.equal(handValue(hand('A', 'K')), 21);
  assert.equal(handValue(hand('A', 'A')), 12);
  assert.equal(handValue(hand('A', 'A', '9')), 21);
  assert.equal(handValue(hand('A', 'A', 'K')), 12);
  assert.equal(handValue(hand('A', '6', 'K')), 17);
  assert.equal(handValue(hand('K', 'Q', '2')), 22);
  assert.equal(handValue([]), 0);
});

test('blackjack shuffling is seeded, unique, and does not share mutable cards', () => {
  const one = createBlackjack('same seed');
  const two = createBlackjack('same seed');
  assert.deepEqual(one, two);
  assert.notDeepEqual(one, createBlackjack('another seed'));
  assert.equal(one.deck.length, 48);
  const all = [...one.deck, ...one.player, ...one.dealer];
  assert.equal(new Set(all.map(c => `${c.rank}:${c.suit}`)).size, 52);
  assert.ok(all.every(c => typeof c.rank === 'string' && typeof c.suit === 'string' && c.value >= 2 && c.value <= 11));
  one.player[0].rank = 'tampered';
  assert.notEqual(two.player[0].rank, 'tampered');
});

test('natural blackjack resolves on creation, including double natural pushes', () => {
  const results = new Set();
  for (let seed = 0; seed < 20000 && results.size < 3; seed++) {
    const game = createBlackjack(seed);
    const playerNatural = handValue(game.player) === 21;
    const dealerNatural = handValue(game.dealer) === 21;
    if (playerNatural || dealerNatural) {
      assert.equal(game.status, 'finished');
      assert.equal(game.result, playerNatural && dealerNatural ? 'push' : playerNatural ? 'win' : 'lose');
      results.add(game.result);
    } else {
      assert.equal(game.status, 'playing');
      assert.equal(game.result, null);
    }
  }
  assert.deepEqual([...results].sort(), ['lose', 'push', 'win']);
});

test('hitting is immutable, removes one deck card, and immediately resolves a bust', () => {
  const game = blackjack(['K', '6'], ['10', '7'], hand('9'));
  const before = structuredClone(game);
  const next = blackjackMove(game, 'hit');
  assert.deepEqual(game, before);
  assert.equal(next.player.length, 3);
  assert.equal(next.deck.length, 0);
  assert.equal(next.status, 'finished');
  assert.equal(next.result, 'lose');
  assert.equal(next.dealer.length, 2);
});

test('a hit to 21 completes the dealer turn and a live hand can continue hitting', () => {
  const game = blackjack(['5', '6'], ['10', '7'], hand('K'));
  const next = blackjackMove(game, 'hit');
  assert.equal(next.status, 'finished');
  assert.equal(next.result, 'win');
  const live = blackjackMove(blackjack(['2', '3'], ['10', '7'], hand('4')), 'hit');
  assert.equal(live.status, 'playing');
  assert.equal(handValue(live.player), 9);
});

test('dealer draws to 17, stands on soft 17, and settles win, loss, bust, and push', () => {
  const cases = [
    [blackjack(['10', '8'], ['10', '6'], hand('2')), 'push', 3],
    [blackjack(['10', '8'], ['A', '6'], []), 'win', 2],
    [blackjack(['10', '8'], ['10', '9'], []), 'lose', 2],
    [blackjack(['10', '8'], ['10', '6'], hand('K')), 'win', 3],
    [blackjack(['10', '7'], ['10', '7'], []), 'push', 2],
  ];
  for (const [game, result, dealerLength] of cases) {
    const before = structuredClone(game);
    const next = blackjackMove(game, 'stand');
    assert.equal(next.result, result);
    assert.equal(next.dealer.length, dealerLength);
    assert.equal(next.status, 'finished');
    assert.deepEqual(game, before);
  }
});

test('completed blackjack games cannot be replayed and invalid live moves are rejected', () => {
  const game = blackjackMove(blackjack(['10', '9'], ['10', '7']), 'stand');
  assert.deepEqual(blackjackMove(game, 'hit'), game);
  assert.deepEqual(blackjackMove(game, 'stand'), game);
  assert.throws(() => blackjackMove(blackjack(['2', '3'], ['10', '7']), 'cheat'), /hit or stand/);
});

test('escape selects three distinct authored layouts deterministically with legal starting cells', () => {
  const maps = [0, 1, 2].map(createEscape);
  assert.equal(new Set(maps.map(game => JSON.stringify(game.walls))).size, 3);
  for (const game of maps) {
    assert.deepEqual(game.player, [0, 5]);
    assert.deepEqual(game.guard, [4, 1]);
    assert.deepEqual(game.exit, [5, 0]);
    assert.equal(game.size, 6);
    assert.equal(game.moves, 0);
    for (const point of [game.player, game.guard, game.exit]) assert.ok(!game.walls.some(wall => wall[0] === point[0] && wall[1] === point[1]));
  }
  assert.deepEqual(createEscape('same'), createEscape('same'));
  maps[0].walls[0][0] = 99;
  assert.notEqual(createEscape(0).walls[0][0], 99);
});

test('all authored escape layouts have a proven winning sequence against the live guard', () => {
  for (const seed of [0, 1, 2]) {
    let game = createEscape(seed);
    const original = structuredClone(game);
    const solution = solveEscape(game);
    assert.deepEqual(game, original);
    assert.ok(solution && solution.length > 0, `Map ${seed} must be solvable`);
    for (const direction of solution) {
      const previous = game;
      game = escapeMove(game, direction);
      assert.notEqual(game.status, 'lost', `Map ${seed}: ${direction}`);
      assert.equal(game.moves, previous.moves + 1);
    }
    assert.equal(game.status, 'won', `Map ${seed}`);
    assert.deepEqual(game.player, game.exit);
    assert.equal(game.moves, solution.length);
    assert.deepEqual(solveEscape(game), []);
  }
});

test('escape walls, map edges, and invalid commands consume neither turn nor guard step', () => {
  const game = createEscape(0);
  assert.deepEqual(escapeMove(game, 'left'), game);
  assert.deepEqual(escapeMove(game, 'down'), game);
  assert.deepEqual(escapeMove(game, 'teleport'), game);
  const besideWall = { ...game, player: [0, 2] };
  assert.deepEqual(escapeMove(besideWall, 'right'), besideWall);
});

test('valid moves clone state and guards follow a shortest legal path with fixed tie ordering', () => {
  const game = { ...createEscape(0), walls: [], player: [0, 5], guard: [4, 1] };
  const original = structuredClone(game);
  const next = escapeMove(game, 'up');
  assert.deepEqual(game, original);
  assert.deepEqual(next.player, [0, 4]);
  assert.deepEqual(next.guard, [4, 2]); // Down precedes left for this shortest-path tie.
  assert.equal(next.moves, 1);
  const walled = { ...game, walls: [[4, 2]] };
  assert.deepEqual(escapeMove(walled, 'up').guard, [3, 1]);
});

test('walking into a guard or being caught loses; reaching an unoccupied exit wins', () => {
  const base = { ...createEscape(0), walls: [], player: [0, 5] };
  assert.equal(escapeMove({ ...base, guard: [1, 5] }, 'right').status, 'lost');
  const caught = escapeMove({ ...base, guard: [2, 5] }, 'right');
  assert.equal(caught.status, 'lost');
  assert.deepEqual(solveEscape(caught), null);
  const won = escapeMove({ ...base, player: [4, 0], guard: [0, 5] }, 'right');
  assert.equal(won.status, 'won');
  assert.deepEqual(escapeMove(won, 'left'), won);
  assert.deepEqual(escapeMove(caught, 'up'), caught);
});

test('escape solver identifies a trapped starting position without inventing blocked turns', () => {
  const game = { ...createEscape(0), walls: [[0, 4], [1, 5]] };
  assert.equal(solveEscape(game), null);
});
