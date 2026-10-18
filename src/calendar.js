// Historical year labels use BCE/CE with no year zero. BigInt keeps crossings and
// very large integer dates exact without relying on JavaScript Date's limits.
const LIMIT = BigInt(Number.MAX_SAFE_INTEGER);

function parseYear(input) {
  if (typeof input === 'number' && Number.isSafeInteger(input) && input !== 0) return input;
  if (typeof input === 'string' && /^[+-]?\d+$/.test(input.trim())) {
    const value = BigInt(input.trim());
    if (value !== 0n && value >= -LIMIT && value <= LIMIT) return Number(value);
  }
  throw new RangeError('Enter a nonzero historical year within the safe integer range. Use a negative number for BCE.');
}

export function validateYear(input, fallback) {
  try { return parseYear(input); }
  catch (error) { if (fallback !== undefined) return parseYear(fallback); throw error; }
}

export function calendarYearAtAge(birthYear, age) {
  const year = validateYear(birthYear);
  if (!Number.isSafeInteger(age)) throw new RangeError('The calendar offset must be a safe integer.');
  // Map 1 BCE to index -1, 1 CE to index 0, then restore historical notation.
  const index = BigInt(year) - (year > 0 ? 1n : 0n) + BigInt(age);
  const result = index >= 0n ? index + 1n : index;
  if (result < -LIMIT || result > LIMIT) throw new RangeError('The requested date exceeds the safe integer calendar range.');
  return Number(result);
}

export function advanceCalendarYear(year) { return calendarYearAtAge(year, 1); }

export function formatYear(year) {
  const value = validateYear(year);
  return `${Math.abs(value)} ${value < 0 ? 'BCE' : 'CE'}`;
}
