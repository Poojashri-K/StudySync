// Shared date helpers.
//
// All "calendar day" comparisons in this app are done using UTC date
// components. Dates coming from <input type="date"> on the frontend are
// parsed by the browser/JS as UTC midnight (e.g. new Date("2026-07-18") ->
// 2026-07-18T00:00:00.000Z), so comparing calendar days using UTC getters
// keeps behaviour identical no matter what timezone the Node server itself
// happens to be running in. Using local-time getters here would shift the
// "day" a task falls on depending on server timezone, which is exactly the
// kind of bug this file exists to avoid.

// Normalizes any date to midnight UTC on that same calendar day.
const startOfDayUTC = (input = new Date()) => {
  const d = new Date(input);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// Returns a new Date `n` days after `input` (n may be negative), normalized to UTC midnight.
const addDays = (input, n) => {
  const d = startOfDayUTC(input);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
};

// True if `a` and `b` fall on the same UTC calendar day.
const isSameUTCDay = (a, b) => startOfDayUTC(a).getTime() === startOfDayUTC(b).getTime();

// True if calendar day `a` is strictly before calendar day `b`.
const isBeforeUTCDay = (a, b) => startOfDayUTC(a).getTime() < startOfDayUTC(b).getTime();

// True if calendar day `a` is strictly after calendar day `b`.
const isAfterUTCDay = (a, b) => startOfDayUTC(a).getTime() > startOfDayUTC(b).getTime();

// Whole number of calendar days between `a` and `b` (b - a).
const daysBetween = (a, b) =>
  Math.round((startOfDayUTC(b).getTime() - startOfDayUTC(a).getTime()) / 86400000);

// Stable YYYY-MM-DD key for grouping/workload maps.
const toISODateString = (input) => startOfDayUTC(input).toISOString().slice(0, 10);

module.exports = {
  startOfDayUTC,
  addDays,
  isSameUTCDay,
  isBeforeUTCDay,
  isAfterUTCDay,
  daysBetween,
  toISODateString,
};
