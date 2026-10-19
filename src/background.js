// Structured fictional CV data. Pure normalization/validation; no inferred life history.
export const BACKGROUND_COLLECTIONS = Object.freeze([
  'education','workExperience','skills','languages','certifications','volunteering','projects','awards','interests','references',
]);
export const BACKGROUND_LABELS = Object.freeze({
  education:'Education',workExperience:'Work experience',skills:'Skills',languages:'Languages',certifications:'Certifications',
  volunteering:'Volunteering',projects:'Projects',awards:'Awards',interests:'Interests',references:'References',
});

const choices = values => values.map(value => ({value,label:value.split('-').map(word => word[0].toUpperCase()+word.slice(1)).join(' ')}));
const textLimit = (key,type) => key === 'summary' ? 4000 : type === 'textarea' ? 2000 : key === 'id' ? 100 : key === 'email' ? 254 : ['url','website','linkedin'].includes(key) ? 500 : key === 'phone' ? 80 : key === 'credentialId' ? 160 : 240;
const field = (key,label,type='text',extra={}) => ({key,label,type,...(['text','textarea'].includes(type) ? {maxLength:textLimit(key,type)} : {}),...extra});
export const BACKGROUND_LIMITS = Object.freeze({summary:4000,recordsPerCollection:100});
const source = () => field('source','Record origin','select',{options:[{value:'custom',label:'Custom history'},{value:'game',label:'Recorded during play'}]});
export const BACKGROUND_FIELDS = Object.freeze({
  contact: [field('email','Email address'),field('phone','Phone number'),field('location','Location'),field('website','Website'),field('linkedin','LinkedIn profile')],
  education: [
    field('institution','School or institution','text',{required:true}),field('location','Location'),
    field('level','Education level','select',{options:choices(['primary','secondary','trade','university','graduate','other'])}),
    field('qualification','Qualification or course'),field('field','Field of study'),field('startYear','Start year','number',{required:true}),field('endYear','End year (leave blank if ongoing)','number'),
    field('status','Status','select',{options:choices(['completed','attending','withdrawn'])}),field('grade','Grade or result'),field('description','Description','textarea'),source(),
  ],
  workExperience: [
    field('employer','Employer or organisation','text',{required:true}),field('title','Job title','text',{required:true}),field('location','Location'),
    field('employmentType','Employment type','select',{options:choices(['full-time','part-time','contract','self-employed','internship','apprenticeship','other'])}),
    field('startYear','Start year','number',{required:true}),field('endYear','End year (leave blank if ongoing)','number'),field('current','Currently working here','checkbox'),
    field('annualSalary','Annual salary (optional)','number',{min:0,max:1e12}),field('description','Responsibilities','textarea'),field('achievements','Achievements','textarea'),source(),
  ],
  skills: [field('name','Skill','text',{required:true}),field('level','Proficiency','select',{options:choices(['beginner','intermediate','advanced','expert'])}),field('category','Category')],
  languages: [field('name','Language','text',{required:true}),field('level','Proficiency','select',{options:choices(['native','fluent','professional','conversational','basic'])})],
  certifications: [field('name','Certification','text',{required:true}),field('issuer','Issuing organisation'),field('year','Year earned','number',{required:true}),field('expiryYear','Expiry year (optional)','number'),field('credentialId','Credential ID')],
  volunteering: [field('organisation','Organisation','text',{required:true}),field('role','Role','text',{required:true}),field('location','Location'),field('startYear','Start year','number',{required:true}),field('endYear','End year (optional)','number'),field('current','Currently volunteering','checkbox'),field('description','Contribution','textarea')],
  projects: [field('name','Project name','text',{required:true}),field('role','Your role'),field('url','Project URL'),field('startYear','Start year','number',{required:true}),field('endYear','End year (optional)','number'),field('current','Project is ongoing','checkbox'),field('description','Description','textarea'),field('technologies','Tools or technologies')],
  awards: [field('title','Award or recognition','text',{required:true}),field('issuer','Awarding organisation'),field('year','Year received','number',{required:true}),field('description','Description','textarea')],
  interests: [field('name','Interest','text',{required:true}),field('description','Description','textarea')],
  references: [field('name','Reference name','text',{required:true}),field('relationship','Relationship'),field('organisation','Organisation'),field('email','Email address'),field('phone','Phone number'),field('notes','Notes','textarea'),field('availableUponRequest','Contact details available on request','checkbox')],
});
for (const fields of Object.values(BACKGROUND_FIELDS)) {
  for (const entry of fields) {
    if (entry.options) { entry.options.forEach(Object.freeze); Object.freeze(entry.options); }
    Object.freeze(entry);
  }
  Object.freeze(fields);
}

