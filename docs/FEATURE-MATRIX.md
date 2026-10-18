# Elsewhere feature coverage

Audit date: 18 October 2026. Baseline: `src/data.js`, `src/engine.js`, `src/systems.js`, `src/minigames.js`, `src/game-session.js` and the browser controls in `src/app.js`. This is an implementation audit of the local prototype, not a claim of full BitLife parity. Research is a nonexhaustive survey; the commercial game varies by version, platform and purchased content.

**Implemented** means a functioning state transition and its surrounding core loop exist. **Simplified** means a playable analogue exists but important depth is absent. **Backlog** means the actual system is absent, even when a related title, possession or generic action exists. A source describing a commercial feature does not prove that feature exists in Elsewhere.

## Base life simulation

| Feature family | Status | Implemented evidence | Limit or next step |
| --- | --- | --- | --- |
| Birth, origin and custom identity | Implemented | `createLife`; identity, place, seed, starting age, BCE/CE birth year, appearance, parent descriptions and editable attributes | Twenty modern countries; name pools are not country-specific; no era-specific world simulation |
| Age advancement and journal | Implemented | `ageUp`, annual journal entries and grouped journal UI | One-year steps; no childhood months or variable turn lengths |
| Character stats and skills | Implemented | Detailed human profiles: IQ, capacities, body measurements, eight health systems, five traits/thirty facets; seven compatibility stats and seven skills | Ratings are synthetic; no clinical assessments, talent trees or separate instruments |
| Life events | Implemented | Ninety-two original age-bounded events; contextual requirements and eight-event recent-history exclusion | Choices change cash/debt/stats; they do not currently create arbitrary relationship, condition or career story arcs |
| Primary and secondary school | Simplified | Automatic start at five, transition at eleven and graduation at eighteen; study, tutoring and clubs | Same ages in every country; no teacher roster, discipline cases, attendance or school-specific activities |
| University and advanced study | Simplified | Twenty-eight majors, four-year university, three-year graduate and two-year trade courses; fees and scholarships | Major does not constrain a job's subject requirement; one graduate gate substitutes for distinct professional schools |
| Full-time employment | Simplified | Eighty-five jobs with qualification/intelligence gates, interviews, annual pay, performance, dismissal and raises | No employer market, interview questions, track-specific promotion titles, seniority requirements or subject-specific licences for ordinary jobs |
| Part-time and freelance work | Implemented | Limited annual shifts from thirteen; skill-based freelance projects from sixteen | Instant projects; no ongoing hours, client contracts or schedules |
| Military service | Simplified | Enlistment, salary, performance and a deployment risk/reward action | No branch ranks, deployment map, tactical puzzle or service-specific decorations |
| Retirement | Simplified | Age-sixty retirement, settlement and annual pension; fallback support after sixty-seven | No contribution history, pension investment account or location-specific retirement rules |
| Parents, friends and colleagues | Simplified | Generated contacts, bond values, time/gifts/compliments/arguments and family money requests | No autonomous life simulation for contacts beyond age, bond drift and mortality; no extended family graph |
| Dating and marriage | Simplified | Dating, matchmaking, friend romance, proposal, wedding, breakup and cash-based divorce | No preferences editor, infidelity/custody systems, prenups or detailed partner compatibility |
| Children and adoption | Simplified | Age-dependent birth attempt, fertility treatment, adoption and child support action | Immediate outcomes; no pregnancy timeline, twin logic or independent descendant education/careers |
| Pets | Simplified | Shelter cats/dogs, name, bond, health, vet care, annual upkeep and mortality | No breeds, exotic animals, breeding, pet-specific events or behavioural traits |
| Health and recovery | Simplified | Eight component health systems with aggregate, physical capacity, ageing, medical care, therapy, rehabilitation, cosmetic surgery and two addiction sources | Conditions are strings; no general disease-onset catalogue, diagnoses by specialty, prognosis or treatment course |
| Hobbies and wellbeing | Implemented | Walking, meditation, gym, sport, music, acting, writing, coding, martial arts and volunteering | Fixed gains and per-year caps; no proficiency certificates or activity minigames |
| Travel and emigration | Simplified | Holiday, twenty migration destinations, relocation fee, job reset and country cost/tax changes | No itinerary, visa process, illegal migration, moving within a country or location-specific events |
| Vehicles and licences | Simplified | Driving and pilot licences; vehicle/aircraft purchase gates and enjoyment | Tests are chance-based or direct purchase; no questions, boating licence, collisions or driving simulation |
| Property and possessions | Simplified | Twenty-seven property, vehicle, boat, aircraft, jewellery and collectible entries; purchase, sale, upkeep and repair | Fixed catalogue, no generated listings, dealers, negotiation, customisation or item provenance |
| Financial accounting | Implemented | Cash, unsecured debt, secured debt, income, tax, expenses and net worth; annual report | One fictional economy; aggregate annual reports exclude in-year action cashflows |
| Loans | Simplified | Income-based borrowing limit and manual debt repayment; annual interest | No credit score, instalment schedule, bankruptcy or default proceeding; see balance caveats below |
| Crime and prison | Simplified | Eight abstract offences, heat, skill, arrest, sentence, prison work/study/exercise, appeal, parole, interactive escape and expungement | Trial evidence, lawyer roster, prison gangs and recapture remain absent |
| Prison escape puzzle | Implemented | Three solvable six-by-six maps; wall validation, directional/keyboard control, a deterministic pursuing guard, saved session and release/sentence consequences | One guard rule and one grid size; no difficulty tiers or procedurally generated maps |
| Gambling | Simplified | Interactive blackjack, abstract casino/sports wagers and lottery; stakes, payouts and addiction risk | Poker, slots and a horse roster remain absent |
| Blackjack game | Implemented | Seeded fifty-two-card deck, hit/stand, soft aces, dealer standing on soft seventeen, natural 3:2 payout, pushes, busts and cash settlement | No split, double down, insurance, surrender or multiplayer table |
| Death and generations | Simplified | Age/health mortality, cause of death, remembered life, heirs, estate calculation and child continuation | Estate becomes cash; no item-by-item heirlooms, independent child histories, estate tax or cemetery collection |
| Achievements | Implemented | Twenty-two original checks and visible goals | No copied achievement/ribbon set; no challenge vault or rotating challenge engine |
| Saves and export | Implemented | Twelve browser save slots, validated JSON import/export, Markdown journal export and single-step undo | No cloud sync, multi-device account or twenty-year rewind history |

