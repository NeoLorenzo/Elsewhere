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

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const integerPart = value => typeof value === 'number' && Number.isInteger(value) ? value
  : typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN;

export function daysInMonth(year, month) {
  const historical = validateYear(year);
  month = integerPart(month);
  if (month < 1 || month > 12 || !Number.isInteger(month)) throw new RangeError('Choose a month from 1 to 12.');
  const astronomical = historical < 0 ? historical + 1 : historical;
  const leap = astronomical % 4 === 0 && (astronomical % 100 !== 0 || astronomical % 400 === 0);
  return month === 2 ? leap ? 29 : 28 : [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function validateBirthDate(raw, birthYear) {
  const value = raw === undefined ? {} : raw;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RangeError('Enter a valid date of birth.');
  const year = validateYear(birthYear === undefined ? value.year ?? 2026 : birthYear);
  if (year < 1900) throw new RangeError('New lives must have a birth year of 1900 or later.');
  if (value.year !== undefined && validateYear(value.year) !== year) throw new RangeError('The date of birth must match the birth year.');
  const month = value.month === undefined ? 1 : integerPart(value.month);
  const day = value.day === undefined ? 1 : integerPart(value.day);
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month)) throw new RangeError('Choose a valid day for the birth month and year.');
  return { year, month, day };
}

/** Save import fallback: preserve valid portions, clamp impossible days, and use January when month is invalid. */
export function normalizeBirthDate(raw, birthYear) {
  const value = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const year = validateYear(birthYear, validateYear(value.year, 2026));
  const parsedMonth = integerPart(value.month);
  const month = parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : 1;
  const parsedDay = integerPart(value.day);
  const day = Number.isInteger(parsedDay) && parsedDay >= 1 ? Math.min(parsedDay, daysInMonth(year, month)) : 1;
  return { year, month, day };
}

export function dateAtAge(birthDate, age) {
  if (!birthDate || typeof birthDate !== 'object') throw new RangeError('Enter a valid date of birth.');
  const year = validateYear(birthDate.year);
  const month = integerPart(birthDate.month), day = integerPart(birthDate.day);
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month)) throw new RangeError('Enter a valid date of birth.');
  const currentYear = calendarYearAtAge(year, age);
  return { year: currentYear, month, day: Math.min(day, daysInMonth(currentYear, month)) };
}

export function formatDate(date) {
  if (!date || typeof date !== 'object') throw new RangeError('Enter a valid date.');
  const year = validateYear(date.year), month = integerPart(date.month), day = integerPart(date.day);
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth(year, month)) throw new RangeError('Enter a valid date.');
  return `${day} ${MONTH_NAMES[month - 1]} ${year < 0 ? `${Math.abs(year)} BCE` : year}`;
}
