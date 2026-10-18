// Self-contained deterministic games. No timers, DOM, external state or network.
const DIRECTIONS = Object.freeze({ up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] });
const DIRECTION_NAMES = Object.keys(DIRECTIONS);

function seedNumber(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0;
  let hash = 2166136261;
  for (const char of String(seed ?? 1)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seedNumber(seed);
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Best non-busting ace total; aces count as eleven until one must become one. */
export function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    const value = card.rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(card.rank) ? 10 : Number(card.rank);
    if (!Number.isInteger(value) || value < 2 || value > 11) throw new Error('The hand contains an invalid card.');
    total += value;
    if (card.rank === 'A') aces += 1;
  }
  while (total > 21 && aces > 0) { total -= 10; aces -= 1; }
  return total;
}

function cloneBlackjack(game) {
  return { ...game, deck: game.deck.map(card => ({ ...card })), player: game.player.map(card => ({ ...card })), dealer: game.dealer.map(card => ({ ...card })) };
}

function draw(game, hand) {
  const card = game.deck.pop();
  if (!card) throw new Error('The deck is empty.');
  hand.push(card);
}

function settle(game) {
  while (handValue(game.dealer) < 17) draw(game, game.dealer);
  const player = handValue(game.player);
  const dealer = handValue(game.dealer);
  game.status = 'finished';
  game.result = player > 21 ? 'lose' : dealer > 21 || player > dealer ? 'win' : player === dealer ? 'push' : 'lose';
  return game;
}

/** A standard 52-card deck, dealt player/dealer/player/dealer. Dealer stands on soft 17. */
export function createBlackjack(seed = 1) {
  const random = seededRandom(seed);
  const deck = [];
  for (const suit of ['♠', '♥', '♦', '♣']) {
    for (const rank of ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']) {
      deck.push({ rank, suit, value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : Number(rank) });
    }
  }
  for (let index = deck.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  const game = { deck, player: [], dealer: [], status: 'playing', result: null };
  draw(game, game.player);
  draw(game, game.dealer);
  draw(game, game.player);
  draw(game, game.dealer);
  const playerNatural = handValue(game.player) === 21;
  const dealerNatural = handValue(game.dealer) === 21;
  if (playerNatural || dealerNatural) {
    game.status = 'finished';
    game.result = playerNatural && dealerNatural ? 'push' : playerNatural ? 'win' : 'lose';
  }
  return game;
}

/** Immutable hit/stand transition. A hit to exactly 21 automatically plays the dealer. */
export function blackjackMove(input, move) {
  const game = cloneBlackjack(input);
  if (game.status !== 'playing') return game;
  if (move !== 'hit' && move !== 'stand') throw new Error('Choose hit or stand.');
  if (move === 'stand') return settle(game);
  draw(game, game.player);
  const total = handValue(game.player);
  if (total > 21) { game.status = 'finished'; game.result = 'lose'; }
  else if (total === 21) settle(game);
  return game;
}

// Authored floor plans keep the perimeter open, with different interior corridors.
// Each can be solved against the same shortest-path guard (verified by BFS tests).
const ESCAPE_MAPS = [
  [
    [1, 1], [2, 1], [3, 1],
    [1, 2], [2, 2], [3, 2], [4, 2],
    [1, 3], [2, 3], [3, 3], [4, 3],
    [1, 4], [2, 4], [3, 4], [4, 4],
  ],
  [
    [2, 1], [3, 1], [1, 2], [2, 2], [3, 2],
    [1, 3], [2, 3], [3, 3], [4, 3],
    [2, 4], [3, 4], [4, 4],
  ],
  [
    [1, 1], [2, 1], [1, 2], [2, 2], [3, 2], [4, 2],
    [2, 3], [3, 3], [4, 3], [1, 4], [2, 4], [3, 4],
  ],
];

const same = (one, other) => one[0] === other[0] && one[1] === other[1];
const pointKey = point => `${point[0]},${point[1]}`;
const stateKey = game => `${pointKey(game.player)}:${pointKey(game.guard)}`;

function floor(game, point) {
  return point[0] >= 0 && point[1] >= 0 && point[0] < game.size && point[1] < game.size && !game.walls.some(wall => same(wall, point));
}

function cloneEscape(game) {
  return { ...game, walls: game.walls.map(wall => [...wall]), player: [...game.player], guard: [...game.guard], exit: [...game.exit] };
}

/** Guard chooses the first shortest step in stable up/right/down/left order. */
function guardStep(game) {
  const queue = [[...game.player]];
  const distances = new Map([[pointKey(game.player), 0]]);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    for (const direction of DIRECTION_NAMES) {
      const delta = DIRECTIONS[direction];
      const next = [current[0] + delta[0], current[1] + delta[1]];
      const key = pointKey(next);
      if (!floor(game, next) || distances.has(key)) continue;
      distances.set(key, distances.get(pointKey(current)) + 1);
      queue.push(next);
    }
  }
  const distance = distances.get(pointKey(game.guard));
  if (!distance) return;
  for (const direction of DIRECTION_NAMES) {
    const delta = DIRECTIONS[direction];
    const next = [game.guard[0] + delta[0], game.guard[1] + delta[1]];
    if (distances.get(pointKey(next)) === distance - 1) { game.guard = next; return; }
  }
}

export function createEscape(seed = 1) {
  return { size: 6, walls: ESCAPE_MAPS[seedNumber(seed) % ESCAPE_MAPS.length].map(wall => [...wall]), player: [0, 5], guard: [4, 1], exit: [5, 0], status: 'playing', moves: 0 };
}

/** Blocked moves consume no turn. A player cannot walk through the guard. */
export function escapeMove(input, direction) {
  const game = cloneEscape(input);
  if (game.status !== 'playing' || !Object.hasOwn(DIRECTIONS, direction)) return game;
  const delta = DIRECTIONS[direction];
  const destination = [game.player[0] + delta[0], game.player[1] + delta[1]];
  if (!floor(game, destination)) return game;
  game.player = destination;
  game.moves += 1;
  if (same(game.player, game.guard)) { game.status = 'lost'; return game; }
  if (same(game.player, game.exit)) { game.status = 'won'; return game; }
  guardStep(game);
  if (same(game.player, game.guard)) game.status = 'lost';
  return game;
}

/** Breadth-first joint player/guard search; returns a shortest winning sequence or null. */
export function solveEscape(input) {
  if (input.status === 'won') return [];
  if (input.status !== 'playing') return null;
  const queue = [{ game: cloneEscape(input), path: [] }];
  const visited = new Set([stateKey(input)]);
  for (let index = 0; index < queue.length; index++) {
    const { game, path } = queue[index];
    for (const direction of DIRECTION_NAMES) {
      const next = escapeMove(game, direction);
      if (next.status === 'lost' || next.moves === game.moves) continue;
      const solution = [...path, direction];
      if (next.status === 'won') return solution;
      const key = stateKey(next);
      if (!visited.has(key)) { visited.add(key); queue.push({ game: next, path: solution }); }
    }
  }
  return null;
}
