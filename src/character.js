// Synthetic character model. These are game ratings, not medical/psychometric scores.
// This module deliberately has no imports and never touches the life's random stream.
const bound = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const finite = value => typeof value === 'number' && Number.isFinite(value);
const rating = (value, fallback = 50, min = 0, max = 100) => bound(finite(value) ? value : fallback, min, max);
const round = value => Math.round(value * 100) / 100;
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const animal = entity => entity?.role === 'pet' || !!entity?.species;

const domain = (id, label, color, facets) => Object.freeze({ id, label, color, facets: Object.freeze(facets.map(([id, label, description]) => Object.freeze({ id, label, description }))) });
export const PERSONALITY_DOMAINS = Object.freeze([
  domain('openness', 'Openness', '#8271c8', [
    ['imagination', 'Imagination', 'Enjoyment of invented possibilities and inner worlds.'],
    ['artisticInterests', 'Artistic interests', 'Interest in creative work, beauty and artistic expression.'],
    ['emotionality', 'Emotionality', 'Attention to the texture and intensity of feelings.'],
    ['adventurousness', 'Adventurousness', 'Preference for unfamiliar experiences over familiar routines.'],
    ['intellect', 'Intellectual curiosity', 'Enjoyment of ideas and abstract questions; distinct from IQ.'],
    ['liberalism', 'Openness to conventions', 'Willingness to question established conventions; not a party affiliation.'],
  ]),
  domain('conscientiousness', 'Conscientiousness', '#5b9b89', [
    ['selfEfficacy', 'Self-efficacy', 'Confidence in handling tasks and finding workable solutions.'],
    ['orderliness', 'Orderliness', 'Preference for structure, organisation and tidy surroundings.'],
    ['dutifulness', 'Dutifulness', 'Attention to commitments and obligations.'],
    ['achievementStriving', 'Achievement striving', 'Energy directed toward ambitious personal goals.'],
    ['selfDiscipline', 'Self-discipline', 'Persistence with intentions when motivation becomes difficult.'],
    ['cautiousness', 'Cautiousness', 'Deliberation before acting or accepting a risk.'],
  ]),
  domain('extraversion', 'Extraversion', '#c68b4f', [
    ['friendliness', 'Friendliness', 'Ease in expressing warmth and making a personal connection.'],
    ['gregariousness', 'Gregariousness', 'Enjoyment of company, gatherings and group experiences.'],
    ['assertiveness', 'Assertiveness', 'Readiness to speak up and take a leading role.'],
    ['activityLevel', 'Activity level', 'Preference for a lively, busy pace of life.'],
    ['excitementSeeking', 'Excitement seeking', 'Attraction to stimulation and high-energy experiences.'],
    ['cheerfulness', 'Cheerfulness', 'Tendency to express enjoyment and positive emotion.'],
  ]),
  domain('agreeableness', 'Agreeableness', '#bd7b96', [
    ['trust', 'Trust', 'Expectation that other people usually mean well.'],
    ['morality', 'Sincerity', 'Preference for straightforward dealing over manipulation.'],
    ['altruism', 'Altruism', 'Inclination to offer practical help to others.'],
    ['cooperation', 'Cooperation', 'Readiness to compromise and work through disagreements.'],
    ['modesty', 'Modesty', 'Comfort sharing credit without needing the spotlight.'],
    ['sympathy', 'Sympathy', 'Sensitivity to another person’s hardship and need for care.'],
  ]),
  domain('neuroticism', 'Neuroticism', '#a97a69', [
    ['anxiety', 'Anxiety sensitivity', 'Tendency to anticipate threats or feel apprehensive.'],
    ['anger', 'Frustration sensitivity', 'Readiness to feel irritation when something goes wrong.'],
    ['depression', 'Low-mood tendency', 'Disposition toward discouragement; not a diagnosis.'],
    ['selfConsciousness', 'Self-consciousness', 'Sensitivity to being watched or judged by others.'],
    ['immoderation', 'Impulse sensitivity', 'Difficulty resisting immediately tempting experiences.'],
    ['vulnerability', 'Stress sensitivity', 'Tendency to feel overwhelmed when pressure builds.'],
  ]),
]);

