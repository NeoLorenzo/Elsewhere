# Elsewhere game design specification

Version 0.3 countries and current-age creation, 19 October 2026 (original baseline: 18 October 2026). This document specifies an original, local-first life simulator and its progression toward a deeper game. Statements labelled **current** describe code inspected in this repository. Targets and acceptance criteria describe required outcomes for later milestones; they are not claims of completed work. See [the coverage audit](FEATURE-MATRIX.md) and [research notes](RESEARCH.md) for external inspiration and explicit gaps.

## Product promise

Let the player guide an ordinary or extraordinary person from birth to death, see consequences accumulate in a readable life journal, and carry a family story into another generation. A life should be playable through quiet family choices, education, employment, wealth, artistry, public service or risk. Original names, writing, visuals, balance and product identity are required throughout.

The target feeling is curiosity about the next year. Planning should matter, chance should create stories, and setbacks should leave recoverable paths. A conventional life needs interesting moments of its own; fame and crime should not be the only narrative engines. The game has no win screen requiring money or notoriety. Death provides a retrospective, and achievements suggest optional ways to play.

## Player experience

1. Begin at any whole-number age from 0 to 120, choose a birth year of 1900 or later, identity and an era-aware location, appearance, parents’ descriptions, current attributes and personality; optionally supply a seed.
2. Read the current life stage, school/job, cash, net worth, wellbeing and recent relationships.
3. Explore education, career, relationships, activities, assets, finance, crime or special paths. Locked actions explain their conditions.
4. Choose a limited set of activities. Costs and important risks should be visible before committing. Dynamic forms collect amounts or named choices.
5. Advance one year. Income and upkeep settle, education progresses, people age, health and opportunities change.
6. Resolve the resulting event before taking another action or advancing again. See the selected result in the journal.
7. Repeat, adapt to changing circumstances, retire or pursue a new direction. When the life ends, inspect the story and continue as a living child or start again.

**Current interface:** persistent identity/status, grouped journal, searchable action lists, locked-action toggle, annual report, relationship/skill insights, achievements, native modal decisions, new-life form, saves, export/import, dark appearance and reduced motion. Single-step undo is a local convenience rather than a multi-year time-travel simulation.

## Architecture and state ownership

- `data.js` owns authored definitions: name pools, eighty-five jobs, twenty-eight majors, twenty-seven assets, twelve special career records, ninety-two events and twenty-two achievements. `countries.js` owns the expanded global catalogue, year-specific country names and city aliases.
- `engine.js` owns seeded randomness, creation, annual updates, event resolution, net worth, normalisation, death, inheritance and achievement checks.
- `systems.js` owns action descriptors and atomic action transactions. It imports data and engine helpers, validates at execution time, applies costs/results and logs outcomes.
- `minigames.js` owns pure deterministic blackjack and prison-grid rules; `game-session.js` validates session entry, reconstructs moves and settles money or prison consequences into life state.
- `character.js` owns deterministic human profiles, thirty facets, abilities, component health and growth. `calendar.js` handles BCE/CE arithmetic without year zero.
- `character-ui.js` renders appearance controls, character sheets and the personality radar.
- `app.js` renders state, requests actions, manages dialogs and persists browser saves. It must not independently award money, skills or career progress.
- `server.js` serves the project locally with Node. Runtime gameplay needs no package dependencies or remote game service.

The shared state has version, identity, seed/RNG, age/year, alive/death fields, stats, skills, cash/debt, education, employment, contacts, assets, investments, company, special career, prison, medical conditions, licences, social audience, journal, achievements, history, annual accounting, pending event, optional active minigame and generation/ancestor fields. Save format changes require explicit migration rather than silently discarding meaningful progress.

**Current determinism:** equal seeds, equal state and equal actions produce equal simulation results. Starting a life without a supplied seed uses a fresh seed. Randomness is advanced in state, allowing save/resume to preserve the sequence. Presentation randomness must not advance the gameplay generator.

## Annual turn order

The current birthday transaction copies state and refuses to advance a dead life or a life with an unresolved event or active minigame. It then:

1. Increments age and calendar year, resets yearly action counts and records the birthday.
2. Progresses education and ages contacts, including bond drift and mortality.
3. Settles jobs, special careers, business results, asset changes, rental income, mortgages, investment valuations, support, tax and expenses.
4. Reduces an existing sentence and heat; records release when the sentence ends.
5. Applies age-related health changes, healthy-diet benefit, happiness drift, condition impact, audience growth and fame changes.
6. Checks mortality. A surviving character receives an eligible event, avoiding the eight most recent event IDs where possible.
7. Records yearly history and checks achievements.

