import { createLife, ageUp, resolveEvent, netWorth, normalizeState, continueLegacy, customizeCharacter } from './engine.js';
import { getActions, performAction } from './systems.js';
import { MAJORS, ACHIEVEMENTS, SPECIAL_CAREERS } from './data.js';
import { countriesForYear, countryForYear } from './countries.js';
import { currentGame, advanceMiniGame } from './game-session.js';
import { handValue } from './minigames.js';
import { formatYear, calendarYearAtAge } from './calendar.js';
import { characterAvatar, renderCharacterSheet, renderCharacterFields, readCharacterFields, refreshBuilder, renderBodyFields, renderPersonRoster } from './character-ui.js';

const STORAGE = 'elsewhere.saves.v1';
const SETTINGS = 'elsewhere.settings.v1';
const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(value)||0);
const shortMoney = value => Math.abs(value)<100000 ? money(value) : `${value<0?'-':''}$${new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(Math.abs(value))}`;
const number = value => new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(value||0);
const paths = {
  journal:'M5 4h10a3 3 0 0 1 3 3v14H7a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Zm3 0v17M11 8h4m-4 4h4',
  education:'m2 9 10-5 10 5-10 5L2 9Zm4 2v6c4 3 8 3 12 0v-6m4-2v7',
  career:'M9 6V4h6v2M4 7h16v13H4V7Zm0 6c5 3 11 3 16 0m-8 0v3',
  relationships:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m17 0v-2a4 4 0 0 0-3-4M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7a4 4 0 0 1 0 7',
  activities:'m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z',
  assets:'m3 10 9-7 9 7v11h-7v-7h-4v7H3V10Z',
  finance:'M3 21h18M4 10h16M5 10v8m5-8v8m4-8v8m5-8v8M3 7l9-4 9 4H3Z',
  crime:'M12 3 3 7v6c0 4 5 7 9 9 4-2 9-5 9-9V7l-9-4Zm0 5v5m0 3v.1',
  special:'M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2 2.8-2.8M12 8l4 4-4 4-4-4 4-4Z',
  legacy:'M8 4h8v5a4 4 0 0 1-8 0V4Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v5m-4 3h8m-6-3h4v3',
  settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2-5h4l1 3 3 1 3 1v4l-3 1-1 3-1 3h-4l-1-3-3-1-3-1v-4l3-1 1-3 1-3Z',
  arrow:'M5 12h14m-5-5 5 5-5 5',
  chevron:'m9 5 7 7-7 7',
  plus:'M12 5v14M5 12h14',
  close:'m6 6 12 12M6 18 18 6',
  check:'m5 12 4 4L19 6',
  globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3a19 19 0 0 1 0 18 19 19 0 0 1 0-18Z',
  heart:'M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 4 0 8 8 15 8-7 12-11 8-15Z',
  health:'M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3Z',
  smarts:'M9 4a3 3 0 0 0-5 3 4 4 0 0 0-1 7 4 4 0 0 0 6 5m6-15a3 3 0 0 1 5 3 4 4 0 0 1 1 7 4 4 0 0 1-6 5M12 3v18M7 9l5 3 5-3M6 16l6-2 6 2',
  looks:'m12 3 2 6 6 3-6 2-2 7-2-7-6-2 6-3 2-6Z',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-6v6l4 2',
  search:'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 6 6',
  menu:'M4 6h16M4 12h16M4 18h16',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  moon:'M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z',
  undo:'M4 5v6h6M4 11a8 8 0 1 1 2 8',
  leaf:'M20 3C6 3 2 8 5 15c7 4 15-2 15-12ZM4 21 15 10',
  book:'M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v16',
  lock:'M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4',
};
const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.activities}"/></svg>`;
const NAV = [
  ['character','Character sheet','Mind, body & personality'],
  ['journal','Life journal','Every chapter counts'],['education','Education','Find your potential'],['career','Career','Make your mark'],['relationships','Relationships','Your people'],['activities','Activities','Live a little'],['assets','Assets & lifestyle','A place in the world'],['finance','Finances','Build your future'],['crime','Crime & justice','Walk the other line'],['special','Special paths','An extraordinary life'],['legacy','Legacy & goals','Leave something behind'],
];
const SECTION_TEXT = {
  character:['A person, in every detail.','Get to know your mind, body, personality, and the things that make you you.'],
  education:['A curious mind. An open world.','Learn something new, invest in your future, or find your people at school.'],
  career:['Find your calling.','From your first shift to the corner office. What will you make of yourself?'],
  relationships:['Life is better, together.','The people who shape your story. A little time can go a long way.'],
  activities:['Make room for living.','Pick up a hobby, take a chance, or just take a breath.'],
  assets:['A little piece of the world.','Find a home, get behind the wheel, or build a portfolio of places.'],
  finance:['Make your money move.','A safety net today. A world of possibilities tomorrow.'],
  crime:['Every choice has a consequence.','Risk, reputation, and the long arm of the law.'],
  special:['Some lives are extraordinary.','The spotlight. The stars. Your own empire. Take the road less travelled.'],
};

