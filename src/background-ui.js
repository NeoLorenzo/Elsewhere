import { BACKGROUND_FIELDS, BACKGROUND_COLLECTIONS, BACKGROUND_LABELS, blankBackgroundRecord } from './background.js';
import { daysInMonth } from './calendar.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
const labels={education:'Education',workExperience:'Work experience',skills:'Skills',languages:'Languages',certifications:'Certifications',volunteering:'Volunteering',projects:'Projects',awards:'Awards',interests:'Interests',references:'References'};
const title=key=>BACKGROUND_LABELS?.[key]||labels[key]||key;
const context=entity=>({birthYear:entity.birthYear,age:entity.age,year:entity.year});
let nextRecord=0;

export function renderBirthdayFields(entity,{creating=false}={}) {
  const birthday=entity.birthDate||{month:1,day:1},year=entity.birthYear||2026;
  const fields=`<div class="form-pair birthday-fields"><label>Birth month<select name="birthMonth">${months.map((month,i)=>`<option value="${i+1}" ${i+1===birthday.month?'selected':''}>${month}</option>`).join('')}</select></label><label>Birth day<input name="birthDay" type="number" value="${birthday.day}" min="1" max="${daysInMonth(year,birthday.month)}" step="1" required inputmode="numeric"></label></div><p class="birthday-note" data-birthday-note role="alert" hidden></p>`;
  return creating?fields:`<details class="builder-section"><summary>Birthday</summary><div class="builder-section-content">${fields}</div></details>`;
}

export function refreshBirthdayFields(form,entity) {
  const month=Number(form.elements.birthMonth?.value),day=Number(form.elements.birthDay?.value),year=Number(form.elements.birthYear?.value||entity.birthYear);
  if(!month||!Number.isSafeInteger(year)||year<1900)return;
  const max=daysInMonth(year,month);form.elements.birthDay.max=max;
  const note=form.querySelector('[data-birthday-note]');
  if(note){const valid=Number.isInteger(day)&&day>=1&&day<=max;note.hidden=valid;note.textContent=valid?'':`Choose a day from 1 to ${max}.`;}
}

function recordField(collection,index,field,record) {
  const name=`cv.${collection}.${index}.${field.key}`,value=record[field.key]??'',fieldId=`cv-${collection}-${index}-${field.key}`;
  const required=field.required?'required':'';
  if(field.type==='checkbox')return `<label class="cv-check"><input id="${fieldId}" name="${name}" type="checkbox" ${value?'checked':''}><span>${esc(field.label)}</span></label>`;
  if(field.type==='textarea')return `<label class="cv-wide">${esc(field.label)}<textarea name="${name}" rows="3" maxlength="${field.maxLength||2000}" ${required}>${esc(value)}</textarea></label>`;
  if(field.type==='select')return `<label>${esc(field.label)}<select name="${name}">${(field.options||[]).map(option=>{const v=typeof option==='object'?option.value:option,l=typeof option==='object'?option.label:option;return `<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(l)}</option>`;}).join('')}</select></label>`;
  return `<label>${esc(field.label)}<input name="${name}" type="${field.type==='number'?'number':'text'}" value="${esc(value)}" ${field.type==='number'?'step="1"':`maxlength="${field.maxLength||240}"`} ${field.min!==undefined?`min="${field.min}"`:''} ${field.max!==undefined?`max="${field.max}"`:''} ${required} autocomplete="off"></label>`;
}

export function renderBackgroundRecord(collection,index,record) {
  return `<fieldset class="cv-record" aria-label="${esc(title(collection))} ${index+1}" data-cv-record="${collection}" data-cv-index="${index}"><input type="hidden" name="cv.${collection}.${index}.id" value="${esc(record.id)}"><input type="hidden" name="cv.${collection}.${index}.source" value="${esc(record.source||'custom')}"><div class="cv-record-fields">${BACKGROUND_FIELDS[collection].filter(field=>field.key!=='source').map(field=>recordField(collection,index,field,record)).join('')}</div><button type="button" class="text-link cv-remove" data-background-remove>Remove</button></fieldset>`;
}

