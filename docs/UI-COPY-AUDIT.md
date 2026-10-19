# Interface copy audit

19 October 2026 · version 0.4.1

Keep text that identifies a control, reports state, explains a consequence or recovers from an error. Preserve the life journal's narrative voice and player-authored content.

| Surface | Changes |
| --- | --- |
| App shell | Removed logo, name, tagline, quotes, promotional footer, build badge and repeated page introductions. Neutral browser title, loading status and calendar favicon. |
| Journal and events | Preserved story entries and choices. Removed repeated journal heading, entry count, static filter and repeated age titles. |
| Character | One identity header; measurements, abilities and health values live in their relevant tabs. Personality domain labels appear once with matching chart colors. |
| Creation and editing | Removed promotional paragraphs, repeated previews, examples and model explanations. Kept field labels, ranges, date errors and starting-year changes. |
| CV | Removed repeated headings, counts and record legends. Kept entered history, field labels, education/employment modes and the past-pay consequence. Export headings no longer repeat record fields. |
| Education, careers and activities | Removed decorative descriptions and duplicated counts. Kept qualifications, course durations, salaries, costs and requirements. Shared costs and conditions appear once per group. |
| Relationships | Roster shows identity, role and age; detailed profiles retain appearance, personality, wealth and history. |
| Assets, finances and crime | Kept values, debt, interest, upkeep, deposits and sentence risks. Removed repeated balances and generic encouragement. |
| Special paths and legacy | Removed promotional copy and goals already represented by achievements. Kept progression, objectives, ancestors and inheritance. |
| Dialogs and games | One title and action label; relevant consequences remain. Compact game outcomes; journal records keep the full narrative. |
| Reports, settings and exports | Removed filler and branding. Kept report values, save controls, errors, capacity and one browser-storage backup note. |

Internal save keys and support for older branded JSON exports remain for compatibility. Simulation data, event prose, journal narratives and character history schemas are unchanged.

Verification: module syntax checks and all 149 simulation tests pass. Browser checks cover all main pages, character tabs, new-life date validation, CV record addition/removal, settings, action confirmations and blackjack with undo.