This order is a reproducibility contract. A future system must state where it runs, which values it reads before or after mutation, and whether it can end a life or cancel a later step. An incarcerated character's annual employment is excluded based on the sentence active at the beginning of the year.

## Stats, skills and identity

The player and every human contact have thirty personality facets, eight abilities including a separate IQ estimate, height/weight/body composition and eight health components. Domain scores and overall health are derived. The seven compatibility stats and skills remain zero-to-one-hundred game ratings; the former smarts value displays as Knowledge. See [the detailed character model](CHARACTER-MODEL.md) for fields, growth, personality structure and assumptions.

Newborn defaults include seventy-five happiness, ninety overall health and zero learned knowledge. IQ is generated separately and remains an age-normed fictional estimate. Appearance, parent descriptions, body targets, attributes, health components and personality are editable. The historical calendar skips year zero; selecting an ancient date does not yet change modern countries, careers or world events.

Skills grow through explicit practice, clubs and career development. Current lessons commonly add six to nine skill points with three uses per year; development should remain visible and should unlock meaningful new decisions. The next balance pass should introduce diminishing returns, time cost or mastery milestones before simply adding more repeated clicks.

## Education and work progression

**Current:** primary school begins at five; secondary begins at eleven; secondary finishes at eighteen. Grades change annually with discipline and chance. Study, library visits, tutoring and clubs improve development. University takes four years with twelve-thousand upfront tuition unless a scholarship applies. Graduate study takes three years and eighteen-thousand tuition; trade study takes two years and thirty-five-hundred tuition. Non-school courses require at least twenty-five grades at completion to award the qualification.

The eighty-five ordinary jobs use minimum education rank and knowledge, then a probabilistic hiring test influenced by knowledge, IQ, temperament, discipline and criminal record. Adult jobs and full-time courses have basic compatibility gates. Working harder improves performance at a happiness/health cost. Good performance may generate annual raises; very poor performance can lead to dismissal. Retirement becomes available at sixty and pays a settlement plus a recurring pension.

**Target:** jobs belong to explicit ladders with employers and prerequisites. A doctor needs a medical path; a pilot needs the applicable licence; a judge needs legal experience. A major should affect subjects and opportunities. Entry, advancement, dismissal and career switching need distinct narratives. Education should add options without making every unqualified path unviable.

## Relationships and generations

**Current:** contacts have role, age, bond and mortality. Interactions strengthen or damage bonds; family can supply modest help. Dating can lead through engagement to marriage; divorce charges a share of available cash. Birth attempts, fertility treatment and adoption can create children. Cats and dogs have additional health and upkeep. A will can name an heir.

On death, a living child can continue the story. Estate value converts to cash, split between living children unless an heir was named. The new character retains the date, location, selected family relationships, ancestry and earned achievements. Their independent life before succession is not simulated; qualifications are inferred by age and a fresh starting state is created. This is an explicit limitation, not an autonomous family-world simulation.

**Target:** give contacts persistent goals, jobs, preferences and significant histories. Build sibling/extended-family links, adult-child careers and custody rules before adding complex interpersonal events that imply those systems. Preserve possessions and ownership through inheritance once item provenance exists.

## Economy and possessions

All money is fictional simulation currency. Country values are balance parameters, not live economic facts. Current job base salaries are global. Countries change living costs and tax rates, with a tax allowance of eight thousand. Annual adult living costs begin at twenty-six hundred, or eighteen hundred while enrolled; each dependent child adds eighteen hundred, scaled by location. Pets add four hundred fifty each.

Net worth equals cash minus unsecured debt, plus assets minus mortgages, plus investment values and company value. Company capital is already included in company value and must not be counted a second time. Annual reports describe the last birthday settlement; immediate action spending belongs in the journal and cash balance.

**Current property:** a purchase can be paid outright or, for approved borrowers, with a twenty-percent deposit. Assets lose condition annually; property value fluctuates while other assets generally depreciate. Rental income is five-and-a-half percent of updated property value multiplied by condition. Upkeep applies annually. Mortgage payments reduce principal by sixty-five percent of the payment. Property repair restores condition for a fee. Sale settles secured debt and can require cash to cover negative equity.

**Current debt:** unsecured borrowing has a broad income-based limit, annual seven-percent interest expense and manual repayment. A cash shortfall becomes debt. There is no default, collection, bankruptcy or formal amortisation schedule. Automatic repayment promises must not appear until implemented.

