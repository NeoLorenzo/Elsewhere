# Character model — version 0.3

Implemented 19 October 2026. This is a transparent game model: it creates coherent individual differences and observable consequences without claiming clinical physiology, a validated psychological assessment, or historical world simulation.

## Creating and inspecting a person

**New life** supports appearance, a description of each parent, starting abilities, body measurements, health components and all thirty personality facets. The **Character sheet** has Overview, Personality, and Body & health tabs. Existing characters can be edited through **Customise this character**. Selecting a person’s card in Relationships opens their individual sheet; parents’ descriptions can be edited from the family section of the editor.

Portraits use skin tone, hair colour/style, eye colour and a modest body-composition silhouette. A free-text description is retained verbatim as text. Explicit colour/style words can inform a parent’s portrait, and clear stature terms such as “tall” can inform their measurements when no numerical body override is supplied. Descriptive text is not a general natural-language character generator. Structured controls take priority. Appearance never determines IQ, temperament, empathy or morality.

## Personality: five domains, thirty facets

The structure follows the public-domain [IPIP NEO facet key](https://ipip.ori.org/newNEOFacetsKey.htm) and [IPIP domain/facet reference](https://ipip.ori.org/newNEOKey.htm). The project does not copy a proprietary questionnaire or administer an IQ/personality test. Some display labels are phrased as tendencies to distinguish personality from a diagnosed condition.

| Domain | Six facets represented |
| --- | --- |
| Openness | Imagination, artistic interests, emotionality, adventurousness, intellectual curiosity, openness to conventions |
| Conscientiousness | Self-efficacy, orderliness, dutifulness, achievement striving, self-discipline, cautiousness |
| Extraversion | Friendliness, gregariousness, assertiveness, activity level, excitement seeking, cheerfulness |
| Agreeableness | Trust, sincerity, altruism, cooperation, modesty, sympathy |
| Neuroticism | Anxiety sensitivity, frustration sensitivity, low-mood tendency, self-consciousness, impulse sensitivity, stress sensitivity |

Each facet has a continuous 0–100 simulation rating. Each domain is the arithmetic mean of its six facets, recomputed on generation, editing and import. The radar chart shows domain values; the detailed bars expose every facet. Ratings are not population percentiles. Openness to conventions is not a political-party assignment, intellectual curiosity is not IQ, and a low-mood tendency is not a depression diagnosis.

Generated facets share a domain-level Gaussian component with individual variation. This makes related facets correlated without making them identical. Domains are generated separately; this is an authored approximation, not an empirically calibrated covariance model. Profiles use an independent seeded generator so adding or inspecting them does not consume the life’s gameplay RNG. Imports preserve profiles rather than rerolling them.

Temperament affects learning, effort, social responses, risk management and recovery through bounded modifiers. Compatibility uses both people’s profiles and remains a soft influence: dissimilar people can maintain strong relationships. All facets contribute through domain compatibility; selected facets also affect relevant actions directly. Experiences can produce small facet changes. Childhood profiles represent developing tendencies, not adult assessment results. Pets retain their species wellbeing model.

## Cognition and abilities

Every human has IQ, strength, stamina, agility, coordination, creativity, empathy and willpower. IQ is a fictional age-normed estimate with a generated centre of 100 and standard deviation of approximately 15, bounded to 40–200. It affects learning and reasoning-related outcomes. It is not inferred from appearance, gender, name or country. Family influence is weak and mixed with substantial individual variation, not a genetic prediction.

The former `stats.smarts` field remains for save compatibility and now displays as **Knowledge**. Newborn knowledge starts at zero; development, schooling and practice increase it. A high IQ does not automatically grant a qualification or learned knowledge. Reading does not simply award IQ points. Other capacities use 0–100 game ratings; they are not kilograms lifted, sprint times or clinical scores. Childhood capacities develop with age.

## Body, growth and physical consequences

The creator accepts any whole-number starting age from 0 to 120. All editable abilities, personality scores, health and measurements describe the person at that current age. There is no future target-age configuration. Each human stores current height in centimetres, weight in kilograms and body-fat percentage. Internal adult-height/weight potentials support authored childhood growth curves; setting current measurements infers these potentials rather than imposing future promises. Adult ageing gradually changes size and physical capacity. These curves are not growth-chart percentiles or individual medical predictions.

Physical capacity combines strength, stamina, agility and coordination with current component health, height and estimated lean mass from weight/body composition. Each contribution is bounded. Training, athletic competitions and selected risky actions use capacity; measurements are not display-only. Training changes strength, stamina and body composition. A diet action can move adult weight gradually toward its target. A taller or heavier body is not universally superior, and body appearance does not set personality or cognitive ability.

BMI is shown only as a reference calculation. The interface does not assign adult BMI categories to children. No clinical body-fat, growth or weight judgement is presented.

## Health breakdown

| Component | Contribution to overall health |
| --- | --- |
| Cardiovascular | 17% |
| Respiratory | 13% |
| Immune resilience | 12% |
| Muscles & joints | 12% |
| Metabolic | 12% |
| Mental wellbeing | 13% |
| Nutrition | 11% |
| Sleep | 10% |

The original overall-health stat is the weighted aggregate. Legacy event changes are reconciled into component values once; targeted actions then modify relevant systems. Exercise, medical care, therapy, rehabilitation, diet, rest and overwork have distinct effects. Sleep and nutrition contribute to physical capacity. Mental wellbeing is a current state, separate from temperament. Age and health influence human NPC mortality as well as the player’s lifespan.

This is a weighted game abstraction, not a simulation of organs, blood chemistry, calorie balance, disease mechanisms or clinical treatment. Existing conditions remain a simpler subsystem. Detailed health must not silently undo a zero-health death or charge the same injury twice.

## Historical calendar

New playable lives require a birth year of 1900 or later. The starting calendar year is birth year plus starting age. Parents can have earlier birth dates as family background. Country and city labels resolve against the birth year in the creator and the current year during play; a stable geographical identifier preserves the selected location through changes of state. See [country model](COUNTRIES.md) for coverage, research and simplifications.

Arithmetic uses integer calendar offsets rather than browser `Date`, with 256 years of safe-integer headroom. Generic BCE helpers remain for reading older saves. Pre-1900 playable saves are moved to a 1900 birth date, shifting their timeline and relatives together, retaining progress and original-date metadata and recording the migration in the journal. This change is applied once. Country labels are era-aware; jobs, technology, laws, events and economic assumptions still share the existing game systems.

## Persistence and verification

Version-1 saves are enriched with deterministic missing fields while retaining age, finances, journal and gameplay RNG. New fields are sanitised and bounded; derived personality domains and overall health are recomputed. A selected legacy heir carries their appearance, personality, IQ, body and birth year forward.

Tests cover complete profiles, generation variation, idempotent upgrades, legacy calendar arithmetic, customisation whitelists, current-age measurements and growth, stable IQ, component-health reconciliation, individual NPC creation, soft trait effects, physique-dependent outcomes and legacy continuity. Browser checks cover custom creation, parent descriptions, profile tabs and save/reload.
