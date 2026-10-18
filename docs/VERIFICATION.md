# Verification record

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