export function renderBackgroundFields(entity) {
  const b=entity.background||{},contact=b.contact||{};
  return `<details class="builder-section cv-builder"><summary>CV & history</summary><div class="builder-section-content"><label>Summary<textarea name="cv.summary" rows="3" maxlength="4000">${esc(b.summary)}</textarea></label><div class="form-pair"><label>Education<select name="cv.educationMode"><option value="unspecified" ${!b.educationMode||b.educationMode==='unspecified'?'selected':''}>Keep current</option><option value="none" ${b.educationMode==='none'?'selected':''}>No formal education</option><option value="recorded" ${b.educationMode==='recorded'?'selected':''}>Use history</option></select></label><label>Employment<select name="cv.employmentMode"><option value="unspecified" ${!b.employmentMode||b.employmentMode==='unspecified'?'selected':''}>Keep current</option><option value="unemployed" ${b.employmentMode==='unemployed'?'selected':''}>Unemployed</option><option value="recorded" ${b.employmentMode==='recorded'?'selected':''}>Use history</option></select></label></div><p class="cv-pay-note">Past jobs do not add savings.</p><details class="cv-collection"><summary>Contact & links</summary><div class="cv-record-fields">${[['email','Email'],['phone','Phone'],['location','Location'],['website','Website / portfolio'],['linkedin','Professional profile']].map(([key,label])=>`<label>${label}<input name="cv.contact.${key}" value="${esc(contact[key])}" maxlength="300" autocomplete="off"></label>`).join('')}</div></details>${BACKGROUND_COLLECTIONS.map(collection=>`<details class="cv-collection" data-cv-collection="${collection}" ${['education','workExperience'].includes(collection)?'open':''}><summary>${esc(title(collection))}</summary><div data-cv-records="${collection}" data-next-index="${b[collection]?.length||0}">${(b[collection]||[]).map((record,i)=>renderBackgroundRecord(collection,i,record)).join('')}</div><button type="button" class="secondary-button cv-add" data-background-add="${collection}">+ Add</button></details>`).join('')}</div></details>`;
}

export function readBackgroundFields(form) {
  if(!form.querySelector('.cv-builder'))return undefined;
  const data=new FormData(form),background={version:1,summary:String(data.get('cv.summary')||''),educationMode:String(data.get('cv.educationMode')||'unspecified'),employmentMode:String(data.get('cv.employmentMode')||'unspecified'),contact:{}};
  for(const key of ['email','phone','location','website','linkedin'])background.contact[key]=String(data.get(`cv.contact.${key}`)||'');
  for(const collection of BACKGROUND_COLLECTIONS)background[collection]=[...form.querySelectorAll(`[data-cv-record="${collection}"]`)].map(row=>{
    const prefix=`cv.${collection}.${row.dataset.cvIndex}.`,record={id:String(data.get(prefix+'id')||''),source:String(data.get(prefix+'source')||'custom')};
    for(const field of BACKGROUND_FIELDS[collection]){const raw=data.get(prefix+field.key);record[field.key]=field.type==='checkbox'?raw!==null:field.type==='number'?(raw===null||String(raw).trim()===''?null:Number(raw)):String(raw||'');}
    return record;
  });
  return background;
}

export function handleBackgroundClick(event,entity) {
  const add=event.target.closest('[data-background-add]'),remove=event.target.closest('[data-background-remove]');
  if(!add&&!remove)return false;
  event.preventDefault();
  const form=(add||remove).closest('form');
  if(add){
    const collection=add.dataset.backgroundAdd,container=form.querySelector(`[data-cv-records="${collection}"]`),index=Number(container.dataset.nextIndex||0);
    if(container.querySelectorAll('[data-cv-record]').length>=100)return true;
    const birthYear=Number(form.elements.birthYear?.value||entity.birthYear),age=Number(form.elements.age?.value??entity.age);
    const record=blankBackgroundRecord(collection,context({...entity,birthYear,age,year:birthYear+age}));
    record.id=`cv-${collection}-${Date.now().toString(36)}-${nextRecord++}`;
    container.insertAdjacentHTML('beforeend',renderBackgroundRecord(collection,index,record));container.dataset.nextIndex=index+1;
    if(collection==='education')form.elements['cv.educationMode'].value='recorded';
    if(collection==='workExperience')form.elements['cv.employmentMode'].value='recorded';
    const added=container.lastElementChild;added.querySelector('input:not([type=hidden]),select,textarea')?.focus();
  }else remove.closest('[data-cv-record]').remove();

  return true;
}

