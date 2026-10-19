import { normalizeBackground } from './background.js';
import { calendarYearAtAge } from './calendar.js';
import { countryForYear } from './countries.js';

// This module observes actual gameplay transitions. It never invents earlier
// study or employment from a character's age, qualifications, or job tenure.
const ranks = { none: 0, primary: 0, secondary: 1, trade: 1, university: 2, graduate: 3 };
const enrolled = education => typeof education?.enrolled === 'object' && education.enrolled ? education.enrolled.level || education.enrolled.type : education?.enrolled || null;
const courseLevel = education => {
  const level = enrolled(education);
  return ['primary', 'secondary', 'trade', 'university', 'graduate'].includes(level) ? level : ['medical', 'law', 'doctorate'].includes(level) ? 'graduate' : 'other';
};
const courseKey = education => `${enrolled(education) || ''}:${education?.major || ''}`;
const jobKey = job => job ? `${job.id || ''}:${job.title || ''}:${job.employer || ''}` : '';
const sameJob = (before, after) => Boolean(before && after && (before.resumeId && after.resumeId ? before.resumeId === after.resumeId : jobKey(before) === jobKey(after)));
const institutionFor = level => ['primary', 'secondary'].includes(level) ? 'Local school' : level === 'trade' ? 'Trade school' : level === 'graduate' ? 'Graduate school' : level === 'university' ? 'University' : 'Educational institution';
const qualificationFor = level => ({ primary: 'Primary education', secondary: 'Secondary school qualification', trade: 'Vocational qualification', university: "Bachelor's degree", graduate: 'Graduate qualification', other: 'Course of study' })[level];
const gradeFor = education => Number.isFinite(education?.grades) ? `${Math.round(education.grades)}%` : '';

function locationFor(state) {
  return [state.city, state.country ? countryForYear(state.country, state.year).name : ''].filter(Boolean).join(', ');
}

function hash(text) {
  let value = 2166136261;
  for (const letter of text) value = Math.imul(value ^ letter.charCodeAt(0), 16777619);
  return (value >>> 0).toString(36);
}

function nextId(rows, state, type, key, startYear) {
  const base = `game-${type}-${hash(`${state.id || 'life'}:${key}`)}-${startYear}`;
  let id = base;
  let suffix = 2;
  while (rows.some(row => row.id === id)) id = `${base}-${suffix++}`;
  return id;
}

function activeEducation(background, education) {
  return background.education.find(row => row.id === education?.resumeId && row.status === 'attending')
    || background.education.find(row => row.status === 'attending' && row.level === courseLevel(education) && (!education?.major || row.field === education.major));
}

function addEducation(background, state, education, context, changed = false) {
  const level = courseLevel(education);
  const previous = context?.education;
  const inheritedInstitution = changed && education.institution === previous?.institution;
  const inheritedQualification = changed && education.qualification === previous?.qualification;
  const row = {
    id: nextId(background.education, state, 'education', courseKey(education), context?.year ?? state.year),
    institution: (!inheritedInstitution && education.institution) || institutionFor(level),
    location: locationFor(context || state), level,
    qualification: (!inheritedQualification && education.qualification) || qualificationFor(level),
    field: education.major || '', startYear: context?.year ?? state.year, endYear: null,
    status: 'attending', grade: gradeFor(education), description: '', source: 'game',
  };
  background.education.push(row);
  return row;
}

function closeEducation(row, state, education, completed) {
  row.status = completed ? 'completed' : 'withdrawn';
  row.endYear = Math.max(row.startYear, state.year);
  if (gradeFor(education)) row.grade = gradeFor(education);
}

