import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBackground, validateBackground, blankBackgroundRecord, BACKGROUND_COLLECTIONS, BACKGROUND_FIELDS } from '../src/background.js';
import { createLife, normalizeState, customizeCharacter, ageUp, resolveEvent, continueLegacy } from '../src/engine.js';
import { daysInMonth, validateBirthDate, normalizeBirthDate, dateAtAge, formatDate } from '../src/calendar.js';
import { performAction, getActions } from '../src/systems.js';
import { syncBackgroundProgress } from '../src/background-events.js';

const ctx={birthYear:1990,age:36,year:2026};
const school=(patch={})=>({id:'school-1',institution:'Northbridge University',level:'university',qualification:'BSc',field:'Computer Science',startYear:2008,endYear:2012,status:'completed',grade:'85',...patch});
const job=(patch={})=>({id:'work-1',employer:'Orchard Studio',title:'Software developer',employmentType:'full-time',startYear:2018,endYear:null,current:true,annualSalary:65000,...patch});
const life=(patch={})=>createLife({seed:32,age:36,birthYear:1990,...patch});
const step=state=>ageUp(state.pendingEvent?resolveEvent(state,0):state);
const snapshot=state=>({year:state.year,city:state.city,country:state.country,job:structuredClone(state.job),education:structuredClone(state.education)});

test('birth dates validate Gregorian leap years without browser Date or timezone dependence',()=>{
  assert.equal(daysInMonth(1900,2),28);assert.equal(daysInMonth(2000,2),29);assert.equal(daysInMonth(2024,2),29);assert.equal(daysInMonth(2025,2),28);
  assert.deepEqual(validateBirthDate({month:2,day:29},2000),{year:2000,month:2,day:29});
  for(const date of [{month:2,day:29},{month:4,day:31},{month:13,day:1},{month:0,day:1},{month:1,day:0},{month:1,day:1.2}])assert.throws(()=>validateBirthDate(date,1900));
  assert.throws(()=>validateBirthDate({year:2001,month:1,day:1},2000),/match/);
  assert.deepEqual(normalizeBirthDate({month:2,day:99},1900),{year:1900,month:2,day:28});
});

test('birthday is stored, displayed, imported and observed on February 28 in non-leap years',()=>{
  let s=life({age:20,birthYear:2000,birthDate:{month:2,day:29}});
  assert.equal(formatDate(s.birthDate),'29 February 2000');assert.deepEqual(s.date,{year:2020,month:2,day:29});
  s=step(s);assert.deepEqual(s.date,{year:2021,month:2,day:28});assert.equal(s.birthDate.day,29);
  assert.deepEqual(dateAtAge(s.birthDate,24),{year:2024,month:2,day:29});
  assert.deepEqual(normalizeState(s).birthDate,s.birthDate);assert.deepEqual(normalizeState(s).date,s.date);
});

test('birthday edits retain age, birth year, timeline, RNG and finances',()=>{
  const original=life(),before=structuredClone(original);
  const s=customizeCharacter(original,{birthDate:{month:12,day:24}});
  assert.deepEqual(original,before);assert.deepEqual(s.birthDate,{year:1990,month:12,day:24});assert.deepEqual(s.date,{year:2026,month:12,day:24});
  for(const key of ['age','birthYear','year','rng','cash','debt'])assert.equal(s[key],original[key]);
  assert.throws(()=>customizeCharacter(original,{birthDate:{month:2,day:30}}));
});

test('old saves gain January 1 birthday and empty history without inventing past institutions or jobs',()=>{
  const s=life();delete s.birthDate;delete s.date;delete s.background;for(const parent of s.relationships)delete parent.netWorth;
  const restored=normalizeState(s);assert.deepEqual(restored.birthDate,{year:1990,month:1,day:1});
  for(const key of BACKGROUND_COLLECTIONS)assert.deepEqual(restored.background[key],[]);
  assert.equal(restored.education.level,'secondary');assert.equal(restored.job,null);assert.equal(restored.rng,s.rng);
  assert.equal(restored.relationships[0].netWorth,50000);
});

test('each parent has separate signed wealth and edits never deposit it into the player balance',()=>{
  const s=life({parents:{mother:{netWorth:2500000},father:{netWorth:-12000}}});
  assert.equal(s.cash,0);assert.equal(s.relationships[0].netWorth,2500000);assert.equal(s.relationships[1].netWorth,-12000);
  const edited=customizeCharacter(s,{parents:{mother:{netWorth:3500000}}});assert.equal(edited.relationships[0].netWorth,3500000);assert.equal(edited.relationships[1].netWorth,-12000);assert.equal(edited.cash,0);
  assert.equal(normalizeState(edited).relationships[0].netWorth,3500000);
  for(const value of [NaN,Infinity,'100',null,1e16])assert.throws(()=>life({parents:{mother:{netWorth:value}}}),/net worth/);
});