let settings = {theme:'light',reduceMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
try { settings = {...settings,...JSON.parse(localStorage.getItem(SETTINGS)||'{}')}; } catch {}
document.documentElement.dataset.theme = settings.theme;
document.documentElement.dataset.motion = settings.reduceMotion ? 'reduced':'full';
let slots = [];
let loadWarning = '';
try {
  const raw = JSON.parse(localStorage.getItem(STORAGE)||'[]');
  if(!Array.isArray(raw)) throw new Error('Invalid save collection');
  slots = raw.slice(0,12).flatMap(slot=>{try {return [{...slot,state:normalizeState(slot.state)}];} catch {return [];}});
  if(raw.length && !slots.length) loadWarning='Your saved data could not be loaded. Import a backup from Settings to recover a life.';
} catch {loadWarning='Your save collection could not be read. A new life has been created.';}
let state = slots[0]?.state || createLife({firstName:'Alex',lastName:'Morgan',gender:'neutral'});
let active = 'journal';
try {const lastSection=sessionStorage.getItem('elsewhere.section');if(NAV.some(n=>n[0]===lastSection))active=lastSection;}catch{}
let search = '';
let showLocked = true;
const expandedGroups = new Set();
let previous = null;
let saveStatus = true;
let toastTimer;
let modalReturnFocus = null;
let mobileNav = false;
let builderCharacter = null;

function country(s=state) {return countryForYear(s.country,s.year);}
function countryText(s=state) {const c=country(s);return `${c?.flag||'🌍'} ${c?.cityAliases?.[s.city]||s.city}, ${c?.name||s.country}`;}
function lifeStage() {return !state.alive?'A life remembered':state.age<5?'The early years':state.age<13?'Growing up':state.age<18?'Finding yourself':state.age<30?'A world of possibilities':state.age<50?'Making your mark':state.age<65?'In your element':'The golden years';}
function occupation() {if(state.prison?.years>0)return `Incarcerated · ${state.prison.years} years remaining`;if(state.specialCareer)return state.specialCareer.title;if(state.job)return state.job.title;if(state.education.enrolled)return typeof state.education.enrolled==='string'?`${state.education.enrolled[0].toUpperCase()+state.education.enrolled.slice(1)} student`:'Student';if(state.age<5)return 'A whole life ahead';if(state.age<18)return 'School student';if(state.flags.retired)return 'Retired';return 'Finding a direction';}
function avatar(s=state,small=false) {return characterAvatar(s,small);}
function save() {
  const slot={id:state.id,state,updatedAt:new Date().toISOString()};
  slots=[slot,...slots.filter(s=>s.id!==state.id)].slice(0,12);
  try {localStorage.setItem(STORAGE,JSON.stringify(slots));saveStatus=true;}catch {saveStatus=false;toast('Browser storage is full. Export a backup from Settings.','error');}
}
function toast(text,type='success') {
  const target=$('#toast');target.innerHTML=`${icon(type==='error'?'crime':'check')}<span>${esc(text)}</span>`;target.className=`toast visible ${type}`;
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>target.classList.remove('visible'),5200);
}
function checkpoint() {previous=structuredClone(state);}
function render() {
  const c=country();
  try{sessionStorage.setItem('elsewhere.section',active);}catch{}
  $('#app').innerHTML=`
  <aside class="sidebar ${mobileNav?'open':''}" aria-label="Main navigation">
    <a class="brand" href="#journal" data-nav="journal"><span class="brand-mark">e<span></span></span><span>elsewhere<span class="brand-dot">.</span></span></a>
    <div class="sidebar-tagline">A life of possibilities.</div>
    <div class="nav-heading">YOUR WORLD</div>
    <nav>${NAV.map(([id,label])=>`<button class="nav-item ${active===id?'active':''}" data-nav="${id}" ${active===id?'aria-current="page"':''}>${icon(id)}<span>${label}</span>${id==='special'?'<span class="nav-new">NEW</span>':''}${active===id?'<span class="nav-dot"></span>':''}</button>`).join('')}</nav>
    <div class="sidebar-bottom"><div class="little-quote">“It’s your life.<br>Make it a good story.”<span>ONE YEAR AT A TIME</span></div><button class="nav-item" data-command="settings">${icon('settings')}<span>Settings & saves</span></button><div class="build-label"><span class="live-dot"></span> LOCAL EDITION <span>v0.3</span></div></div>
  </aside>
  <div class="nav-backdrop ${mobileNav?'visible':''}" data-command="close-nav"></div>
  <main class="workspace">
    <header class="topbar"><div class="breadcrumbs"><button class="icon-button mobile-toggle" data-command="menu" aria-label="Open navigation" aria-expanded="${mobileNav}">${icon('menu')}</button><span>Your world</span>${icon('chevron')}<strong>${NAV.find(n=>n[0]===active)?.[1]}</strong></div><div class="topbar-actions"><span class="autosave">${icon(saveStatus?'check':'crime')} ${saveStatus?'Saved on this device':'Unsaved · export a backup'}</span><button class="icon-button" data-command="theme" aria-label="Toggle color theme" title="Toggle color theme">${icon('moon')}</button><button class="new-life-button" data-command="new-life">${icon('plus')}<span>New life</span></button></div></header>
    <div class="page-wrap">
      <div class="page-heading"><div><div class="eyebrow">${active==='journal'?'THE BEAUTY IS IN THE POSSIBILITIES':'YOUR NEXT CHAPTER'}</div><h1>${active==='journal'?'One life. Endless possibilities.':active==='legacy'?'A story worth remembering.':SECTION_TEXT[active]?.[0]}</h1><p>${active==='journal'?'A little chance. A lot of choices. The rest is up to you.':active==='legacy'?'Collect moments, reach milestones, and pass the story on.':SECTION_TEXT[active]?.[1]}</p></div><button class="year-pill" data-command="report" title="View your annual report">${icon('clock')}<span>${esc(formatYear(state.year))}</span><span class="year-season">CHAPTER ${state.age+1}</span></button></div>
      <section class="identity-card" aria-label="Your character"><div class="identity-person">${avatar()}<div><div class="identity-name">${esc(state.firstName)} ${esc(state.lastName)} ${!state.alive?'<span class="deceased-tag">Remembered</span>':''}</div><div class="identity-location">${icon('globe')} ${esc(countryText())}</div><div class="identity-role">${icon(state.age<18?'education':'career')}${esc(occupation())}</div></div></div><div class="identity-facts"><div><span>AGE</span><strong>${state.age}<small>${state.age===1?'year':'years'}</small></strong></div><div><span>BANK BALANCE</span><strong class="balance ${state.cash<0?'negative':''}">${shortMoney(state.cash)}</strong></div><div><span>NET WORTH</span><strong>${shortMoney(netWorth(state))}</strong></div></div></section>
      <div class="content-grid"><div class="primary-content">${active==='journal'?renderJournal():active==='character'?renderCharacterSheet(state,{self:true,embedded:true}):active==='legacy'?renderLegacy():renderActions()}</div><aside class="insights">${renderInsights()}</aside></div>
      <footer class="page-footer"><span>Every ordinary moment could become an extraordinary story.</span><span>MADE OF CHOICES ${icon('leaf')}</span></footer>
    </div>
    <div class="age-dock"><div class="dock-copy"><span class="dock-icon">${icon(state.alive?'leaf':'book')}</span><div><strong>${esc(lifeStage())}</strong><span>${state.pendingEvent?'There’s a decision waiting for you.':state.alive?`What will age ${state.age+1} bring?`:'Every ending is a new beginning.'}</span></div></div><div class="dock-actions">${previous?`<button class="icon-button undo-button" data-command="undo" title="Undo your last step" aria-label="Undo your last step">${icon('undo')}</button>`:''}<button class="age-button" data-command="${state.alive?'age':'life-summary'}">${state.alive?state.pendingEvent?'Make a choice':'Age up':'Remember this life'} ${icon(state.alive?'plus':'arrow')} ${state.alive&&!state.pendingEvent?'<span>1 YEAR</span>':''}</button></div></div>
  </main>`;
  if(state.minigame){const button=$('[data-command="age"]');if(button)button.innerHTML=`Resume game ${icon('arrow')}`;const hint=$('.dock-copy div>span');if(hint)hint.textContent='Your game is saved. Finish it to continue.';}
}
function renderJournal() {
  const groups=new Map();
  [...state.journal].reverse().forEach(entry=>{const age=entry.age??0;if(!groups.has(age))groups.set(age,[]);groups.get(age).push(entry);});
  if(!groups.size)groups.set(state.age,[]);
  return `<section class="journal-section"><div class="section-heading"><h2>${icon('journal')} Your life journal</h2><span class="subtle">${state.journal.length} ${state.journal.length===1?'moment':'moments'} so far</span></div><div class="journal-filter"><span class="tab-current">Your story</span><button data-command="life-summary">Life overview ${icon('arrow')}</button></div>
  ${state.pendingEvent?`<button class="pending-card" data-command="event"><span class="pending-icon">${icon('special')}</span><span><strong>A moment of possibility</strong><small>${esc(state.pendingEvent.title)} · Your choice is waiting</small></span>${icon('arrow')}</button>`:''}
  ${!state.alive?`<button class="pending-card memorial" data-command="life-summary"><span class="pending-icon">${icon('book')}</span><span><strong>A life, remembered</strong><small>${esc(state.causeOfDeath||'Your story has come to an end.')} · View your legacy</small></span>${icon('arrow')}</button>`:''}
  <div class="journal-timeline">${[...groups].map(([age,entries],idx)=>`<section class="year-group"><div class="timeline-year"><span class="timeline-point ${idx===0?'current':''}"></span><strong>Age ${age}</strong><span>${esc(formatYear(calendarYearAtAge(state.birthYear,age)))}</span>${idx===0?'<em>THE CURRENT CHAPTER</em>':''}</div><div class="year-entries">${entries.length?entries.map(entry=>`<article class="journal-entry"><div class="entry-icon category-${esc(entry.category)}">${icon(categoryIcon(entry.category))}</div><div><h3>${esc(entry.title||categoryTitle(entry.category))}</h3><p>${esc(entry.text)}</p></div></article>`).join(''):'<article class="journal-entry"><div class="entry-icon">✦</div><div><h3>Hello, world.</h3><p>A brand new story is waiting to be written. Start by exploring your world.</p></div></article>'}${age===0?'<div class="origin-caption">And just like that, your story began.</div>':''}</div></section>`).join('')}</div>
  <div class="journal-end">${icon('leaf')}<span>The next chapter is yours to write.</span></div></section>`;
}
function categoryIcon(cat) {return ({birth:'leaf',family:'relationships',relationship:'heart',health:'health',death:'book',school:'education',education:'education',job:'career',career:'career',money:'finance',finance:'finance',crime:'crime',prison:'crime',asset:'assets',assets:'assets',event:'special',achievement:'legacy',milestone:'legacy',activity:'activities',activities:'activities',legacy:'legacy',special:'special',social:'relationships'})[cat]||'journal';}
function categoryTitle(cat) {return String(cat||'A moment in your life').replace(/^./,c=>c.toUpperCase());}
function statBar(key,label,color) {const value=Math.round(state.stats[key]||0);return `<div class="stat-item"><div class="stat-label"><span>${icon(({happiness:'heart',health:'health',smarts:'smarts',looks:'looks'})[key]||'special')} ${label}</span><strong>${value}<small>%</small></strong></div><div class="stat-track"><div style="width:${Math.max(0,Math.min(100,value))}%;background:${color}"></div></div></div>`;}
function renderInsights() {
  const closePeople=state.relationships.filter(p=>p.alive).slice(0,3);
  return `<section class="insight-card wellbeing"><div class="section-heading"><h2>Your wellbeing</h2><button class="icon-button small" data-command="profile" aria-label="View all character stats">${icon('special')}</button></div>${statBar('happiness','Happiness','var(--yellow)')}${statBar('health','Health','var(--green)')}${statBar('smarts','Knowledge','var(--blue)')}${statBar('looks','Looks','var(--pink)')}<div class="wellbeing-note">${icon('leaf')} ${state.stats.health>65?'A little care goes a long way.':'Take a moment to care for yourself.'}</div></section>
  <section class="insight-card year-glance"><div class="section-heading"><h2>This year, at a glance</h2>${icon('clock')}</div><div class="glance-row"><span>Income</span><strong class="positive">+${money(state.annual?.income)}</strong></div><div class="glance-row"><span>Expenses & tax</span><strong>${money((state.annual?.expenses||0)+(state.annual?.tax||0))}</strong></div><div class="glance-row glance-total"><span>Net change</span><strong>${money(state.annual?.net)}</strong></div><button class="text-link" data-command="report">View annual report ${icon('arrow')}</button></section>
  <section class="insight-card people-card"><div class="section-heading"><h2>Your inner circle</h2><button class="icon-button small" data-nav="relationships" aria-label="View relationships">${icon('arrow')}</button></div>${closePeople.length?closePeople.map((person,i)=>`<button class="person-mini" data-nav="relationships"><span class="person-initial color-${i}">${esc(person.name?.[0]||'?')}</span><span class="person-mini-copy"><strong>${esc(person.name)}</strong><small>${esc(categoryTitle(person.role))} · ${person.age}</small></span><span class="bond-mini" title="Relationship ${person.bond}%">${icon('heart')}<small>${Math.round(person.bond)}</small></span></button>`).join(''):'<p class="muted-copy">A new connection could be just around the corner.</p>'}</section>
  <section class="possibility-card"><span class="possibility-star">✷</span><div class="eyebrow">A DIFFERENT KIND OF LIFE</div><h3>Who will you<br>become?</h3><p>There’s more than one way to leave your mark.</p><button data-nav="special">Explore special paths ${icon('arrow')}</button><div class="orb orb-one"></div><div class="orb orb-two"></div></section>
  <div class="privacy-note">${icon('lock')} Your story stays on this device.</div>`;
}
function renderActions() {
  let actions=[];
  try {actions=getActions(state,active)||[];}catch(error){console.error(error);return '<div class="empty-state">This part of your world couldn’t load. Refresh to try again.</div>';}
  const query=search.toLowerCase();
  const filtered=actions.filter(a=>(showLocked||!a.disabled)&&`${a.title} ${a.description} ${a.group||''}`.toLowerCase().includes(query));
  const grouped=new Map();
  filtered.forEach(action=>{const group=action.group||({education:'Learning & opportunity',career:'Your working life',relationships:'Your connections',activities:'A little of everything',assets:'Find your next favourite thing',finance:'Money & opportunity',crime:'Risk & consequence',special:'Choose a different path'})[active];if(!grouped.has(group))grouped.set(group,[]);grouped.get(group).push(action);});
  const priority=group=>group==='Your job'?(state.job?-3:1):group==='Work'?-2:group===state.specialCareer?.title||group===state.business?.name?-3:group==='Job listings'||group==='University'||group==='Special careers'?2:0;
  const ordered=[...grouped].sort(([a],[b])=>priority(a)-priority(b));
  return `<section class="actions-section"><div class="section-heading"><h2>${icon(active)}${NAV.find(n=>n[0]===active)?.[1]}</h2><span class="subtle">${actions.filter(a=>!a.disabled).length} available</span></div>${renderContext()}${active==='relationships'?renderPersonRoster(state.relationships):''}
  <div class="action-toolbar"><label class="search-box">${icon('search')}<input id="action-search" type="search" placeholder="Find a possibility…" value="${esc(search)}" aria-label="Search actions" autocomplete="off"></label><label class="locked-toggle"><input type="checkbox" id="show-locked" ${showLocked?'checked':''}> Show locked</label></div>
  ${!state.alive?'<div class="notice-banner">This life has ended. View your legacy to continue as a child or begin again.</div>':''}
  <div class="action-groups">${ordered.map(([group,items])=>{const expanded=expandedGroups.has(`${active}:${group}`)||query;const sorted=[...items].sort((a,b)=>Number(!!a.disabled)-Number(!!b.disabled));return `<section class="action-group"><h3>${esc(group)}<span>${items.length}</span></h3><div class="action-list">${(expanded?sorted:sorted.slice(0,12)).map(action=>`<button class="action-row ${action.disabled||!state.alive?'locked':''}" data-action="${esc(action.id)}" ${action.disabled||!state.alive?'aria-disabled="true"':''}><span class="action-symbol">${action.icon?renderActionIcon(action.icon):icon(active)}</span><span class="action-copy"><strong>${esc(action.title)}</strong><small>${esc(action.description||'Choose your next move.')}</small>${action.disabled?`<em>${icon('lock')}${esc(action.disabled)}</em>`:''}</span><span class="action-right">${action.cost?`<span class="action-cost">${money(action.cost)}</span>`:''}${icon(action.disabled?'lock':'chevron')}</span></button>`).join('')}</div>${items.length>12&&!query?`<button class="show-more-button" data-expand="${esc(group)}">${expanded?'Show fewer':`Show all ${items.length} possibilities`}${icon('chevron')}</button>`:''}</section>`;}).join('')||`<div class="empty-state">${icon('search')}<h3>No possibilities found</h3><p>Try another search or show locked actions to see what’s ahead.</p></div>`}</div></section>`;
}
function renderActionIcon(value) {return paths[value]?icon(value):`<span>${esc(value)}</span>`;}
function renderContext() {
  if(active==='education')return `<div class="context-banner">${icon('education')}<div><strong>${esc(state.education.enrolled?`Studying ${state.education.major||state.education.enrolled}`:`Education: ${categoryTitle(state.education.level)}`)}</strong><small>Grades ${Math.round(state.education.grades||0)}% ${state.education.yearsLeft?`· ${state.education.yearsLeft} years remaining`:''}</small></div></div>`;
  if(active==='career'&&state.job)return `<div class="context-banner">${icon('career')}<div><strong>${esc(state.job.title)} · ${money(state.job.salary)} / year</strong><small>Performance ${Math.round(state.job.performance)}% · ${state.job.years||0} years in this role</small></div></div>`;
  if(active==='relationships')return `<div class="context-banner">${icon('heart')}<div><strong>${state.relationships.filter(p=>p.alive).length} people in your world</strong><small>Strong relationships make a happier life.</small></div></div>`;
  if(active==='assets')return `<div class="context-banner">${icon('assets')}<div><strong>${state.assets.length} possessions · ${money(state.assets.reduce((n,a)=>n+a.value,0))} in value</strong><small>${state.assets.filter(a=>a.rented).length} rented properties · ${money(state.assets.reduce((n,a)=>n+(a.mortgage||0),0))} in mortgages</small></div></div>`;
  if(active==='finance')return `<div class="context-banner">${icon('finance')}<div><strong>${money(state.cash)} cash · ${money(state.debt)} debt</strong><small>Investments ${money(state.investments.reduce((n,i)=>n+i.value,0))} · All amounts in simulation dollars</small></div></div>`;
  if(active==='crime')return `<div class="context-banner ${state.prison.years?'warning':''}">${icon('crime')}<div><strong>${state.prison.years?`${state.prison.years} years left in prison`:'You are free'}</strong><small>Heat ${Math.round(state.prison.heat||0)}% · ${state.prison.record||0} convictions</small></div></div>`;
  if(active==='special'&&(state.specialCareer||state.business))return `<div class="context-banner">${icon('special')}<div><strong>${esc(state.specialCareer?.title||state.business?.name)}</strong><small>${state.specialCareer?`Level ${state.specialCareer.level} · Performance ${Math.round(state.specialCareer.performance)}%`:`${state.business.employees} employees · Last annual profit ${money(state.business.profit)}`}</small></div></div>`;
  if(active==='activities'&&state.conditions.length)return `<div class="context-banner warning">${icon('health')}<div><strong>Take care of yourself</strong><small>${esc(state.conditions.map(c=>typeof c==='string'?c:c.name).join(', '))}</small></div></div>`;
  return '';
}
const goals = () => [
  {title:'The first chapter',description:'Reach your eighteenth birthday.',done:state.age>=18,progress:Math.min(100,state.age/18*100)},
  {title:'On the payroll',description:'Land your first full-time job.',done:!!state.job||state.journal.some(j=>j.category==='career'&&/hired|job|offer/i.test(j.text)),progress:state.job?100:0},
  {title:'A place to call home',description:'Own a home of your own.',done:state.assets.some(a=>['house','property','home','real-estate'].includes(a.type)),progress:0},
  {title:'Six figures',description:'Build a net worth of $100,000.',done:netWorth(state)>=100000,progress:Math.min(100,Math.max(0,netWorth(state)/1000))},
  {title:'A life well lived',description:'Reach age 80.',done:state.age>=80,progress:Math.min(100,state.age/80*100)},
];
function renderLegacy() {
  const unlocked=state.achievements||[];
  return `<section class="legacy-section"><div class="section-heading"><h2>${icon('legacy')} Your milestones</h2><span class="subtle">${unlocked.length} achievements</span></div><div class="legacy-hero"><span>✦</span><div><div class="eyebrow">ONE LIFE IN A BIGGER STORY</div><h2>Generation ${state.generation||1}</h2><p>${state.ancestors?.length?`${state.ancestors.length} lives came before you. Where will you take the story?`:'Great stories start somewhere. This one starts with you.'}</p></div></div><h3 class="standalone-label">A FEW THINGS TO LIVE FOR</h3><div class="goals-list">${goals().map(goal=>`<div class="goal-row ${goal.done?'complete':''}"><span>${icon(goal.done?'check':'legacy')}</span><div><strong>${goal.title}</strong><p>${goal.description}</p><div class="stat-track"><div style="width:${goal.done?100:goal.progress}%;background:var(--purple)"></div></div></div></div>`).join('')}</div><h3 class="standalone-label">THE COLLECTION</h3><div class="achievement-grid">${ACHIEVEMENTS.map(a=>`<div class="achievement ${unlocked.includes(a.id)?'unlocked':''}"><span>${unlocked.includes(a.id)?esc(a.icon||'✦'):icon('lock')}</span><strong>${esc(a.title)}</strong><small>${esc(a.description)}</small></div>`).join('')}</div>${state.ancestors?.length?`<h3 class="standalone-label">THE FAMILY STORY</h3>${state.ancestors.map(a=>`<div class="ancestor-card">${icon('book')}<div><strong>${esc(a.firstName||a.name)} ${esc(a.lastName||'')}</strong><p>${esc(a.age??a.ageAtDeath??'?')} years · ${money(a.netWorth??a.wealth??a.estate??0)} estate</p></div></div>`).join('')}`:''}<button class="secondary-button full-width" data-command="life-summary">View life overview ${icon('arrow')}</button></section>`;
}
function openModal(content,wide=false) {
  const existing=$('#modal-root dialog');if(existing)existing.close();
  modalReturnFocus=document.activeElement;
  $('#modal-root').innerHTML=`<dialog class="modal ${wide?'modal-wide':''}"><button class="modal-close icon-button" data-command="close-modal" aria-label="Close dialog">${icon('close')}</button>${content}</dialog>`;
  const dialog=$('#modal-root dialog');dialog.showModal();
  const title=dialog.querySelector('h2');if(title){title.id='modal-title';dialog.setAttribute('aria-labelledby','modal-title');}
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
  dialog.addEventListener('close',()=>modalReturnFocus?.isConnected&&modalReturnFocus.focus(),{once:true});
}
function closeModal() {$('#modal-root dialog')?.close();}
function eventModal() {
  const event=state.pendingEvent;if(!event)return;
  openModal(`<div class="modal-hero event-hero">${icon(categoryIcon(event.category))}<span class="eyebrow">AGE ${state.age} · A TURN IN THE STORY</span><h2>${esc(event.title)}</h2></div><p class="event-description">${esc(event.text)}</p><div class="event-choices">${event.choices.map((choice,i)=>`<button class="event-choice" data-choice="${i}"><span class="choice-letter">${String.fromCharCode(65+i)}</span><span>${esc(choice.label)}</span>${icon('arrow')}</button>`).join('')}</div><p class="modal-footnote">A choice today. A different tomorrow.</p>`);
}
function newLifeModal() {
  builderCharacter=createLife({country:state.country});
  const countries=countriesForYear(builderCharacter.birthYear).map(c=>`<option value="${esc(c.id)}" ${c.id===builderCharacter.country?'selected':''}>${esc(c.flag)} ${esc(c.name)}</option>`).join('');
  openModal(`<div class="modal-hero"><span class="hero-glyph">✷</span><span class="eyebrow">ANOTHER WORLD IS WAITING</span><h2>Begin a new story.</h2><p>A family, a place in time, and a person in every detail.</p></div>
  <form id="new-life-form" class="modal-form">
    <input type="hidden" name="generatedSeed" value="${builderCharacter.seed}">
    <div class="form-pair"><label>First name<input name="firstName" maxlength="32" placeholder="Leave to randomise" autocomplete="off"></label><label>Last name<input name="lastName" maxlength="32" placeholder="Leave to randomise" autocomplete="off"></label></div>
    <div class="form-pair"><label>Identity<select name="gender" id="builder-gender"><option value="neutral">Non-binary</option><option value="female">Female</option><option value="male">Male</option></select></label><label>Starting age<input name="age" id="builder-age" type="number" min="0" max="120" step="1" value="0" required inputmode="numeric"></label></div>
    <label>Year of birth<input name="birthYear" type="number" min="1900" max="9007199254740000" step="1" value="2026" required inputmode="numeric"></label>
    <div class="historical-note">Born in 1900 or later · Start at any age from 0 to 120. Your traits describe you at that age. Country names follow your birth year; labels simplify changes within each year. Careers and events use the shared game systems.</div>
    <div class="form-pair"><label>Birth country or territory<select name="country" id="country-select">${countries}</select></label><label>Birth city<select name="city" id="city-select">${(countryForYear(builderCharacter.country,builderCharacter.birthYear)?.cities||[]).map(city=>`<option>${esc(city)}</option>`).join('')}</select></label></div>
    <div id="builder-calendar" class="historical-note" role="status">${builderLocationSummary(builderCharacter.country,2026,0)}</div>
    <label>World seed <span class="optional">optional · custom attributes override generated values</span><input name="seed" maxlength="40" placeholder="A surprise from the universe" autocomplete="off"></label>
    ${renderCharacterFields(builderCharacter,{parents:builderCharacter.relationships,creating:true})}
    <div class="save-note">${icon('book')}Your current life is saved. You can return to it in Settings.</div>
    <button type="submit" class="primary-button full-width">Let’s see what happens ${icon('arrow')}</button>
  </form>`,true);
}