export const HEALTH_COMPONENTS = Object.freeze([
  { id: 'cardiovascular', label: 'Cardiovascular', description: 'Circulation and tolerance for physical effort.', weight: .17 },
  { id: 'respiratory', label: 'Respiratory', description: 'Breathing comfort and capacity.', weight: .13 },
  { id: 'immune', label: 'Immune resilience', description: 'Resilience to illness and recovery.', weight: .12 },
  { id: 'musculoskeletal', label: 'Muscles & joints', description: 'Physical comfort, support and mobility.', weight: .12 },
  { id: 'metabolic', label: 'Metabolic', description: 'Energy regulation and bodily maintenance.', weight: .12 },
  { id: 'mental', label: 'Mental wellbeing', description: 'Current emotional wellbeing, separate from personality.', weight: .13 },
  { id: 'nutrition', label: 'Nutrition', description: 'Nourishment to support growth and activity.', weight: .11 },
  { id: 'sleep', label: 'Sleep', description: 'Rest, recovery and sleep quality.', weight: .10 },
].map(Object.freeze));

const PALETTES = Object.freeze({
  skinTone: ['fair', 'light', 'medium', 'tan', 'brown', 'deep'],
  hairColor: ['black', 'brown', 'blonde', 'auburn', 'red', 'grey', 'white'],
  hairStyle: ['short', 'long', 'curly', 'wavy', 'bald'],
  eyeColor: ['brown', 'hazel', 'green', 'blue', 'grey'],
});

function hash(value) {
  let state = 2166136261;
  for (const char of String(value ?? 'character')) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return state >>> 0;
}

function generator(seed) {
  let state = hash(seed);
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return (state + .5) / 4294967296; };
}

function gaussian(random) {
  return Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
}

function entitySeed(entity, options = {}) {
  return `${options.seed ?? entity.seed ?? 'elsewhere'}:${entity.id ?? `${entity.firstName ?? entity.name ?? ''}:${entity.lastName ?? ''}:${entity.birthYear ?? ''}`}`;
}

function generatedPersonality(seed) {
  const random = generator(`${seed}:personality`);
  const facets = {};
  for (const group of PERSONALITY_DOMAINS) {
    const shared = gaussian(random) * 14;
    for (const facet of group.facets) facets[facet.id] = round(bound(50 + shared + gaussian(random) * 11));
  }
  return facets;
}

/** Supplied facets win; a domain override only fills facets absent from that input. */
export function normalizePersonality(raw, seed = 1) {
  const input = object(raw), supplied = object(input.facets), domains = object(input.domains);
  const defaults = generatedPersonality(seed), facets = {}, derived = {};
  for (const group of PERSONALITY_DOMAINS) {
    const override = finite(domains[group.id]) ? domains[group.id] : input[group.id];
    for (const facet of group.facets) {
      const value = finite(supplied[facet.id]) ? supplied[facet.id] : input[facet.id];
      facets[facet.id] = rating(value, finite(override) ? rating(override) : defaults[facet.id]);
    }
    derived[group.id] = group.facets.reduce((sum, facet) => sum + facets[facet.id], 0) / group.facets.length;
  }
  return { facets, domains: derived };
}

// Piecewise developmental anchors are authored simulation curves, not CDC data.
function interpolate(age, anchors) {
  if (age <= anchors[0][0]) return anchors[0][1];
  for (let index = 1; index < anchors.length; index++) {
    const [right, to] = anchors[index], [left, from] = anchors[index - 1];
    if (age <= right) return from + (to - from) * (age - left) / (right - left);
  }
  return anchors.at(-1)[1];
}

const heightFactor = age => interpolate(age, [[0, .295], [1, .445], [2, .515], [5, .65], [8, .75], [10, .815], [12, .885], [14, .95], [16, .985], [18, 1], [50, 1], [80, .99], [120, .975]]);
const weightFactor = age => interpolate(age, [[0, .052], [1, .15], [2, .19], [5, .29], [8, .41], [10, .52], [12, .65], [14, .81], [16, .94], [18, 1], [40, 1], [60, 1.04], [80, .98], [120, .88]]);
const ageOf = entity => rating(entity.age, 18, 0, 160);
const physicalFactor = (key, age) => interpolate(age, {
  strength: [[0, .08], [1, .16], [5, .34], [10, .57], [15, .87], [20, 1], [40, 1], [60, .82], [80, .57], [120, .25]],
  stamina: [[0, .24], [1, .35], [5, .53], [10, .72], [15, .92], [20, 1], [40, 1], [60, .85], [80, .62], [120, .30]],
  agility: [[0, .07], [1, .20], [5, .51], [10, .78], [15, .98], [20, 1], [40, 1], [60, .86], [80, .65], [120, .33]],
  coordination: [[0, .05], [1, .20], [5, .48], [10, .75], [15, .96], [20, 1], [40, 1], [60, .92], [80, .79], [120, .48]],
  creativity: [[0, .45], [5, .80], [10, .95], [18, 1], [120, 1]],
  empathy: [[0, .18], [5, .45], [10, .68], [18, .95], [25, 1], [120, 1]],
  willpower: [[0, .10], [5, .32], [10, .56], [18, .88], [25, 1], [120, 1]],
}[key]);