test('all CV collections have explicit schemas and survive a validated JSON round trip',()=>{
  const raw={summary:'A thoughtful builder.',contact:{email:'rowan@example.com',website:'example.com'},educationMode:'recorded',employmentMode:'recorded',education:[school()],workExperience:[job()],
    skills:[{name:'Programming',level:'advanced',category:'Technical'}],languages:[{name:'English',level:'native'}],certifications:[{name:'Cloud certificate',issuer:'Cloud Institute',year:2025,expiryYear:2028,credentialId:'C-123'}],
    volunteering:[{organisation:'Community garden',role:'Mentor',startYear:2024,current:true}],projects:[{name:'Garden planner',startYear:2025,current:true,url:'https://example.com/project',technologies:'JavaScript'}],
    awards:[{title:'Design award',issuer:'Local society',year:2022}],interests:[{name:'Astronomy',description:'Watching the night sky.'}],references:[{name:'Alex Reed',relationship:'Former manager',availableUponRequest:true}]};
  const normalized=validateBackground(raw,ctx),again=normalizeBackground(JSON.parse(JSON.stringify(normalized)),ctx);
  assert.deepEqual(again,normalized);assert.equal(normalized.contact.website,'https://example.com/');
  for(const key of BACKGROUND_COLLECTIONS){assert.equal(normalized[key].length,1);assert.ok(normalized[key][0].id);assert.ok(BACKGROUND_FIELDS[key].length);}
  assert.equal(normalized.certifications[0].expiryYear,2028);
});

test('creation applies only explicitly recorded qualifications and current job; past jobs award no earnings',()=>{
  const s=life({background:{educationMode:'recorded',employmentMode:'recorded',education:[school()],workExperience:[job({id:'old',current:false,startYear:2012,endYear:2017,annualSalary:900000}),job()]}});
  assert.equal(s.education.level,'university');assert.equal(s.education.institution,'Northbridge University');assert.equal(s.education.major,'Computer Science');
  assert.equal(s.job.title,'Software developer');assert.equal(s.job.employer,'Orchard Studio');assert.equal(s.job.salary,65000);assert.equal(s.job.years,8);assert.equal(s.cash,0);
  assert.equal(s.background.workExperience.length,2);
  const restored=normalizeState(s);assert.deepEqual(restored.background,s.background);assert.deepEqual(restored.job,s.job);assert.deepEqual(restored.education,s.education);
});

test('no formal education changes qualification gates, while an explicit degree opens them',()=>{
  const none=life({background:{educationMode:'none'}});none.stats.smarts=100;none.cash=100000;
  assert.equal(none.education.level,'none');assert.match(getActions(none,'education').find(a=>a.id.startsWith('education:university:')).disabled,/secondary/);
  const degree=customizeCharacter(none,{background:{educationMode:'recorded',education:[school()]}});
  assert.equal(degree.education.level,'university');assert.equal(getActions(degree,'education').find(a=>a.id==='education:graduate').disabled,undefined);
  const unemployed=customizeCharacter(life({background:{employmentMode:'recorded',workExperience:[job()]}}),{background:{employmentMode:'unemployed'}});assert.equal(unemployed.job,null);
});

test('current custom education completes through birthdays and records its actual institution',()=>{
  let s=life({seed:15,age:21,birthYear:2000,stats:{discipline:100},background:{educationMode:'recorded',education:[school({startYear:2018,endYear:null,status:'attending'})]}});
  assert.equal(s.education.enrolled,'university');assert.equal(s.education.yearsLeft,1);
  s=step(s);assert.equal(s.education.level,'university');assert.equal(s.education.enrolled,null);
  assert.equal(s.background.education.length,1);assert.equal(s.background.education[0].status,'completed');assert.equal(s.background.education[0].endYear,2022);assert.equal(s.background.education[0].institution,'Northbridge University');
});

test('history import does not reset current course progress, salary, performance or tenure',()=>{
  const s=life({background:{employmentMode:'recorded',workExperience:[job()]}});s.job.salary=82000;s.job.performance=91;s.job.years=10;
  s.education={level:'university',enrolled:'graduate',yearsLeft:1,grades:90,major:'Physics',institution:'Hill University',qualification:'MSc',resumeId:'grad-1'};
  const restored=normalizeState(s);assert.deepEqual(restored.job,s.job);assert.deepEqual(restored.education,s.education);
});

