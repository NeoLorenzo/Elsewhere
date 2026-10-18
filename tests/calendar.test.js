import test from 'node:test';
import assert from 'node:assert/strict';
import { validateYear, calendarYearAtAge, advanceCalendarYear, formatYear } from '../src/calendar.js';

test('historical calendar crosses directly between 1 BCE and 1 CE in either direction', () => {
  assert.equal(advanceCalendarYear(-2), -1);
  assert.equal(advanceCalendarYear(-1), 1);
  assert.equal(advanceCalendarYear(1), 2);
  assert.equal(calendarYearAtAge(-20, 20), 1);
  assert.equal(calendarYearAtAge(1, -1), -1);
  assert.equal(calendarYearAtAge(10, -20), -11);
  assert.equal(calendarYearAtAge(-44, 0), -44);
});

test('calendar offsets remain exact for remote historical and future years', () => {
  for (const birth of [-9007199254740000, -1000000, -1, 1, 2026, 9007199254740000]) {
    const current = calendarYearAtAge(birth, 120);
    assert.equal(calendarYearAtAge(current, -120), birth);
    assert.ok(Number.isSafeInteger(current));
    assert.notEqual(current, 0);
  }
  assert.equal(calendarYearAtAge(-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER), 1);
  assert.throws(() => advanceCalendarYear(Number.MAX_SAFE_INTEGER), /range/);
  assert.throws(() => calendarYearAtAge(-Number.MAX_SAFE_INTEGER, -1), /range/);
});

test('year validation rejects fractions, zero, coercion and unsafe values', () => {
  assert.equal(validateYear(' -44 '), -44);
  assert.equal(validateYear('+2026'), 2026);
  assert.equal(validateYear(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
  for (const invalid of [0, -0, '0', 1.5, '1.5', '', null, true, {}, Infinity, NaN, '44 BCE', '1e3', Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => validateYear(invalid), /historical year/);
    assert.equal(validateYear(invalid, -10), -10);
  }
  assert.throws(() => calendarYearAtAge(1, .5), /offset/);
  assert.throws(() => validateYear(0, 0), /historical year/);
});

test('year labels expose the era without a misleading year zero', () => {
  assert.equal(formatYear(-44), '44 BCE');
  assert.equal(formatYear(-1), '1 BCE');
  assert.equal(formatYear(2026), '2026 CE');
  assert.throws(() => formatYear(0), /historical year/);
});