const years=record=>record.startYear!==undefined?`${record.startYear??'—'} – ${record.current||record.status==='attending'?'Present':record.endYear??'—'}`:record.year?String(record.year):'';
function cvEntry(collection,record) {
  const heading=record.institution||record.title||record.name||record.role||record.organisation||'Entry';
  const details=collection==='education'?[record.qualification,record.field,record.status,record.grade]:collection==='workExperience'?[record.employer,record.employmentType,record.location]:[record.issuer,record.organisation,record.role,record.level,record.relationship,record.category];
  return `<article class="cv-entry"><div class="cv-entry-heading"><strong>${esc(heading)}</strong><small>${esc(years(record))}</small></div><p>${[...new Set(details.filter(value=>value&&value!==heading))].map(esc).join(' · ')}</p>${record.description?`<p class="cv-description">${esc(record.description)}</p>`:''}${record.achievements?`<p class="cv-description">${esc(record.achievements)}</p>`:''}${record.technologies?`<small>${esc(record.technologies)}</small>`:''}${record.url?`<p>${esc(record.url)}</p>`:''}${collection==='references'?`<p>${record.availableUponRequest?'References on request':[record.email,record.phone].filter(Boolean).map(esc).join(' · ')}</p>`:''}</article>`;
}

export function renderBackgroundSummary(entity,{self=false}={}) {
  const b=entity.background||{},hasRows=BACKGROUND_COLLECTIONS.some(key=>b[key]?.length);
  return `<div class="cv-sheet">${self?'<div class="cv-sheet-heading"><button class="text-link" data-command="export-cv">Export CV</button></div>':''}${b.summary?`<p class="cv-personal-summary">${esc(b.summary)}</p>`:''}${Object.values(b.contact||{}).some(Boolean)?`<div class="cv-contact">${Object.values(b.contact).filter(Boolean).map(value=>`<span>${esc(value)}</span>`).join('')}</div>`:''}${b.educationMode==='none'?'<p class="cv-empty">No formal education.</p>':''}${!hasRows&&b.educationMode!=='none'?'<p class="cv-empty">No history.</p>':''}${BACKGROUND_COLLECTIONS.filter(key=>b[key]?.length).map(key=>`<section class="cv-history"><h4>${esc(title(key))}</h4>${b[key].map(record=>cvEntry(key,record)).join('')}</section>`).join('')}</div>`;
}

export function backgroundMarkdown(entity) {
  const b=entity.background||{},name=entity.firstName?entity.firstName+' '+entity.lastName:entity.name;
  const clean=value=>String(value??'').replace(/[\r\n]+/g,' ').trim();
  const sections=['# '+clean(name)+' — CV',b.summary||''];
  const contact=Object.values(b.contact||{}).filter(Boolean);if(contact.length)sections.push([...new Set(contact)].map(clean).join(' · '));
  for(const collection of BACKGROUND_COLLECTIONS){
    if(!b[collection]?.length)continue;
    sections.push('## '+title(collection));
    for(const record of b[collection]){
      const headingKey=record.institution?'institution':record.title?'title':record.name?'name':record.role?'role':'organisation';
      sections.push('### '+clean(record[headingKey]||'Entry'));
      const period=years(record);if(period)sections.push(period);
      const lines=[];
      for(const field of BACKGROUND_FIELDS[collection]){
        if(['id','source',headingKey,'startYear','endYear','year','current'].includes(field.key))continue;
        if(collection==='references'&&record.availableUponRequest&&['email','phone'].includes(field.key))continue;
        const value=record[field.key];if(value===undefined||value===null||value===''||value===false)continue;
        const label=field.label.replace(/ \(.*\)/,'');
        lines.push('- '+(field.type==='checkbox'?label:label+': '+clean(value)));
      }
      if(lines.length)sections.push(lines.join('\n'));
    }
  }
  return sections.filter(Boolean).join('\n\n');
}