The base-loop research is supported by the [official App Store description](https://apps.apple.com/us/app/bitlife-life-simulator/id1374403536), [community jobs catalogue](https://bitlife-life-simulator.fandom.com/wiki/Careers/Jobs) and [community update history](https://bitlife-life-simulator.fandom.com/wiki/Updates). These sources establish broad families; Elsewhere's precise rules are original.

## Special careers and modes

Twelve data-driven careers share a common state shape, practice action, annual performance/earnings and one main chance-based assignment. That is a playable starting point, not twelve independently complete profession simulations. The [official support FAQ](https://bitlifeapp.com/help/) distinguishes special career packs from the core game.

| Career or mode family | Status | Current analogue | Depth needed for a dedicated system |
| --- | --- | --- | --- |
| Musician | Simplified | Music training, recording-artist entry and release-single roll | Bands, labels, auditions, genres, contracts, album/song catalogue, tours, sales and awards |
| Actor | Simplified | Acting training, actor entry and film-audition roll | Agents, casting briefs, films/TV, scripts, named roles, preparation, co-stars and awards |
| Professional athlete | Simplified | Athletics training, age-gated entry and tournament roll | Sports, positions, teams, contracts, seasons, match records, injuries and championships |
| Politician | Simplified | Clean-record entry, campaign cost and success-based office title progression | Election opponents, voters, issues, approval, terms, policy decisions and office-specific powers |
| Organised crime | Simplified | Crime skill, syndicate assignment, scaled proceeds and arrest risk | Family members, rank hierarchy, loyalty, notoriety, rival factions, informant paths and retaliation |
| Business owner | Simplified | Capital, company value, staff count, operations, marketing, hiring, dividends and sale | Product lines, pricing, inventory, suppliers, competitors, forecasting and industry-specific decisions |
| Street hustler | Simplified | Music-based street performer and a tip roll | Separate performance, begging and con-game styles; street selection, police and local characters |
| Astronaut | Simplified | Degree/pilot gate, coding training and risky mission roll | Academy curriculum, examinations, missions, research discoveries, mission records and agency hierarchy |
| Model | Simplified | Fitness-based entry; looks-based casting outcome | Agencies, portfolio, poses, client requests, body/appearance preferences and distinct bookings |
| Dealer/cartel | Backlog | Ordinary crime and syndicate actions are adjacent only | A separate fictional organisation, territory, inventory, rivals and enforcement economy |
| Music producer | Backlog | Musician single-release action is adjacent only | Track production, artist collaborations, catalogue, label sales and recurring rights income |
| Ultimate fighter | Simplified | Fitness training, professional-fighter career and bout roll | Opponent roster, coaches, fighting styles, moves/counters, league standings and strategic bout play |
| Movie director | Simplified | Costly feature-film roll with success payout | Script and casting decisions, budgets, production timeline, distribution, festivals and awards |
| Writer | Simplified | Writing skill, author career and book-release roll | A persistent book catalogue, genres, editors, publishing contracts and distinct readership dynamics |
| Creator/influencer | Simplified | Followers, posts, viral roll, sponsorship and creator campaign | Distinct platforms, content history, moderation, collaborators and platform-specific audiences |
| Royalty | Simplified | Fame/country-gated marriage, allowance and public engagement | Birth status, titles, succession, public respect, obligations, abdication and country-specific institutions |
| Vampire mode | Backlog | None | Separate supernatural identity, powers, resources, opposition and family progression |

The [official store release notes](https://apps.apple.com/us/app/bitlife-life-simulator/id1374403536) establish music production and directing as distinct additions. The [official combat patch notes](https://bitlifeapp.com/whats-new/patch-notes/) describe strategic combat depth beyond a single result roll. The [official Vampire Mode page](https://bitlifeapp.com/whats-new/vampire-mode/) confirms that supernatural progression is another substantial system.

## Expansion families and platform features

| Family | Status | Current analogue | Missing system |
| --- | --- | --- | --- |
| Investor | Simplified | Four investment categories, annual price movement, purchase/sale and transaction fee | Named securities, company news, market cycles, advisers, research, fund fees and a price history |
| Landlord | Simplified | Mortgage purchase, rental toggle, condition-based annual rent, upkeep and repair | Tenants, leases, screening, rent setting, defaults, eviction, renovations and property-specific incidents |
| Black market/museum | Backlog | Collectibles are ordinary assets only | Dealers, authenticity, provenance, auctions, seizures, museum exhibits and admission economics |
| Cult/community organisation | Backlog | No organisation simulation | Membership, doctrine, facilities, loyalty, recruitment, finances and consequences |
| Secret agency | Backlog | No agency simulation | Recruits, training, equipment, missions, intelligence, adversaries and agency costs |
| Zoo | Backlog | Pet adoption does not constitute zoo management | Species roster, enclosures, welfare, breeding, staffing, visitors and conservation |
| Casino ownership | Backlog | Interactive blackjack and cash wagers are player activities only | Game rooms, staff, amenities, clientele and operating margin; other interactive casino games |
| Luxury lifestyle | Simplified | Expensive property, cars, jewellery, boats and aircraft | Islands, bespoke services, item customisation and dedicated luxury encounters |
| Racing | Backlog | Cars and a generic sports bet are adjacent only | Garages, modifications, racing licences, tracks, opponents, records and driving mechanics |
| Seasonal events and challenge vault | Backlog | Original static achievements only | Scenario definitions, eligibility/progress tracking, rotating goals and persistent reward inventory |
| Character editor and paid power items | Implemented editor; other items backlog | Creation and existing-character editor: appearance, family descriptions, abilities, body, health and thirty personality facets | Edits are explicit and journalled; no real-money store or paid power items is planned |
| Accessibility and localisation | Simplified | Responsive navigation, native dialogs, labelled controls and reduced-motion preference | Formal keyboard/screen-reader audit, contrast audit, text scaling and translated content |
| Cloud/mobile services | Backlog | Local browser application and static localhost server | Hosting, account sync, native packaging and cross-device recovery |

The [community expansion index](https://bitlife-life-simulator.fandom.com/wiki/Category%3AExpansion_Packs) identifies investor, landlord, black market, cult, secret agency and zoo families. The [community updates page](https://bitlife-life-simulator.fandom.com/wiki/Updates) documents casino ownership and racing as separate additions. The [community achievement index](https://bitlife-life-simulator.fandom.com/wiki/Achievements) provides secondary evidence of luxury-related ownership/customisation. Those community catalogues are incomplete and are used to identify backlog themes, not as authoritative specifications of current releases.

## Balance and audit caveats

- All ordinary salaries use one economy. Country selection changes taxes and living costs; it does not currently scale each job salary, property price or profession requirement.
- Trade and academic qualifications are broad ranks. A generic graduate degree can currently qualify for medicine, law and other advanced professions.
- Index funds and individual shares currently use the same annual volatility formula despite distinct descriptions. Bonds and cryptocurrency use separate volatility values. None uses a historical price feed.
- Unsecured debt accrues a seven-percent annual interest expense; principal is repaid manually. There is no automatic principal-amortisation schedule.
- Hiring increases payroll; it does not introduce named staff or employee-specific skills. A business category is currently descriptive rather than a distinct business model.
- A release, book, bout or film action produces earnings and progression but does not create a persistent project record or an actual award object.
- Some prose outcomes imply social consequences while the event effect system only changes declared cash/stat values. Deeper narratives need explicit state fields and tests.

No completion percentage is supplied: counting broad labels as equal to multi-system expansions would overstate coverage. Future changes should update this matrix only after the relevant state, actions, annual effects, UI and acceptance criteria exist.

### Verified interactive sessions

Interactive blackjack and the prison escape puzzle have been verified through thirteen pure game-rule tests, thirteen session integration tests and browser play. The blackjack smoke run committed a hundred-dollar stake, reloaded and resumed the same cards, then hit/stood and settled the correct hundred-dollar net win. The escape smoke run solved a grid past its guard in twelve moves and released the character. Search tests verify all three authored maps are solvable.

Sessions save their kind, seed, stake and move history. Reload/import reconstructs the same game; moves and outcomes commit to the life save. Active sessions block other actions and birthdays. Starting blackjack consumes a yearly allowance and commits the stake before showing cards: at most three hands per year, with whole-dollar stakes from ten to one million and sufficient available cash. Leaving forfeits the stake. Escape is limited to one attempt per year; capture or abandoning the attempt adds three years, costs twelve health and ten happiness. Successful escape releases the character and adds heat. A session accepts at most two hundred recorded moves, while wall-blocked moves consume no turn.

These are implemented interactive mechanics within broader simplified gambling/prison systems. They do not implement casino ownership, a full justice simulation or multiple prison difficulty levels.

## Detailed character update (19 October 2026)

Player and human NPC profiles now use a seeded thirty-facet Big Five model, with derived domain charts, inspectable individual bodies/abilities, and component health. Personality/IQ influence learning and work; both people influence social compatibility; physical capacity uses size, composition, abilities and health. Childhood growth, save migration and legacy continuity are implemented. Calendar-only historical birth years are supported with BCE/CE crossings and no year zero. See [CHARACTER-MODEL.md](CHARACTER-MODEL.md) for synthetic-model limits and remaining depth.
