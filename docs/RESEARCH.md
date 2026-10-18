# Elsewhere: life simulator research

Researched 18 October 2026. This is a feature-family survey to inform an original browser game. It is not an exhaustive inventory, a verified reproduction of private mechanics, or a claim that every expansion has been implemented. Store listings and community pages change; some features differ by platform or purchase.

## Sources and confidence

- [Official game website](https://bitlifeapp.com/): identifies the central appeal as choices, careers, relationships and unexpected events, and currently promotes filmmaking and combat additions. Used for broad product structure, not game text or assets.
- [Official Apple App Store listing and release notes](https://apps.apple.com/us/app/bitlife-life-simulator/id1374403536): confirms a full life played through annual choices, education, employment, romance, family, criminal activity and prison. Release notes also identify filmmaking, professional fighting, music production, loans, creator channels and seasonal objectives. The notes describe public features, not their probabilities or complete rules.
- [Official support: job packs](https://bitlife.zendesk.com/hc/en-us/articles/5165168014228-What-are-Job-Packs): confirms that special career paths include organised crime, professional sport, politics and acting.
- [Community career catalogue](https://bitlife-life-simulator.fandom.com/wiki/Careers) and [community job catalogue](https://bitlife-life-simulator.fandom.com/wiki/Careers/Jobs): secondary evidence for qualification gates, income progression, part-time work, professional schools and career collections. The latter describes education structures varying by location. Community information can be incomplete or outdated; its salaries are not a balance specification.
- [Community activities index](https://bitlife-life-simulator.fandom.com/wiki/Activities): search index confirms a broad activities menu and favourites. The full page could not be fetched during this research, so no detailed implementation claim relies on it.

All scenario dialogue, character pools, game balance, product identity and UI assets in Elsewhere are newly authored. Research supports mechanic categories; it supplies no copied event bank, copied interface or proprietary source code. Country taxes, salaries and prices in the game are fictional balance values, not current economic data.

## Feature map and intended implementation

| Family | Research finding | Elsewhere target |
| --- | --- | --- |
| Life loop | Age advances, stats and choices accumulate over a complete life | Seeded annual simulation, journal, four prominent wellbeing stats plus discipline, karma and fame |
| Origin and identity | Lives have countries, personal identity and family context | Custom or random name, gender, 20 countries, cities and parent relationships |
| School | Age and qualifications gate opportunities | Automatic childhood schooling, study actions, university majors and graduate study |
| Ordinary employment | Jobs differ by education and progression | 85 original job definitions, qualification thresholds, work performance and annual pay |
| Special careers | Paid packs expand into high-profile paths | Twelve generic career tracks with training, progression, risk and earnings; depth is simplified |
| Relationships | Romance, marriage, children and conflict shape a life | Friend and family interactions, dating, marriage, separation, parenting and legacy continuation |
| Health and leisure | Choices can change wellbeing and longevity | Fitness, reading, mindfulness, medical care, travel and age-aware health events |
| Property and possessions | Wealth can be held beyond cash | Property, vehicles, aircraft, boats, jewellery and collectibles; maintenance and ownership actions |
| Financial strategy | Investing, businesses and loans expand wealth paths | Investment categories, business management, liabilities, annual accounting and net worth |
| Crime and justice | Criminal choices can lead to imprisonment | Abstract risk/reward crime actions, arrest, sentences, prison choices and reintegration |
| Interactive side activities | Community update history identifies blackjack and a prison escape minigame | Implemented original blackjack rules and a guard/grid escape puzzle; details and verification below |
| Fame and audience | Entertainment and creator careers can build a public profile | Fame stat, followers, posts and reputation events |
| Migration | Location changes can alter opportunities | Emigration, cities and fictional tax/cost multipliers |
| Death and inheritance | Full lives end and family stories can continue | Cause of death, life summary, achievement checks, descendants and inheritance |
| Challenges and collection | Long-term objectives encourage unusual lives | Original achievements; later scenario challenges can build on the simulation |
| Save continuity | Long games need persistent progress | Local browser saves, manual export/import and generation history |

The target column describes the project’s intended initial scope. The executable code and test results determine what is implemented. A menu label or data record alone is not evidence that a system has full depth.

## Initial content specification

The original content module contains twenty locations with several selectable cities, diverse name pools, eighty-five jobs, twenty-eight majors, twenty-seven purchasable possessions, twelve special career concepts and twenty-two achievement definitions. Events span infancy, school, young adulthood, working life, parenting, midlife, ageing and late-life reflection, with contextual pools for employment, partners, children, assets, fame, businesses, special careers and prison. All event outcomes are prewritten and state-changing; the engine selects compatible events using age and context.

Original content priorities are varied everyday moments, meaningful tradeoffs and occasional absurdity. Ethical choices need not always yield cash, expensive choices need not always yield happiness, and a peaceful life should provide as much narrative texture as fame or crime. Young characters receive school and family scenarios; adults receive financial and workplace consequences; older characters retain learning, community and legacy choices.

## Verified interactive games

The [community update history](https://bitlife-life-simulator.fandom.com/wiki/Updates) identifies blackjack and escape puzzles as established genre features. Elsewhere implements original versions with pure deterministic rules and separate life-state settlement. Blackjack supports hit/stand, soft aces, dealer standing on soft seventeen, two-card naturals paying three-to-two, pushes and busts. Escape has three authored solvable six-by-six maps with walls, an exit and one shortest-path pursuing guard. The maps share a grid size and guard rule; there are no prison difficulty tiers. Blackjack does not support splitting or doubling down.

Saved sessions preserve the seed and move history so refresh/import resumes the same cards or map. Stakes and yearly allowances commit on entry, and other life actions pause until the session ends. Blackjack permits three hands per year; leaving loses the stake. Escape permits one attempt per year; capture or abandonment adds three years and applies the health/happiness penalty. A two-hundred-move replay limit bounds each session. Thirteen rule tests, thirteen integration tests and browser play verified rules, save/resume and correct cash/release outcomes. This is evidence of these two implemented games, not of casino ownership, a complete prison simulation or all side activities.

## Depth backlog and parity limits

The existing commercial game has years of updates and many expansion-specific subsystems. Faithful genre structure is achievable in this project; exhaustive content and balancing parity would require sustained implementation, playtesting and a complete versioned feature audit. The following deserve their own future specifications rather than being implied by a generic action:

- Distinct professional-school curricula, vocational qualifications, licences and location-specific school calendars.
- Detailed sports positions, contracts, leagues, injuries and championships.
- Rich acting, modelling, film direction and music production pipelines with projects, collaborators and awards.
- Election districts, policy choices, approval ratings and different offices.
- Space missions and technical training, organised-crime hierarchies and specialised crime encounters.
- Business product lines, demand forecasts, supplier contracts and employee management.
- Per-property tenants, leases, repairs, financing schedules and collectible authenticity.
- Detailed medical conditions, addiction/recovery, reproductive choices, pets, royalty and military deployments.
- Granular social platforms, interactions, scandals, product sponsorships and seasonal challenges.
- Additional side activities beyond blackjack and escape, scenario scripting, formal accessibility audits, localisation and mobile packaging.

No claim is made that these detailed systems already exist. Build on the shared annual loop, preserve deterministic saves, validate every action in the simulation layer and add deeper systems against measurable acceptance tests.
