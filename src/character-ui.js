import { PERSONALITY_DOMAINS, HEALTH_COMPONENTS, normalizePersonality, describeAppearance, overallHealth, bodyDefaults, bodyBounds } from './character.js';
import { formatYear, formatDate, calendarYearAtAge } from './calendar.js';
import { renderBirthdayFields, renderBackgroundFields, readBackgroundFields, renderBackgroundSummary } from './background-ui.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rounded = (value, digits=0) => Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : '—';
export const SKIN_COLORS = {fair:'#f5d8c2',light:'#edc3a1',medium:'#d3a17e',tan:'#b78059',brown:'#915c3d',deep:'#5c392a'};
export const HAIR_COLORS = {black:'#27262b',brown:'#604333',blonde:'#cba766',auburn:'#874a34',red:'#b65b32',grey:'#a49c97',white:'#ddd9d3'};
export const EYE_COLORS = {brown:'#513c2b',hazel:'#827541',green:'#58806a',blue:'#608fac',grey:'#8a9298'};
const shirtColors=['#7570ba','#5c8b83','#c18a6d','#6c89a5'];
const label = text => String(text).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./, c=>c.toUpperCase());
const ATTRIBUTES = [
  ['iq','IQ','Age-normed cognitive aptitude; separate from knowledge.',40,200],
  ['strength','Strength','Current physical strength.',0,100],
  ['stamina','Stamina','Capacity for sustained physical effort.',0,100],
  ['agility','Agility','Speed and ease of movement.',0,100],
  ['coordination','Coordination','Control and precision of movement.',0,100],
  ['creativity','Creativity','Generating and developing ideas.',0,100],
  ['empathy','Empathy','Understanding other people’s feelings.',0,100],
  ['willpower','Willpower','Maintaining deliberate effort.',0,100],
];

export function characterAvatar(entity, small=false) {
  const a=entity.appearance||{};
  const seed=String(entity.id||entity.firstName||entity.name||'person').split('').reduce((n,c)=>n+c.charCodeAt(0),0);
  const skin=SKIN_COLORS[a.skinTone]||SKIN_COLORS.medium;
  const hair=HAIR_COLORS[a.hairColor]||HAIR_COLORS.brown;
  const eye=EYE_COLORS[a.eyeColor]||EYE_COLORS.brown;
  const style=a.hairStyle||'short';
  const name=entity.firstName||entity.name||'Character';
  const bodyFat=entity.body?.bodyFatPercent||22;
  const bodyWidth=Math.min(43,Math.max(28,29+(bodyFat-12)*.34));
  const sideHair=style==='long'?`<path d="M25 41c-5-21 6-34 25-34s29 15 25 35l4 35H20l5-36Z" fill="${hair}"/>`:'';
  const fringe=style==='bald'?'':style==='curly'?`<path d="M26 38c-8-7-5-15 2-16-3-7 4-13 10-10 3-8 12-8 16-3 8-5 15 0 15 6 9-1 15 10 7 16l-5 13-6-16c-12 6-22 1-29 1l-9 15Z" fill="${hair}"/>`:style==='wavy'?`<path d="M26 42c-7-19 2-31 16-33 14-7 33 2 34 17 3 8-1 15-4 19l-8-17c-9 10-15-4-23 1-8 4-7 9-15 13Z" fill="${hair}"/>`:`<path d="M27 43c-5-26 11-34 24-34 22 0 29 19 22 37l-5-16c-13 4-26 1-30-6l-11 19Z" fill="${hair}"/>`;
  return `<svg class="avatar ${small?'small':''}" viewBox="0 0 100 100" role="img" aria-label="${esc(name)}’s portrait"><circle cx="50" cy="50" r="50" fill="#ece7db"/>${sideHair}<path d="M${50-bodyWidth} 101c0-31 ${bodyWidth/2} -40 ${bodyWidth} -40s${bodyWidth} 9 ${bodyWidth} 40" fill="${shirtColors[seed%4]}"/><path d="M41 57h18v18c-6 6-12 6-18 0" fill="${skin}"/><ellipse cx="50" cy="43" rx="${entity.age<4?25:23}" ry="27" fill="${skin}"/>${fringe}<ellipse cx="41" cy="44" rx="3" ry="3" fill="${eye}"/><ellipse cx="59" cy="44" rx="3" ry="3" fill="${eye}"/><circle cx="41" cy="44" r="1.3" fill="#27262b"/><circle cx="59" cy="44" r="1.3" fill="#27262b"/><path d="M44 56q6 5 12 0" fill="none" stroke="#8e5342" stroke-width="2" stroke-linecap="round"/></svg>`;
}