function bodyLimits(age) {
  return {
    heightMin: interpolate(age, [[0, 30], [1, 45], [5, 65], [10, 85], [18, 100]]),
    heightMax: interpolate(age, [[0, 65], [1, 105], [5, 145], [10, 190], [18, 240]]),
    weightMin: interpolate(age, [[0, 1], [1, 3], [5, 6], [10, 12], [18, 20]]),
    weightMax: interpolate(age, [[0, 7], [1, 25], [5, 65], [10, 130], [18, 350]]),
  };
}

export function bodyBounds(age=18){return {...bodyLimits(rating(age,18,0,160))};}

/** Returns synthetic current size and stored adult targets; units are cm/kg/percent. */
export function bodyDefaults(age = 18, gender = 'neutral', seed = 1) {
  age = rating(age, 18, 0, 160);
  const random = generator(`${seed}:body`);
  const meanHeight = gender === 'male' ? 177 : gender === 'female' ? 164 : 170.5;
  const adultHeightCm = round(bound(meanHeight + gaussian(random) * 7.3, 140, 210));
  const bmi = bound(23 + gaussian(random) * 3, 17, 34);
  const adultWeightKg = round((adultHeightCm / 100) ** 2 * bmi);
  const bodyFatPercent = round(bound(21 + (bmi - 23) * 1.2 + gaussian(random) * 3 + (age < 2 ? 3 : 0) + Math.max(0, age - 35) * .06, 8, 45));
  return { heightCm: round(adultHeightCm * heightFactor(age)), weightKg: round(adultWeightKg * weightFactor(age)), bodyFatPercent, adultHeightCm, adultWeightKg };
}

function normalizeBody(raw, patch, age, gender, seed, parents) {
  const input = { ...object(raw), ...object(patch) };
  const defaults = bodyDefaults(age, gender, seed), random = generator(`${seed}:inheritBody`);
  const heights = parents.map(p => p.body?.adultHeightCm).filter(finite);
  const genderOffset = gender === 'male' ? 6.5 : gender === 'female' ? -6.5 : 0;
  if (!finite(input.adultHeightCm) && heights.length) {
    const average = heights.reduce((sum, value) => sum + value, 0) / heights.length;
    defaults.adultHeightCm = bound(defaults.adultHeightCm * .5 + (average + (heights.length > 1 ? genderOffset : 0)) * .5 + gaussian(random) * 3, 120, 230);
    defaults.adultWeightKg *= (defaults.adultHeightCm / bodyDefaults(age, gender, seed).adultHeightCm) ** 2;
  }
  const limits = bodyLimits(age);
  const adultHeightCm = rating(input.adultHeightCm, age >= 18 && finite(input.heightCm) ? input.heightCm / heightFactor(age) : defaults.adultHeightCm, 100, 240);
  const adjustedWeight = defaults.adultWeightKg * (adultHeightCm / defaults.adultHeightCm) ** 2;
  const adultWeightKg = rating(input.adultWeightKg, age >= 18 && finite(input.weightKg) ? input.weightKg / weightFactor(age) : adjustedWeight, 20, 350);
  // A newly edited adult target updates current growth unless a current size was supplied too.
  const replaceHeight = finite(patch?.adultHeightCm) && !finite(patch?.heightCm);
  const replaceWeight = finite(patch?.adultWeightKg) && !finite(patch?.weightKg);
  return {
    heightCm: round(rating(replaceHeight ? undefined : input.heightCm, adultHeightCm * heightFactor(age), limits.heightMin, limits.heightMax)),
    weightKg: round(rating(replaceWeight ? undefined : input.weightKg, adultWeightKg * weightFactor(age), limits.weightMin, limits.weightMax)),
    bodyFatPercent: round(rating(input.bodyFatPercent, defaults.bodyFatPercent, 2, 65)),
    adultHeightCm: round(adultHeightCm), adultWeightKg: round(adultWeightKg),
  };
}

