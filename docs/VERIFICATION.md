# Verification record

## Countries and current-age creation — version 0.3, 19 October 2026

`npm run check` passes **127 tests** and `npm run build` produces the static module graph. The country fixture checks the exact 193 UN member geography IDs plus Taiwan, Palestine, Vatican City and Kosovo, not just the total of 197. Regression checks cover all existing location IDs/balance, historical transition boundaries, historical city aliases, year-dependent migration choices, arbitrary starting ages0–120, current body measurements, birthday growth and pre-1900 save migration without losing progress.

Browser verification confirmed 197 choices, the birth-year minimum of1900, Russian Empire in1900, Soviet Union in1950 and Russia in2000. Created Rowan Vale at age27, born1930 in British India, beginning in1957 in Bombay, India, with IQ142, strength73, height190cm, weight88kg and body fat17%. All values persisted after reload; the checked browser session reported no console warnings or errors. Existing Avery's pre-1900 save retained age18 and its profile while shifting to a1900 birth date and displaying the calendar migration journal notice. Saved UI evidence: `artifacts/age-countries.png` (local, ignored by Git).

The creator uses current traits only. The former future-size controls have been removed. A browser-discovered age-input issue was corrected so unedited generated measurements update immediately when the starting age changes. The country model uses yearly geographical labels rather than precise historical borders; jobs, laws, events and economics remain shared game systems. See [COUNTRIES.md](COUNTRIES.md).

The records below describe earlier releases; their unrestricted BCE creation behavior was superseded by version0.3.

## Character expansion — 19 October 2026

The updated check suite passes **103 tests**, covering all previous systems plus personality generation, IQ/knowledge separation, calendar validation/BCE crossings, detailed profile migration, edited health components, adult growth targets, inherited profiles, appearance parsing, physique-dependent capacity and individual NPC outcomes.

Browser verification created an adult born in 44 BCE with IQ 139, strength 71, height 186 cm, weight 84 kg, body fat 16.3%, curly red hair and two custom parent descriptions. The profile tabs exposed all five domains and thirty facets, eight health systems and separate knowledge. Relationship cards retained both descriptions after a source reload; opening the mother’s card showed her own IQ, body measurements, appearance and temperament.

The historical calendar changes dates only; the world remains the existing modern simulation. Character scores and growth curves are synthetic game models. See [CHARACTER-MODEL.md](CHARACTER-MODEL.md).

Verified 18 October 2026 against the initial playable implementation.

## Automated

`npm run check` passes all module syntax checks and **69 tests** using Node.js 22. The suite covers seeded reproducibility, school and degree progression, cash/tax/debt/mortgage accounting, business capital conservation, family and inheritance, pets, employment gates, costs and yearly limits, save validation, events, full lifetimes, blackjack and prison escape.

The game-session integration tests verify stakes are charged once, natural-blackjack payouts, pushes, wins and losses, no repeat settlement, caps, forfeits, escape consequences, death, save/resume and active-session guards. Breadth tests exercise enabled action descriptors with default payloads; they do not constitute long-term balance testing of every strategy.

## Browser checks

Checked the local preview in desktop and narrow mobile layouts, including the mobile menu and modal layout. Completed these actual UI flows:

1. Advanced a newborn life, resolved a decision and checked the journal.
2. Created a custom adult character with a world seed.
3. Searched jobs, received a rejected application, then secured a barista position.
4. Advanced a year and confirmed $24,000 annual pay, $6,440 combined expenses/tax and $17,560 net cash in the annual view.
5. Started a $100 blackjack hand, refreshed, resumed the same cards, hit and stood. A win returned $200 to the balance, yielding $100 net profit.
6. Entered prison through a game crime action; observed lost employment, a 15-year sentence and parole restrictions.
7. Played a prison escape map through 12 actual moves. The guard pursued each turn; reaching the exit cleared the sentence and increased heat.
8. Loaded the deployed `/Elsewhere/` GitHub Pages URL, advanced a year, resolved an event, reloaded and verified the saved age/journal persisted. No browser warnings or errors were reported in the checked session.

GitHub Actions successfully ran the test and deployment jobs for the initial `main` commit. The game loaded from relative module/style/icon paths on the repository Pages prefix.

## Limits

This confirms the implemented baseline works; it does not establish exhaustive parity, long-term economy balance, complete accessibility certification or every browser/device combination. Detailed gaps are recorded in [FEATURE-MATRIX.md](FEATURE-MATRIX.md). Local and hosted saves are separate; export/import transfers a life between them. The local server remains a development process and must be started again after shutdown or reboot.
