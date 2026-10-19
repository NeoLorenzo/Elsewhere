# Elsewhere

**A little chance. A lot of choices.** An original browser life simulator with a complete birth-to-death loop, branching decisions, connected progression and family generations.

Play the published game at **[neolorenzo.github.io/Elsewhere](https://neolorenzo.github.io/Elsewhere/)** once the Pages workflow has deployed. Local development lives in `C:\BitLife Clone`.

## Run locally

Requires Node.js 22 or newer. There are no packages to install.

```powershell
cd 'C:\BitLife Clone'
npm start
```

Open **[localhost:3000](http://localhost:3000)**. Edits refresh the local preview automatically; progress is saved in the browser. Start another life at any whole-number age from 0 to 120 using **New life**. The navigation opens with the menu button on narrow screens.

New in **0.4**: set your full birthday and each parent's individual net worth. Build a structured CV with schools, qualifications, jobs, skills, languages, certifications, volunteering, projects, awards and references. View it in **Character sheet → CV & history**, edit it later, or export a Markdown CV. Completed education and a current job connect to actual qualification gates, course progression and future pay. See [the background schema](docs/BACKGROUND.md).

Choose a birth year of 1900 or later and a starting age from0 to120. Country and city names follow the chosen era. Customise your current measurements, portrait, IQ, abilities and every Big Five facet; describe both parents. Existing pre-1900 lives retain progress while their timeline moves to a1900 birth date, with original-date metadata and a journal notice.

```powershell
npm run check
```

This checks module syntax and runs the Node test suite. The GitHub Actions workflow tests every push to `main` before deploying GitHub Pages.

## Playable now

- Annual ageing, seven character stats, life events, a chronological journal, illness treatment, death and life summaries.
- Individual human profiles: five personality domains and thirty facets, IQ distinct from knowledge, strength/stamina/agility/coordination, creativity/empathy/willpower, height/weight/body fat, and eight health components.
- Appearance controls and parent descriptions, age-aware growth, editable current attributes, personality charts and era-aware country/city names from 1900 onward.
- Custom characters, deterministic world seeds, a global country catalogue and selectable cities.
- Childhood schooling, twenty-eight university majors, graduate and trade study, scholarships, school equivalency, driving and pilot licences.
- Eighty-five ordinary jobs, interviews, performance, pay rises, part-time and freelance work, military service and retirement.
- Friends, dating, engagement, marriage, divorce, children, adoption, fertility treatment, pets, wills and playable descendants.
- Skills, fitness, mindfulness, travel, emigration, social followers and sponsorships.
- Twenty-seven property and possession listings, mortgages, renting, upkeep, resale, investing, debt and business ownership.
- Crime, sentences, appeals, parole, prison work and an interactive escape puzzle with a pursuing guard.
- Interactive blackjack with hit/stand, ace handling, dealer play and persistent hands; other abstract betting activities.
- Twelve simplified specialist career paths, fame and a royal marriage route.
- Original achievements and goals, twelve browser save slots, JSON import/export, journal export, undo, dark appearance and reduced motion.

## Scope and roadmap

This is **an early playable foundation**, not exhaustive parity with BitLife's years of content and expansion systems. All names, event writing, UI and assets are original. Some career paths share a progression framework; detailed leagues, production pipelines, specialised businesses and many expansion families still need their own systems and content.

The [feature matrix](docs/FEATURE-MATRIX.md) records implemented, simplified and unimplemented systems. The [game design specification](docs/GAME-DESIGN.md) defines the loop, formulas and acceptance criteria. The [research notes](docs/RESEARCH.md) link the sources used for the feature survey. See [deployment](docs/DEPLOYMENT.md) for hosting and save transfer between local and published play.

The [character model](docs/CHARACTER-MODEL.md) documents the personality/physical simulation and its assumptions. These are synthetic game values, not psychological or medical assessments. Country labels follow the year; technology, laws, careers, events and economies still use shared game systems. See the [country model](docs/COUNTRIES.md) for coverage and historical simplifications.

All locations use one fictional dollar economy. Taxes, prices and salaries are game balance. Localhost and GitHub Pages have separate browser storage; export/import to transfer a life between them. No accounts, ads or purchases are implemented. Fonts load from Google Fonts when available and fall back to installed fonts offline; the game logic runs locally.

## Project layout

| Path | Purpose |
| --- | --- |
| `src/engine.js` | Seeded simulation, annual turns, saves, inheritance |
| `src/systems.js` | Validated action catalogues and transactions |
| `src/data.js`, `src/countries.js` | Original content and year-aware country catalogue |
| `src/character.js`, `src/calendar.js` | Detailed human profiles, growth, health, Big Five facets and BCE/CE dates |
| `src/character-ui.js`, `src/character.css` | Character creation, editable profiles and personality maps |
| `src/background.js`, `src/background-events.js`, `src/background-ui.js` | Structured CV schema, game progression records, birthday and CV editor |
| `src/minigames.js` | Pure deterministic blackjack and escape rules |
| `src/game-session.js` | Persistent games, stakes, consequences and settlement |
| `src/app.js`, `src/styles.css` | Responsive interface and local persistence |
| `server.js` | Loopback-only static development server with source refresh |
| `tests/` | Simulation, action, game rules and integration tests |
| `.github/workflows/pages.yml` | Test and publish on pushes to main |
| `scripts/build-static.mjs` | Static staging with versioned module URLs for coherent updates |

Static deployment stages `index.html`, `src/`, and `public/` with versioned module URLs using `npm run build`. Relative URLs support the GitHub Pages repository prefix.