function builderLocationSummary(id,birthYear,age) {
  const now=calendarYearAtAge(birthYear,age),origin=countryForYear(id,birthYear),current=countryForYear(id,now);
  return `Born in ${esc(origin.name)} · Your story starts in ${esc(formatYear(now))}${current.name!==origin.name?` · Now ${esc(current.name)}`:''}.`;
}
function refreshBirthLocation(form) {
  const birthYear=Number(form.elements.birthYear.value),age=Number(form.elements.age.value);
  if(!Number.isSafeInteger(birthYear)||birthYear<1900||!Number.isInteger(age)||age<0||age>120)return;
  const selected=form.elements.country.value,city=form.elements.city.value;
  form.elements.country.innerHTML=countriesForYear(birthYear).map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(c.flag)} ${esc(c.name)}</option>`).join('');
  const location=countryForYear(form.elements.country.value,birthYear);
  const selectedCity=location.cityAliases?.[city]||city;
  form.elements.city.innerHTML=location.cities.map(name=>`<option ${name===selectedCity?'selected':''}>${esc(name)}</option>`).join('');
  $('#builder-calendar',form).innerHTML=builderLocationSummary(location.id,birthYear,age);
}
function updateStartingProfile(form) {
  const age=Number(form.elements.age.value),gender=form.elements.gender.value;
  if(form.elements.age.value===''||!Number.isInteger(age)||age<0||age>120||!builderCharacter)return;
  if(builderCharacter.age===age&&builderCharacter.gender===gender)return;
  const editedBody=Object.fromEntries(['heightCm','weightKg','bodyFatPercent'].flatMap(key=>{const field=form.elements[`body.${key}`];return field?.dataset.edited&&field.value!==''?[[key,Number(field.value)]]:[];}));
  const updated=createLife({seed:builderCharacter.seed,age,gender,country:form.elements.country.value});
  builderCharacter={...builderCharacter,age,gender,body:updated.body,attributes:updated.attributes};
  if(!form.dataset.birthEdited)form.elements.birthYear.value=2026-age;
  $('#body-builder-inputs',form).innerHTML=renderBodyFields(builderCharacter);
  for(const [key,value] of Object.entries(editedBody)){const field=form.elements[`body.${key}`];field.value=value;field.dataset.edited='true';}
  for(const group of ['attributes','stats'])for(const [key,value] of Object.entries(updated[group])){const field=form.elements[`${group}.${key}`];if(field&&!field.dataset.edited){field.value=Math.round(value);field.dataset.original=String(value);}}
  refreshBirthLocation(form);
}
function actionModal(action) {
  if(!state.alive){toast('This life has ended. You can continue the story through your legacy.','error');return;}
  if(action.disabled){toast(action.disabled,'error');return;}
  if(!action.fields?.length&&!action.confirm){runAction(action.id);return;}
  openModal(`<div class="modal-hero"><span class="hero-glyph">${action.icon?renderActionIcon(action.icon):icon(active)}</span><span class="eyebrow">YOUR NEXT MOVE</span><h2>${esc(action.title)}</h2><p>${esc(action.description)}</p></div><form id="action-form" class="modal-form" data-action-id="${esc(action.id)}">${(action.fields||[]).map(field=>`<label>${esc(field.label)}${field.type==='select'?`<select name="${esc(field.name)}">${(field.options||[]).map(option=>{const v=typeof option==='object'?option.value:option;const label=typeof option==='object'?option.label:option;return `<option value="${esc(v)}" ${String(v)===String(field.value)?'selected':''}>${esc(label)}</option>`;}).join('')}</select>`:`<input name="${esc(field.name)}" type="${field.type==='number'?'number':'text'}" value="${esc(field.value??'')}" ${field.min!==undefined?`min="${esc(field.min)}"`:''} ${field.max!==undefined?`max="${esc(field.max)}"`:''} ${field.type==='number'?'step="any"':''} maxlength="80" required>`}</label>`).join('')}${action.cost?`<div class="cost-summary"><span>Cost</span><strong>${money(action.cost)}</strong></div>`:''}${action.confirm?`<div class="notice-banner">${esc(action.confirm)}</div>`:''}<button type="submit" class="primary-button full-width">${esc(action.title)} ${icon('arrow')}</button></form>`);
}
function runAction(id,payload={}) {
  try {
    const before=structuredClone(state);const result=performAction(state,id,payload);
    if(!result||!result.state)throw new Error('Action did not return a state');
    if(result.ok){previous=before;state=result.state;save();closeModal();render();if(result.kind)gameModal(result);else{toast(result.message||'Your story moves forward.');if(!state.alive)summaryModal();else if(state.pendingEvent)eventModal();}}
    else toast(result.message||'That choice is unavailable right now.','error');
  } catch(error) {console.error(error);toast('That choice couldn’t be completed. Your previous save is safe.','error');}
}
function gameModal(result=null) {
  const session=state.minigame;
  const kind=result?.kind||session?.kind;
  if(!kind)return;
  const done=!session;
  let game=result?.game;
  try {game||=currentGame(state);}catch(error){openModal(`<div class="modal-hero"><h2>Let’s leave this game.</h2><p>Your saved game could not be replayed. Leaving settles the existing stake or escape penalty.</p></div><button class="primary-button full-width" data-play="forfeit">Leave the game</button>`);return;}
  let content='';
  if(kind==='blackjack'&&game) {
    const cards=(hand,hidden=false)=>hand.map((card,i)=>hidden&&i>0?'<span class="playing-card card-back" aria-label="Hidden card">✦</span>':`<span class="playing-card ${['♥','♦'].includes(card.suit)?'card-red':''}" aria-label="${esc(card.rank)} ${esc(card.suit)}"><b>${esc(card.rank)}</b><span>${esc(card.suit)}</span><i>${esc(card.rank)}</i></span>`).join('');
    content=`<div class="blackjack-table"><div class="hand-label"><span>THE DEALER</span><strong>${done?handValue(game.dealer):game.dealer[0].value}</strong></div><div class="card-hand">${cards(game.dealer,!done)}</div><div class="table-rule">DEALER STANDS ON ALL 17 · BLACKJACK PAYS 3:2</div><div class="hand-label"><span>YOUR HAND</span><strong>${handValue(game.player)}</strong></div><div class="card-hand">${cards(game.player)}</div></div>`;
  }else if(kind==='escape'&&game) {
    const at=(point,x,y)=>point[0]===x&&point[1]===y;
    content=`<div class="escape-board" role="img" aria-label="Prison map. Your position column ${game.player[0]+1}, row ${game.player[1]+1}. Guard column ${game.guard[0]+1}, row ${game.guard[1]+1}. Exit top right.">${Array.from({length:game.size*game.size},(_,i)=>{const x=i%game.size,y=Math.floor(i/game.size);const wall=game.walls.some(w=>at(w,x,y));const player=at(game.player,x,y),guard=at(game.guard,x,y),exit=at(game.exit,x,y);return `<span class="escape-cell ${wall?'wall':''} ${player?'player':''} ${guard?'guard':''} ${exit?'exit':''}">${player?'●':guard?icon('crime'):exit?icon('arrow'):''}</span>`;}).join('')}</div><div class="board-key"><span><b class="player-key">●</b> You</span><span><b class="guard-key">◆</b> Guard</span><span>↗ Exit</span><span>${game.moves} moves</span></div>${!done?`<div class="direction-pad"><button data-play="up" aria-label="Move up">↑</button><button data-play="left" aria-label="Move left">←</button><button data-play="down" aria-label="Move down">↓</button><button data-play="right" aria-label="Move right">→</button></div>`:''}`;
  }
  openModal(`<div class="modal-hero game-hero"><span class="eyebrow">${kind==='blackjack'?'ONE MORE HAND':'EVERY STEP COUNTS'}</span><h2>${kind==='blackjack'?'At the blackjack table.':'Find a way out.'}</h2><p>${done?'Every choice is part of the story.':kind==='blackjack'?`${money(session.bet)} stake committed · Hit or stand.`:'Reach the exit. The guard follows one step after every move.'}</p></div>${content}${done?`<div class="game-result" role="status">${esc(result?.message||'Your game has ended.')}</div><button class="primary-button full-width" data-command="${state.alive?'close-modal':'life-summary'}">${state.alive?'Back to my story':'Remember this life'} ${icon('arrow')}</button>`:`${kind==='blackjack'?'<div class="game-buttons"><button class="primary-button" data-play="hit">Hit · another card</button><button class="secondary-button" data-play="stand">Stand · keep my hand</button></div>':''}<p class="modal-footnote">${kind==='escape'?'Use the arrow buttons or your keyboard. Walls block movement. Three years are added if you’re caught or abandon the attempt.':'Your hand survives a refresh. Leaving the table forfeits your stake.'}</p><button class="game-forfeit" data-play="forfeit">${kind==='blackjack'?'Leave table & forfeit stake':'Abandon escape · +3 years'}</button>`}`);
  $('#modal-root dialog').dataset.game=kind;
}
function gameMove(move) {
  const result=advanceMiniGame(state,move);
  if(!result.ok){toast(result.message,'error');return;}
  state=result.state;save();render();gameModal(result);if(result.message&&!result.settled)toast(result.message);
}
function profileModal() {
  openModal(renderCharacterSheet(state,{self:true})+`<div class="sheet-skills"><h3 class="standalone-label">SKILLS & PRACTICE</h3><div class="skills-grid">${Object.entries(state.skills).map(([key,value])=>`<div><span>${esc(categoryTitle(key))}</span><strong>${Math.round(value)}%</strong></div>`).join('')}</div></div>`,true);
}
function editCharacterModal() {
  if(state.minigame){toast('Finish your current game before editing your character.','error');return;}
  builderCharacter=structuredClone(state);
  openModal(`<div class="modal-hero"><span class="eyebrow">MAKE THIS LIFE YOUR OWN</span><h2>Customise your character.</h2><p>Appearance, family descriptions, personality, and starting attributes.</p></div><div class="character-edit-meta"><span>${esc(state.firstName)} ${esc(state.lastName)} · Age ${state.age}</span><span>Born ${esc(formatYear(state.birthYear))}</span></div><form id="edit-character-form" class="modal-form">${renderCharacterFields(builderCharacter,{parents:state.relationships})}<div class="save-note">${icon('journal')}Changes are recorded in your journal. Your timeline, money, and relationships are kept.</div><button class="primary-button full-width" type="submit">Save character changes ${icon('check')}</button></form>`,true);
}
function reportModal() {
  const a=state.annual||{};
  openModal(`<div class="modal-hero"><span class="hero-glyph">${icon('finance')}</span><span class="eyebrow">${esc(formatYear(state.year))} · AGE ${state.age}</span><h2>A year in the life.</h2><p>A little perspective on where you stand.</p></div><div class="report-rows"><div><span>Income</span><strong class="positive">${money(a.income)}</strong></div><div><span>Tax</span><strong>${money(a.tax)}</strong></div><div><span>Living & other expenses</span><strong>${money(a.expenses)}</strong></div><div class="report-total"><span>Annual net change</span><strong>${money(a.net)}</strong></div><div><span>Cash balance</span><strong>${money(state.cash)}</strong></div><div><span>Investment value</span><strong>${money(state.investments.reduce((n,i)=>n+i.value,0))}</strong></div><div><span>Asset value</span><strong>${money(state.assets.reduce((n,a)=>n+a.value,0))}</strong></div><div><span>Debt & mortgages</span><strong>${money(state.debt+state.assets.reduce((n,a)=>n+(a.mortgage||0),0))}</strong></div><div class="report-total"><span>Total net worth</span><strong>${money(netWorth(state))}</strong></div></div><p class="modal-footnote">Reports summarise the last birthday update. In-year actions appear in your journal. All amounts use simulation dollars.</p>`);
}
function summaryModal() {
  const children=state.relationships.filter(p=>p.alive&&p.role==='child');
  const namedHeir=children.find(child=>child.id===state.flags.heir);
  const inheritance=child=>money(Math.max(0,netWorth(state))*(namedHeir?(namedHeir.id===child.id?1:0):1/children.length));
  openModal(`<div class="modal-hero"><span class="hero-glyph">${icon('book')}</span><span class="eyebrow">${state.alive?'A STORY STILL UNFOLDING':'A LIFE REMEMBERED'}</span><h2>${esc(state.firstName)}’s story.</h2><p>${state.alive?`${state.age} years of becoming.`:esc(state.causeOfDeath||'A life full of moments.')}</p></div><div class="summary-numbers"><div><strong>${state.age}</strong><span>YEARS LIVED</span></div><div><strong>${shortMoney(netWorth(state))}</strong><span>NET WORTH</span></div><div><strong>${state.journal.length}</strong><span>MOMENTS</span></div></div><div class="summary-detail"><p>${esc(occupation())}</p><p>${state.relationships.filter(r=>r.alive).length} connections · ${children.length} children · ${state.achievements.length} achievements</p><p>${esc(countryText())}</p></div>${!state.alive?`<h3 class="standalone-label">THE NEXT CHAPTER</h3>${children.length?children.map(child=>`<button class="event-choice" data-legacy="${esc(child.id)}"><span class="person-initial color-1">${esc(child.name[0])}</span><span>Continue as ${esc(child.name)}<small>Age ${child.age} · ${inheritance(child)} inheritance${namedHeir?.id===child.id?' · Named heir':''}</small></span>${icon('arrow')}</button>`).join(''):'<p class="muted-copy">There are no living children to carry on this family story. A new beginning is waiting.</p>'}<button class="primary-button full-width spaced" data-command="new-life">Begin a new life ${icon('arrow')}</button>`:'<p class="modal-footnote">You’re still writing this one. Make the next chapter count.</p>'}<button class="secondary-button full-width spaced" data-command="export-journal">${icon('download')} Export life journal</button>`);
}
function settingsModal() {
  openModal(`<div class="modal-hero"><span class="hero-glyph">${icon('settings')}</span><span class="eyebrow">MAKE YOURSELF AT HOME</span><h2>Your little corner.</h2><p>Saves, preferences, and new beginnings.</p></div><div class="settings-controls"><label><span>Dark appearance</span><input type="checkbox" id="theme-setting" ${settings.theme==='dark'?'checked':''}></label><label><span>Reduce animations</span><input type="checkbox" id="motion-setting" ${settings.reduceMotion?'checked':''}></label></div><div class="settings-button-grid"><button class="secondary-button" data-command="export">${icon('download')} Export save</button><button class="secondary-button" data-command="import">${icon('plus')} Import save</button></div><input type="file" id="import-file" accept=".json,application/json" hidden><h3 class="standalone-label">YOUR SAVED LIVES <span>${slots.length} / 12</span></h3><div class="saved-lives">${slots.map(slot=>`<button class="saved-life ${slot.id===state.id?'current-save':''}" data-load="${esc(slot.id)}">${avatar(slot.state,true)}<span><strong>${esc(slot.state.firstName)} ${esc(slot.state.lastName)}</strong><small>Age ${slot.state.age} · ${esc(country(slot.state)?.name||'')} · ${slot.state.alive?'Living':'Remembered'}</small></span>${slot.id===state.id?'<span class="save-badge">CURRENT</span>':icon('arrow')}</button>`).join('')}</div><div class="save-note">${icon('lock')}Saves live in this browser. Export a backup to keep them if browser data is cleared. The 12 most recent lives are retained.</div><button class="text-link full-width spaced" data-command="about">About Elsewhere & development ${icon('arrow')}</button>`);
}
function persistSettings() {try{localStorage.setItem(SETTINGS,JSON.stringify(settings));}catch{}document.documentElement.dataset.theme=settings.theme;document.documentElement.dataset.motion=settings.reduceMotion?'reduced':'full';}
function download(name,body,type='application/json') {const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
function aboutModal() {
  openModal(`<div class="modal-hero"><span class="brand-mark">e</span><span class="eyebrow">LOCAL EDITION · VERSION 0.3</span><h2>A life of possibilities.</h2><p>Elsewhere is an original, independently built life simulator.</p></div><div class="about-copy"><p>This playable foundation connects ageing, education, careers, family, wellbeing, property, investing, crime, specialist paths, and generations.</p><p>Systems are simplified and still being developed. It does not claim exhaustive feature parity with another game. All story text and visuals are original.</p><p>Play is local to this browser. There are no ads, purchases, accounts, or external game services. The game uses one fictional dollar economy across all locations.</p><p>Research, architecture, test instructions, and the feature matrix are in the project’s <strong>docs</strong> folder.</p></div><button class="primary-button full-width spaced" data-command="close-modal">Back to my story ${icon('arrow')}</button>`);
}
const commands = {
  'menu':()=>{mobileNav=!mobileNav;render();},'close-nav':()=>{mobileNav=false;render();},
  'close-modal':closeModal,'new-life':newLifeModal,'settings':settingsModal,'event':eventModal,'profile':profileModal,'report':reportModal,'life-summary':summaryModal,'about':aboutModal,'game':()=>gameModal(),'edit-character':editCharacterModal,
  'theme':()=>{settings.theme=settings.theme==='dark'?'light':'dark';persistSettings();},
  'age':()=>{if(state.minigame){gameModal();return;}if(state.pendingEvent){eventModal();return;}if(!state.alive){summaryModal();return;}try{checkpoint();state=ageUp(state);save();render();if(!state.alive)summaryModal();else if(state.pendingEvent)eventModal();else toast(`Chapter ${state.age+1}. Here’s to age ${state.age}.`);}catch(error){console.error(error);toast('The year couldn’t advance. Your save is safe.','error');}},
  'undo':()=>{if(!previous)return;const next=previous;previous=null;state=next;save();render();toast('Your last step has been rewound.');},
  'export':()=>{download(`elsewhere-${state.firstName.toLowerCase().replace(/[^a-z0-9]/g,'')}-age-${state.age}.json`,JSON.stringify({game:'elsewhere',version:1,state},null,2));toast('Save exported. Keep it somewhere safe.');},
  'import':()=>$('#import-file')?.click(),
  'export-journal':()=>{download(`elsewhere-journal-${state.age}.md`,`# ${state.firstName} ${state.lastName} — a life in Elsewhere\n\n${state.journal.map(e=>`## Age ${e.age} · ${e.title}\n\n${e.text}`).join('\n\n')}`,'text/markdown');toast('Your life journal has been exported.');},
};
document.addEventListener('click',event=>{
  const sheetTab=event.target.closest('[data-sheet-tab]');if(sheetTab){const sheet=sheetTab.closest('.character-sheet');sheet.querySelectorAll('[data-sheet-tab]').forEach(button=>button.setAttribute('aria-selected',String(button===sheetTab)));sheet.querySelectorAll('[data-sheet-panel]').forEach(panel=>panel.hidden=panel.dataset.sheetPanel!==sheetTab.dataset.sheetTab);return;}
  const person=event.target.closest('[data-person-id]');if(person){const found=state.relationships.find(p=>p.id===person.dataset.personId);if(found)openModal(renderCharacterSheet(found),true);return;}
  if(event.target.closest('.identity-person')){profileModal();return;}
  const play=event.target.closest('[data-play]');if(play){gameMove(play.dataset.play);return;}
  const expand=event.target.closest('[data-expand]');if(expand){const key=`${active}:${expand.dataset.expand}`;if(expandedGroups.has(key))expandedGroups.delete(key);else expandedGroups.add(key);render();return;}
  const nav=event.target.closest('[data-nav]');if(nav){event.preventDefault();active=nav.dataset.nav;search='';mobileNav=false;render();window.scrollTo({top:0,behavior:'instant'});return;}
  const command=event.target.closest('[data-command]');if(command){commands[command.dataset.command]?.();return;}
  const action=event.target.closest('[data-action]');if(action){const found=getActions(state,active).find(a=>a.id===action.dataset.action);if(found)actionModal(found);return;}
  const choice=event.target.closest('[data-choice]');if(choice){try{checkpoint();state=resolveEvent(state,Number(choice.dataset.choice));save();closeModal();render();if(!state.alive)summaryModal();else toast('Your choice becomes part of your story.');}catch(error){console.error(error);toast('That choice couldn’t be completed.','error');}return;}
  const load=event.target.closest('[data-load]');if(load){const selected=slots.find(s=>s.id===load.dataset.load);if(selected){state=normalizeState(selected.state);previous=null;active='journal';search='';save();closeModal();render();toast('Welcome back to your story.');}return;}
  const legacy=event.target.closest('[data-legacy]');if(legacy){try{checkpoint();state=continueLegacy(state,legacy.dataset.legacy);save();closeModal();active='journal';render();toast('A new generation. The story continues.');}catch(error){toast(error.message,'error');}}
});
document.addEventListener('submit',event=>{
  if(event.target.id==='new-life-form'){
    event.preventDefault();const values=Object.fromEntries(new FormData(event.target));
    try{const birthYear=Number(values.birthYear);if(!Number.isSafeInteger(birthYear)||birthYear<1900)throw new Error('Choose a whole-number birth year of 1900 or later.');const options={...readCharacterFields(event.target),age:Number(values.age),birthYear,gender:values.gender,country:values.country,city:values.city,seed:values.seed||Number(values.generatedSeed)};if(values.firstName.trim())options.firstName=values.firstName.trim();if(values.lastName.trim())options.lastName=values.lastName.trim();const next=createLife(options);save();state=next;previous=null;save();active='character';search='';closeModal();render();toast('Your story begins. Meet your character.');}catch(error){toast(error.message,'error');}
  }
  if(event.target.id==='edit-character-form'){event.preventDefault();try{const next=customizeCharacter(state,readCharacterFields(event.target));checkpoint();state=next;save();closeModal();render();toast('Your character and family descriptions have been updated.');}catch(error){toast(error.message,'error');}}
  if(event.target.id==='action-form'){event.preventDefault();runAction(event.target.dataset.actionId,Object.fromEntries(new FormData(event.target)));}
});
document.addEventListener('input',event=>{
  if(event.target.id==='builder-age'||event.target.id==='builder-gender')updateStartingProfile(event.target.closest('form'));
  if(event.target.name==='birthYear'&&event.target.closest('#new-life-form')){event.target.closest('form').dataset.birthEdited='true';refreshBirthLocation(event.target.closest('form'));}
  const builder=event.target.closest('#new-life-form,#edit-character-form');if(builder&&builderCharacter&&event.target.name!=='seed'){event.target.dataset.edited='true';refreshBuilder(builder,event.target,builderCharacter);}
  if(event.target.id==='action-search'){const selection=event.target.selectionStart;search=event.target.value;const y=window.scrollY;render();const input=$('#action-search');input.focus();input.setSelectionRange(selection,selection);window.scrollTo(0,y);}
});
document.addEventListener('change',async event=>{
  if(event.target.id==='builder-age'||event.target.id==='builder-gender'){
    const form=event.target.closest('form');updateStartingProfile(form);
    refreshBuilder(form,event.target,builderCharacter);
  }
  if(event.target.id==='show-locked'){showLocked=event.target.checked;render();}
  if(event.target.id==='country-select'||event.target.name==='birthYear')refreshBirthLocation(event.target.closest('form'));
  if(event.target.id==='theme-setting'){settings.theme=event.target.checked?'dark':'light';persistSettings();}
  if(event.target.id==='motion-setting'){settings.reduceMotion=event.target.checked;persistSettings();}
  if(event.target.id==='import-file'){
    const file=event.target.files[0];if(!file)return;if(file.size>2_000_000){toast('That file is too large. Choose an Elsewhere save under 2 MB.','error');return;}
    try{const raw=JSON.parse(await file.text());if(raw.game&&raw.game!=='elsewhere')throw new Error('Choose an Elsewhere save file.');const imported=normalizeState(raw.state||raw);save();state=imported;previous=null;save();closeModal();active='journal';render();toast('Your saved story is ready to continue.');}catch(error){toast(`Could not import save: ${error.message}`,'error');}
  }
});
document.addEventListener('keydown',event=>{const direction={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[event.key];if(direction&&state.minigame?.kind==='escape'&&$('#modal-root dialog[open]')?.dataset.game==='escape'){event.preventDefault();gameMove(direction);}});
save();render();if(loadWarning)setTimeout(()=>toast(loadWarning,'error'),100);

// A tiny dependency-free development loop. Saves survive source reloads.
let revision=null;
if(['localhost','127.0.0.1','[::1]'].includes(location.hostname))setInterval(async()=>{try{const response=await fetch(`/__dev?t=${Date.now()}`,{cache:'no-store'});if(!response.ok)return;const current=(await response.json()).revision;if(revision!==null&&revision!==current){const next=new URL(location.href);next.searchParams.set('dev',current);location.replace(next);}revision=current;}catch{}},2500);