test('chronology and contradictory current employment fail atomically with useful errors',()=>{
  assert.throws(()=>validateBackground({education:[school({startYear:1980})]},ctx),/before.*birth/);
  assert.throws(()=>validateBackground({workExperience:[job({startYear:2027})]},ctx),/after.*current/);
  assert.throws(()=>validateBackground({education:[school({startYear:2014,endYear:2012})]},ctx),/precede/);
  assert.throws(()=>validateBackground({workExperience:[job(),job({id:'second'})]},ctx),/one current full-time/);
  assert.throws(()=>validateBackground({workExperience:[job({endYear:2024})]},ctx),/current.*end year/);
  assert.throws(()=>validateBackground({skills:[{name:''}]},ctx),/required/);
  assert.throws(()=>validateBackground({certifications:[{name:'Test',year:2025,expiryYear:2024}]},ctx),/expiry/);
  const s=life(),before=structuredClone(s);assert.throws(()=>customizeCharacter(s,{background:{workExperience:[job({startYear:3000})]}}));assert.deepEqual(s,before);
});

test('imports bound records, sanitize unsupported fields, reject active URL protocols and resolve duplicate ids',()=>{
  const raw={summary:'<script>unsafe</script>text',cash:999999,contact:{website:'javascript:alert(1)'},skills:Array.from({length:105},()=>({id:'same',name:'Skill',level:'expert',cash:99})),education:[school({startYear:1800,endYear:9999})]};
  const result=normalizeBackground(raw,ctx);assert.equal(result.skills.length,100);assert.equal(new Set(result.skills.map(s=>s.id)).size,100);assert.equal(result.contact.website,'');assert.equal(result.cash,undefined);assert.equal(result.skills[0].cash,undefined);assert.doesNotMatch(result.summary,/[<>]/);
  assert.equal(result.education[0].startYear,1990);assert.equal(result.education[0].endYear,2026);
  assert.throws(()=>validateBackground({contact:{website:'javascript:alert(1)'}},ctx),/http/);
  assert.equal(validateBackground({summary:'a'.repeat(4000)},ctx).summary.length,4000);
});

test('blank form records have age-appropriate editable defaults without making assertions about a life',()=>{
  const young={birthYear:2019,age:7,year:2026};assert.equal(blankBackgroundRecord('workExperience',young).startYear,2026);assert.equal(blankBackgroundRecord('education',young).startYear,2024);
  assert.equal(blankBackgroundRecord('workExperience',ctx).startYear,2006);assert.deepEqual(normalizeBackground(null,ctx).education,[]);
});

test('ordinary job changes and retirement close one job entry and open the next without duplication',()=>{
  const s=life({background:{employmentMode:'recorded',workExperience:[job()]}}),before=snapshot(s);
  s.job={id:'new-role',title:'Manager',employer:'Second Studio',salary:85000,performance:60,years:0};syncBackgroundProgress(s,before);
  assert.equal(s.background.workExperience.length,2);assert.equal(s.background.workExperience[0].current,false);assert.equal(s.background.workExperience[0].endYear,2026);assert.equal(s.background.workExperience[1].current,true);
  const ongoing=snapshot(s);syncBackgroundProgress(s,ongoing);assert.equal(s.background.workExperience.length,2);
  const retire=snapshot(s);s.job=null;syncBackgroundProgress(s,retire);assert.ok(s.background.workExperience.every(r=>!r.current));
});

test('actions, course withdrawal, employment resignation and save/resume maintain the CV',()=>{
  let s=life({background:{educationMode:'recorded',education:[school({status:'attending',startYear:2025,endYear:null})],employmentMode:'recorded',workExperience:[job()]}});s.cash=100000;
  const dropout=performAction(s,'education:dropout');assert.equal(dropout.ok,true);s=dropout.state;
  assert.equal(s.background.education[0].status,'withdrawn');assert.equal(s.background.education[0].endYear,2026);
  const resign=performAction(s,'career:quit');assert.equal(resign.ok,true);s=resign.state;
  assert.equal(s.background.workExperience[0].current,false);assert.equal(s.background.workExperience[0].endYear,2026);
  assert.deepEqual(normalizeState(s).background,s.background);
});