const EDUCATION_MODES = ['unspecified','none','recorded'];
const EMPLOYMENT_MODES = ['unspecified','unemployed','recorded'];
const MAX_RECORDS = 100;
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const object = value => isObject(value) ? value : {};
const present = value => value !== undefined && value !== null && value !== '';
const numeric = value => typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));

function string(value,max=240) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  if (typeof value === 'number' && !Number.isFinite(value)) return '';
  return String(value).replace(/<[^>]*>/g,'').replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim().slice(0,max);
}

const limitFor = entry => entry.maxLength ?? textLimit(entry.key,entry.type);

function safeUrl(value) {
  const cleaned = string(value,500);
  if (!cleaned) return '';
  let candidate = cleaned;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate) && /^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[/?#].*)?$/i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const url = new URL(candidate);
    return ['http:','https:'].includes(url.protocol) && !url.username && !url.password ? url.href.slice(0,500) : '';
  } catch { return ''; }
}

function yearValue(value) {
  const year = numeric(value);
  return Number.isSafeInteger(year) && year !== 0 ? year : null;
}

function shiftedYear(value,offset) {
  const start = BigInt(value > 0 ? value : value + 1), target = start + BigInt(Math.floor(offset));
  const historical = target > 0n ? target : target - 1n;
  return Number(historical < BigInt(Number.MIN_SAFE_INTEGER) ? BigInt(Number.MIN_SAFE_INTEGER) : historical > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : historical);
}

function bounds(context={}) {
  const input = object(context), birth = yearValue(input.birthYear), age = Number.isFinite(numeric(input.age)) ? Math.max(0,Math.floor(numeric(input.age))) : null;
  const year = yearValue(input.year) ?? (birth !== null && age !== null ? shiftedYear(birth,age) : 2026);
  const birthYear = birth ?? (age !== null ? shiftedYear(year,-age) : null);
  return {year,birthYear:birthYear !== null ? Math.min(birthYear,year) : null,age};
}

function cleanYear(value,context,{nullable=false,fallback=context.year,future=false}={}) {
  const year = yearValue(value);
  if (year === null && nullable) return null;
  const minimum = context.birthYear ?? Number.MIN_SAFE_INTEGER;
  const maximum = future ? Number.MAX_SAFE_INTEGER : context.year;
  let result = clamp(year ?? fallback,minimum,maximum);
  if (result === 0) result = maximum >= 1 ? 1 : -1;
  return result;
}

function hash(value) {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0),16777619);
  return (result >>> 0).toString(36);
}

function emptyBackground() {
  return {version:1,summary:'',contact:{email:'',phone:'',location:'',website:'',linkedin:''},educationMode:'unspecified',employmentMode:'unspecified',...Object.fromEntries(BACKGROUND_COLLECTIONS.map(name => [name,[]]))};
}

function defaultsFor(collection,context) {
  const age = context.age ?? (context.birthYear !== null ? Math.max(0,context.year-context.birthYear) : 18);
  const milestone = collection === 'education' ? 5 : collection === 'workExperience' ? 16 : 0;
  const startYear = context.birthYear !== null ? Math.min(context.year,shiftedYear(context.birthYear,Math.min(age,milestone))) : context.year;
  const values = {startYear,endYear:null,year:context.year,expiryYear:null,current:false,source:'custom'};
  if (collection === 'education') Object.assign(values,{level:'other',status:'attending'});
  if (collection === 'workExperience') Object.assign(values,{employmentType:'full-time',current:true});
  if (collection === 'skills') values.level = 'beginner';
  if (collection === 'languages') values.level = 'conversational';
  if (collection === 'references') values.availableUponRequest = false;
  return values;
}

/** Blank editable row; no claimed qualification or employment is inserted into a life. */
export function blankBackgroundRecord(collection,context={}) {
  if (!BACKGROUND_COLLECTIONS.includes(collection)) throw new Error(`Unknown background collection: ${String(collection)}.`);
  const normalized = bounds(context), defaults = defaultsFor(collection,normalized), result = {id:''};
  for (const entry of BACKGROUND_FIELDS[collection]) {
    if (entry.key === 'annualSalary') continue;
    result[entry.key] = entry.key in defaults ? defaults[entry.key] : entry.type === 'checkbox' ? false : entry.type === 'number' ? null : '';
  }
  return result;
}

function mainText(collection,row) {
  const key = collection === 'education' ? 'institution' : collection === 'workExperience' ? 'title' : collection === 'volunteering' ? 'organisation' : collection === 'awards' ? 'title' : 'name';
  return row[key];
}