export function personalitySummary(entity) {
  const d=entity.personality?.domains||{};
  const descriptors=[
    ['openness','curious','practical'],['conscientiousness','methodical','spontaneous'],
    ['extraversion','outgoing','reserved'],['agreeableness','accommodating','direct'],
    ['neuroticism','emotionally sensitive','even-tempered'],
  ];
  return descriptors.filter(([key])=>Number.isFinite(d[key])).sort((a,b)=>Math.abs(d[b[0]]-50)-Math.abs(d[a[0]]-50)).slice(0,3).map(([key,high,low])=>d[key]>=50?high:low).join(' · ');
}

export function personalityRadar(personality) {
  const domains=PERSONALITY_DOMAINS;
  const center=[150,125],radius=85;
  const position=(i,r)=>[center[0]+Math.sin(i*Math.PI*2/5)*r,center[1]-Math.cos(i*Math.PI*2/5)*r];
  const polygon=r=>domains.map((_,i)=>position(i,r).join(',')).join(' ');
  const shape=domains.map((domain,i)=>position(i,(personality?.domains?.[domain.id]??50)/100*radius).join(',')).join(' ');
  const description=domains.map(domain=>`${domain.label}: ${rounded(personality?.domains?.[domain.id]??50)} out of 100`).join('; ');
  return `<svg class="personality-radar" viewBox="-40 0 380 255" role="img" aria-label="${esc(description)}">${[.25,.5,.75,1].map(level=>`<polygon points="${polygon(radius*level)}" fill="none" stroke="currentColor" opacity=".12"/>`).join('')}${domains.map((_,i)=>{const p=position(i,radius);return `<path d="M150 125L${p.join(' ')}" stroke="currentColor" opacity=".12"/>`;}).join('')}<polygon points="${shape}" fill="#8376d345" stroke="#8e7fdb" stroke-width="2"/>${domains.map((domain,i)=>{const p=position(i,radius);return `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${domain.color}"/>`;}).join('')}</svg>`;
}

function metric(title,value,unit='',hint='') {
  return `<div class="character-metric"><span>${esc(title)}</span><strong>${esc(value)}<small>${esc(unit)}</small></strong>${hint?`<em>${esc(hint)}</em>`:''}</div>`;
}
function componentBar(value,name,color='var(--purple)',description='') {
  return `<div class="profile-component" title="${esc(description)}"><div><span>${esc(name)}</span><strong>${rounded(value)}<small>/100</small></strong></div><div class="stat-track"><div style="width:${Math.max(0,Math.min(100,Number(value)||0))}%;background:${color}"></div></div></div>`;
}