function explicitAppearance(description) {
  const result = {}, text = description.toLowerCase();
  const color = text.match(/\b(black|brown|blonde|blond|auburn|red|gr[ae]y|white)\s+(?:curly\s+|wavy\s+|short\s+|long\s+)?hair\b/);
  if (color) result.hairColor = color[1].replace('blond', 'blonde').replace('blondee', 'blonde').replace('gray', 'grey');
  const eyes = text.match(/\b(brown|hazel|green|blue|gr[ae]y)\s+eyes\b/);
  if (eyes) result.eyeColor = eyes[1].replace('gray', 'grey');
  const style = text.match(/\b(short|long|curly|wavy)\s+(?:(?:black|brown|blonde|blond|auburn|red|gr[ae]y|white)\s+)?hair\b/);
  if (style) result.hairStyle = style[1];
  if (/\bbald\b/.test(text)) result.hairStyle = 'bald';
  const skin = text.match(/\b(fair|light|medium|tan|brown|deep)\s+skin(?:\s+tone)?\b/);
  if (skin) result.skinTone = skin[1];
  return result;
}

function normalizeAppearance(raw, patch, age, seed, parents) {
  const input = object(raw), override = object(patch), random = generator(`${seed}:appearance`), result = {};
  const description = typeof override.description === 'string' ? override.description.trim().slice(0, 300)
    : typeof input.description === 'string' ? input.description.trim().slice(0, 300) : '';
  const parsed = explicitAppearance(description);
  const changedDescription = typeof override.description === 'string';
  for (const [key, palette] of Object.entries(PALETTES)) {
    let possibilities = key === 'hairColor' && age < 50 ? palette.slice(0, 5) : key === 'hairStyle' && age < 2 ? palette.filter(value => value !== 'long') : palette;
    const inherited = parents.map(p => p.appearance?.[key]).filter(value => palette.includes(value) && !(key === 'hairColor' && ['grey', 'white'].includes(value)));
    let value = possibilities[Math.floor(random() * possibilities.length)];
    if (inherited.length && ['skinTone', 'eyeColor', 'hairColor'].includes(key) && random() < .7) value = inherited[Math.floor(random() * inherited.length)];
    if (palette.includes(input[key])) value = input[key];
    if (parsed[key] && (changedDescription || !palette.includes(input[key]))) value = parsed[key];
    if (palette.includes(override[key])) value = override[key];
    result[key] = value;
  }
  result.description = description;
  return result;
}

function normalizeAttributes(raw, patch, entity, seed, parents) {
  const input = { ...object(raw), ...object(patch) }, random = generator(`${seed}:attributes`), age = ageOf(entity);
  const parentIQ = parents.map(p => p.attributes?.iq).filter(finite);
  const iqCentre = parentIQ.length ? 100 + (parentIQ.reduce((sum, value) => sum + value, 0) / parentIQ.length - 100) * .3 : 100;
  const result = { iq: round(rating(input.iq, iqCentre + gaussian(random) * 15, 40, 200)) };
  const physical = gaussian(random) * 9, facets = entity.personality.facets;
  const defaults = {
    strength: 54 + physical + gaussian(random) * 9,
    stamina: 56 + physical * .7 + gaussian(random) * 10,
    agility: 55 + physical * .4 + gaussian(random) * 11,
    coordination: 55 + physical * .3 + gaussian(random) * 10,
    creativity: 50 + ((facets.imagination + facets.artisticInterests) / 2 - 50) * .45 + gaussian(random) * 13,
    empathy: 50 + ((facets.sympathy + facets.altruism) / 2 - 50) * .45 + gaussian(random) * 12,
    willpower: 50 + (facets.selfDiscipline - 50) * .45 + gaussian(random) * 12,
  };
  for (const key of Object.keys(defaults)) result[key] = round(rating(input[key], bound(defaults[key], 10, 95) * physicalFactor(key, age)));
  return result;
}