**Current investments:** index fund, individual shares, cryptocurrency and government bonds are separate purchasable holdings. Annual value is multiplied by `1.045 + (random - 0.5) × volatility`. Volatility is 0.70 for crypto, 0.04 for bonds and 0.24 for the other categories. Selling charges one percent. This implies the current bond model cannot lose nominal value in a year and shares/indexes share a formula. Broader market behaviour requires a new model and should not be implied by labels.

**Target economy:** build audited cashflow ledgers, annual loan statements, distinct market risk, meaningful entry costs and recovery paths. Simulate at least a hundred seeded lives per major balance change. Track median net worth, bankrupt years, health, career success and age at death. Neither investment guarantees nor unchecked exponential special-career growth should dominate all other playstyles.

## Business and special careers

**Current business:** one company holds name, industry label, capital, estimated value, employee count, performance and annual profit. Operations/marketing improve performance; hiring adds payroll; cash injections, dividends and acquisition offers move value between personal and corporate accounts. Annual results allocate thirty-five percent of positive profit to the owner and retain the rest, with losses reducing reserves/value. Failed companies can close. Industry labels currently share the same formula.

**Current special careers:** entering typically requires adulthood, forty in the relevant skill and an entry cost. Some paths add degree, licence, age or record gates. Each career has level, performance, annual earnings, practice and one main assignment. Success can raise level, earnings, fame and cash; sport, combat and space failures can reduce health. Politics changes office titles; a syndicate job uses criminal sentencing. Royal marriage is an additional gated action with a royal allowance and public engagement.

**Target:** replace generic rolls with persistent projects, competitors, contracts and profession-specific decisions. A film should have production and release states; an athlete should play a season; a campaign should resolve against an electorate; an organisation should have named members and consequences. Pack names or career entry buttons do not satisfy these requirements. Casino ownership, zoo management, secret agencies, supernatural progression and the other absent families remain backlog in the matrix.

## Crime, prison, health and death

**Current crime:** offences trade reward against a risk reduced by skill and increased by heat. Arrest sets a term, increases the record and ends employment/special employment. In prison, ordinary categories are blocked; work, study, exercise, appeals, parole and escape supply choices. Serving a term records release. Escape does not yet create an ongoing pursuit/recapture simulation.

**Current interactive blackjack:** a seeded fifty-two-card deck deals player/dealer/player/dealer. The player can hit or stand; aces count as eleven or one to avoid a bust, and the dealer stands on all seventeen. Two-card natural wins pay three-to-two profit; ordinary wins pay one-to-one profit; pushes return the stake; losses return nothing. The whole-dollar stake must be between ten and one million and affordable. It is deducted before cards appear, and settlement clears the session so it cannot pay twice. Entry is limited to free adults and three hands per year. Leaving the table forfeits the committed stake. Splitting, double down, insurance, surrender and other table games are absent.

**Current interactive escape:** a seeded selection chooses one of three authored, solvable six-by-six maps. The player moves orthogonally toward the exit while a guard follows one shortest-path step after each valid move, using stable directional tie-breaking. Walls block movement without consuming a turn; touching the guard loses, reaching the exit wins. A win sets the sentence to zero, records release/escape and increases heat. Capture or abandonment adds three years and reduces health by twelve and happiness by ten, potentially causing death if health reaches zero. Entry requires an existing sentence and is limited to one attempt per year. There is one grid size and guard rule, with no difficulty tiers or generated map catalogue.

**Current session persistence:** saves retain game kind, seed, stake and recorded moves; reconstruction reproduces the same cards or positions after reload/import. Active sessions block birthdays, ordinary actions and event resolution until completed or explicitly forfeited. A two-hundred-recorded-move ceiling bounds replay size. Thirteen pure-rule tests and thirteen integration tests passed; browser verification resumed the same blackjack cards after reload, settled a correct net win and solved an escape grid to release the character. These verified games deepen the existing systems without constituting complete gambling, casino ownership or justice simulations.

**Current health:** explicit activities improve health while ageing, conditions and risky choices reduce it. Nightlife and gambling can introduce addiction strings; medical care, therapy and rehabilitation act on limited condition rules. Mortality depends on age bands, very low health and a hard age limit of one hundred twenty. Death can also occur after health reaches zero during an event or action. The health system lacks a broader disease catalogue and condition-specific timelines.