export function renderCharacterSheet(entity,{self=false,embedded=false}={}) {
  const isPet=entity.role==='pet';
  const name=entity.firstName?`${entity.firstName} ${entity.lastName}`:entity.name;
  if(isPet)return `<div class="modal-hero"><span class="hero-glyph">🐾</span><h2>${esc(name)}</h2><p>${esc(entity.species||'Companion')} · Age ${entity.age} · Bond ${rounded(entity.bond)}%</p></div>`;
  const p=entity.personality||normalizePersonality({},entity.id);
  const b=entity.body||{};
  const a=entity.attributes||{};
  const h=entity.healthProfile||{};
  const bmi=b.heightCm>0?b.weightKg/((b.heightCm/100)**2):0;
  return `<section class="character-sheet ${embedded?'embedded':''}">${self&&embedded?`<div class="profile-birth">Born ${esc(entity.birthDate?formatDate(entity.birthDate):formatYear(entity.birthYear))}</div>`:`<div class="character-sheet-hero">${characterAvatar(entity)}<div><h2>${esc(name)}</h2><small>Age ${entity.age}${entity.birthYear?` · Born ${esc(entity.birthDate?formatDate(entity.birthDate):formatYear(entity.birthYear))}`:''}</small></div></div>`}
    <div class="sheet-tabs" role="tablist" aria-label="Character details"><button role="tab" aria-selected="true" data-sheet-tab="overview">Overview</button><button role="tab" aria-selected="false" data-sheet-tab="personality">Personality</button><button role="tab" aria-selected="false" data-sheet-tab="body">Body & health</button><button role="tab" aria-selected="false" data-sheet-tab="background">CV & history</button></div>
    <section data-sheet-panel="overview"><p class="appearance-description">${esc(describeAppearance(entity))}</p><div class="character-metrics">${Number.isFinite(entity.netWorth)?metric('Personal net worth',new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(entity.netWorth)):''}${metric('IQ',rounded(a.iq))}</div><div class="capacities-grid">${ATTRIBUTES.filter(([id])=>id!=='iq').map(([id,name,desc])=>componentBar(a[id],name,'var(--purple)',desc)).join('')}</div>${self?`${componentBar(entity.stats?.smarts||0,'Knowledge','var(--blue)','')}`:''}</section>
    <section data-sheet-panel="personality" hidden><div class="personality-intro"><div>${personalityRadar(p)}</div></div><div class="facet-domain-list">${PERSONALITY_DOMAINS.map(domain=>`<details class="facet-domain"><summary><span><i style="background:${esc(domain.color||'var(--purple)')}"></i>${esc(domain.label)}</span><strong>${rounded(p.domains[domain.id])}<small>/100</small></strong></summary><div class="facet-readings">${domain.facets.map(f=>componentBar(p.facets[f.id],f.label,domain.color||'var(--purple)',f.description)).join('')}</div></details>`).join('')}</div></section>
    <section data-sheet-panel="body" hidden><div class="character-metrics">${metric('Height',rounded(b.heightCm,1),'cm')}${metric('Weight',rounded(b.weightKg,1),'kg')}${metric('Body fat',rounded(b.bodyFatPercent,1),'%')}${metric('Health',rounded(overallHealth(entity)),'/100')}${metric('BMI',rounded(bmi,1))}</div><h3 class="standalone-label">Health components</h3><div class="capacities-grid">${HEALTH_COMPONENTS.map(c=>componentBar(h[c.id],c.label,'var(--green)',c.description)).join('')}</div></section>
    <section data-sheet-panel="background" hidden>${renderBackgroundSummary(entity,{self})}</section>
    ${self?'<button class="primary-button full-width spaced" data-command="edit-character">Edit character</button>':['mother','father'].includes(entity.role)?'<button class="secondary-button full-width spaced" data-command="edit-character">Edit family details</button>':''}
  </section>`;
}

