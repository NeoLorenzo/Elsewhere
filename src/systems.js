import { COUNTRIES, JOBS, MAJORS, ASSETS, SPECIAL_CAREERS, FIRST_NAMES, LAST_NAMES } from './data.js';
import { addLog, random, clamp, checkAchievements } from './engine.js';
import { beginMiniGame } from './game-session.js';
import { ensureCharacter, reconcileCharacter, applyCharacterAction, personalityCompatibility, personalityModifier, physicalCapacity } from './character.js';
import { calendarYearAtAge } from './calendar.js';

const CATEGORIES = ['education', 'career', 'relationships', 'activities', 'assets', 'finance', 'crime', 'special'];
const money = value => Math.round(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const rank = { none: 0, primary: 0, secondary: 1, university: 2, graduate: 3, trade: 1 };
const icons = { education: '🎓', career: '💼', relationships: '❤️', activities: '✨', assets: '🏠', finance: '📈', crime: '⚖️', special: '🌟' };
const living = state => state.relationships.filter(person => person.alive);
const spouseOf = state => living(state).find(person => person.role === 'spouse');
const partnerOf = state => living(state).find(person => ['partner', 'spouse', 'fiancé'].includes(person.role));
const countryOf = state => COUNTRIES.find(country => country.id === state.country || country.name === state.country) || COUNTRIES[0];
const count = (state, key) => state.actionCounts?.[key] || 0;
const uid = (state, prefix) => `${prefix}-${state.age}-${Math.floor(random(state) * 0xFFFFFFFF).toString(36)}`;

function change(state, changes) {
  for (const [key, amount] of Object.entries(changes)) {
    if (key === 'cash') state.cash = Math.round(state.cash + amount);
    else if (key in state.stats) state.stats[key] = clamp(state.stats[key] + amount);
  }
}

function skill(state, name, amount) {
  const cognitive = ['music', 'acting', 'writing', 'coding'].includes(name);
  const physical = ['fitness', 'athletics'].includes(name);
  const factor = cognitive ? learningFactor(state) : physical ? clamp(0.85 + physicalAbility(state) * 0.003, 0.85, 1.15) * personalityModifier(state, 'work') : 1;
  state.skills[name] = clamp((state.skills[name] || 0) + Math.round(amount * factor * 10) / 10);
}

const attribute = (entity, key, fallback = 50) => Number.isFinite(entity.attributes?.[key]) ? entity.attributes[key] : fallback;
const facet = (entity, key) => entity.personality?.facets?.[key] ?? 50;
const physicalAbility = entity => physicalCapacity(entity);
const learningFactor = entity => clamp(1 + (attribute(entity, 'iq', 100) - 100) / 400, 0.85, 1.15) * personalityModifier(entity, 'learning');

function enrichHumans(state) {
  ensureCharacter(state, { seed: state.seed });
  for (const entity of state.relationships) {
    if (entity.role === 'pet' || entity.species) continue;
    entity.birthYear ??= calendarYearAtAge(state.year, -entity.age);
    ensureCharacter(entity, { seed: `${state.seed}:${entity.id}` });
  }
}

function connectionGain(state, target, base) {
  if (target.role === 'pet') return base;
  const compatibility = personalityCompatibility(state, target);
  const empathy = clamp(0.9 + attribute(state, 'empathy') / 500, 0.9, 1.1);
  return Math.max(1, Math.round(base * (0.8 + compatibility / 250) * empathy * personalityModifier(state, 'social')));
}

function connectionNote(state, target) {
  if (target.role === 'pet') return '';
  const compatibility = personalityCompatibility(state, target);
  if (compatibility > 75) return ' Your temperaments made it easy to connect.';
  if (compatibility < 40) return ' You made room for your different ways of relating.';
  if (facet(target, 'gregariousness') < 30) return ' A quiet conversation suited them well.';
  return '';
}

function person(state, role, age, bond = 55, options = {}) {
  const gender = random(state) < 0.5 ? 'female' : 'male';
  const names = FIRST_NAMES[gender];
  const entity = { id: uid(state, role), name: `${names[Math.floor(random(state) * names.length)]} ${LAST_NAMES[Math.floor(random(state) * LAST_NAMES.length)]}`, role, age, bond, alive: true, gender, birthYear: calendarYearAtAge(state.year, -age) };
  if (options.lastName) entity.name = `${entity.name.split(' ')[0]} ${options.lastName}`;
  if (options.prefix) entity.name = `${options.prefix} ${entity.name}`;
  ensureCharacter(entity, { seed: `${state.seed}:${entity.id}`, parents: options.parents });
  return entity;
}

function field(name, label, value, min, max) {
  return { name, label, type: 'number', value, min, max };
}

function amount(payload, fallback, minimum, maximum) {
  const number = payload.amount === undefined || payload.amount === '' ? fallback : Number(payload.amount);
  if (!Number.isFinite(number) || number < minimum || number > maximum) throw new Error(`Enter an amount between ${money(minimum)} and ${money(maximum)}.`);
  return Math.round(number);
}

function spend(state, value) {
  if (state.cash < value) throw new Error(`You need ${money(value)} in available cash.`);
  state.cash = Math.round(state.cash - value);
}

function commitCrime(state, { title, reward = 0, risk, term, karma = 8, lethal = false }) {
  const phrase=({'Shoplift':'shoplifting','Pickpocket':'pickpocketing','Commit a burglary':'committing a burglary','Steal a vehicle':'stealing a vehicle','Commit financial fraud':'committing financial fraud','Rob a bank':'robbing a bank','Assault a stranger':'assaulting a stranger','Commit murder':'committing murder','Syndicate robbery':'a syndicate robbery'})[title]||title.toLowerCase();
  const dexterity = (attribute(state, 'agility') + attribute(state, 'coordination')) / 2;
  const physicalEdge = (dexterity - 50) * 0.0015 + (lethal ? (attribute(state, 'strength') - 50) * 0.0005 : 0);
  const chance = clamp((risk - (state.skills.crime || 0) * 0.003 + state.prison.heat * 0.002 - physicalEdge) / personalityModifier(state, 'risk'), 0.04, 0.98);
  skill(state, 'crime', 3);
  state.prison.heat = clamp(state.prison.heat + 8);
  change(state, { karma: -karma, happiness: -2 });
  if (random(state) < chance) {
    state.prison.years = term;
    state.prison.record += 1;
    state.flags.lastSentence = term;
    state.flags.convictionAge = state.age;
    state.job = null;
    state.specialCareer = null;
    state.flags.prisonOffense = title;
    return `You were caught ${phrase}. You received a ${term}-year prison sentence and lost your employment.`;
  }
  if (lethal) {
    change(state, { health: -15, karma: -25 });
  }
  const proceeds = Math.round(reward * (0.6 + random(state) * 0.8));
  state.cash += proceeds;
  return `You got away with ${phrase}${proceeds ? ` and gained ${money(proceeds)}` : ''}. Your criminal heat increased.`;
}

function definitions(state, category) {
  const actions = [];
  const add = (id, title, description, execute, options = {}) => {
    actions.push({ id, title, description, icon: options.icon || icons[category], category, execute, cap: 1, ...options });
  };
  const ageGate = minimum => state.age < minimum ? `Available from age ${minimum}.` : null;
  const adult = () => ageGate(18);
  const school = () => !state.education.enrolled ? 'You must be enrolled in school or university.' : null;
  const employed = () => !state.job ? 'Find a job first.' : null;

  if (category === 'education') {
    add('education:study', 'Study harder', 'Improve your grades, knowledge, and discipline.', s => {
      const progress = Math.round((7 + Math.floor(random(s) * 6)) * learningFactor(s));
      s.education.grades = clamp(s.education.grades + progress);
      change(s, { smarts: 3, discipline: 3, happiness: -1 });
      return `You studied carefully. Your grades are now ${Math.round(s.education.grades)}%.`;
    }, { gate: school, cap: 3 });
    add('education:library', 'Visit the library', 'Read something new and develop your mind.', s => {
      change(s, { smarts: 3, discipline: 1 });
      skill(s, 'writing', 2);
      return 'An afternoon of reading left you more knowledgeable and inspired.';
    }, { gate: () => ageGate(6), cap: 3 });
    add('education:tutor', 'Private tutoring', 'Pay for individual lessons to improve your grades.', s => {
      s.education.grades = clamp(s.education.grades + Math.round(18 * learningFactor(s)));
      change(s, { smarts: 4 });
      return 'Your tutor helped you understand the subjects you had struggled with.';
    }, { cost: 400, gate: school });
    add('education:club', 'Join a school club', 'Make a friend and develop a skill through extracurricular activities.', s => {
      const names = ['music', 'athletics', 'writing', 'coding'];
      const name = names[Math.floor(random(s) * names.length)];
      skill(s, name, 8);
      change(s, { happiness: 5 });
      if (living(s).filter(p => p.role === 'friend').length < 8) s.relationships.push(person(s, 'friend', s.age));
      return `You joined the ${name} club, practiced your skills, and made a friend.`;
    }, { gate: () => ageGate(8) || school() });
    for (const major of MAJORS) {
      add(`education:university:${encodeURIComponent(major)}`, `Study ${major}`, 'A four-year university degree. Tuition is paid up front.', s => {
        s.education.enrolled = 'university';
        s.education.major = major;
        s.education.yearsLeft = 4;
        s.education.grades = Math.max(50, s.stats.smarts);
        s.flags.degreeInProgress = major;
        s.flags.scholarship = false;
        return `You enrolled in a four-year ${major} degree. Age up each year to progress; studying helps your grades.`;
      }, { cost: state.flags.scholarship ? 0 : 12000, group: 'University', gate: () => adult() || (state.education.enrolled ? 'Finish or leave your current education first.' : null) || ((rank[state.education.level] || 0) < 1 ? 'Complete secondary school first.' : null) || (state.stats.smarts < 30 ? 'You need at least 30 knowledge to enter university.' : null) });
    }
    add('education:scholarship', 'Apply for a scholarship', 'Strong grades and knowledge can earn free university tuition.', s => {
      if (random(s) < clamp((s.education.grades + s.stats.smarts) / 230, 0.1, 0.9)) {
        s.flags.scholarship = true;
        return 'Your scholarship application was accepted. Your next university degree tuition is covered.';
      }
      change(s, { happiness: -2 });
      return 'Your scholarship application was declined this year.';
    }, { gate: () => adult() || (state.stats.smarts < 65 || state.education.grades < 70 ? 'Requires 65 knowledge and 70% grades.' : null) });
    add('education:graduate', 'Attend graduate school', 'Earn an advanced qualification over three years.', s => {
      s.education.enrolled = 'graduate';
      s.education.yearsLeft = 3;
      s.education.grades = 65;
      return 'You enrolled in graduate school. Complete three years to qualify for advanced professions.';
    }, { cost: 18000, gate: () => adult() || (state.education.level !== 'university' && state.education.level !== 'graduate' ? 'A university degree is required.' : null) || (state.education.enrolled ? 'You are already studying.' : null) });
    add('education:trade', 'Attend trade school', 'Train for a practical career over two years.', s => {
      s.education.enrolled = 'trade';
      s.education.yearsLeft = 2;
      s.education.major = 'Skilled trades';
      s.education.grades = 65;
      return 'You enrolled in a two-year trade qualification.';
    }, { cost: 3500, gate: () => ageGate(16) || (state.education.enrolled ? 'Finish or leave your current education first.' : null) });
    add('education:equivalency', 'Complete secondary equivalency', 'Return to education and earn a secondary qualification in one year.', s => {
      s.education.enrolled = 'secondary';
      s.education.yearsLeft = 1;
      s.education.grades = Math.max(50, s.stats.smarts);
      return 'You enrolled in a one-year secondary equivalency course. Age up to complete it and reopen further education options.';
    }, { cost: 500, gate: () => adult() || (state.education.enrolled ? 'You are already enrolled in education.' : null) || ((rank[state.education.level] || 0) >= 1 ? 'You already hold a secondary or higher qualification.' : null) });
    add('education:dropout', 'Leave education', 'Withdraw from your current course. Tuition is not refunded.', s => {
      const course = s.education.enrolled;
      s.education.enrolled = null;
      s.education.yearsLeft = 0;
      change(s, { happiness: 3, discipline: -5 });
      return `You left ${course} and are no longer enrolled.`;
    }, { gate: () => ageGate(16) || school(), confirm: 'Leave your current education? Tuition will not be refunded.' });
    add('education:driving', 'Take a driving test', 'Pass a test to receive a driving licence.', s => {
      if (random(s) < 0.45 + s.stats.smarts * 0.004) {
        s.licenses.push('driving');
        return 'You passed your driving test and earned your driving licence.';
      }
      return 'You failed your driving test. You can try again next year.';
    }, { cost: 150, gate: () => ageGate(16) || (state.licenses.includes('driving') ? 'You already hold a driving licence.' : null) });
    add('education:pilot', 'Earn a pilot licence', 'Complete flight training and a practical examination.', s => {
      s.licenses.push('pilot');
      skill(s, 'coding', 5);
      return 'After ground school and flight practice, you earned your pilot licence.';
    }, { cost: 12000, gate: () => adult() || (state.stats.smarts < 65 ? 'Requires 65 knowledge.' : null) || (state.licenses.includes('pilot') ? 'You already hold a pilot licence.' : null) });
  }

  if (category === 'career') {
    for (const job of JOBS) {
      add(`career:apply:${job.id}`, job.title, `${money(job.salary)} per year · ${job.education === 'none' ? 'No qualification required' : `${job.education} education`}`, s => {
        const preparation = 0.55 + (s.stats.smarts - (job.minSmarts || 0)) / 150 + (s.stats.discipline - 50) / 300 - s.prison.record * 0.06;
        const reasoning = clamp((attribute(s, 'iq', 100) - 100) / 700, -0.08, 0.12);
        const chance = clamp(preparation * personalityModifier(s, 'work') + reasoning, 0.1, 0.95);
        if (random(s) < chance) {
          s.job = { id: job.id, title: job.title, salary: job.salary, performance: 55, years: 0 };
          s.flags.retired = false;
          s.specialCareer = null;
          return `You were hired as a ${job.title}. Your salary is ${money(job.salary)} per year, paid when you age up.`;
        }
        return `You interviewed for ${job.title}, but another applicant was selected.`;
      }, { group: 'Job listings', gate: () => ageGate(job.minAge || 18) || ((rank[state.education.level] || 0) < (rank[job.education] || 0) ? `Requires ${job.education} education.` : null) || (state.stats.smarts < (job.minSmarts || 0) ? `Requires ${job.minSmarts} knowledge.` : null) || (state.job?.id === job.id ? 'You already hold this job.' : null) || (state.education.enrolled === 'university' || state.education.enrolled === 'graduate' ? 'Complete your full-time course before accepting a full-time job.' : null) });
    }
    add('career:parttime', 'Work a part-time shift', 'Earn extra money. Useful while studying or looking for work.', s => {
      const pay = Math.round((150 + s.age * 10) * (0.7 + random(s) * 0.6));
      change(s, { cash: pay, discipline: 1, happiness: -2 });
      return `You worked a part-time shift and earned ${money(pay)}.`;
    }, { gate: () => ageGate(13), cap: 4, group: 'Work' });
    add('career:freelance', 'Complete freelance work', 'Your coding, writing, and creative skills determine your earnings.', s => {
      const talent = Math.max(s.skills.coding, s.skills.writing, s.skills.acting);
      const pay = Math.round(150 + talent * 25 + random(s) * 300);
      change(s, { cash: pay, discipline: 2, happiness: -2 });
      return `You delivered a freelance project and earned ${money(pay)}.`;
    }, { gate: () => ageGate(16), cap: 3, group: 'Work' });
    add('career:hardwork', 'Work harder', 'Improve your performance and chances of promotion at your next birthday.', s => {
      s.job.performance = clamp(s.job.performance + Math.round(15 * personalityModifier(s, 'work')));
      change(s, { discipline: 2, happiness: -3, health: -1 });
      return `You put in extra effort. Your job performance rose to ${Math.round(s.job.performance)}%.`;
    }, { gate: employed, cap: 3, group: 'Your job' });
    add('career:raise', 'Ask for a raise', 'A strong track record can persuade your employer to increase your salary.', s => {
      if (s.job.performance >= 75 && random(s) < 0.65) {
        const raise = Math.round(s.job.salary * 0.1);
        s.job.salary += raise;
        return `Your employer approved a ${money(raise)} annual raise.`;
      }
      s.job.performance = clamp(s.job.performance - 3);
      return 'Your employer declined your request. Improve your performance and try next year.';
    }, { gate: employed, group: 'Your job' });
    add('career:coworker', 'Socialize with colleagues', 'Build happiness and workplace relationships.', s => {
      s.relationships.push(person(s, 'coworker', Math.max(18, s.age + Math.floor(random(s) * 13) - 6), 65));
      change(s, { happiness: 5 });
      s.job.performance = clamp(s.job.performance + 3);
      return 'You went out after work and made a closer connection with a colleague.';
    }, { cost: 40, gate: employed, group: 'Your job' });
    add('career:quit', 'Resign', 'Leave your job immediately and stop receiving its salary.', s => {
      const title = s.job.title;
      s.job = null;
      change(s, { happiness: 5 });
      return `You resigned from your position as ${title}.`;
    }, { gate: employed, confirm: 'Resign from your job?', group: 'Your job' });
    add('career:retire', 'Retire', 'End your career and receive a one-time retirement settlement.', s => {
      const payout = Math.round(s.job.salary * Math.min(2, (s.job.years || 0) / 10));
      s.cash += payout;
      s.flags.retired = true;
      s.flags.retirementSalary = Math.round(s.job.salary * 0.3);
      s.job = null;
      change(s, { happiness: 12 });
      return `You retired with a ${money(payout)} settlement. Your pension will pay ${money(s.flags.retirementSalary)} each year.`;
    }, { gate: () => employed() || ageGate(60) || (state.job.years < 10 ? 'Complete at least ten years in your job before retiring.' : null), group: 'Your job' });
    add('career:military', 'Enlist in the military', 'Begin a demanding service career with a reliable salary.', s => {
      s.job = { id: 'military-enlisted', title: 'Military service member', salary: 32000, performance: 60, years: 0 };
      s.specialCareer = null;
      skill(s, 'fitness', 5);
      return 'You enlisted in the armed forces. Maintain your health and work performance to advance.';
    }, { gate: () => adult() || (state.age > 40 ? 'Recruitment is open through age 40.' : null) || (state.stats.health < 60 ? 'Requires 60 health.' : null) || (state.prison.record ? 'Your criminal record prevents enlistment.' : null), group: 'Service' });
    add('career:deployment', 'Volunteer for deployment', 'Risk your health on a military assignment for a service bonus.', s => {
      if (random(s) < 0.15) {
        change(s, { health: -25, happiness: -12 });
        return 'Your unit encountered heavy fighting. You survived but were injured.';
      }
      change(s, { cash: 8000, discipline: 6 });
      s.job.performance = clamp(s.job.performance + 12);
      return 'You completed your deployment and received an $8,000 service bonus.';
    }, { gate: () => !state.job || (!state.job.id.startsWith('military') && !['soldier', 'sailor', 'aircrew', 'officer'].includes(state.job.id)) ? 'Requires military service.' : null, group: 'Service' });
  }

  if (category === 'relationships') {
    add('relationships:all', 'Spend time with everyone', 'Reconnect with your family and friends.', s => {
      for (const p of living(s)) p.bond = clamp(p.bond + 6);
      change(s, { happiness: 6 });
      return 'You made time for the people who matter to you.';
    }, { gate: () => !living(state).length ? 'There is nobody to spend time with.' : null });
    add('relationships:friend', 'Make a new friend', 'Meet someone new and begin a friendship.', s => {
      const friend = person(s, 'friend', Math.max(4, s.age + Math.floor(random(s) * 7) - 3), 55);
      s.relationships.push(friend);
      change(s, { happiness: 4 });
      return `You met ${friend.name}. The two of you became friends.`;
    }, { gate: () => ageGate(5) || (living(state).filter(p => p.role === 'friend').length >= 12 ? 'You already have a full circle of friends.' : null), cap: 2 });
    add('relationships:date', 'Find a date', 'Meet a potential romantic partner.', s => {
      const roll = random(s);
      const date = person(s, 'partner', Math.max(16, s.age + Math.floor(random(s) * 9) - 4), 60);
      const affinity = personalityCompatibility(s, date);
      const chance = clamp((0.35 + s.stats.looks * 0.005) * personalityModifier(s, 'social') + (affinity - 50) * 0.002, 0.15, 0.95);
      if (roll < chance) {
        date.bond = clamp(date.bond + Math.round((affinity - 50) / 5));
        s.relationships.push(date);
        change(s, { happiness: 8 });
        return `You connected with ${date.name} and began a relationship.${connectionNote(s, date)}`;
      }
      return 'You met some new people but did not feel a romantic connection.';
    }, { cost: state.age < 18 ? 0 : 75, gate: () => ageGate(16) || (partnerOf(state) ? 'You are already in a romantic relationship.' : null), cap: 2 });
    add('relationships:datingapp', 'Use a dating app', 'A paid matchmaking service offers another chance to meet someone.', s => {
      const date = person(s, 'partner', Math.max(18, s.age + Math.floor(random(s) * 11) - 5), 55);
      date.bond = clamp(date.bond + Math.round((personalityCompatibility(s, date) - 50) / 5));
      s.relationships.push(date);
      change(s, { happiness: 5 });
      return `Your match with ${date.name} developed into a relationship.${connectionNote(s, date)}`;
    }, { cost: 200, gate: () => adult() || (partnerOf(state) ? 'You are already in a romantic relationship.' : null) });
    for (const p of living(state)) {
      const prefix = `relationships:${encodeURIComponent(p.id)}`;
      const group = `${p.name} · ${p.role}`;
      add(`${prefix}:time`, p.role === 'pet' ? 'Play together' : 'Spend time together', `Strengthen your bond with ${p.name}.`, s => {
        const target = s.relationships.find(person => person.id === p.id);
        target.bond = clamp(target.bond + connectionGain(s, target, 12));
        change(s, { happiness: 4 });
        return `You enjoyed some quality time with ${target.name}.${connectionNote(s, target)}`;
      }, { group, cap: 2 });
      add(`${prefix}:gift`, 'Give a gift', 'A thoughtful $100 gift can strengthen your relationship.', s => {
        s.relationships.find(person => person.id === p.id).bond = clamp(p.bond + 18);
        change(s, { happiness: 2, karma: 1 });
        return `${p.name} appreciated your thoughtful present.`;
      }, { cost: 100, group });
      if (p.role !== 'pet') {
        add(`${prefix}:compliment`, 'Pay a compliment', 'Say something kind and sincere.', s => {
          const target = s.relationships.find(person => person.id === p.id);
          target.bond = clamp(target.bond + connectionGain(s, target, 6));
          change(s, { karma: 1 });
          return `Your kind words made ${p.name} smile.`;
        }, { group, gate: () => ageGate(3) });
        add(`${prefix}:argue`, 'Start an argument', 'Express your frustration, at the cost of your bond.', s => {
          const target = s.relationships.find(person => person.id === p.id);
          const intensity = clamp(0.85 + facet(target, 'anger') / 250 + facet(s, 'anger') / 500 - attribute(s, 'empathy') / 500 - (target.personality?.domains?.agreeableness ?? 50) / 500, 0.5, 1.5);
          target.bond = clamp(target.bond - Math.round(20 * intensity));
          change(s, { happiness: -4, karma: -2 });
          return `You argued with ${p.name}. Your relationship suffered.${facet(target, 'anger') > 70 ? ' Their quick temper made it difficult to de-escalate.' : attribute(s, 'empathy') > 75 ? ' Trying to understand their feelings softened the disagreement.' : ''}`;
        }, { group });
      }
      if (['mother', 'father', 'parent'].includes(p.role)) {
        add(`${prefix}:money`, 'Ask for money', 'Your age and relationship affect your family’s willingness to help.', s => {
          const target = s.relationships.find(person => person.id === p.id);
          target.bond = clamp(target.bond - 5);
          const support = clamp(p.bond / 140 * personalityModifier(s, 'social') + (facet(target, 'altruism') - 50) / 700, 0.05, 0.9);
          if (random(s) < support) {
            const gift = s.age < 18 ? 30 + Math.floor(random(s) * 170) : 100 + Math.floor(random(s) * 900);
            s.cash += gift;
            return `${p.name} gave you ${money(gift)}.`;
          }
          return `${p.name} declined your request for money.`;
        }, { group, gate: () => ageGate(3) });
      }
      if (p.role === 'friend' && state.age >= 16 && p.age >= 16) {
        add(`${prefix}:romance`, 'Ask them out', 'Find out whether your friend shares your romantic feelings.', s => {
          const target = s.relationships.find(person => person.id === p.id);
          if (random(s) < clamp(target.bond / 130 + (personalityCompatibility(s, target) - 50) * 0.002, 0.1, 0.95)) {
            target.role = 'partner';
            change(s, { happiness: 8 });
            return `${p.name} said yes. You are now a couple.`;
          }
          target.bond = clamp(target.bond - 10);
          return `${p.name} would prefer to remain friends.`;
        }, { group, gate: () => partnerOf(state) ? 'You are already in a relationship.' : null });
      }
      if (['partner', 'fiancé', 'spouse'].includes(p.role)) {
        add(`${prefix}:date`, 'Go on a date', 'Share a romantic evening together.', s => {
          const target = s.relationships.find(person => person.id === p.id);
          target.bond = clamp(target.bond + connectionGain(s, target, 16));
          change(s, { happiness: 6 });
          return `You and ${p.name} shared a lovely evening together.`;
        }, { cost: 150, group });
        if (p.role === 'partner') add(`${prefix}:propose`, 'Propose marriage', 'Buy an engagement ring and ask to share your future.', s => {
          const target = s.relationships.find(person => person.id === p.id);
          if (random(s) < clamp(target.bond / 115 + (personalityCompatibility(s, target) - 50) * 0.0015, 0.1, 0.96)) {
            target.role = 'fiancé';
            change(s, { happiness: 10 });
            return `${p.name} accepted your proposal. You are engaged!`;
          }
          target.bond = clamp(target.bond - 10);
          return `${p.name} is not ready for marriage.`;
        }, { cost: 1000, group, gate: adult });
        if (p.role === 'fiancé') add(`${prefix}:marry`, 'Get married', 'Celebrate a wedding and become a married couple.', s => {
          s.relationships.find(person => person.id === p.id).role = 'spouse';
          change(s, { happiness: 15 });
          s.flags.married = true;
          return `You married ${p.name} in a beautiful ceremony.`;
        }, { cost: 3000, group, gate: adult });
        add(`${prefix}:breakup`, p.role === 'spouse' ? 'File for divorce' : 'End the relationship', p.role === 'spouse' ? 'A divorce settlement costs 20% of your available cash, plus legal fees.' : 'Separate and return to single life.', s => {
          const target = s.relationships.find(person => person.id === p.id);
          let settlement = 0;
          if (target.role === 'spouse') {
            settlement = Math.round(Math.max(0, s.cash) * 0.2);
            s.cash -= settlement;
          }
          target.role = 'ex';
          target.bond = clamp(target.bond - 35);
          change(s, { happiness: -12 });
          return `You separated from ${p.name}${settlement ? ` and paid a ${money(settlement)} settlement` : ''}.`;
        }, { cost: p.role === 'spouse' ? 1000 : 0, group, confirm: 'End this romantic relationship?' });
      }
      if (p.role === 'child') {
        add(`${prefix}:support`, 'Support their education', 'Pay for lessons and encourage your child’s development.', s => {
          const target = s.relationships.find(person => person.id === p.id);
          target.bond = clamp(target.bond + 15);
          target.educationSupport = (target.educationSupport || 0) + 1;
          change(s, { happiness: 3, karma: 3 });
          return `You invested in ${p.name}’s education and strengthened your bond.`;
        }, { cost: 1000, group });
      }
      if (p.role === 'pet') {
        add(`${prefix}:vet`, 'Visit the vet', 'Give your companion a health check and treatment.', s => {
          const pet = s.relationships.find(person => person.id === p.id);
          pet.bond = clamp(pet.bond + 10);
          pet.health = clamp((pet.health ?? 60) + 30);
          change(s, { happiness: 3 });
          return `${p.name} received a thorough veterinary examination and treatment.`;
        }, { cost: 250, group });
      }
    }
    const familyGate = () => adult() || (living(state).filter(p => p.role === 'child' && p.age < 18).length >= 10 ? 'Your household is already full.' : null);
    add('relationships:baby', 'Try for a baby', 'Try to grow your family with your partner. Fertility declines with age.', s => {
      const partner = partnerOf(s);
      const reproductiveAge = s.gender === 'female' ? s.age : partner.gender === 'female' ? partner.age : s.age;
      const chance = reproductiveAge < 35 ? 0.78 : reproductiveAge < 42 ? 0.45 : reproductiveAge < 50 ? 0.12 : 0.01;
      if (random(s) < chance) {
        const child = person(s, 'child', 0, 85, { lastName: s.lastName, parents: [s, partner] });
        s.relationships.push(child);
        change(s, { happiness: 15 });
        return `Your family welcomed ${child.name}. Your child will grow older as you age up.`;
      }
      change(s, { happiness: -3 });
      return 'You tried for a baby, but it did not happen this year.';
    }, { cost: 500, gate: () => familyGate() || (!partnerOf(state) ? 'You need a romantic partner to try for a baby.' : null), cap: 2 });
    add('relationships:adopt', 'Adopt a child', 'Complete an adoption assessment and welcome a child into your family.', s => {
      const child = person(s, 'child', 1 + Math.floor(random(s) * 7), 70, { lastName: s.lastName });
      s.relationships.push(child);
      change(s, { happiness: 12, karma: 8 });
      return `Your adoption was approved. You welcomed ${child.name}, age ${child.age}, into your family.`;
    }, { cost: 12000, gate: () => familyGate() || (state.age < 21 || state.age > 70 ? 'Adoption is available from ages 21 to 70.' : null) || (state.prison.record ? 'Your criminal record prevents adoption approval.' : null) });
    add('relationships:fertility', 'Fertility treatment', 'Specialist treatment provides a chance to have a child without a partner.', s => {
      if (random(s) < (s.age <= 40 ? 0.65 : 0.3)) {
        const child = person(s, 'child', 0, 85, { lastName: s.lastName, parents: [s] });
        s.relationships.push(child);
        change(s, { happiness: 15 });
        return `Your fertility treatment succeeded. You welcomed ${child.name}.`;
      }
      return 'The treatment was unsuccessful. The medical costs were still incurred.';
    }, { cost: 8000, gate: () => familyGate() || (state.age > 55 ? 'This clinic offers treatment up to age 55.' : null) });
    add('relationships:pet', 'Adopt a pet', 'Give a shelter dog or cat a home. Pets need care and age faster.', (s, payload) => {
      const pet = { id: uid(s, 'pet'), name: String(payload.name || 'Mochi').trim().slice(0, 30) || 'Mochi', role: 'pet', species: payload.species === 'cat' ? 'cat' : 'dog', age: 1, bond: 70, health: 80, alive: true, gender: random(s) < 0.5 ? 'male' : 'female' };
      s.relationships.push(pet);
      change(s, { happiness: 8 });
      return `You adopted ${pet.name}, a ${pet.species}, from the local shelter.`;
    }, { cost: 250, gate: () => adult() || (living(state).filter(p => p.role === 'pet').length >= 4 ? 'Your home can accommodate up to four pets.' : null), fields: [{ name: 'name', label: 'Pet name', type: 'text', value: 'Mochi' }, { name: 'species', label: 'Species', type: 'select', options: [{ value: 'dog', label: 'Dog' }, { value: 'cat', label: 'Cat' }] }] });
    add('relationships:will', 'Write your will', 'Choose the child who will inherit when you continue your legacy.', (s, payload) => {
      const children = living(s).filter(p => p.role === 'child');
      const heir = children.find(p => p.id === payload.heir) || children[0];
      if (!heir) throw new Error('You need a living child to name as your heir.');
      s.flags.heir = heir.id;
      return `You named ${heir.name} as the beneficiary of your estate.`;
    }, { cost: 250, gate: () => adult() || (!living(state).some(p => p.role === 'child') ? 'You need a living child to name an heir.' : null), fields: [{ name: 'heir', label: 'Choose your heir', type: 'select', options: living(state).filter(p => p.role === 'child').map(p => ({ value: p.id, label: p.name })) }] });
  }

  if (category === 'activities') {
    const basic = [
      ['walk', 'Go for a walk', 'Clear your head and improve your health.', 0, { health: 3, happiness: 3 }, 'fitness', 2, 3, 3],
      ['meditate', 'Meditate', 'Build self-control and emotional balance.', 0, { happiness: 4, discipline: 3, health: 1 }, null, 0, 6, 3],
      ['gym', 'Go to the gym', 'Train your body and improve your appearance.', 80, { health: 5, looks: 2, happiness: 2 }, 'fitness', 6, 14, 3],
      ['sport', 'Practice sport', 'Develop athletic ability through focused practice.', 50, { health: 3, discipline: 2 }, 'athletics', 7, 8, 3],
      ['music', 'Take music lessons', 'Learn an instrument, music theory, and performance.', 250, { happiness: 3, smarts: 1 }, 'music', 9, 6, 3],
      ['acting', 'Take acting lessons', 'Practice delivering a convincing performance.', 250, { looks: 1, happiness: 3 }, 'acting', 9, 8, 3],
      ['writing', 'Practice creative writing', 'Develop your storytelling and language skills.', 0, { smarts: 2, discipline: 1 }, 'writing', 7, 8, 3],
      ['coding', 'Learn programming', 'Build a small project and improve your technical skills.', 100, { smarts: 3, discipline: 2 }, 'coding', 8, 10, 3],
      ['martial', 'Take martial arts lessons', 'Build fitness and self-discipline.', 200, { discipline: 4, health: 3 }, 'fitness', 7, 8, 3],
      ['volunteer', 'Volunteer locally', 'Help your community and meet people.', 0, { karma: 7, happiness: 5 }, null, 0, 12, 2],
    ];
    for (const [id, title, description, cost, effects, talent, gain, minimumAge, cap] of basic) {
      add(`activities:${id}`, title, description, s => {
        change(s, effects);
        if (talent) skill(s, talent, gain);
        return `${title} helped you grow${talent ? `. Your ${talent} skill is now ${Math.round(s.skills[talent])}%` : ''}.`;
      }, { cost, cap, gate: () => ageGate(minimumAge), group: 'Mind & body' });
    }
    add('activities:doctor', 'See a doctor', 'Diagnose and treat an illness, or have a routine check-up.', s => {
      if (s.conditions.length) {
        const condition = s.conditions[0];
        if (random(s) < 0.8) {
          s.conditions.shift();
          change(s, { health: 18, happiness: 4 });
          return `Treatment for ${typeof condition === 'string' ? condition : condition.name || 'your condition'} was successful.`;
        }
        change(s, { health: 4 });
        return 'Your treatment helped a little, but the condition needs further care.';
      }
      change(s, { health: 8 });
      return 'Your doctor completed a check-up and gave you a useful care plan.';
    }, { cost: 250, cap: 3, group: 'Healthcare' });
    add('activities:therapy', 'Attend therapy', 'Receive support for stress, mood, and difficult experiences.', s => {
      change(s, { happiness: 15, discipline: 3 });
      const index = s.conditions.findIndex(c => /depress|anxiety|stress/i.test(typeof c === 'string' ? c : c.name || ''));
      if (index >= 0 && random(s) < 0.65) s.conditions.splice(index, 1);
      return 'A thoughtful therapy session helped you process your feelings.';
    }, { cost: 200, cap: 3, group: 'Healthcare' });
    add('activities:rehab', 'Enter rehabilitation', 'Seek treatment for an addiction and rebuild your health.', s => {
      s.conditions = s.conditions.filter(c => !/addict|alcohol|drug/i.test(typeof c === 'string' ? c : c.name || ''));
      s.flags.addiction = false;
      change(s, { health: 15, discipline: 8, happiness: 5 });
      return 'You completed a rehabilitation programme and committed to recovery.';
    }, { cost: 2500, gate: () => ageGate(16), group: 'Healthcare' });
    add('activities:surgery', 'Have cosmetic surgery', 'A surgical procedure can improve your looks, with some medical risk.', s => {
      if (random(s) < 0.1) {
        change(s, { looks: -12, health: -15, happiness: -8 });
        return 'Your procedure had complications. You need time and medical care to recover.';
      }
      change(s, { looks: 18, health: -4, happiness: 6 });
      return 'You recovered from your procedure and are pleased with the results.';
    }, { cost: 5000, gate: adult, group: 'Healthcare' });
    add('activities:diet', 'Adopt a healthy diet', 'Improve your health through a balanced eating plan.', s => {
      s.flags.healthyDiet = true;
      change(s, { health: 8, looks: 2, discipline: 3 });
      return 'You planned balanced meals and committed to a healthier diet.';
    }, { cost: 300, gate: () => ageGate(14), group: 'Mind & body' });
    add('activities:vacation', 'Take a holiday', 'Enjoy a relaxing trip away from daily responsibilities.', s => {
      change(s, { happiness: 18, health: 3 });
      s.flags.travelCount = (s.flags.travelCount || 0) + 1;
      for (const p of living(s).filter(p => ['partner', 'spouse', 'child'].includes(p.role))) p.bond = clamp(p.bond + 8);
      return 'You returned from a memorable holiday feeling refreshed and closer to your family.';
    }, { cost: 2000, gate: adult, group: 'Travel' });
    for (const destination of COUNTRIES) {
      add(`activities:emigrate:${destination.id}`, `Move to ${destination.name}`, 'Emigrate, establish a new home, and leave your current job.', s => {
        s.country = destination.id;
        s.city = destination.cities[0];
        s.job = null;
        s.specialCareer = null;
        s.flags.emigrations = (s.flags.emigrations || 0) + 1;
        s.flags.countriesVisited = (s.flags.countriesVisited || 0) + 1;
        change(s, { happiness: 8 });
        return `You emigrated to ${destination.name} and settled in ${s.city}. Look for new work in your new home.`;
      }, { cost: 5000, group: 'Emigration', gate: () => adult() || (countryOf(state)?.id === destination.id ? 'You already live here.' : null) || (state.prison.record > 2 ? 'Your criminal record prevents this visa application.' : null) });
    }
    add('activities:socialjoin', 'Create a social media account', 'Start building an audience online.', s => {
      s.flags.socialAccount = true;
      s.social.followers += 25;
      return 'You created an account and your first followers arrived.';
    }, { gate: () => ageGate(13) || (state.flags.socialAccount ? 'You already have an account.' : null), group: 'Social media' });
    add('activities:post', 'Post on social media', 'Share original content. Quality and fame affect audience growth.', s => {
      const viral = random(s) < 0.06;
      const gain = Math.round((30 + s.skills.writing * 3 + s.stats.fame * 50 + s.social.followers * 0.02) * (viral ? 12 : 0.5 + random(s)));
      s.social.followers += gain;
      s.social.posts += 1;
      change(s, { fame: viral ? 4 : 1, happiness: 2 });
      return `Your post ${viral ? 'went viral and ' : ''}attracted ${gain.toLocaleString()} new followers.`;
    }, { gate: () => !state.flags.socialAccount ? 'Create a social media account first.' : null, cap: 4, group: 'Social media' });
    add('activities:sponsor', 'Accept a sponsorship', 'Monetize your audience through a paid promotional post.', s => {
      const pay = Math.round(s.social.followers * 0.025);
      s.cash += pay;
      s.social.followers = Math.max(0, Math.round(s.social.followers * 0.98));
      return `A sponsor paid you ${money(pay)}. Some followers disliked the advertisement.`;
    }, { gate: () => state.social.followers < 10000 ? 'Requires at least 10,000 followers.' : null, group: 'Social media' });
    add('activities:nightclub', 'Go clubbing', 'Enjoy a night out. Excessive partying can harm your health.', s => {
      change(s, { happiness: 10, health: -3 });
      if (random(s) < 0.08 && !s.conditions.some(c => /alcohol/i.test(typeof c === 'string' ? c : c.name || ''))) {
        s.conditions.push('Alcohol addiction');
        s.flags.addiction = true;
        return 'Your partying became difficult to control. You developed an alcohol addiction.';
      }
      return 'You danced late into the night and enjoyed yourself.';
    }, { cost: 150, gate: adult, cap: 2, group: 'Leisure' });
  }

  if (category === 'assets') {
    for (const asset of ASSETS) {
      const property = asset.type === 'property';
      const vehicleGate = () => ageGate(asset.id === 'bicycle' ? 12 : 18) || (asset.type === 'vehicle' && !['bicycle', 'scooter'].includes(asset.id) && !state.licenses.includes('driving') ? 'Earn a driving licence first.' : null) || (asset.type === 'aircraft' && !state.licenses.includes('pilot') ? 'Earn a pilot licence first.' : null);
      add(`assets:buy:${asset.id}`, `Buy ${asset.name}`, `${money(asset.value)} · ${asset.type}. Ownership brings annual running costs.`, s => {
        s.assets.push({ ...asset, id: uid(s, asset.id), condition: 100, rented: false, mortgage: 0 });
        change(s, { happiness: 6 });
        return `You purchased ${asset.name} for ${money(asset.value)}.`;
      }, { cost: asset.value, group: 'For sale', gate: vehicleGate, cap: 3 });
      if (property) {
        add(`assets:mortgage:${asset.id}`, `Mortgage ${asset.name}`, `${money(asset.value * 0.2)} deposit, ${money(asset.value * 0.8)} mortgage. Annual repayments and interest apply.`, s => {
          s.assets.push({ ...asset, id: uid(s, asset.id), condition: 100, rented: false, mortgage: Math.round(asset.value * 0.8) });
          change(s, { happiness: 8 });
          return `You bought ${asset.name} with a 20% deposit and a ${money(asset.value * 0.8)} mortgage. Your loan is secured against the property.`;
        }, { cost: Math.round(asset.value * 0.2), group: 'Mortgages', gate: () => adult() || (!state.job && !state.business && !state.specialCareer ? 'A regular income is required for mortgage approval.' : null) || (state.debt > Math.max(10000, state.cash) ? 'Your unsecured debt is too high for mortgage approval.' : null), cap: 1 });
      }
    }
    for (const asset of state.assets) {
      const group = `${asset.name} · ${Math.round(asset.condition)}% condition`;
      const id = encodeURIComponent(asset.id);
      add(`assets:sell:${id}`, 'Sell asset', `Sell for approximately ${money(asset.value)}${asset.mortgage ? ` and settle ${money(asset.mortgage)} mortgage` : ''}.`, s => {
        const target = s.assets.find(item => item.id === asset.id);
        const proceeds = Math.round(target.value * (0.94 + random(s) * 0.06)) - target.mortgage;
        if (proceeds < 0) spend(s, -proceeds);
        else s.cash += proceeds;
        s.assets = s.assets.filter(item => item.id !== asset.id);
        return `You sold ${asset.name}. ${proceeds >= 0 ? `After settling secured debt, you received ${money(proceeds)}.` : `You paid ${money(-proceeds)} to cover the remaining secured debt.`}`;
      }, { group, confirm: 'Sell this asset and settle any outstanding mortgage?', gate: () => state.cash < Math.max(0, asset.mortgage - asset.value * 0.94) ? 'You need enough cash to cover possible negative equity.' : null });
      add(`assets:repair:${id}`, 'Maintain and repair', 'Restore condition. Good maintenance helps preserve value.', s => {
        const target = s.assets.find(item => item.id === asset.id);
        const improvement = 100 - target.condition;
        target.condition = 100;
        target.value = Math.round(target.value * (1 + improvement * 0.001));
        return `You restored ${asset.name} to excellent condition.`;
      }, { cost: Math.max(100, Math.round(asset.value * 0.015)), group, gate: () => asset.condition >= 100 ? 'This asset is already in perfect condition.' : null });
      if (asset.type === 'property') {
        add(`assets:rent:${id}`, asset.rented ? 'End rental agreement' : 'Rent out property', asset.rented ? 'Stop receiving rent and make the property available for your own use.' : 'Receive annual rent, with maintenance and tenant risks.', s => {
          const target = s.assets.find(item => item.id === asset.id);
          target.rented = !target.rented;
          return target.rented ? `You rented out ${asset.name}. Rental income will be paid each year.` : `You ended the tenancy at ${asset.name}.`;
        }, { group });
      } else {
        add(`assets:enjoy:${id}`, `Enjoy your ${asset.type}`, 'Spend some time enjoying something you own.', s => {
          const target = s.assets.find(item => item.id === asset.id);
          target.condition = clamp(target.condition - 2);
          change(s, { happiness: 8 });
          return `You spent an enjoyable day with your ${asset.name}.`;
        }, { group });
      }
    }
  }

  if (category === 'finance') {
    add('finance:blackjack', 'Play blackjack', 'Play a real hand: hit or stand, beat the dealer, and stay under 22. Naturals pay 3:2.', () => '', { minigame: 'blackjack', group: 'Gambling', cap: 3, gate: () => adult() || (state.cash < 10 ? 'You need at least $10 to play.' : null), fields: [field('amount', 'Stake', Math.max(10, Math.min(100, state.cash)), 10, Math.min(1000000, Math.max(10, state.cash)))] });
    for (const investment of [
      { id: 'index', name: 'Global index fund', type: 'index', description: 'Diversified shares. Moderate volatility; returns can be negative.' },
      { id: 'stocks', name: 'Individual shares', type: 'stock', description: 'Concentrated shares. Higher potential gains and losses.' },
      { id: 'crypto', name: 'Cryptocurrency', type: 'crypto', description: 'Highly speculative digital assets. Large gains and losses are possible.' },
      { id: 'bond', name: 'Government bonds', type: 'bond', description: 'A lower-risk investment with modest annual returns.' },
    ]) {
      add(`finance:buy:${investment.id}`, `Invest in ${investment.name}`, investment.description, (s, payload) => {
        const value = amount(payload, Math.min(1000, s.cash), 100, 1e12);
        spend(s, value);
        s.investments.push({ id: uid(s, investment.id), name: investment.name, type: investment.type, value, cost: value });
        return `You invested ${money(value)} in ${investment.name}. Returns are applied when you age up.`;
      }, { gate: () => adult() || (state.cash < 100 ? 'You need at least $100 to invest.' : null), cap: 5, fields: [field('amount', 'Amount to invest', Math.max(100, Math.min(1000, state.cash)), 100, 1e12)], group: 'Investments' });
    }
    for (const investment of state.investments) {
      add(`finance:sell:${encodeURIComponent(investment.id)}`, `Sell ${investment.name}`, `Current value ${money(investment.value)} · ${money(investment.value - investment.cost)} gain or loss. A 1% transaction fee applies.`, s => {
        const target = s.investments.find(item => item.id === investment.id);
        const proceeds = Math.round(target.value * 0.99);
        s.cash += proceeds;
        s.investments = s.investments.filter(item => item.id !== investment.id);
        return `You sold ${investment.name} for ${money(proceeds)} after the transaction fee.`;
      }, { group: 'Your portfolio' });
    }
    const borrowingRoom = Math.max(0, Math.min(1e8, Math.max(5000, (state.job?.salary || 0) * 2 + (state.specialCareer?.earnings || 0)) - state.debt));
    add('finance:loan', 'Apply for a personal loan', 'Borrow cash. Interest applies annually; repay principal through your bank.', (s, payload) => {
      const ceiling = Math.max(5000, (s.job?.salary || 0) * 2 + (s.specialCareer?.earnings || 0));
      const value = amount(payload, Math.min(5000, ceiling - s.debt), 1000, Math.min(1e8, ceiling));
      if (s.debt + value > ceiling) throw new Error(`Your total unsecured borrowing limit is ${money(ceiling)}.`);
      s.cash += value;
      s.debt += value;
      return `Your ${money(value)} loan was approved. Outstanding unsecured debt: ${money(s.debt)}. Interest is charged annually; use Repay debt to reduce the principal.`;
    }, { gate: () => adult() || (borrowingRoom < 1000 ? 'You have reached your unsecured borrowing limit.' : null), fields: [field('amount', 'Loan amount', Math.max(1000, Math.min(5000, borrowingRoom)), 1000, Math.max(1000, borrowingRoom))], group: 'Banking' });
    add('finance:repay', 'Repay debt', 'Reduce your unsecured borrowing and future interest costs.', (s, payload) => {
      const value = amount(payload, Math.min(1000, s.debt, s.cash), 1, Math.max(1, s.debt));
      spend(s, value);
      s.debt = Math.max(0, s.debt - value);
      return `You repaid ${money(value)}. Your remaining unsecured debt is ${money(s.debt)}.`;
    }, { gate: () => state.debt <= 0 ? 'You have no unsecured debt to repay.' : state.cash < 1 ? 'You need cash to repay debt.' : null, cap: 10, fields: [field('amount', 'Repayment amount', Math.min(1000, state.debt, state.cash), 1, Math.max(1, state.debt))], group: 'Banking' });
    add('finance:mortgage', 'Make a mortgage overpayment', 'Reduce secured borrowing on your first mortgaged property.', (s, payload) => {
      const asset = s.assets.find(item => item.mortgage > 0);
      if (!asset) throw new Error('You have no mortgage.');
      const value = amount(payload, Math.min(1000, asset.mortgage, s.cash), 1, asset.mortgage);
      spend(s, value);
      asset.mortgage -= value;
      return `You paid ${money(value)} toward ${asset.name}. The remaining mortgage is ${money(asset.mortgage)}.`;
    }, { gate: () => !state.assets.some(a => a.mortgage > 0) ? 'You do not have a mortgage.' : state.cash < 1 ? 'You need cash to overpay your mortgage.' : null, cap: 10, fields: [field('amount', 'Overpayment', Math.min(1000, state.cash, state.assets.find(a => a.mortgage > 0)?.mortgage || 1000), 1, state.assets.find(a => a.mortgage > 0)?.mortgage || 1e12)], group: 'Banking' });
    add('finance:charity', 'Donate to charity', 'Support a good cause and improve your karma.', (s, payload) => {
      const value = amount(payload, Math.min(1000, s.cash), 10, 1e12);
      spend(s, value);
      change(s, { karma: Math.min(15, 2 + Math.log10(value)), happiness: 4 });
      s.flags.donated = (s.flags.donated || 0) + value;
      return `You donated ${money(value)} to a community charity.`;
    }, { gate: () => adult() || (state.cash < 10 ? 'You need at least $10 to donate.' : null), cap: 3, fields: [field('amount', 'Donation', Math.max(10, Math.min(1000, state.cash)), 10, 1e12)], group: 'Giving' });
    for (const game of [
      { id: 'casino', title: 'Play at the casino', odds: 0.45, multiplier: 2, description: 'A chance-based even-money game. The house has an edge.' },
      { id: 'sports', title: 'Place a sports bet', odds: 0.3, multiplier: 3, description: 'Back an underdog. Most wagers lose.' },
      { id: 'lottery', title: 'Buy lottery tickets', odds: 0.002, multiplier: 300, description: 'A very small chance of a large payout. Expect to lose your stake.' },
    ]) add(`finance:${game.id}`, game.title, game.description, (s, payload) => {
      const stake = amount(payload, game.id === 'lottery' ? 10 : Math.min(100, s.cash), 10, game.id === 'lottery' ? 100 : 1000000);
      spend(s, stake);
      if (random(s) < game.odds) {
        const payout = Math.round(stake * game.multiplier);
        s.cash += payout;
        change(s, { happiness: 6 });
        s.flags.gamblingWins = (s.flags.gamblingWins || 0) + 1;
        return `You won ${money(payout)} on a ${money(stake)} wager. Your net gain was ${money(payout - stake)}.`;
      }
      change(s, { happiness: -3 });
      if (random(s) < 0.04 && !s.conditions.includes('Gambling addiction')) s.conditions.push('Gambling addiction');
      return `You lost your ${money(stake)} wager.`;
    }, { gate: () => adult() || (state.cash < 10 ? 'You need at least $10 to place a wager.' : null), cap: 3, group: 'Gambling', fields: [field('amount', 'Stake', game.id === 'lottery' ? 10 : Math.max(10, Math.min(100, state.cash)), 10, game.id === 'lottery' ? 100 : 1000000)] });
  }

  if (category === 'crime') {
    if (state.prison.years > 0) {
      add('crime:appeal', 'Hire an appeals lawyer', 'A lawyer may reduce your sentence or overturn a conviction.', s => {
        if (random(s) < 0.35 + s.stats.smarts * 0.002) {
          const reduction = Math.max(1, Math.ceil(s.prison.years * 0.65));
          s.prison.years = Math.max(0, s.prison.years - reduction);
          if (s.prison.years === 0) s.flags.released = true;
          return `Your appeal succeeded. Your sentence was reduced by ${reduction} years${s.prison.years === 0 ? ' and you were released' : ''}.`;
        }
        return 'Your appeal was denied. The court upheld your conviction.';
      }, { cost: 10000, group: 'Prison' });
      add('crime:escape', 'Attempt an escape', 'Navigate a prison grid past a pursuing guard. Each move matters.', () => '', { minigame:'escape', group: 'Prison', confirm: 'Navigate the prison grid past a pursuing guard. Failure or abandoning the attempt adds three years to your sentence.' });
      add('crime:prisonstudy', 'Study in prison', 'Use prison library resources to improve your mind.', s => {
        change(s, { smarts: 5, discipline: 3 });
        skill(s, 'writing', 4);
        return 'You spent time studying in the prison library.';
      }, { group: 'Prison', cap: 3 });
      add('crime:prisonexercise', 'Exercise in the yard', 'Maintain your health and fitness while incarcerated.', s => {
        change(s, { health: 4, discipline: 2 });
        skill(s, 'fitness', 6);
        return 'You worked out in the exercise yard and improved your fitness.';
      }, { group: 'Prison', cap: 3 });
      add('crime:prisonwork', 'Work a prison job', 'Earn a modest amount and demonstrate good conduct.', s => {
        change(s, { cash: 120, discipline: 4, karma: 2 });
        s.flags.goodConduct = (s.flags.goodConduct || 0) + 1;
        return 'You worked in the prison kitchen, earned $120, and improved your conduct record.';
      }, { group: 'Prison', cap: 3 });
      add('crime:parole', 'Apply for parole', 'Good conduct and a completed portion of your sentence improve your chances.', s => {
        const chance = Math.min(0.8, 0.15 + (s.flags.goodConduct || 0) * 0.06 + s.stats.karma * 0.002);
        if (random(s) < chance) {
          s.prison.years = 0;
          s.flags.released = true;
          s.flags.goodConduct = 0;
          return 'The parole board approved your release. You are free to rebuild your life.';
        }
        return 'The parole board declined your application. Continue demonstrating good conduct.';
      }, { group: 'Prison', gate: () => state.age <= (state.flags.convictionAge ?? state.age - 1) ? 'Serve at least one year of your sentence before applying for parole.' : !(state.flags.goodConduct >= 2) ? 'Complete at least two prison work shifts to demonstrate good conduct.' : null });
    } else {
      const crimes = [
        { id: 'shoplift', title: 'Shoplift', description: 'Steal small items from a shop.', reward: 120, risk: 0.3, term: 1, karma: 5, age: 12 },
        { id: 'pickpocket', title: 'Pickpocket', description: 'Try to steal money from a passer-by.', reward: 350, risk: 0.38, term: 2, karma: 7, age: 14 },
        { id: 'burglary', title: 'Commit a burglary', description: 'Break into a home. Discovery can lead to a long sentence.', reward: 5000, risk: 0.5, term: 5, karma: 14, age: 16 },
        { id: 'vehicle', title: 'Steal a vehicle', description: 'Attempt a high-value vehicle theft.', reward: 12000, risk: 0.6, term: 6, karma: 16, age: 16 },
        { id: 'fraud', title: 'Commit financial fraud', description: 'A complex scam with a large potential payout and serious consequences.', reward: 25000, risk: 0.65, term: 8, karma: 20, age: 18 },
        { id: 'bank', title: 'Rob a bank', description: 'An extremely risky crime carrying a severe prison sentence.', reward: 85000, risk: 0.78, term: 15, karma: 30, age: 18 },
        { id: 'assault', title: 'Assault a stranger', description: 'A violent confrontation can harm you and lead to imprisonment.', reward: 0, risk: 0.62, term: 4, karma: 25, age: 16, lethal: true },
        { id: 'murder', title: 'Commit murder', description: 'A grave violent crime with a life-changing sentence and lasting consequences.', reward: 0, risk: 0.85, term: 35, karma: 70, age: 18, lethal: true },
      ];
      for (const crime of crimes) add(`crime:${crime.id}`, crime.title, crime.description, s => commitCrime(s, crime), { gate: () => ageGate(crime.age), cap: 2, confirm: `${crime.title}? You risk a ${crime.term}-year sentence.`, group: 'Crimes' });
      add('crime:laylow', 'Keep a low profile', 'Reduce criminal heat by avoiding attention.', s => {
        s.prison.heat = clamp(s.prison.heat - 20);
        change(s, { discipline: 2 });
        return 'You avoided trouble and reduced the attention you attract from law enforcement.';
      }, { gate: () => ageGate(12), group: 'Legal matters' });
      add('crime:expunge', 'Seek record expungement', 'Pay legal fees for a chance to remove one old conviction.', s => {
        if (s.prison.heat > 20 || random(s) > 0.65) return 'The court declined to expunge your conviction. The legal fees were still payable.';
        s.prison.record = Math.max(0, s.prison.record - 1);
        return 'The court approved your petition and removed one conviction from your record.';
      }, { cost: 8000, gate: () => adult() || (!state.prison.record ? 'Your criminal record is already clean.' : null), group: 'Legal matters' });
    }
  }

  if (category === 'special') {
    for (const career of SPECIAL_CAREERS) {
      add(`special:start:${career.id}`, `Become ${/^[aeiou]/i.test(career.title) ? 'an' : 'a'} ${career.title}`, career.description, s => {
        const talent = s.skills[career.skill] || 0;
        const criminal = career.id === 'crime_family';
        const earnings = criminal ? 30000 : career.id === 'astronaut' ? 85000 : career.id === 'politician' ? 45000 : Math.round(18000 + talent * 500);
        s.specialCareer = { id: career.id, title: career.title, level: 1, performance: 50 + talent * 0.3, earnings };
        s.job = null;
        s.flags.retired = false;
        change(s, { happiness: 7, fame: criminal ? 0 : 3 });
        return `You began your career as ${career.title}. Annual earnings start at ${money(earnings)}. Use your career activities to progress.`;
      }, { cost: career.cost || 0, group: 'Special careers', gate: () => adult() || (state.specialCareer?.id === career.id ? 'You already follow this career.' : null) || ((state.skills[career.skill] || 0) < (career.minSkill ?? 40) ? `Requires ${career.minSkill ?? 40}% ${career.skill} skill. Train through Activities.` : null) || (career.id === 'astronaut' && ((rank[state.education.level] || 0) < 2 || !state.licenses.includes('pilot')) ? 'Requires a university degree and pilot licence.' : null) || (career.id === 'athlete' && state.age > 40 ? 'Professional sports entry is available through age 40.' : null) || (career.id === 'politician' && state.prison.record ? 'A clean criminal record is required to run for office.' : null) });
    }
    if (state.specialCareer) {
      const career = state.specialCareer;
      add('special:practice', 'Develop your career', 'Focused practice improves your professional performance.', s => {
        const data = SPECIAL_CAREERS.find(c => c.id === s.specialCareer.id);
        s.specialCareer.performance = clamp(s.specialCareer.performance + 10);
        if (data?.skill) skill(s, data.skill, 4);
        change(s, { discipline: 2, happiness: -2 });
        return `You improved your ${career.title} performance to ${Math.round(s.specialCareer.performance)}%.`;
      }, { group: career.title, cap: 3 });
      const actionsByCareer = {
        musician: ['Release a single', 'Record and distribute original music. Sales depend on your talent and fame.', 'music', 1500],
        actor: ['Audition for a film', 'Compete for a role. Strong acting and a public profile improve your prospects.', 'acting', 500],
        athlete: ['Compete in a tournament', 'Test your athletic skill in a professional competition.', 'athletics', 1000],
        politician: ['Run an election campaign', 'Campaign for the next level of office. Voters consider your karma and reputation.', null, 10000],
        astronaut: ['Fly a space mission', 'Use your technical ability and fitness on a risky scientific mission.', 'coding', 5000],
        writer: ['Publish a book', 'Release an original book and earn sales from your readership.', 'writing', 2000],
        influencer: ['Launch a creator campaign', 'Produce a major collaboration and reach new followers.', 'writing', 500],
        fighter: ['Take a professional fight', 'Fight for prize money. Your fitness affects success and injury risk.', 'fitness', 500],
        director: ['Direct a feature film', 'Finance an original production. Artistic success can generate substantial returns.', 'acting', 10000],
        model: ['Attend a casting', 'Compete for a major modelling contract.', null, 300],
        street_performer: ['Perform in the city square', 'A lively public performance can attract tips and an audience.', 'music', 0],
        crime_family: ['Complete a syndicate job', 'A lucrative criminal assignment with a high risk of imprisonment.', 'crime', 0],
        royal: ['Attend a royal engagement', 'Fulfil public duties and build approval.', null, 1000],
      };
      const activity = actionsByCareer[career.id] || ['Take on a major assignment', 'Use your professional talents to advance and earn a bonus.', null, 1000];
      add(`special:work:${career.id}`, activity[0], activity[1], s => {
        const current = s.specialCareer;
        const talent = activity[2] ? s.skills[activity[2]] : current.id === 'model' ? s.stats.looks : current.id === 'politician' ? s.stats.karma : s.stats.smarts;
        if (current.id === 'crime_family') {
          const result = commitCrime(s, { title: 'Syndicate robbery', reward: 25000 * current.level, risk: 0.62, term: 12, karma: 20 });
          if (s.specialCareer) s.specialCareer.performance = clamp(s.specialCareer.performance + 5);
          return result;
        }
        const physicalEdge = ['athlete', 'fighter', 'astronaut'].includes(current.id) ? (physicalAbility(s) - 50) * 0.002 : 0;
        const chance = clamp((0.15 + talent * 0.005 + current.performance * 0.003) * personalityModifier(s, 'work') + physicalEdge, 0.1, 0.93);
        if (random(s) < chance) {
          const payout = Math.round((current.id === 'politician' ? 2000 : current.id === 'street_performer' ? 300 : current.id === 'director' ? 25000 : 5000) * current.level * (0.5 + talent / 100));
          current.level += 1;
          current.performance = clamp(current.performance + 5);
          current.earnings = Math.round(current.earnings * 1.15);
          s.cash += payout;
          change(s, { fame: current.id === 'street_performer' ? 2 : 7, happiness: 8 });
          if (current.id === 'influencer') s.social.followers += Math.round(10000 * current.level);
          if (current.id === 'politician') current.title = ['Local councillor', 'City mayor', 'Regional governor', 'National leader'][Math.min(current.level - 1, 3)];
          return `Your ${activity[0].toLowerCase()} succeeded. You earned ${money(payout)}, reached career level ${current.level}, and increased your annual earnings to ${money(current.earnings)}.`;
        }
        current.performance = clamp(current.performance - 8);
        change(s, { happiness: -5 });
        if (['astronaut', 'athlete', 'fighter'].includes(current.id)) change(s, { health: -15 });
        return `Your ${activity[0].toLowerCase()} did not go as planned.${['astronaut', 'athlete', 'fighter'].includes(current.id) ? ' You suffered an injury.' : ' Your professional reputation suffered.'}`;
      }, { cost: activity[3], group: career.title, cap: career.id === 'politician' ? 1 : 2 });
      add('special:quit', 'Leave this career', 'Step away from your specialist profession and its annual earnings.', s => {
        s.specialCareer = null;
        return `You stepped away from your career as ${career.title}.`;
      }, { group: career.title, confirm: 'Leave this special career?' });
    }
    add('special:fameinterview', 'Give a public interview', 'A good interview raises your profile and earns an appearance fee.', s => {
      const fee = Math.round(s.stats.fame * 200);
      change(s, { cash: fee, fame: 4, happiness: 3 });
      return `Your interview earned ${money(fee)} and attracted new attention.`;
    }, { gate: () => state.stats.fame < 20 ? 'Requires 20 fame.' : null, group: 'Fame' });
    add('special:bookdeal', 'Sign an autobiography deal', 'Publish your life story while public interest is high.', s => {
      const advance = Math.round(s.stats.fame * 1800 + s.skills.writing * 500);
      s.cash += advance;
      change(s, { fame: 3 });
      return `A publisher bought your life story for an advance of ${money(advance)}.`;
    }, { gate: () => state.stats.fame < 60 ? 'Requires 60 fame.' : null, group: 'Fame' });
    add('special:royalty', 'Pursue a royal marriage', 'Attend exclusive events to seek a connection with a royal household.', s => {
      if (random(s) < 0.15 + s.stats.fame * 0.003) {
        const royal = person(s, 'spouse', s.age + 2, 65, { prefix: 'Royal' });
        s.relationships.push(royal);
        s.specialCareer = { id: 'royal', title: 'Member of the royal household', level: 1, performance: 60, earnings: 120000 };
        s.job = null;
        s.flags.royal = true;
        change(s, { fame: 25, happiness: 10 });
        return `You met and married ${royal.name}. You joined the royal household and now receive an annual allowance for public duties.`;
      }
      return 'You attended the royal social season, but no lasting connection developed.';
    }, { cost: 50000, gate: () => adult() || (partnerOf(state) ? 'You must be single to seek a royal marriage.' : null) || (state.stats.fame < 40 ? 'Requires 40 fame to enter these circles.' : null) || (!['uk', 'es', 'se', 'jp', 'ae', 'norway', 'thailand', 'monaco', 'united-kingdom', 'united_kingdom'].includes(countryOf(state)?.id) && !/kingdom|japan|spain|sweden|norway|thailand|monaco/i.test(countryOf(state)?.name || '') ? 'Move to a country with a monarchy first.' : null), group: 'Royalty' });
    add('special:business', 'Start a business', 'Invest capital in a company. Profits, wages, and market risk apply each year.', (s, payload) => {
      const capital = amount(payload, Math.min(25000, s.cash), 10000, 1e9);
      spend(s, capital);
      const name = String(payload.name || `${s.lastName} & Co.`).trim().slice(0, 50) || `${s.lastName} & Co.`;
      const type = ['Technology', 'Retail', 'Food', 'Consulting', 'Manufacturing'].includes(payload.type) ? payload.type : 'Technology';
      s.business = { name, type, value: capital, capital, employees: 1, performance: 55, profit: 0 };
      change(s, { happiness: 8 });
      return `You founded ${name}, a ${type.toLowerCase()} business, with ${money(capital)} of company capital. Business results are settled each year.`;
    }, { gate: () => adult() || (state.business ? 'You already own a business.' : null) || (state.cash < 10000 ? 'Starting a business requires at least $10,000 capital.' : null), fields: [{ name: 'name', label: 'Company name', type: 'text', value: `${state.lastName} & Co.` }, { name: 'type', label: 'Industry', type: 'select', options: ['Technology', 'Retail', 'Food', 'Consulting', 'Manufacturing'].map(value => ({ value, label: value })) }, field('amount', 'Initial capital', Math.max(10000, Math.min(25000, state.cash)), 10000, 1e9)], group: 'Business' });
    if (state.business) {
      const business = state.business;
      add('special:businessmanage', 'Improve operations', 'Work on efficiency, quality, and customer satisfaction.', s => {
        s.business.performance = clamp(s.business.performance + 12);
        change(s, { discipline: 3, happiness: -2 });
        return `Your work improved ${business.name}’s operating performance to ${Math.round(s.business.performance)}%.`;
      }, { cap: 3, group: business.name });
      add('special:businessmarketing', 'Run a marketing campaign', 'Invest company capital to attract customers and increase performance.', s => {
        if (s.business.capital < 3000) throw new Error('Your company needs $3,000 in capital to fund this campaign.');
        s.business.capital -= 3000;
        s.business.performance = clamp(s.business.performance + 18);
        s.business.value += 1500;
        return 'Your marketing campaign attracted new customers and improved your company’s prospects.';
      }, { group: business.name, gate: () => business.capital < 3000 ? 'The company needs $3,000 in available capital.' : null });
      add('special:businesshire', 'Expand the team', 'Spend $5,000 of company capital to hire an employee. Payroll increases annually.', s => {
        if (s.business.capital < 5000) throw new Error('The company needs $5,000 in capital to expand.');
        s.business.capital -= 5000;
        s.business.employees += 1;
        s.business.performance = clamp(s.business.performance + 5);
        s.business.value += 5000;
        return `You hired an employee. ${business.name} now has ${s.business.employees} employees.`;
      }, { group: business.name, cap: 3, gate: () => business.capital < 5000 ? 'The company needs $5,000 in available capital.' : null });
      add('special:businessinject', 'Inject capital', 'Invest more of your personal cash in the company.', (s, payload) => {
        const value = amount(payload, Math.min(10000, s.cash), 1000, 1e9);
        spend(s, value);
        s.business.capital += value;
        s.business.value += value;
        return `You invested another ${money(value)} in ${business.name}.`;
      }, { group: business.name, cap: 3, gate: () => state.cash < 1000 ? 'You need at least $1,000 cash to invest in your company.' : null, fields: [field('amount', 'Capital investment', Math.max(1000, Math.min(10000, state.cash)), 1000, 1e9)] });
      add('special:businessdividend', 'Take a dividend', 'Withdraw available company capital. Keep enough cash to fund operations.', (s, payload) => {
        const value = amount(payload, Math.min(1000, s.business.capital), 1, Math.max(1, s.business.capital));
        s.business.capital -= value;
        s.business.value = Math.max(0, s.business.value - value);
        s.cash += value;
        return `You withdrew a ${money(value)} dividend from ${business.name}.`;
      }, { group: business.name, gate: () => business.capital <= 0 ? 'There is no company capital available to distribute.' : null, fields: [field('amount', 'Dividend', Math.min(1000, business.capital), 1, Math.max(1, business.capital))] });
      add('special:businesssell', 'Sell your business', `An acquisition would pay approximately ${money(business.value)}. Company capital is included in the sale price.`, s => {
        const offer = Math.round(s.business.value * (0.8 + random(s) * 0.4));
        s.cash += offer;
        s.business = null;
        return `You sold ${business.name} for ${money(offer)}.`;
      }, { group: business.name, confirm: 'Sell your business and end your ownership?' });
    }
  }

  return actions;
}

function blocked(state, action) {
  if (!state.alive) return 'This life has ended. Start a new life or continue your legacy.';
  if (state.minigame) return 'Finish your current game first.';
  if (state.pendingEvent) return 'Resolve your current life event first.';
  if (state.prison.years > 0 && !action.id.startsWith('crime:')) return 'You are in prison. Use prison activities in Crime & Law.';
  if (count(state, '__total') >= 100) return 'You have used this year’s action allowance. Age up to continue.';
  if (count(state, action.id) >= action.cap) return action.cap > 1 ? `You have done this ${action.cap} times this year. Age up to continue.` : 'You have already done this this year. Age up to continue.';
  if (action.id.startsWith('career:apply:') && count(state, 'applications') >= 8) return 'You have submitted eight job applications this year.';
  if (action.id.startsWith('activities:emigrate:') && count(state, 'emigrations') >= 1) return 'You can emigrate once per year.';
  const reason = action.gate?.();
  if (reason) return reason;
  if (action.cost > state.cash) return `Requires ${money(action.cost)} in available cash.`;
  return null;
}

/** Read-only action catalogue. State gates are checked again when executing. */
export function getActions(state, category) {
  if (!CATEGORIES.includes(category)) return [];
  return definitions(state, category).map(action => {
    const { execute, gate, cap, category: internalCategory, ...descriptor } = action;
    const disabled = blocked(state, action);
    return disabled ? { ...descriptor, disabled } : descriptor;
  });
}

/** Atomic action transaction: errors and failed validation never charge or mutate the caller. */
export function performAction(state, actionId, payload = {}) {
  let next;
  try {
    next = structuredClone(state);
    if (!next || !next.stats || !next.education || !next.prison) throw new Error('This save is not a valid life.');
    next.actionCounts ||= {};
    next.flags ||= {};
    enrichHumans(next);
    if (typeof actionId !== 'string') throw new Error('Choose a valid action.');
    const category = CATEGORIES.find(name => actionId.startsWith(`${name}:`));
    if (!category) throw new Error('That action does not exist.');
    const action = definitions(next, category).find(item => item.id === actionId);
    if (!action) throw new Error('That action is no longer available.');
    const reason = blocked(next, action);
    if (reason) throw new Error(reason);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('The action details are invalid.');
    if (action.minigame) return beginMiniGame(next, action.minigame, payload);
    const beforeStats = { ...next.stats };
    if (action.cost) spend(next, action.cost);
    const message = action.execute(next, payload);
    for (const entity of next.relationships) {
      if (entity.role !== 'pet' && !entity.species) ensureCharacter(entity, { seed: `${next.seed}:${entity.id}` });
    }
    reconcileCharacter(next, beforeStats);
    applyCharacterAction(next, actionId);
    next.actionCounts[actionId] = count(next, actionId) + 1;
    next.actionCounts.__total = count(next, '__total') + 1;
    // Related investments / jobs have a shared yearly cap as well as individual limits.
    const bucket = actionId.startsWith('career:apply:') ? 'applications' : actionId.startsWith('activities:emigrate:') ? 'emigrations' : null;
    if (bucket) {
      if (count(next, bucket) >= (bucket === 'applications' ? 8 : 1)) throw new Error(bucket === 'applications' ? 'You have submitted eight job applications this year.' : 'You can emigrate once per year.');
      next.actionCounts[bucket] = count(next, bucket) + 1;
    }
    if (next.stats.health <= 0) {
      next.alive = false;
      next.causeOfDeath = `complications following ${action.title.toLowerCase()}`;
      addLog(next, 'life', 'A life comes to an end', `You died at age ${next.age} from ${next.causeOfDeath}.`);
    }
    addLog(next, category, action.title, message);
    checkAchievements(next);
    return { state: next, ok: true, message };
  } catch (error) {
    return { state: structuredClone(state), ok: false, message: error instanceof Error ? error.message : 'The action could not be completed.' };
  }
}