function healthMean(profile) {
  return HEALTH_COMPONENTS.reduce((sum, component) => sum + rating(profile?.[component.id]) * component.weight, 0);
}

/** Uniform shifts with saturation redistribute the remaining delta to conserve the target. */
function calibrateHealth(profile, target) {
  target = bound(target);
  if (target <= 0 || target >= 100) {
    for (const component of HEALTH_COMPONENTS) profile[component.id] = target;
    return;
  }
  const initial = { ...profile };
  let low = -100, high = 100;
  for (let pass = 0; pass < 60; pass++) {
    const shift = (low + high) / 2;
    const value = HEALTH_COMPONENTS.reduce((sum, component) => sum + bound(initial[component.id] + shift) * component.weight, 0);
    if (value < target) low = shift; else high = shift;
  }
  const shift = (low + high) / 2;
  for (const component of HEALTH_COMPONENTS) profile[component.id] = bound(initial[component.id] + shift);
}

/** Numeric aggregate; NPCs can have a profile without a legacy stats object. */
export function overallHealth(entity) {
  if (animal(entity)) return rating(entity.health, entity.stats?.health ?? 80);
  if (!entity.healthProfile) return rating(entity.stats?.health, 80);
  return round(healthMean(entity.healthProfile));
}

function normalizeHealth(entity, patch, seed) {
  const input = { ...object(entity.healthProfile), ...object(patch) }, random = generator(`${seed}:health`);
  const legacy = finite(entity.stats?.health) ? rating(entity.stats.health) : null;
  const centre = legacy ?? 82;
  const profile = {};
  for (const component of HEALTH_COMPONENTS) profile[component.id] = rating(input[component.id], centre + gaussian(random) * 6);
  const explicitPatch = HEALTH_COMPONENTS.some(c => finite(patch?.[c.id]));
  // Legacy callers still change the scalar directly. Keep it authoritative unless editing components.
  if (legacy !== null && (!explicitPatch || legacy === 0) && Math.abs(healthMean(profile)-legacy)>.005) calibrateHealth(profile, legacy);
  entity.healthProfile = profile;
  if (entity.stats) entity.stats.health = overallHealth(entity);
}

function deriveBirthYear(entity) {
  if (Number.isSafeInteger(entity.birthYear) && entity.birthYear !== 0) return entity.birthYear;
  const current = Number.isSafeInteger(entity.year) && entity.year !== 0 ? entity.year : 2026;
  const astronomical = BigInt(current > 0 ? current : current + 1) - BigInt(Math.floor(ageOf(entity)));
  const historical = astronomical > 0n ? astronomical : astronomical - 1n;
  return Number(historical < BigInt(Number.MIN_SAFE_INTEGER) ? BigInt(Number.MIN_SAFE_INTEGER) : historical);
}