function numericField(name,title,value,min,max,step=1,description='') {
  return `<label class="character-number-label"><span>${esc(title)}</span><input type="number" name="${esc(name)}" value="${esc(rounded(value,step===.1?1:0))}" data-original="${esc(value)}" min="${min}" max="${max}" step="${step}" required></label>`;
}
function selectField(name,title,values,value) {
  return `<label>${esc(title)}<select name="${esc(name)}">${values.map(v=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(label(v))}</option>`).join('')}</select></label>`;
}

export function renderCharacterFields(entity,{parents=[],creating=false}={}) {
  const a=entity.attributes||{};
  const b=entity.body||{};
  const p=entity.personality||normalizePersonality({},entity.id);
  const appearance=entity.appearance||{};
  return `<div class="character-builder" data-builder-age="${entity.age}">
    <div class="builder-preview"><div id="builder-avatar">${characterAvatar(entity)}</div></div>
    ${creating?'':renderBirthdayFields(entity)}
    <details class="builder-section" open><summary>Appearance</summary><div class="builder-section-content"><div class="form-pair">${selectField('appearance.skinTone','Skin tone',Object.keys(SKIN_COLORS),appearance.skinTone)}${selectField('appearance.eyeColor','Eye colour',Object.keys(EYE_COLORS),appearance.eyeColor)}</div><div class="form-pair">${selectField('appearance.hairColor','Hair colour',Object.keys(HAIR_COLORS),appearance.hairColor)}${selectField('appearance.hairStyle','Hair style',['short','long','curly','wavy','bald'],appearance.hairStyle)}</div><label>Description<textarea name="appearance.description" maxlength="300" rows="2">${esc(appearance.description||'')}</textarea></label></div></details>
    <details class="builder-section"><summary>Parents</summary><div class="builder-section-content">${['mother','father'].map(role=>{const person=parents.find(p=>p.role===role);return `${numericField(`parentWealth.${role}`,`${label(role)} net worth ($)`,person?.netWorth??50000,-1e15,1e15,1,'Their own wealth, separate from your balance. Negative values represent debt.')}<label>${label(role)} appearance<textarea name="parent.${role}" rows="3" maxlength="300">${esc(person?.appearance?.description||'')}</textarea></label>`;}).join('')}</div></details>
    <details class="builder-section"><summary>Abilities</summary><div class="builder-section-content"><div class="character-input-grid">${ATTRIBUTES.map(([id,name,desc,min,max])=>numericField(`attributes.${id}`,name,a[id],min,max,1,desc)).join('')}</div></div></details>
    <details class="builder-section"><summary>Body measurements</summary><div class="builder-section-content"><div class="character-input-grid" id="body-builder-inputs">${renderBodyFields(entity)}</div></div></details>
    <details class="builder-section"><summary>Health components</summary><div class="builder-section-content"><div class="character-input-grid">${HEALTH_COMPONENTS.map(c=>numericField(`healthProfile.${c.id}`,c.label,entity.healthProfile?.[c.id],0,100,1,c.description)).join('')}</div></div></details>
    <details class="builder-section"><summary>Personality</summary><div class="builder-section-content"><div id="builder-radar">${personalityRadar(p)}</div>${PERSONALITY_DOMAINS.map(d=>`<details class="facet-editor"><summary><span class="facet-label"><i style="background:${esc(d.color)}"></i>${esc(d.label)}</span> <output data-domain-output="${d.id}">${rounded(p.domains[d.id])}</output></summary><div class="domain-adjuster"><label>Domain score<input type="range" min="0" max="100" step="1" value="${rounded(p.domains[d.id])}" data-domain-range="${d.id}" aria-label="${esc(d.label)} domain"></label></div><div class="character-input-grid">${d.facets.map(f=>numericField(`facet.${f.id}`,f.label,p.facets[f.id],0,100,1,f.description)).join('')}</div></details>`).join('')}</div></details>
    ${renderBackgroundFields(entity)}
    <details class="builder-section"><summary>Other stats</summary><div class="builder-section-content"><div class="character-input-grid">${[['happiness','Happiness'],['smarts','Knowledge'],['looks','Presentation'],['discipline','Self-control'],['karma','Karma'],['fame','Fame']].map(([id,name])=>numericField(`stats.${id}`,name,entity.stats?.[id]??50,0,100)).join('')}</div></div></details>
  </div>`;
}

export function renderBodyFields(entity) {
  const b=entity.body||bodyDefaults(entity.age,entity.gender,entity.id);
  const bounds=bodyBounds(entity.age);
  return numericField('body.heightCm','Height (cm)',b.heightCm,bounds.heightMin,bounds.heightMax,.1)+numericField('body.weightKg','Weight (kg)',b.weightKg,bounds.weightMin,bounds.weightMax,.1)+numericField('body.bodyFatPercent','Body fat (%)',b.bodyFatPercent,2,65,.1);
}

export function readCharacterFields(form) {
  const values=Object.fromEntries(new FormData(form));
  const result={appearance:{},attributes:{},body:{},healthProfile:{},personality:{facets:{}},stats:{},parents:{}};
  for(const [key,value] of Object.entries(values)) {
    const [group,id]=key.split('.');
    if(group==='appearance')result.appearance[id]=value;
    const control=form.elements[key];
    const numeric=control?.dataset.original!==undefined&&!control.dataset.edited?Number(control.dataset.original):Number(value);
    if(['attributes','body','healthProfile','stats'].includes(group))result[group][id]=numeric;
    if(group==='facet')result.personality.facets[id]=numeric;
    if(group==='parent'){result.parents[id]??={};result.parents[id].appearance={description:value};}
    if(group==='parentWealth'){result.parents[id]??={};result.parents[id].netWorth=numeric;}
  }
  if(values.birthMonth!==undefined&&values.birthDay!==undefined)result.birthDate={month:Number(values.birthMonth),day:Number(values.birthDay)};
  const background=readBackgroundFields(form);if(background)result.background=background;
  return result;
}

export function refreshBuilder(form,eventTarget,entity) {
  if(!form.querySelector('.character-builder'))return;
  if(eventTarget?.dataset.domainRange) {
    const domain=PERSONALITY_DOMAINS.find(d=>d.id===eventTarget.dataset.domainRange);
    const initial=domain.facets.map(f=>Number(form.elements[`facet.${f.id}`].value));
    const target=Number(eventTarget.value);let low=-100,high=100;
    for(let i=0;i<40;i++){const delta=(low+high)/2,average=initial.reduce((sum,value)=>sum+Math.max(0,Math.min(100,value+delta)),0)/6;if(average<target)low=delta;else high=delta;}
    const values=initial.map(value=>Math.round(Math.max(0,Math.min(100,value+(low+high)/2))));
    let remaining=target*6-values.reduce((sum,n)=>sum+n,0);
    for(let i=0;remaining!==0&&i<600;i++){const index=i%6,delta=Math.sign(remaining);if(values[index]+delta>=0&&values[index]+delta<=100){values[index]+=delta;remaining-=delta;}}
    domain.facets.forEach((f,i)=>{form.elements[`facet.${f.id}`].value=values[i];form.elements[`facet.${f.id}`].dataset.edited='true';});
  }
  const patch=readCharacterFields(form);
  const p=normalizePersonality(patch.personality,entity.id);
  form.querySelectorAll('[data-domain-output]').forEach(output=>output.textContent=rounded(p.domains[output.dataset.domainOutput]));
  if(!eventTarget?.dataset.domainRange)form.querySelectorAll('[data-domain-range]').forEach(input=>input.value=rounded(p.domains[input.dataset.domainRange]));
  const radar=form.querySelector('#builder-radar');if(radar)radar.innerHTML=personalityRadar(p);
  const preview=form.querySelector('#builder-avatar');if(preview)preview.innerHTML=characterAvatar({...entity,...patch});
}

export function renderPersonRoster(people) {
  return `<div class="people-roster">${people.filter(p=>p.alive).map(person=>`<button class="person-profile-card" data-person-id="${esc(person.id)}">${person.role==='pet'?'<span class="pet-portrait">🐾</span>':characterAvatar(person,true)}<span><strong>${esc(person.name)}</strong><small>${esc(label(person.role))} · ${person.age} ${person.age===1?'year':'years'}</small></span><span class="profile-open-arrow">↗</span></button>`).join('')}</div>`;
}
