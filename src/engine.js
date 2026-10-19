import { COUNTRIES, FIRST_NAMES, LAST_NAMES, EVENTS, ACHIEVEMENTS } from './data.js';
import { ensureCharacter, reconcileCharacter, ageCharacter, personalityModifier, overallHealth, HEALTH_COMPONENTS } from './character.js';
import { validateYear, calendarYearAtAge, advanceCalendarYear, validateBirthDate, normalizeBirthDate, dateAtAge } from './calendar.js';
import { countryForYear } from './countries.js';
import { normalizeBackground, validateBackground, BACKGROUND_COLLECTIONS } from './background.js';
import { syncBackgroundProgress } from './background-events.js';

export const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, Number.isFinite(Number(n)) ? Number(n) : min));
const copy = value => structuredClone(value);
const money = n => Math.round(Number.isFinite(Number(n)) ? clamp(Number(n), -1e15, 1e15) : 0);
const text = (value, fallback = '', max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : fallback;
const number = (value, fallback = 0, min = 0, max = 100) => Number.isFinite(Number(value)) ? clamp(Number(value), min, max) : fallback;
const list = (value, max = 1000) => Array.isArray(value) ? value.slice(0, max) : [];
const statNames = ['happiness', 'health', 'smarts', 'looks', 'discipline', 'karma', 'fame'];
const profileKeys = ['appearance', 'personality', 'attributes', 'body', 'healthProfile'];
const profileOptions = source => Object.fromEntries(profileKeys.filter(key => source?.[key] && typeof source[key] === 'object' && !Array.isArray(source[key])).map(key => [key, copy(source[key])]));
const birthAt = (year, age) => calendarYearAtAge(year, -age);
const parentRoles = ['mother', 'father', 'parent'];

function validateParentWealth(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 1e15) throw new RangeError('Parent net worth must be a finite amount from -1,000,000,000,000,000 to 1,000,000,000,000,000.');
  return value;
}

const importedParentWealth = value => value === undefined ? 50000 : typeof value === 'number' && Number.isFinite(value) ? clamp(value, -1e15, 1e15) : 0;
const backgroundContext = state => ({ birthYear: state.birthYear, age: state.age, year: state.year });

function applyBackgroundGameplay(state) {
  const background = state.background;
  if (background.educationMode !== 'unspecified') {
    const rank = { none: 0, primary: 1, secondary: 2, trade: 2, university: 3, graduate: 4, other: 0 };
    const records = background.educationMode === 'recorded' ? background.education : [];
    const completed = records.filter(row => row.status === 'completed' && (row.endYear ?? row.startYear) <= state.year)
      .sort((a, b) => (rank[b.level] || 0) - (rank[a.level] || 0) || (b.endYear ?? b.startYear) - (a.endYear ?? a.startYear))[0];
    const attending = records.filter(row => row.status === 'attending' && row.startYear <= state.year && (row.endYear === null || row.endYear >= state.year))
      .sort((a, b) => b.startYear - a.startYear)[0];
    const numericGrade = Number((attending || completed)?.grade);
    state.education = { level: completed && completed.level !== 'other' ? completed.level : 'none', enrolled: null, yearsLeft: 0,
      grades: Number.isFinite(numericGrade) && (attending || completed)?.grade !== '' ? clamp(numericGrade) : state.education.grades,
      major: completed?.field || null, institution: completed?.institution || '', qualification: completed?.qualification || '', resumeId: completed?.id || null, plannedEndYear: null };
    if (attending) {
      const duration = ({ primary: 6, secondary: 7, trade: 2, university: 4, graduate: 3 })[attending.level] || 1;
      const automaticSchool=attending.source==='game'&&['primary','secondary'].includes(attending.level)&&state.age<18;
      state.education.enrolled = attending.level;
      state.education.yearsLeft = automaticSchool?18-state.age:Math.round(clamp(attending.endYear === null ? duration - (state.year - attending.startYear) : attending.endYear - state.year, 1, 160));
      state.education.customSchedule=!automaticSchool;
      state.education.major = attending.field || null;
      state.education.institution = attending.institution;
      state.education.qualification = attending.qualification;
      state.education.resumeId = attending.id;
      state.education.plannedEndYear = attending.endYear;
    }
  }
  if (background.employmentMode !== 'unspecified') {
    const current = background.employmentMode === 'recorded' ? background.workExperience.filter(row => row.current && row.startYear <= state.year)
      .sort((a, b) => Number(b.employmentType==='full-time')-Number(a.employmentType==='full-time') || b.startYear-a.startYear)[0] : null;
    if (!current) state.job = null;
    else state.job = { id: state.job?.resumeId === current.id ? state.job.id : `custom:${current.id}`,
      title: current.title, employer: current.employer, employmentType:current.employmentType, resumeId: current.id,
      salary: money(number(current.annualSalary, 0, 0, 1e12)), performance: state.job?.resumeId === current.id ? state.job.performance : 55,
      years: Math.max(0, state.year - current.startYear) };
  }
}

function startingAge(value) {
  if (value === undefined) return 0;
  const age = typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value.trim()) : value;
  if (typeof age !== 'number' || !Number.isInteger(age) || age < 0 || age > 120) throw new RangeError('Choose a whole-number starting age from 0 to 120.');
  return age;
}

function migrateCalendar(raw) {
  const age = Math.floor(number(raw.age, 0, 0, 120));
  const birthYear = validateYear(raw.birthYear, validateYear(raw.birthDate?.year, birthAt(validateYear(raw.year, 2026), age)));
  if (birthYear >= 1900) return false;
  const index = year => BigInt(year) - (year > 0 ? 1n : 0n);
  const offset = index(1900) - index(birthYear);
  const shift = value => {
    let year;
    try { year = validateYear(value); } catch { return value; }
    const shifted = index(year) + offset;
    const historical = shifted >= 0n ? shifted + 1n : shifted;
    const limit = BigInt(Number.MAX_SAFE_INTEGER);
    return Number(historical < -limit ? -limit : historical > limit ? limit : historical);
  };
  raw.originalBirthYear = validateYear(raw.originalBirthYear, birthYear);
  raw.birthYear = 1900;
  raw.year = calendarYearAtAge(1900, age);
  if (raw.birthDate && typeof raw.birthDate === 'object') raw.birthDate.year = 1900;
  if (raw.date && typeof raw.date === 'object') raw.date.year = raw.year;
  const shiftBackground = background => {
    for (const collection of BACKGROUND_COLLECTIONS) for (const row of list(background?.[collection], 100)) if (row && typeof row === 'object') {
      for (const key of ['startYear', 'endYear', 'year', 'expiryYear']) if (row[key] !== undefined && row[key] !== null) row[key] = shift(row[key]);
    }
  };
  shiftBackground(raw.background);
  for (const person of list(raw.relationships, 250)) if (person && typeof person === 'object') {
    if (person.birthYear !== undefined) person.birthYear = shift(person.birthYear);
    if (person.year !== undefined) person.year = shift(person.year);
    if (person.birthDate && typeof person.birthDate === 'object' && person.birthDate.year !== undefined) person.birthDate.year = shift(person.birthDate.year);
    shiftBackground(person.background);
  }
  for (const record of [...list(raw.journal, 1800), ...list(raw.history, 1000), ...list(raw.ancestors, 100)]) {
    if (record && typeof record === 'object') {
      if (record.year !== undefined) record.year = shift(record.year);
      if (record.birthYear !== undefined) record.birthYear = shift(record.birthYear);
    }
  }
  return true;
}