/** Idempotent enrichment; explicit profile patches preserve existing custom values. */
export function ensureCharacter(entity, options = {}) {
  if (!entity || typeof entity !== 'object' || animal(entity)) return entity;
  options = object(options);
  const seed = entitySeed(entity, options), age = ageOf(entity), parents = Array.isArray(options.parents) ? options.parents.filter(p => p && !animal(p)) : [];
  const hadFacets = PERSONALITY_DOMAINS.some(group => group.facets.some(facet => finite(entity.personality?.facets?.[facet.id])));
  let rawPersonality = entity.personality;
  if (!hadFacets && parents.length) {
    const defaults = generatedPersonality(seed), inherited = {};
    for (const group of PERSONALITY_DOMAINS) for (const facet of group.facets) {
      const values = parents.map(p => p.personality?.facets?.[facet.id]).filter(finite);
      inherited[facet.id] = values.length ? bound(defaults[facet.id] + (values.reduce((sum, value) => sum + value, 0) / values.length - 50) * .25) : defaults[facet.id];
    }
    rawPersonality = { ...object(entity.personality), facets: inherited };
  }
  if (options.personality) {
    const patch = object(options.personality), current = normalizePersonality(rawPersonality, seed);
    const patchFacets = { ...object(patch.facets) };
    // Domain edits deliberately update their unspecified facets; explicit facets remain precise controls.
    for (const group of PERSONALITY_DOMAINS) {
      const value = finite(patch.domains?.[group.id]) ? patch.domains[group.id] : patch[group.id];
      if (finite(value)) for (const facet of group.facets) if (!finite(patchFacets[facet.id])) patchFacets[facet.id] = value;
    }
    rawPersonality = { facets: { ...current.facets, ...patchFacets } };
  }
  entity.personality = normalizePersonality(rawPersonality, seed);
  entity.appearance = normalizeAppearance(entity.appearance, options.appearance, age, seed, parents);
  entity.attributes = normalizeAttributes(entity.attributes, options.attributes, entity, seed, parents);
  const bodyPatch={...object(options.body)};
  if(age>=18&&typeof options.appearance?.description==='string'&&!finite(bodyPatch.heightCm)&&!finite(bodyPatch.adultHeightCm)){
    const description=options.appearance.description.toLowerCase();
    const height=/\bvery tall\b/.test(description)?198:/\btall\b/.test(description)?185:/\bpetite\b/.test(description)?155:/\bshort (?:stature|build|person)\b|\bshort\s*,/.test(description)?158:null;
    if(height!==null){const base=normalizeBody(entity.body,{},age,entity.gender,seed,parents),ratio=height/base.heightCm;bodyPatch.heightCm=height;bodyPatch.adultHeightCm=height/heightFactor(age);bodyPatch.weightKg=base.weightKg*ratio**2;bodyPatch.adultWeightKg=base.adultWeightKg*ratio**2;}
  }
  entity.body = normalizeBody(entity.body, bodyPatch, age, entity.gender, seed, parents);
  entity.birthYear = deriveBirthYear(entity);
  normalizeHealth(entity, options.healthProfile, seed);
  return entity;
}

/** Applies a legacy scalar delta once, then makes that scalar the component aggregate. */
export function reconcileCharacter(entity, beforeStats = {}) {
  if (!entity || animal(entity)) return entity;
  if (!entity.healthProfile || !entity.attributes || !entity.personality || !entity.body) ensureCharacter(entity);
  for (const component of HEALTH_COMPONENTS) entity.healthProfile[component.id] = rating(entity.healthProfile[component.id], 80);
  if (finite(entity.stats?.health)) {
    const current = rating(entity.stats.health);
    if (current === 0) calibrateHealth(entity.healthProfile, 0);
    else if (finite(beforeStats.health)) {
      const delta = current - rating(beforeStats.health);
      if (Math.abs(delta) > 1e-9) calibrateHealth(entity.healthProfile, bound(healthMean(entity.healthProfile) + delta));
    } else if(Math.abs(healthMean(entity.healthProfile)-current)>.005)calibrateHealth(entity.healthProfile, current);
    entity.stats.health = overallHealth(entity);
  }
  for (const [key, value] of Object.entries(entity.attributes)) entity.attributes[key] = rating(value, key === 'iq' ? 100 : 50, key === 'iq' ? 40 : 0, key === 'iq' ? 200 : 100);
  entity.personality = normalizePersonality(entity.personality, entitySeed(entity));
  return entity;
}

/** Age is advanced by the engine; this only transforms the stored physical profile. */
export function ageCharacter(entity, previousAge) {
  if (!entity || animal(entity)) return entity;
  if (!entity.body || !entity.attributes || !entity.healthProfile || !entity.personality) ensureCharacter(entity);
  const age = ageOf(entity), before = rating(previousAge, age, 0, 160);
  if (age === before) return entity;
  const limits = bodyLimits(age);
  // Childhood size can differ from its curve but converges to the selected adult target.
  const growing = before < 18;
  const residual = growing ? Math.max(0, 18 - age) / Math.max(1, 18 - before) : 1;
  const height = growing ? entity.body.adultHeightCm * heightFactor(age) + (entity.body.heightCm - entity.body.adultHeightCm * heightFactor(before)) * residual : entity.body.heightCm * heightFactor(age) / heightFactor(before);
  const weight = growing ? entity.body.adultWeightKg * weightFactor(age) + (entity.body.weightKg - entity.body.adultWeightKg * weightFactor(before)) * residual : entity.body.weightKg * weightFactor(age) / weightFactor(before);
  entity.body.heightCm = round(bound(height, limits.heightMin, limits.heightMax));
  entity.body.weightKg = round(bound(weight, limits.weightMin, limits.weightMax));
  entity.body.bodyFatPercent = round(bound(entity.body.bodyFatPercent + (age >= 35 ? .06 * (age - before) : 0), 2, 65));
  for (const key of ['strength', 'stamina', 'agility', 'coordination', 'creativity', 'empathy', 'willpower']) {
    entity.attributes[key] = round(bound(entity.attributes[key] * physicalFactor(key, age) / physicalFactor(key, before)));
  }
  // The engine already applies age-related scalar health loss. Avoid charging it twice here.
  return entity;
}