function normalizeRecord(collection,input,context,index) {
  const raw = typeof input === 'string' && ['skills','languages','interests'].includes(collection) ? {name:input} : object(input);
  const defaults = blankBackgroundRecord(collection,context), row = {id:string(raw.id,100)};
  for (const entry of BACKGROUND_FIELDS[collection]) {
    const value = raw[entry.key];
    if (entry.type === 'select') {
      row[entry.key] = entry.options.some(option => option.value === value) ? value : defaults[entry.key];
    } else if (entry.type === 'checkbox') row[entry.key] = value === true;
    else if (entry.key === 'annualSalary') {
      if (present(value) && Number.isFinite(numeric(value))) row.annualSalary = Math.round(clamp(numeric(value),0,1e12));
    } else if (entry.type === 'number') row[entry.key] = cleanYear(value,context,{nullable:entry.key === 'endYear' || entry.key === 'expiryYear',fallback:defaults[entry.key] ?? context.year,future:entry.key === 'expiryYear'});
    else if (['url','website','linkedin'].includes(entry.key)) row[entry.key] = safeUrl(value);
    else {
      row[entry.key] = string(Array.isArray(value) && entry.key === 'achievements' ? value.map(item => string(item,500)).join('\n') : value,limitFor(entry));
      if (entry.key === 'email' && !emailValid(row[entry.key])) row[entry.key] = '';
    }
  }
  if (!mainText(collection,row)) return null;
  if ('startYear' in row && row.endYear !== null && row.endYear < row.startYear) row.endYear = row.startYear;
  if (collection === 'education' && row.status === 'attending') row.endYear = null;
  if (row.current) row.endYear = null;
  if (collection === 'certifications' && row.expiryYear !== null && row.expiryYear < row.year) row.expiryYear = row.year;
  row.id ||= `background-${collection}-${hash(JSON.stringify(row))}-${index+1}`;
  return row;
}

/** Defensive save upgrade: whitelist keys, bound content, retain valid provenance, never invent history. */
export function normalizeBackground(raw,context={}) {
  const input = object(raw), result = emptyBackground(), normalized = bounds(context);
  result.summary = string(input.summary,4000);
  result.educationMode = EDUCATION_MODES.includes(input.educationMode) ? input.educationMode : 'unspecified';
  result.employmentMode = EMPLOYMENT_MODES.includes(input.employmentMode) ? input.employmentMode : 'unspecified';
  for (const entry of BACKGROUND_FIELDS.contact) result.contact[entry.key] = ['website','linkedin'].includes(entry.key) ? safeUrl(input.contact?.[entry.key]) : string(input.contact?.[entry.key],limitFor(entry));
  if (!emailValid(result.contact.email)) result.contact.email = '';
  for (const collection of BACKGROUND_COLLECTIONS) {
    const seen = new Set(), rows = Array.isArray(input[collection]) ? input[collection].slice(0,MAX_RECORDS) : [];
    result[collection] = rows.map((value,index) => normalizeRecord(collection,value,normalized,index)).filter(Boolean).map(row => {
      const original = row.id;
      let suffix = 2;
      while (seen.has(row.id)) row.id = `${original.slice(0,85)}-${suffix++}`;
      seen.add(row.id); return row;
    });
  }
  // Conflicting current full-time jobs become past/undated records on a tolerant import.
  let fullTime = false;
  for (const row of result.workExperience) if (row.current && row.employmentType === 'full-time') {
    if (fullTime) { row.current = false; row.endYear = normalized.year; }
    else fullTime = true;
  }
  return result;
}

const emailValid = value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function validateYear(value,label,context,{optional=false,future=false}={}) {
  if (!present(value) && optional) return null;
  const year = yearValue(value);
  if (year === null) throw new Error(`${label} must be a whole calendar year, with no year zero.`);
  if (context.birthYear !== null && year < context.birthYear) throw new Error(`${label} cannot be before the character's birth year (${context.birthYear}).`);
  if (!future && year > context.year) throw new Error(`${label} cannot be after the current year (${context.year}).`);
  return year;
}

function validateText(value,entry,label) {
  if (!present(value)) {
    if (entry.required) throw new Error(`${label} is required.`);
    return;
  }
  if (typeof value !== 'string' && !(entry.key === 'grade' && typeof value === 'number' && Number.isFinite(value))) throw new Error(`${label} must be text.`);
  if (String(value).length > limitFor(entry)) throw new Error(`${label} is too long (maximum ${limitFor(entry)} characters).`);
  if (entry.required && !string(value,limitFor(entry))) throw new Error(`${label} is required.`);
  if (['url','website','linkedin'].includes(entry.key) && !safeUrl(value)) throw new Error(`${label} must be an http or https website address.`);
  if (entry.key === 'email' && !emailValid(String(value).trim())) throw new Error(`${label} must be a valid email address.`);
}