function ensureHuman(entity, year, options = {}) {
  if (entity.role === 'pet' || entity.species) return entity;
  entity.birthYear = validateYear(entity.birthYear, birthAt(year, entity.age));
  ensureCharacter(entity, options);
  return entity;
}

function applyStats(entity, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return;
  for (const key of statNames) if (typeof patch[key] === 'number' && Number.isFinite(patch[key])) entity.stats[key] = clamp(patch[key]);
}

function initializeCharacters(state, options = {}) {
  const parents = state.relationships.filter(person => ['mother', 'father', 'parent'].includes(person.role));
  for (const parent of parents) {
    const patch = options.parents?.[parent.role] || {};
    if (patch.age !== undefined) parent.age = Math.floor(number(patch.age, parent.age, 16, 160));
    if (typeof patch.name === 'string' && patch.name.trim()) parent.name = text(patch.name);
    parent.netWorth = patch.netWorth === undefined ? 50000 : validateParentWealth(patch.netWorth);
    parent.birthYear = birthAt(state.year, parent.age);
    ensureHuman(parent, state.year, { ...profileOptions(patch), seed: state.seed });
  }
  ensureHuman(state, state.year, { ...profileOptions(options), parents, seed: state.seed });
}

function seedValue(seed) {
  if (Number.isFinite(Number(seed)) && seed !== '' && seed != null) return Number(seed) >>> 0;
  if (typeof seed === 'string') {
    let hash = 2166136261;
    for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return hash >>> 0;
  }
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

export function random(state) {
  state.rng = (Math.imul((state.rng ?? state.seed) >>> 0, 1664525) + 1013904223) >>> 0;
  return state.rng / 4294967296;
}

const pick = (state, items) => items[Math.floor(random(state) * items.length)];
const roll = (state, low, high) => low + Math.floor(random(state) * (high - low + 1));
const uid = (state, prefix) => `${prefix}-${state.age}-${Math.floor(random(state) * 0xffffffff).toString(36)}`;
const countryFor = (value, year = 2026) => countryForYear(value, year) || countryForYear('uk', year) || COUNTRIES[0];
const cityAlias = (country, city) => Object.hasOwn(country?.cityAliases || {}, city) ? text(country.cityAliases[city], city) : city;
const living = (state, role) => state.relationships.filter(r => r.alive && (!role || r.role === role));

export function addLog(state, category, title, message) {
  state.journal ??= [];
  state.flags ??= {};
  state.flags.logSequence = (Number(state.flags.logSequence) || 0) + 1;
  state.journal.push({ id: `${state.id}-${state.flags.logSequence}`, age: state.age, year: state.year,
    category: text(category, 'life', 40), title: text(title, 'Life update'), text: text(message, '', 3000) });
  if (state.journal.length > 1800) state.journal.splice(0, state.journal.length - 1800);
}

function educationAt(age) {
  if (age < 5) return { level: 'none', enrolled: null, yearsLeft: 0, grades: 65, major: null };
  if (age < 18) return { level: 'none', enrolled: age < 11 ? 'primary' : 'secondary', yearsLeft: 18 - age, grades: 65, major: null };
  return { level: 'secondary', enrolled: null, yearsLeft: 0, grades: 65, major: null };
}

export function createLife(options = {}) {
  const seed = seedValue(options.seed);
  const gender = ['female', 'male', 'neutral'].includes(options.gender) ? options.gender : 'neutral';
  const age = startingAge(options.age);
  const birthYear = options.birthYear === undefined ? validateYear(options.birthDate?.year, birthAt(2026, age)) : validateYear(options.birthYear);
  if (birthYear < 1900) throw new RangeError('New lives must have a birth year of 1900 or later.');
  if (Math.abs(birthYear) > Number.MAX_SAFE_INTEGER - 256) throw new RangeError('Choose a birth year with at least 256 years of safe calendar headroom.');
  const year = calendarYearAtAge(birthYear, age);
  const birthDate = validateBirthDate(options.birthDate, birthYear);
  const country = countryFor(options.country, year);
  const requestedCity = text(options.city);
  const city = cityAlias(country, requestedCity);
  const state = {
    version: 1, id: `life-${seed.toString(36)}`, seed, rng: seed, firstName: '', lastName: '', gender,
    country: country?.id || 'uk', city: city || (country?.cities?.includes('London') ? 'London' : country?.cities?.[0] || 'London'),
    age, birthYear, birthDate, date: dateAtAge(birthDate, age), year, alive: true, causeOfDeath: null,
    stats: { happiness: 75, health: 90, smarts: 50, looks: 50, discipline: 50, karma: 65, fame: 0 },
    cash: 0, debt: 0, education: educationAt(age), job: null, relationships: [], assets: [], investments: [],
    business: null, specialCareer: null, prison: { years: 0, record: 0, heat: 0 },
    skills: { fitness: 0, music: 0, acting: 0, athletics: 0, writing: 0, coding: 0, crime: 0 },
    conditions: [], licenses: [], social: { followers: 0, posts: 0 }, journal: [], achievements: [], history: [],
    flags: {}, annual: { income: 0, tax: 0, expenses: 0, net: 0 }, pendingEvent: null, minigame: null,
    generation: 1, ancestors: [], actionCounts: {},
  };
  state.firstName = text(options.firstName) || pick(state, FIRST_NAMES[gender] || FIRST_NAMES.neutral || FIRST_NAMES.male);
  state.lastName = text(options.lastName) || pick(state, LAST_NAMES);
  state.id = `life-${seed.toString(36)}-${Math.floor(random(state) * 1e8).toString(36)}`;
  for (const key of ['smarts', 'looks', 'discipline']) state.stats[key] = roll(state, 30, 85);
  if(age<18)state.stats.smarts=Math.round(state.stats.smarts*age/18);
  state.relationships = ['mother', 'father'].map((role, index) => ({
    id: uid(state, role), name: `${pick(state, FIRST_NAMES[index ? 'male' : 'female'])} ${state.lastName}`,
    role, age: age + roll(state, 21, 37), bond: roll(state, 65, 100), alive: true, gender: index ? 'male' : 'female',
  }));
  applyStats(state, options.stats);
  initializeCharacters(state, options);
  state.background = options.background === undefined ? normalizeBackground(null, backgroundContext(state)) : validateBackground(options.background, backgroundContext(state));
  applyBackgroundGameplay(state);
  addLog(state, 'life', age ? 'A new chapter' : 'Hello, world', age
    ? `My story begins at age ${age} in ${state.city}, ${country?.name || state.country}.`
    : `I was born in ${state.city}, ${country?.name || state.country}. My name is ${state.firstName} ${state.lastName}.`);
  addLog(state, 'relationships', 'The people at the beginning', `My mother is ${state.relationships[0].name}, age ${state.relationships[0].age}. My father is ${state.relationships[1].name}, age ${state.relationships[1].age}. This is where my family story begins.`);
  if (age === 0) addLog(state, 'life', 'Small beginnings', 'For now, my world is warm blankets, unfamiliar faces, and a family getting to know me. Every birthday will open a little more of the world.');
  if (state.education.enrolled) addLog(state, 'education', 'School days', 'I am attending school and discovering what interests me.');
  return state;
}

export function netWorth(state) {
  return money((Number(state.cash) || 0) - (Number(state.debt) || 0)
    + (state.assets || []).reduce((sum, asset) => sum + (Number(asset.value) || 0) - (Number(asset.mortgage) || 0), 0)
    + (state.investments || []).reduce((sum, investment) => sum + (Number(investment.value) || 0), 0)
    + (Number(state.business?.value) || 0));
}

function grant(state, id) {
  if (state.achievements.includes(id) || !ACHIEVEMENTS.some(a => a.id === id)) return;
  state.achievements.push(id);
  const achievement = ACHIEVEMENTS.find(a => a.id === id);
  addLog(state, 'achievement', achievement.title, achievement.description);
}

export function checkAchievements(state) {
  const checks = {
    adulthood: state.age >= 18, adult: state.age >= 18, graduate: ['university', 'graduate'].includes(state.education.level),
    scholar: state.education.level === 'graduate', millionaire: netWorth(state) >= 1000000,
    billionaire: netWorth(state) >= 1000000000, centenarian: state.age >= 100,
    parent: living(state, 'child').length > 0, family: living(state, 'child').length >= 3,
    married: state.relationships.some(r => r.alive && ['spouse', 'husband', 'wife'].includes(r.role)),
    entrepreneur: !!state.business, mogul: (state.business?.value || 0) >= 1000000,
    famous: state.stats.fame >= 75, celebrity: state.stats.fame >= 75, influencer: state.social.followers >= 100000,
    homeowner: state.assets.some(a => ['house', 'property', 'real-estate', 'real_estate', 'home'].includes(a.type)),
    investor: state.investments.length >= 3, survivor: state.age >= 80,
    legacy: state.generation > 1, dynasty: state.generation >= 3,
    freedom: state.flags.released === true, fit: state.skills.fitness >= 90,
    genius: state.stats.smarts >= 95, happiness: state.stats.happiness >= 100,
    first_job: !!state.job, employed: !!state.job, debt_free: state.age >= 30 && state.debt === 0 && state.cash >= 10000,
    golden_years: state.age >= 65 && netWorth(state) >= 250000,
    athlete: state.skills.athletics >= 90,
    artist: Math.max(state.skills.music, state.skills.acting, state.skills.writing) >= 90,
    polymath: Object.values(state.skills).filter(value => value >= 70).length >= 4,
    collector: state.assets.length >= 5,
    clean_slate: state.flags.released === true && state.prison.years === 0 && !!state.job,
    comeback: state.flags.released === true && state.cash >= 100000,
    philanthropist: (state.flags.donated || state.flags.totalDonated || 0) >= 100000,
    globetrotter: (Number(state.flags.travelCount) || 0) + Math.max(Number(state.flags.countriesVisited) || 0, Number(state.flags.emigrations) || 0) >= 5,
  };
  // Content can supply explicit milestones without coupling the engine to its prose.
  for (const item of ACHIEVEMENTS) {
    let unlocked = checks[item.id] === true;
    if (item.stat && Number.isFinite(item.threshold)) unlocked ||= Number(state.stats[item.stat]) >= item.threshold;
    if (unlocked) grant(state, item.id);
  }
}

function finishEducation(state) {
  const school = state.education;
  const enrolled = typeof school.enrolled === 'object' ? school.enrolled.level || school.enrolled.type : school.enrolled;
  if (!enrolled) return;
  if (['primary', 'secondary', 'school'].includes(enrolled)) {
    if (school.customSchedule) {
      school.yearsLeft = Math.max(0, school.yearsLeft - 1);
      if (!school.yearsLeft) {
        if (school.grades >= 25) {
          const rank = { none: 0, primary: 1, secondary: 2, trade: 2, university: 3, graduate: 4 };
          const earned = enrolled === 'primary' ? 'primary' : 'secondary';
          if ((rank[earned] || 0) >= (rank[school.level] || 0)) school.level = earned;
          addLog(state, 'education', 'Course completed', `I completed ${school.qualification || enrolled} at ${school.institution || 'my school'}.`);
        } else addLog(state, 'education', 'An unfinished course', 'My grades were too low to complete my course.');
        school.enrolled = null;
      }
      return;
    }
    school.yearsLeft = Math.max(0, 18 - state.age);
    if (state.age >= 18) {
      school.level = 'secondary'; school.enrolled = null;
      addLog(state, 'education', 'School graduation', `I completed secondary school with grades of ${school.grades}%.`);
    } else if (state.age === 11) {
      school.enrolled = 'secondary';
      addLog(state, 'education', 'Secondary school', 'I moved on to secondary school.');
    }
  } else {
    school.yearsLeft = Math.max(0, school.yearsLeft - 1);
    if (!school.yearsLeft) {
      if (school.grades < 25) {
        addLog(state, 'education', 'An unfinished degree', 'My grades were too low to graduate. I left my course without a qualification.');
      } else {
        const qualification = enrolled === 'other' ? null : enrolled === 'trade' ? 'trade' : ['graduate', 'medical', 'law', 'doctorate'].includes(enrolled) ? 'graduate' : 'university';
        const rank = { none: 0, primary: 0, secondary: 1, trade: 1, university: 2, graduate: 3 };
        if (qualification && (rank[qualification] || 0) >= (rank[school.level] || 0)) school.level = qualification;
        addLog(state, 'education', 'Degree completed', `I graduated${school.major ? ` in ${school.major}` : ''} with grades of ${school.grades}%.`);
      }
      school.enrolled = null;
    }
  }
}

function annualEducation(state) {
  if(state.age<5)state.stats.smarts=clamp(state.stats.smarts+1);
  if (state.age === 5 && state.education.level === 'none' && !state.education.enrolled) {
    state.education.enrolled = 'primary'; state.education.yearsLeft = 13;
    addLog(state, 'education', 'First day of school', 'I started primary school, made new friends, and learned my way around a classroom.');
  }
  if (state.education.enrolled) {
    const learning = personalityModifier(state, 'learning');
    const aptitude = clamp((state.attributes.iq - 100) / 30, -2, 2);
    state.education.grades = Math.round(clamp(state.education.grades + roll(state, -7, 4) + (state.stats.discipline - 45) / 15 + (learning - 1) * 6 + aptitude));
    state.stats.smarts = clamp(state.stats.smarts + (1+roll(state, 0, 2)) * learning);
    finishEducation(state);
  }
}

function annualRelationships(state) {
  for (const person of state.relationships) {
    if (!person.alive) continue;
    person.age++;
    person.bond = Math.round(clamp(person.bond + roll(state, -5, 2)));
    const pet = person.role === 'pet';
    if (pet) person.health = clamp((person.health ?? 80) - roll(state, person.age > 10 ? 3 : 0, person.age > 10 ? 10 : 4));
    if(!pet&&person.healthProfile&&person.age>45){const loss=(person.age>75?.8:.2)/personalityModifier(person,'recovery');for(const component of HEALTH_COMPONENTS)person.healthProfile[component.id]=clamp(person.healthProfile[component.id]-loss);}
    const baseRisk = pet ? person.age > 16 ? .22 : person.age > 10 ? .08 : .006
      : person.age > 100 ? .3 : person.age > 85 ? .09 : person.age > 70 ? .025 : .001;
    const risk=pet?baseRisk:baseRisk*clamp(1+(60-overallHealth(person))/100,.65,1.65);
    if (person.age >= (pet ? 22 : 115) || (pet ? person.health <= 0 : overallHealth(person)<=0) || random(state) < risk) {
      person.alive = false;
      state.stats.happiness = clamp(state.stats.happiness - (person.bond > 60 ? 18 : 7));
      addLog(state, 'relationships', 'A goodbye', `My ${person.role} ${person.name} died at the age of ${person.age}.`);
      if (parentRoles.includes(person.role) && state.age >= 18 && person.bond > 35) {
        const inheritance = person.netWorth === undefined ? roll(state, 1000, 22000) : Math.max(0, Number(person.netWorth) || 0);
        person.netWorth = 0;
        state.cash = money(state.cash + inheritance);
        if (inheritance > 0) addLog(state, 'finance', 'An inheritance', `I inherited ${inheritance.toLocaleString('en-US')} from ${person.name}'s estate.`);
      }
    }
  }
}

function annualFinances(state, incarcerated) {
  const country = countryFor(state.country, state.year);
  let income = 0, tax = 0, expenses = 0;
  if (state.job && !incarcerated) {
    state.job.years++;
    state.job.performance = Math.round(clamp(state.job.performance + roll(state, -7, 5) + (state.stats.discipline - 50) / 20 + (personalityModifier(state, 'work') - 1) * 8 + clamp((state.attributes.iq - 100) / 50, -1, 1)));
    if (state.job.performance < 12 && random(state) < .6) {
      addLog(state, 'career', 'Dismissed', `I lost my job as ${state.job.title} after a difficult year at work.`);
      state.job = null; state.stats.happiness = clamp(state.stats.happiness - 12);
    } else {
      if (state.job.performance >= 78 && state.job.years % 3 === 0) {
        state.job.salary = money(state.job.salary * 1.12);
        addLog(state, 'career', 'Work recognised', `My strong performance earned a pay rise. My salary is now ${state.job.salary.toLocaleString('en-US')}.`);
      }
      income += state.job.salary;
    }
  }
  if (state.specialCareer && !incarcerated) {
    const career = state.specialCareer;
    career.performance = Math.round(clamp(career.performance + roll(state, -8, 7)));
    career.level = Math.min(100, (career.level || 1) + (career.performance > 65 ? 1 : 0));
    const earnings = money(Math.max(1000, career.earnings || 12000) * (0.75 + random(state) * .6));
    career.earnings = earnings; income += earnings;
    state.stats.fame = clamp(state.stats.fame + (career.performance > 45 ? roll(state, 1, 5) : -3));
    addLog(state, 'special', career.title, `My career earned ${earnings.toLocaleString('en-US')} this year. My standing is ${career.performance}%.`);
  }
  if (state.business) {
    const company = state.business;
    company.performance = Math.round(clamp(company.performance + roll(state, -14, 10) + (state.stats.smarts - 50) / 20 - (incarcerated ? 12 : 0)));
    const margin = (company.performance - 38) / 100;
    company.profit = money((company.capital || company.value * .2 || 10000) * margin + roll(state, -1500, 1500) - company.employees * 1200);
    const distribution = money(Math.max(0, company.profit) * .35);
    const reserveChange = company.profit - distribution;
    const reserve = company.capital + reserveChange;
    company.capital = money(Math.max(0, reserve));
    company.value = money(Math.max(0, company.value + reserveChange));
    income += distribution;
    expenses += Math.max(0, -reserve);
    addLog(state, 'business', `${company.name}: annual results`, `After payroll, the business ${company.profit >= 0 ? 'made' : 'lost'} ${Math.abs(company.profit).toLocaleString('en-US')}. I received ${distribution.toLocaleString('en-US')}; operating reserves are ${company.capital.toLocaleString('en-US')}. Its estimated value is ${company.value.toLocaleString('en-US')}.`);
    if (company.value <= 0 || company.performance <= 2) {
      addLog(state, 'business', 'Business closed', `${company.name} could no longer keep trading.`); state.business = null;
    }
  }
  for (const asset of state.assets) {
    const property = ['house', 'property', 'real-estate', 'real_estate', 'home'].includes(asset.type);
    asset.value = money(Math.max(0, asset.value * (property ? .97 + random(state) * .09 : .86 + random(state) * .08)));
    asset.condition = Math.round(clamp(asset.condition - roll(state, 1, 5)));
    expenses += money(asset.value * (property ? .008 : .018));
    if (asset.rented) income += money(asset.value * .055 * (asset.condition / 100));
    if (asset.mortgage > 0) {
      const payment = Math.min(asset.mortgage, Math.max(1200, money(asset.value * .045)));
      expenses += payment; asset.mortgage = money(Math.max(0, asset.mortgage - payment * .65));
    }
  }
  for (const investment of state.investments) {
    const volatility = ['crypto', 'cryptocurrency'].includes(investment.type) ? .7 : ['bond', 'bonds'].includes(investment.type) ? .04 : .24;
    investment.value = money(Math.max(0, investment.value * (1.045 + (random(state) - .5) * volatility)));
  }
  if (state.age >= 18 && !incarcerated) {
    expenses += money((state.education.enrolled ? 1800 : 2600) * (Number(country?.cost) || 1));
    if (state.flags.retired && !state.job) income += money(state.flags.retirementSalary || 0);
    else if (state.age >= 67 && !state.job && !state.specialCareer) income += money(7200 * (Number(country?.cost) || 1));
    expenses += living(state, 'child').filter(person => person.age < 18).length * money(1800 * (Number(country?.cost) || 1));
    expenses += living(state, 'pet').length * 450;
    if (state.social.followers >= 10000) income += money(state.social.followers * .018 * (1 + state.stats.fame / 100));
  }
  let rate = number(country?.tax, .22, 0, 100); if (rate > 1) rate /= 100;
  tax = money(Math.max(0, income - 8000) * rate);
  if (state.debt > 0) expenses += money(state.debt * .07);
  expenses = money(expenses); income = money(income);
  const net = income - tax - expenses;
  state.cash = money(state.cash + net);
  if (state.cash < 0) { state.debt = money(state.debt - state.cash); state.cash = 0; }
  state.annual = { income, tax, expenses, net };
  if (state.age >= 18) addLog(state, 'finance', 'Year in numbers', `Income ${income.toLocaleString('en-US')}; tax ${tax.toLocaleString('en-US')}; expenses ${expenses.toLocaleString('en-US')}. Net worth: ${netWorth(state).toLocaleString('en-US')}.`);
}

function eligibleEvent(state, event) {
  if (state.age < (event.minAge ?? 0) || state.age > (event.maxAge ?? 120)) return false;
  const context = { job: !!state.job, partner: state.relationships.some(r => r.alive && ['partner', 'fiancé', 'spouse', 'husband', 'wife'].includes(r.role)),
    child: living(state, 'child').length > 0, asset: state.assets.length > 0, business: !!state.business,
    special: !!state.specialCareer, prison: state.prison.years > 0, fame: state.stats.fame >= 20 };
  if (event.requires && !context[event.requires]) return false;
  if (state.prison.years > 0 && event.requires !== 'prison' && !['health', 'prison'].includes(event.category)) return false;
  return event.choices?.length > 0;
}

function endLife(state, cause) {
  state.alive = false; state.causeOfDeath = cause; state.pendingEvent = null; state.minigame = null;
  addLog(state, 'life', 'A life remembered', `I died at age ${state.age} from ${cause}. My estate was worth ${netWorth(state).toLocaleString('en-US')}.`);
}

export function ageUp(input) {
  const state = copy(input);
  if (!state.alive || state.pendingEvent || state.minigame) return state;
  const beforeProgress = { year: state.year, city: state.city, country: state.country, education: copy(state.education), job: copy(state.job), licenses:[...state.licenses] };
  ensureHuman(state, state.year, { seed: state.seed });
  for (const person of state.relationships) ensureHuman(person, state.year, { seed: state.seed });
  const beforeStats = copy(state.stats);
  const personStats = new Map(state.relationships.map(person => [person.id, copy(person.stats || {})]));
  const previousAge = state.age;
  const previousCountry = countryFor(state.country, state.year);
  state.age++; state.year = advanceCalendarYear(state.year); state.actionCounts = {};
  state.birthDate = normalizeBirthDate(state.birthDate, state.birthYear);
  state.date = dateAtAge(state.birthDate, state.age);
  const currentCountry = countryFor(state.country, state.year);
  if (cityAlias(currentCountry, state.city) !== state.city) state.city = cityAlias(currentCountry, state.city);
  else if (!currentCountry.cities.includes(state.city) && previousCountry.cities.includes(state.city)) state.city = currentCountry.cities[previousCountry.cities.indexOf(state.city)] || state.city;
  addLog(state, 'life', `Age ${state.age}`, `Another year of my life began in ${state.city}.`);
  const incarcerated = state.prison.years > 0;
  annualEducation(state);
  annualRelationships(state);
  annualFinances(state, incarcerated);
  if (incarcerated) {
    state.prison.years = Math.max(0, state.prison.years - 1);
    state.stats.happiness = clamp(state.stats.happiness - 7);
    if (!state.prison.years) {
      state.flags.released = true;
      addLog(state, 'crime', 'Released', 'I completed my sentence and stepped back into the world.');
    } else addLog(state, 'crime', 'Time inside', `I have ${state.prison.years} year${state.prison.years === 1 ? '' : 's'} left to serve.`);
  }
  state.prison.heat = Math.max(0, state.prison.heat - 8);
  const recovery = personalityModifier(state, 'recovery');
  if (state.age > 45) state.stats.health = clamp(state.stats.health - (state.age > 75 ? roll(state, 1, 5) : roll(state, 0, 2)) / recovery);
  if (state.flags.healthyDiet) state.stats.health = clamp(state.stats.health + 2 * recovery);
  state.stats.happiness = clamp(state.stats.happiness + roll(state, -3, 3));
  if (state.conditions.length) state.stats.health = clamp(state.stats.health - Math.min(12, state.conditions.length * 2));
  if (state.social.followers) state.social.followers = Math.round(Math.max(0, state.social.followers * (.97 + random(state) * .08) + state.stats.fame * 3));
  if (!state.specialCareer) state.stats.fame = clamp(state.stats.fame - 1);
  const zeroHealth = state.stats.health <= 0;
  ageCharacter(state, previousAge);
  reconcileCharacter(state, beforeStats);
  if (zeroHealth && state.stats.health > 0) { const health = state.stats.health; state.stats.health = 0; reconcileCharacter(state, { health }); }
  for (const person of state.relationships) if (person.alive && person.role !== 'pet' && !person.species) {
    ageCharacter(person, person.age - 1);
    reconcileCharacter(person, personStats.get(person.id) || {});
  }
  const mortality = state.age >= 110 ? .24 : state.age >= 95 ? .09 : state.age >= 80 ? .035 : state.age >= 65 ? .009 : .0004;
  const healthRisk = state.stats.health < 10 ? .2 : state.stats.health < 25 ? .04 : 0;
  if (state.age >= 120 || state.stats.health <= 0 || random(state) < mortality + healthRisk) {
    endLife(state, state.stats.health < 25 ? 'complications of poor health' : state.age >= 75 ? 'natural causes' : 'an unexpected medical emergency');
  } else {
    const recent = state.history.filter(item => item.type === 'event').slice(-8).map(item => item.id);
    let events = EVENTS.filter(event => eligibleEvent(state, event) && !recent.includes(event.id));
    if (!events.length) events = EVENTS.filter(event => eligibleEvent(state, event));
    if (events.length) state.pendingEvent = copy(pick(state, events));
  }
  state.history.push({ type: 'year', age: state.age, year: state.year, netWorth: netWorth(state), job: state.job?.title || null });
  if (state.history.length > 1000) state.history.splice(0, state.history.length - 1000);
  syncBackgroundProgress(state, beforeProgress);
  checkAchievements(state);
  return state;
}

export function resolveEvent(input, index) {
  const state = copy(input);
  if (!state.alive || state.minigame || !state.pendingEvent || !Number.isInteger(index) || !state.pendingEvent.choices[index]) return state;
  const beforeProgress = { year:state.year,city:state.city,country:state.country,education:copy(state.education),job:copy(state.job),licenses:[...state.licenses] };
  ensureHuman(state, state.year, { seed: state.seed });
  const beforeStats = copy(state.stats);
  const event = state.pendingEvent, choice = event.choices[index];
  for (const [key, value] of Object.entries(choice.effects || {})) {
    if (!Number.isFinite(value)) continue;
    if (statNames.includes(key)) state.stats[key] = clamp(state.stats[key] + value);
    if (key === 'cash') {
      state.cash = money(state.cash + value);
      if (state.cash < 0) { state.debt = money(state.debt - state.cash); state.cash = 0; }
    }
    if (key === 'debt') state.debt = money(Math.max(0, state.debt + value));
  }
  addLog(state, event.category || 'life', event.title, `${choice.label}. ${choice.result || ''}`);
  state.history.push({ type: 'event', id: event.id, age: state.age, choice: index });
  state.pendingEvent = null;
  reconcileCharacter(state, beforeStats);
  if (state.stats.health <= 0) endLife(state, 'a serious health crisis');
  syncBackgroundProgress(state,beforeProgress);
  checkAchievements(state);
  return state;
}

export function continueLegacy(input, childId) {
  input = normalizeState(input);
  if (input.alive) throw new Error('The current life must end before continuing a legacy.');
  const children = living(input, 'child');
  const namedHeir = children.find(person => person.id === input.flags.heir);
  const child = childId ? children.find(person => person.id === childId) : namedHeir || children[0];
  if (!child) throw new Error('Choose a living child to continue the family story.');
  const state = createLife({ seed: `${input.seed}:${child.id}:${input.generation}`, firstName: child.name.split(' ')[0],
    lastName: child.name.split(' ').slice(1).join(' ') || input.lastName, country: input.country, city: input.city,
    age: child.age, birthYear: child.birthYear, birthDate: normalizeBirthDate(child.birthDate, child.birthYear), gender: child.gender, ...profileOptions(child), stats: child.stats,
    background: normalizeBackground(child.background, { birthYear: child.birthYear, age: child.age, year: input.year }) });
  state.id = child.id;
  state.year = input.year;
  state.date = { ...state.date, year: state.year };
  const supportBenefit = Math.min(20, (Number(child.educationSupport) || 0) * 2);
  state.stats.smarts = clamp(state.stats.smarts + supportBenefit);
  state.education.grades = clamp(state.education.grades + supportBenefit);
  state.cash = money(namedHeir ? namedHeir.id === child.id ? Math.max(0, netWorth(input)) : 0 : Math.max(0, netWorth(input)) / children.length);
  state.generation = input.generation + 1;
  state.ancestors = [...copy(input.ancestors || []), { name: `${input.firstName} ${input.lastName}`, age: input.age,
    birthYear: input.birthYear, year: input.year, netWorth: netWorth(input), causeOfDeath: input.causeOfDeath }].slice(-100);
  state.relationships = input.relationships.filter(r => r.id !== child.id && ['child', 'spouse', 'partner', 'fiancé'].includes(r.role)).map(r => ({
    ...copy(r), role: r.role === 'child' ? 'sibling' : 'parent', bond: Math.round(clamp(r.bond * .8)),
  }));
  state.relationships.unshift({ id: input.id, name: `${input.firstName} ${input.lastName}`, age: input.age, alive: false,
    birthYear: input.birthYear, netWorth: 0, role: 'parent', gender: input.gender, bond: child.bond, ...profileOptions(input) });
  for (const person of state.relationships) ensureHuman(person, state.year, { seed: state.seed });
  state.achievements = [...input.achievements];
  state.journal = []; state.flags.logSequence = 0;
  addLog(state, 'life', 'The next generation', `I am ${state.firstName} ${state.lastName}, age ${state.age}. I inherited ${state.cash.toLocaleString('en-US')} and carry my family's story forward.`);
  if (supportBenefit) addLog(state, 'education', 'An investment in my future', 'The educational support my family gave me helped build my confidence and knowledge.');
  checkAchievements(state);
  return state;
}

export function normalizeState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('This file does not contain a life.');
  let json;
  try { json = JSON.stringify(input); } catch { throw new Error('The save file is not valid JSON data.'); }
  if (!json || !json.startsWith('{')) throw new Error('The save file is not valid life data.');
  if (json.length > 2000000) throw new Error('The save file is too large.');
  const raw = JSON.parse(json);
  if (raw.version !== 1 || typeof raw.firstName !== 'string' || typeof raw.lastName !== 'string' || !raw.stats || typeof raw.stats !== 'object') {
    throw new Error('Unsupported or incomplete save file.');
  }
  const migratedCalendar = migrateCalendar(raw);
  const importedBirthYear = validateYear(raw.birthYear, validateYear(raw.birthDate?.year, birthAt(validateYear(raw.year, 2026), Math.floor(number(raw.age, 0, 0, 120)))));
  const state = createLife({ seed: raw.seed, firstName: raw.firstName, lastName: raw.lastName, gender: raw.gender,
    country: raw.country, city: raw.city, age: Math.floor(number(raw.age, 0, 0, 120)),
    birthYear: importedBirthYear, birthDate: normalizeBirthDate(raw.birthDate, importedBirthYear) });
  state.id = text(raw.id, state.id, 100); state.seed = seedValue(raw.seed); state.rng = number(raw.rng, state.seed, 0, 0xffffffff) >>> 0;
  state.year = calendarYearAtAge(state.birthYear, state.age);
  if (raw.originalBirthYear !== undefined) state.originalBirthYear = validateYear(raw.originalBirthYear, state.birthYear);
  state.alive = raw.alive !== false; state.causeOfDeath = state.alive ? null : text(raw.causeOfDeath, 'natural causes');
  for (const key of statNames) state.stats[key] = number(raw.stats[key], state.stats[key]);
  state.cash = money(number(raw.cash, 0, 0, 1e15)); state.debt = money(number(raw.debt, 0, 0, 1e15));
  const education = raw.education || {};
  state.education = { level: ['none', 'primary', 'secondary', 'trade', 'university', 'graduate'].includes(education.level) ? education.level : 'none',
    enrolled: typeof education.enrolled === 'string' ? text(education.enrolled, '', 50) || null : null,
    yearsLeft: Math.floor(number(education.yearsLeft, 0, 0, 160)), grades: number(education.grades, 60), major: text(education.major, '', 100) || null,
    ...(education.institution!==undefined?{institution:text(education.institution,'',240)}:{}),
    ...(education.qualification!==undefined?{qualification:text(education.qualification,'',240)}:{}),
    ...(education.resumeId!==undefined?{resumeId:text(education.resumeId,'',100)||null}:{}),
    ...(education.customSchedule!==undefined?{customSchedule:education.customSchedule===true}:{}),
    ...(education.plannedEndYear!==undefined?{plannedEndYear:education.plannedEndYear==null?null:validateYear(education.plannedEndYear,state.year)}:{}) };
  if (education.enrolled && typeof education.enrolled === 'object') {
    state.education.enrolled = text(education.enrolled.level || education.enrolled.type, '', 50) || null;
  }
  state.job = raw.job && typeof raw.job === 'object' ? { id: text(raw.job.id, 'job', 80), title: text(raw.job.title, 'Worker'),
    salary: money(number(raw.job.salary, 0, 0, 1e12)), performance: number(raw.job.performance, 50), years: Math.floor(number(raw.job.years, 0, 0, 120)),
    ...(raw.job.employer!==undefined?{employer:text(raw.job.employer,'',240)}:{}),
    ...(raw.job.resumeId!==undefined?{resumeId:text(raw.job.resumeId,'',100)||null}:{}),
    ...(raw.job.employmentType!==undefined?{employmentType:text(raw.job.employmentType,'full-time',40)}:{}) } : null;
  state.relationships = list(raw.relationships, 250).filter(r => r && typeof r === 'object').map((r, i) => ({
    id: text(r.id, `person-${i}`, 100), name: text(r.name, 'Unknown person'), role: text(r.role, 'friend', 40),
    age: Math.floor(number(r.age, 18, 0, 160)), bond: number(r.bond, 50), alive: r.alive !== false,
    gender: ['male', 'female', 'neutral'].includes(r.gender) ? r.gender : 'neutral',
    ...(r.role !== 'pet' ? { birthYear: validateYear(r.birthYear, birthAt(state.year, Math.floor(number(r.age, 18, 0, 160)))), ...profileOptions(r) } : {}),
    ...(r.birthDate && r.role !== 'pet' ? { birthDate: normalizeBirthDate(r.birthDate, validateYear(r.birthYear, birthAt(state.year, Math.floor(number(r.age, 18, 0, 160))))) } : {}),
    ...(parentRoles.includes(r.role) || r.netWorth !== undefined ? { netWorth: importedParentWealth(r.netWorth) } : {}),
    ...(r.stats && typeof r.stats === 'object' && !Array.isArray(r.stats) ? { stats: Object.fromEntries(statNames.filter(key => typeof r.stats[key] === 'number' && Number.isFinite(r.stats[key])).map(key => [key, clamp(r.stats[key])])) } : {}),
    ...(r.role === 'pet' ? { species: text(r.species, 'dog', 40), health: number(r.health, 80) } : {}),
    ...(r.role === 'child' ? { educationSupport: Math.floor(number(r.educationSupport, 0, 0, 100)) } : {}),
    ...(r.background && r.role !== 'pet' ? { background: normalizeBackground(r.background, { birthYear: validateYear(r.birthYear, birthAt(state.year, Math.floor(number(r.age, 18, 0, 160)))), age: Math.floor(number(r.age, 18, 0, 160)), year: state.year }) } : {}),
  }));
  state.assets = list(raw.assets, 200).filter(a => a && typeof a === 'object').map((a, i) => ({
    id: text(a.id, `asset-${i}`, 100), name: text(a.name, 'Asset'), type: text(a.type, 'property', 40),
    value: money(number(a.value, 0, 0, 1e15)), condition: number(a.condition, 100), rented: a.rented === true,
    mortgage: money(number(a.mortgage, 0, 0, 1e15)),
  }));
  state.investments = list(raw.investments, 200).filter(a => a && typeof a === 'object').map((a, i) => ({
    id: text(a.id, `investment-${i}`, 100), name: text(a.name, 'Investment'), type: text(a.type, 'stock', 40),
    value: money(number(a.value, 0, 0, 1e15)), cost: money(number(a.cost, 0, 0, 1e15)),
  }));
  const company = raw.business;
  state.business = company && typeof company === 'object' ? { name: text(company.name, 'My business'), type: text(company.type, 'services', 40),
    value: money(number(company.value, 0, 0, 1e15)), capital: money(number(company.capital, 0, 0, 1e15)),
    employees: Math.floor(number(company.employees, 0, 0, 1000000)), performance: number(company.performance, 50), profit: money(company.profit) } : null;
  const special = raw.specialCareer;
  state.specialCareer = special && typeof special === 'object' ? { id: text(special.id, 'special', 80), title: text(special.title, 'Performer'),
    level: number(special.level, 1), performance: number(special.performance, 50), earnings: money(number(special.earnings, 0, 0, 1e15)) } : null;
  state.prison = { years: Math.floor(number(raw.prison?.years, 0, 0, 200)), record: Math.floor(number(raw.prison?.record, 0, 0, 1000)), heat: number(raw.prison?.heat, 0) };
  for (const key of Object.keys(state.skills)) state.skills[key] = number(raw.skills?.[key], 0);
  state.conditions = list(raw.conditions, 50).filter(c => typeof c === 'string').map(c => text(c));
  state.licenses = list(raw.licenses, 30).filter(c => typeof c === 'string').map(c => text(c, '', 50));
  state.social = { followers: Math.floor(number(raw.social?.followers, 0, 0, 1e12)), posts: Math.floor(number(raw.social?.posts, 0, 0, 1e9)) };
  state.journal = list(raw.journal, 1800).filter(j => j && typeof j === 'object').map((j, i) => ({
    id: text(j.id, `log-${i}`, 150), age: Math.floor(number(j.age, 0, 0, 160)), year: validateYear(j.year, calendarYearAtAge(state.birthYear, Math.floor(number(j.age, 0, 0, 160)))),
    category: text(j.category, 'life', 40), title: text(j.title, 'Life update'), text: text(j.text, '', 3000),
  }));
  state.achievements = [...new Set(list(raw.achievements, 300).filter(id => typeof id === 'string' && ACHIEVEMENTS.some(a => a.id === id)))];
  state.history = list(raw.history, 1000).filter(h => h && typeof h === 'object').map(h => ({
    type: text(h.type, 'year', 40), id: text(h.id, '', 100), age: Math.floor(number(h.age, 0, 0, 160)),
    year: validateYear(h.year, calendarYearAtAge(state.birthYear, Math.floor(number(h.age, 0, 0, 160)))), choice: Math.floor(number(h.choice, 0, 0, 20)),
    netWorth: money(h.netWorth), job: text(h.job, '', 160) || null,
  }));
  state.flags = {};
  for (const [key, value] of Object.entries(raw.flags || {}).slice(0, 200)) {
    if (!['__proto__', 'constructor', 'prototype'].includes(key) && ['string', 'number', 'boolean'].includes(typeof value)) {
      state.flags[key.slice(0, 80)] = typeof value === 'string' ? value.slice(0, 300) : value;
    }
  }
  state.flags.logSequence = Math.max(Number(state.flags.logSequence) || 0, state.journal.length);
  state.actionCounts = {};
  for (const [key, value] of Object.entries(raw.actionCounts || {}).slice(0, 500)) {
    if (!['__proto__', 'constructor', 'prototype'].includes(key)) state.actionCounts[key.slice(0, 150)] = Math.floor(number(value, 0, 0, 10000));
  }
  state.annual = Object.fromEntries(['income', 'tax', 'expenses', 'net'].map(key => [key, money(raw.annual?.[key])]));
  state.generation = Math.floor(number(raw.generation, 1, 1, 10000));
  state.ancestors = list(raw.ancestors, 100).filter(a => a && typeof a === 'object').map(a => {
    const year = validateYear(a.year, state.year), age = Math.floor(number(a.age, 0, 0, 160));
    return { name: text(a.name, 'Ancestor'), age, year, birthYear: validateYear(a.birthYear, birthAt(year, age)),
      netWorth: money(a.netWorth), causeOfDeath: text(a.causeOfDeath) };
  });
  const event = raw.pendingEvent;
  state.pendingEvent = null;
  if (state.alive && event && typeof event === 'object' && Array.isArray(event.choices) && event.choices.length) {
    state.pendingEvent = { id: text(event.id, 'imported-event', 100), title: text(event.title, 'A decision'), text: text(event.text, '', 3000),
      category: text(event.category, 'life', 40), choices: event.choices.slice(0, 8).map(choice => ({
        label: text(choice?.label, 'Continue'), result: text(choice?.result, '', 3000),
        effects: Object.fromEntries(Object.entries(choice?.effects || {}).filter(([key, value]) => [...statNames, 'cash', 'debt'].includes(key) && Number.isFinite(value))
          .map(([key, value]) => [key, clamp(value, key === 'cash' || key === 'debt' ? -1e9 : -100, key === 'cash' || key === 'debt' ? 1e9 : 100)])),
      })) };
  }
  const session = raw.minigame;
  const allowedMoves = session?.kind === 'blackjack' ? ['hit', 'stand'] : ['up', 'down', 'left', 'right'];
  state.minigame = null;
  if (state.alive && session && typeof session === 'object' && !Array.isArray(session)
    && ['blackjack', 'escape'].includes(session.kind)
    && Number.isInteger(session.seed) && session.seed >= 0 && session.seed <= 0xffffffff
    && typeof session.bet === 'number' && Number.isFinite(session.bet) && session.bet >= 0 && session.bet <= 1e9
    && Array.isArray(session.moves) && session.moves.length <= 200
    && session.moves.every(move => typeof move === 'string' && allowedMoves.includes(move))) {
    state.minigame = { kind: session.kind, seed: session.seed >>> 0, bet: session.bet, moves: [...session.moves] };
  }
  for (const key of profileKeys) delete state[key];
  Object.assign(state, profileOptions(raw));
  ensureHuman(state, state.year, { seed: state.seed });
  for (const person of state.relationships) ensureHuman(person, state.year, { seed: state.seed });
  state.background = normalizeBackground(raw.background, backgroundContext(state));
  if (migratedCalendar && !state.flags.calendarMigrationNotice) {
    state.flags.calendarMigrationNotice = true;
    addLog(state, 'life', 'Calendar updated', 'My saved story was moved to a birth year of 1900. My age, experiences, relationships, and progress were preserved.');
  }
  return state;
}