function changeProfile(entity, changes) {
  for (const [key, delta] of Object.entries(changes)) entity.healthProfile[key] = bound(entity.healthProfile[key] + delta);
}
function changeAttributes(entity, changes) {
  for (const [key, delta] of Object.entries(changes)) entity.attributes[key] = round(bound(entity.attributes[key] + delta, key === 'iq' ? 40 : 0, key === 'iq' ? 200 : 100));
}
function changeTraits(entity, changes) {
  for (const [key, delta] of Object.entries(changes)) entity.personality.facets[key] = bound(entity.personality.facets[key] + delta);
}

/** Extra detail only: never awards cash, knowledge, counts, journal entries or IQ points. */
export function applyCharacterAction(entity, actionId) {
  if (!entity || animal(entity) || typeof actionId !== 'string') return entity;
  if (!entity.healthProfile || !entity.attributes || !entity.personality || !entity.body) ensureCharacter(entity);
  const id = actionId;
  if (/^activities:(gym|sport|martial|walk)$|^crime:prisonexercise$/.test(id)) {
    const light = id === 'activities:walk';
    changeAttributes(entity, { strength: light ? .25 : 1.6, stamina: light ? .7 : 1.4, agility: light ? .2 : .6, coordination: light ? .15 : .5 });
    changeProfile(entity, { cardiovascular: light ? 1 : 2, respiratory: .6, musculoskeletal: light ? .4 : 1.5, sleep: .5 });
    entity.body.bodyFatPercent = round(bound(entity.body.bodyFatPercent - (light ? .05 : .15), 2, 65));
    changeTraits(entity, { selfDiscipline: .15 });
  }
  if (/^education:(study|library|tutor|club)$|^activities:(coding|writing|music|acting)$|^crime:prisonstudy$/.test(id)) {
    changeAttributes(entity, { creativity: /music|writing|acting|club/.test(id) ? .8 : .25, willpower: .35 });
    changeTraits(entity, { intellect: .12, selfDiscipline: .12, ...(/music|acting/.test(id) ? { artisticInterests: .15 } : {}) });
  }
  if (id === 'activities:meditate') {
    changeProfile(entity, { mental: 2, sleep: 1 });
    changeAttributes(entity, { willpower: .6 });
    changeTraits(entity, { vulnerability: -.18, cautiousness: .12 });
  }
  if (id === 'activities:therapy') {
    changeProfile(entity, { mental: 4, sleep: 1 });
    changeAttributes(entity, { empathy: .4, willpower: .4 });
    changeTraits(entity, { vulnerability: -.25, selfConsciousness: -.15 });
  }
  if (id === 'activities:doctor') changeProfile(entity, { immune: 2, cardiovascular: .5, respiratory: .5 });
  if (id === 'activities:rehab') {
    changeProfile(entity, { mental: 3, metabolic: 2, nutrition: 2, sleep: 2 });
    changeAttributes(entity, { willpower: 1 });
    changeTraits(entity, { immoderation: -.3, selfDiscipline: .2 });
  }
  if (id === 'activities:diet') {
    changeProfile(entity, { nutrition: 5, metabolic: 2, immune: 1 });
    // The direction is toward a moderate synthetic target, not a weight-loss prescription.
    entity.body.bodyFatPercent = round(entity.body.bodyFatPercent + bound(23 - entity.body.bodyFatPercent, -.15, .15));
    if(entity.age>=18)entity.body.weightKg=round(entity.body.weightKg+bound((entity.body.adultWeightKg-entity.body.weightKg)*.015,-1,1));
  }
  if (id === 'activities:vacation' || id === 'career:retire') changeProfile(entity, { mental: 2, sleep: 2 });
  if (id === 'activities:sleep' || id === 'activities:rest') changeProfile(entity, { sleep: 4, mental: 1, immune: .5 });
  if (id === 'activities:nightclub') changeProfile(entity, { sleep: -3, metabolic: -.8 });
  if (id === 'career:hardwork' || id === 'career:parttime') {
    changeProfile(entity, { sleep: -1, mental: -.5 });
    changeAttributes(entity, { willpower: .3 });
    changeTraits(entity, { achievementStriving: .12, selfDiscipline: .1 });
  }
  if (/^relationships:.*:(time|compliment|gift|support)$|^relationships:all$|^activities:volunteer$/.test(id)) {
    changeAttributes(entity, { empathy: .35 });
    changeProfile(entity, { mental: .8 });
    changeTraits(entity, { friendliness: .1, sympathy: .1 });
  }
  if (/^relationships:.*:argue$/.test(id)) changeProfile(entity, { mental: -.8 });
  entity.personality = normalizePersonality(entity.personality, entitySeed(entity));
  if (entity.stats) entity.stats.health = overallHealth(entity);
  return entity;
}