function syncEducation(state, before, background) {
  const current = state.education || {};
  const previous = before?.education || {};
  const previousEnrollment = enrolled(previous);
  const currentEnrollment = state.alive === false ? null : enrolled(current);
  const changed = Boolean(previousEnrollment && (!currentEnrollment || courseKey(previous) !== courseKey(current)));
  if (changed) {
    const old = activeEducation(background, previous) || addEducation(background, state, previous, before);
    const timeAdvanced = state.year > before.year;
    const levelAdvanced = (ranks[current.level] || 0) > (ranks[previous.level] || 0);
    const primaryCompleted = previousEnrollment === 'primary' && currentEnrollment === 'secondary';
    const courseFinished = !currentEnrollment && timeAdvanced && previous.yearsLeft <= 1 && current.yearsLeft === 0 && (current.grades ?? 60) >= 25;
    closeEducation(old, state, current, levelAdvanced || primaryCompleted || courseFinished);
    delete current.resumeId;
  }
  if (!currentEnrollment) return;
  let row = changed ? null : activeEducation(background, current);
  if (!row) {
    // A game transition replaces editable current study rather than layering a
    // second, contradictory current course over it.
    for (const active of background.education.filter(item => item.status === 'attending')) closeEducation(active, state, previous, false);
    row = addEducation(background, state, current, state, changed);
  }
  const gradeChanged = before && previous.grades !== current.grades;
  if (row.source === 'game' || gradeChanged || state.year > (before?.year ?? state.year)) row.grade = gradeFor(current) || row.grade;
  current.resumeId = row.id;
  current.institution = row.institution;
  current.qualification = row.qualification;
  if (Number.isSafeInteger(current.yearsLeft) && current.yearsLeft > 0) current.plannedEndYear = calendarYearAtAge(state.year, current.yearsLeft);
  background.educationMode = 'recorded';
}

function activeWork(background, job) {
  return background.workExperience.find(row => row.id === job?.resumeId && row.current)
    || background.workExperience.find(row => row.current && row.title === job?.title && (!job?.employer || row.employer === job.employer));
}

function addWork(background, state, job, context) {
  const startYear = context?.year ?? state.year;
  const row = {
    id: nextId(background.workExperience, state, 'work', jobKey(job), startYear),
    employer: job.employer || 'Local employer', title: job.title || 'Employee',
    location: locationFor(context || state), employmentType: job.employmentType || 'full-time',
    startYear, endYear: null, current: true, description: '', achievements: '', source: 'game',
  };
  if (Number.isFinite(job.salary) && job.salary >= 0) row.annualSalary = job.salary;
  background.workExperience.push(row);
  return row;
}

function closeWork(row, state) {
  row.current = false;
  row.endYear = Math.max(row.startYear, state.year);
  delete row.annualSalary;
}

function syncWork(state, before, background) {
  const previous = before?.job;
  const current = state.alive === false ? null : state.job;
  const changed = Boolean(previous && (!current || !sameJob(previous, current)));
  if (changed) {
    const old = activeWork(background, previous) || addWork(background, state, previous, before);
    closeWork(old, state);
    if (current) delete current.resumeId;
  }
  if (!current) return;
  let row = changed ? null : activeWork(background, current);
  if (!row) {
    for (const active of background.workExperience.filter(item => item.current)) closeWork(active, state);
    row = addWork(background, state, current, state);
  }
  row.current = true;
  row.endYear = null;
  row.title = current.title || row.title;
  if (Number.isFinite(current.salary) && current.salary >= 0) row.annualSalary = current.salary;
  current.resumeId = row.id;
  current.employer = row.employer;
  background.employmentMode = 'recorded';
}

/** Mutate only the supplied life; record the current observed course/job and its
 * transitions. Call after an actual action or birthday, never during import. */
export function syncBackgroundProgress(state, before) {
  const background = normalizeBackground(state.background, state);
  syncEducation(state, before, background);
  syncWork(state, before, background);
  for(const license of state.licenses||[])if(before?.licenses&&!before.licenses.includes(license)){
    const id=`game-license-${license}`;
    if(!background.certifications.some(row=>row.id===id))background.certifications.push({id,name:license==='driving'?'Driving licence':license==='pilot'?'Pilot licence':String(license),issuer:'Licensing authority',year:state.year,expiryYear:null,credentialId:''});
  }
  if (background.education.length) background.educationMode = 'recorded';
  if (background.workExperience.length) background.employmentMode = 'recorded';
  state.background = normalizeBackground(background, state);
  return state;
}