/** Explicit character editor. Gameplay/economy/session fields are never copied from a patch. */
export function customizeCharacter(input, patch = {}) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('Character edits must be an object.');
  const state = normalizeState(input);
  if (patch.birthDate !== undefined) {
    if (!patch.birthDate || typeof patch.birthDate !== 'object' || Array.isArray(patch.birthDate)) throw new RangeError('Enter a valid date of birth.');
    state.birthDate = validateBirthDate({ year: state.birthYear, month: patch.birthDate.month ?? state.birthDate.month, day: patch.birthDate.day ?? state.birthDate.day }, state.birthYear);
    state.date = dateAtAge(state.birthDate, state.age);
  }
  const beforeStats = copy(state.stats);
  applyStats(state, patch.stats);
  reconcileCharacter(state, beforeStats);
  ensureHuman(state, state.year, { ...profileOptions(patch), seed: state.seed });
  if (patch.background !== undefined) {
    state.background = validateBackground(patch.background, backgroundContext(state));
    applyBackgroundGameplay(state);
  }
  for (const role of ['mother', 'father']) {
    const parent = state.relationships.find(person => person.role === role);
    const edit = patch.parents?.[role];
    if (parent && edit && typeof edit === 'object' && !Array.isArray(edit)) {
      if (edit.netWorth !== undefined) parent.netWorth = validateParentWealth(edit.netWorth);
      ensureHuman(parent, state.year, { ...profileOptions(edit), seed: state.seed });
    }
  }
  addLog(state, 'life', 'Character updated', 'I updated the details of my character and family profile.');
  if (state.alive && state.stats.health <= 0) endLife(state, 'a serious health crisis');
  checkAchievements(state);
  return state;
}