/** Strict creation/editor validation; returns the normalized schema on success. */
export function validateBackground(raw,context={}) {
  if (!isObject(raw)) throw new Error('Background must be a structured object.');
  const normalized = bounds(context);
  if (present(raw.version) && raw.version !== 1) throw new Error('Unsupported background version.');
  for (const [key,values] of [['educationMode',EDUCATION_MODES],['employmentMode',EMPLOYMENT_MODES]]) if (present(raw[key]) && !values.includes(raw[key])) throw new Error(`${key === 'educationMode' ? 'Education' : 'Employment'} history mode is invalid.`);
  validateText(raw.summary,{key:'summary',type:'textarea'},'Summary');
  if (typeof raw.summary === 'string' && raw.summary.length > 4000) throw new Error('Summary is too long (maximum 4000 characters).');
  if (present(raw.contact) && !isObject(raw.contact)) throw new Error('Contact information must be a structured object.');
  for (const entry of BACKGROUND_FIELDS.contact) validateText(raw.contact?.[entry.key],entry,`Contact: ${entry.label}`);
  let fullTime = 0;
  for (const collection of BACKGROUND_COLLECTIONS) {
    if (raw[collection] === undefined) continue;
    if (!Array.isArray(raw[collection])) throw new Error(`${BACKGROUND_LABELS[collection]} must be a list of records.`);
    if (raw[collection].length > MAX_RECORDS) throw new Error(`${BACKGROUND_LABELS[collection]} supports at most ${MAX_RECORDS} records.`);
    const seen = new Set();
    raw[collection].forEach((row,index) => {
      const label = `${BACKGROUND_LABELS[collection]} record ${index+1}`;
      if (!isObject(row)) throw new Error(`${label} must be a structured record.`);
      if (present(row.id)) {
        if (typeof row.id !== 'string' || row.id.length > 100) throw new Error(`${label}: record ID must be text of at most 100 characters.`);
        if (seen.has(string(row.id,100))) throw new Error(`${label}: duplicate record ID.`);
        seen.add(string(row.id,100));
      }
      for (const entry of BACKGROUND_FIELDS[collection]) {
        const value = row[entry.key], fieldLabel = `${label}: ${entry.label}`;
        if (entry.type === 'select') {
          if (present(value) && !entry.options.some(option => option.value === value)) throw new Error(`${fieldLabel} is invalid.`);
        } else if (entry.type === 'checkbox') {
          if (present(value) && typeof value !== 'boolean') throw new Error(`${fieldLabel} must be true or false.`);
        } else if (entry.key === 'annualSalary') {
          if (present(value) && (!Number.isFinite(numeric(value)) || numeric(value) < 0 || numeric(value) > 1e12)) throw new Error(`${fieldLabel} must be between 0 and 1,000,000,000,000.`);
        } else if (entry.type === 'number') validateYear(value,fieldLabel,normalized,{optional:!entry.required,future:entry.key === 'expiryYear'});
        else validateText(value,entry,fieldLabel);
      }
      const start = yearValue(row.startYear), end = yearValue(row.endYear);
      if (start !== null && end !== null && end < start) throw new Error(`${label}: end year cannot precede start year.`);
      if (row.current === true && present(row.endYear)) throw new Error(`${label}: a current position or project cannot have an end year.`);
      if (collection === 'education' && row.status === 'attending' && present(row.endYear)) throw new Error(`${label}: attending education cannot have a completed end year.`);
      if (collection === 'certifications' && yearValue(row.expiryYear) !== null && yearValue(row.year) !== null && yearValue(row.expiryYear) < yearValue(row.year)) throw new Error(`${label}: expiry year cannot precede the year earned.`);
      if (collection === 'workExperience' && row.current === true && (row.employmentType || 'full-time') === 'full-time') fullTime++;
    });
  }
  if (fullTime > 1) throw new Error('Work experience can include only one current full-time position; multiple part-time positions are allowed.');
  return normalizeBackground(raw,context);
}

/** Conservative sync: callers add real game records; this never infers older experiences. */
export function syncBackground(state) {
  if (!state || typeof state !== 'object') return state;
  state.background = normalizeBackground(state.background,{birthYear:state.birthYear,age:state.age,year:state.year});
  return state;
}