/** Similarity is one modest influence, never a rule about whether a bond can work. */
export function personalityCompatibility(a, b) {
  const first = normalizePersonality(a?.personality ?? a, entitySeed(a || {}));
  const second = normalizePersonality(b?.personality ?? b, entitySeed(b || {}));
  let difference = 0;
  for (const group of PERSONALITY_DOMAINS) difference += Math.abs(first.domains[group.id] - second.domains[group.id]);
  const warmth = (first.facets.cooperation + first.facets.sympathy + second.facets.cooperation + second.facets.sympathy) / 4;
  return round(bound(82 - difference / 5 * .5 + (warmth - 50) * .1, 20, 95));
}

/** >1 is beneficial in every context, including risk management. */
export function personalityModifier(entity, context) {
  const personality = normalizePersonality(entity?.personality, entitySeed(entity || {})), f = personality.facets;
  const centred = key => (f[key] - 50) / 50;
  const modifiers = {
    learning: .075 * centred('intellect') + .04 * centred('selfDiscipline') + .02 * centred('imagination'),
    work: .07 * centred('selfDiscipline') + .05 * centred('achievementStriving') + .025 * centred('dutifulness'),
    social: .05 * centred('friendliness') + .04 * centred('cooperation') + .025 * centred('cheerfulness') - .02 * centred('selfConsciousness'),
    risk: .07 * centred('cautiousness') + .035 * centred('selfDiscipline') - .04 * centred('immoderation'),
    recovery: .04 * centred('selfDiscipline') + .025 * centred('cheerfulness') - .045 * centred('vulnerability'),
  };
  return bound(1 + (modifiers[context] || 0), .85, 1.15);
}

/** A bounded game capacity: abilities, current health, size and lean mass all contribute. */
export function physicalCapacity(entity) {
  const attributes=object(entity?.attributes), body=object(entity?.body), health=object(entity?.healthProfile);
  const ability=['strength','stamina','agility','coordination'].reduce((sum,key)=>sum+rating(attributes[key]),0)/4;
  const height=rating(body.heightCm,170,20,260), weight=rating(body.weightKg,70,1,450), fat=rating(body.bodyFatPercent,23,2,65);
  const leanMass=weight*(1-fat/100), expectedLeanMass=18.5*(height/100)**2;
  const massFactor=bound(.94+.06*leanMass/Math.max(1,expectedLeanMass),.88,1.12);
  const reachFactor=bound(1+(height-170)/1800,.94,1.06);
  const condition=['cardiovascular','respiratory','musculoskeletal','nutrition','sleep'].reduce((sum,key)=>sum+rating(health[key],80),0)/5;
  return round(bound(ability*massFactor*reachFactor*(.85+condition*.0015)));
}

export function describeAppearance(entity) {
  const appearance = object(entity?.appearance);
  if (typeof appearance.description === 'string' && appearance.description.trim()) return appearance.description.trim().slice(0, 300);
  if (!Object.keys(appearance).length) return 'Appearance not yet described.';
  const hair = appearance.hairStyle === 'bald' ? 'a bald head' : `${appearance.hairStyle || 'short'} ${appearance.hairColor || 'brown'} hair`;
  return `${appearance.skinTone || 'medium'} skin, ${hair}, and ${appearance.eyeColor || 'brown'} eyes.`;
}