test('positive parent support is funded by their wealth and debts never become gifts',()=>{
  let gifted=false;
  for(let seed=1;seed<=20&&!gifted;seed++){
    const s=life({seed,parents:{mother:{netWorth:1000},father:{netWorth:-500}}});s.relationships[0].bond=100;
    const moneyAction=getActions(s,'relationships').find(a=>a.title==='Ask for money'&&a.group.includes(s.relationships[0].name));
    assert.ok(moneyAction);const result=performAction(s,moneyAction.id);assert.equal(result.ok,true);
    if(result.state.cash>0){gifted=true;assert.equal(result.state.cash+result.state.relationships[0].netWorth,1000);}
    const poorAction=getActions(s,'relationships').find(a=>a.title==='Ask for money'&&a.group.includes(s.relationships[1].name));const poor=performAction(s,poorAction.id);assert.equal(poor.state.cash,0);assert.equal(poor.state.relationships[1].netWorth,-500);
  }
  assert.equal(gifted,true);
});

test('parent estates transfer positive configured wealth once, without inheriting debt',()=>{
  let s=life({parents:{mother:{netWorth:123456},father:{netWorth:-10000}}});s.relationships.forEach(p=>{p.age=114;p.bond=100;});
  s=step(s);assert.equal(s.relationships[0].alive,false);assert.equal(s.relationships[1].alive,false);assert.equal(s.relationships[0].netWorth,0);
  assert.ok(s.journal.some(j=>j.title==='An inheritance'&&j.text.includes('123,456')));assert.equal(s.journal.filter(j=>j.title==='An inheritance').length,1);
  s=step(s);assert.equal(s.journal.filter(j=>j.title==='An inheritance').length,1);
});

test('legacy uses the heir birthday and background rather than the former player CV',()=>{
  const s=life({age:70,birthYear:1900,background:{summary:'Former player'}});s.alive=false;
  const child=life({seed:88,age:30,birthYear:1940,birthDate:{month:7,day:9},background:{summary:'The heir',educationMode:'none'}});
  s.relationships.push({...child,id:'heir',role:'child',name:'River Vale',bond:80});
  const next=continueLegacy(s,'heir');assert.equal(next.background.summary,'The heir');assert.deepEqual(next.birthDate,{year:1940,month:7,day:9});assert.equal(next.education.level,'none');
});

test('CV tracking preserves automatic primary-to-secondary school progression and graduation',()=>{
  let s=life({seed:18,age:4,birthYear:2000});
  for(let age=5;age<=18;age++){
    s=step(s);
    if(age===5)assert.equal(s.education.enrolled,'primary');
    if(age===11)assert.equal(s.education.enrolled,'secondary');
    s=normalizeState(s);
  }
  assert.equal(s.education.level,'secondary');assert.equal(s.education.enrolled,null);
  assert.equal(s.background.education.length,2);assert.ok(s.background.education.every(row=>row.status==='completed'));
  assert.equal(s.background.education[0].startYear,2005);assert.equal(s.background.education[0].endYear,2011);assert.equal(s.background.education[1].endYear,2018);
});

test('a full-time role is primary when the CV also records a newer part-time role',()=>{
  const s=life({background:{employmentMode:'recorded',workExperience:[job(),job({id:'side',title:'Tutor',employmentType:'part-time',startYear:2024,annualSalary:8000})]}});
  assert.equal(s.job.title,'Software developer');assert.equal(s.job.salary,65000);assert.equal(s.background.workExperience.filter(row=>row.current).length,2);
});

test('licences earned in play become certificates once, without inventing pre-existing ones',()=>{
  let s=life({seed:2,stats:{smarts:100}});s.cash=100000;
  let result=performAction(s,'education:driving');
  assert.equal(result.ok,true);s=result.state;
  assert.ok(s.licenses.includes('driving'));assert.equal(s.background.certifications.length,1);assert.equal(s.background.certifications[0].name,'Driving licence');
  s=step(s);assert.equal(s.background.certifications.length,1);
  const imported=life();imported.licenses=['pilot'];assert.equal(normalizeState(imported).background.certifications.length,0);
});

test('pre-1900 upgrades shift full birthdays and prior CV dates together exactly once',()=>{
  const old=life({age:30,birthYear:1900,birthDate:{month:8,day:16}});old.birthYear=1800;old.birthDate.year=1800;old.year=1830;
  old.background={educationMode:'recorded',education:[school({startYear:1818,endYear:1822})],employmentMode:'recorded',workExperience:[job({startYear:1825})]};
  const s=normalizeState(old);assert.deepEqual(s.birthDate,{year:1900,month:8,day:16});assert.deepEqual(s.date,{year:1930,month:8,day:16});
  assert.equal(s.background.education[0].startYear,1918);assert.equal(s.background.education[0].endYear,1922);assert.equal(s.background.workExperience[0].startYear,1925);
  assert.deepEqual(normalizeState(s).background,s.background);
});