**Target:** introduce named conditions with severity, duration, care plans, recurrence and bounded chance. Risk explanations should be legible without promising precise real-world medical probabilities. Provide useful choices during adversity and restore access to ordinary life after a sentence or recovery. Death must preserve a readable final state and a valid family continuation route.

## Narrative rules

- Author original events for the character's age and actual context. A workplace event needs a job; parenting needs a child; a prison story needs incarceration.
- Every choice must declare its state effect and return a result consistent with that effect. Prose alone cannot create a job, child, disease or criminal charge.
- Include credible quiet outcomes, ethical ambiguity, humour and chance. Avoid repeating one moral choice with different nouns.
- Preserve recent-event exclusion. Add flags/cooldowns for major one-time stories and event chains before increasing the event rate.
- Events with mandatory expense can currently create debt; action purchases require available cash. This distinction should be explained or reconsidered during balance work.
- Future branching scenarios need measurable entry, choices, state transitions, follow-ups and exit conditions. They must remain deterministic and saveable.

## Action, persistence and failure contract

Current actions clone caller state, validate alive/pending-event/active-game/prison/age/qualification/cash conditions, debit cost, execute, record a count and journal entry, and check achievements. Validation failures return unchanged state and a readable reason. A valid probabilistic attempt may fail while still consuming cost and yearly allowance. Every year has a hundred-action ceiling, per-action limits, eight job applications and one emigration. Minigame entry also counts toward that ceiling, with three blackjack hands and one escape attempt per year. These caps are implementation choices subject to balance review.

Browser storage retains twelve recent lives. Save export contains versioned JSON; import normalises and bounds fields. The UI can export the journal as Markdown. User-provided text must render as text rather than HTML. A failed import must preserve the active life, and storage failure must offer export. A one-step undo checkpoint is session-local.

## Acceptance criteria and delivery priorities

The criteria below define reviewable completion; existing tests cover portions of the baseline, while UI and deeper-system criteria need separate evidence.

| Priority | Requirement | Acceptance evidence |
| --- | --- | --- |
| P0 | Play a complete original life locally | Browser smoke run: create, school, job, family, yearly event, report, death and descendant continuation without an uncaught error |
| P0 | Preserve deterministic and valid state | Same seed/actions produce deep-equal results; caller state remains unchanged; cash/debt/skills/stats stay finite and bounded |
| P0 | Enforce all action gates in the simulation | Direct calls with forged IDs/payloads, insufficient money, wrong age, pending events, prison and dead state fail without mutation |
| P0 | Resolve each event at most once | Unresolved decision blocks advancement; invalid index leaves state unchanged; valid resolution logs once and clears the event |
| P0 | Preserve saves across normal use | Reload restores RNG and pending event; valid import round-trips; malformed/oversize saves fail clearly; export remains available |
| P0 | Explain actual finances | Cashflows reconcile to annual report/net worth; loans, mortgages, company reserves and sale proceeds cannot duplicate wealth; wording matches formulas |
| P1 | Reach opportunities through readable progression | Seeded runs demonstrate vocational, university and creative paths, plus career recovery after a setback |
| P1 | Improve narrative consistency | Events never refer to absent roles; one-time milestones do not repeat; results match state changes and proper life stages |
| P1 | Formalise major job prerequisites | Every profession has documented subject/licence/experience gates and tests for both eligible and ineligible characters |
| P1 | Audit usability and accessibility | Keyboard completes create/event/action/save flows; focus returns correctly; text scaling and narrow layouts work; contrast and reduced motion verified |
| P1 | Balance wealth and longevity | A reproducible batch simulation reports distribution and extreme outliers; no repeatable same-year wealth loop remains |
| P2 | Add deep career modules | One career at a time gains persistent projects/contracts/opponents, annual effects, UI, save migration and end-to-end acceptance scenarios |
| P2 | Add landlord/business depth | Named tenants/staff, distinct operating decisions, ledgers, risk and lifecycle tests; generic rent/performance buttons no longer stand in for the whole system |
| P2 | Expand family and conditions | Independent contact histories, pregnancy/care timelines and structured medical state survive saves and succession |
| P3 | Build absent expansion families | Specify and implement casino ownership, zoo, agency, museum, racing and other families independently; update matrix only after full module validation |
| P3 | Consider distribution services | Evaluate hosting/mobile/cloud sync only once local progression, save compatibility and recovery are stable |

For a new module, completion requires its state model, entry/exit conditions, meaningful decisions, annual interactions, original content, visible feedback, bounded errors, save compatibility and tests. A menu entry, renamed generic roll or successful import is insufficient evidence of feature depth.
