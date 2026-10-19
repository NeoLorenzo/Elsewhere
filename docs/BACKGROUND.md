# Birthdays, family wealth and CV data — version 0.4

Implemented 19 October 2026. These records describe fictional game characters and remain in the existing browser saves and JSON exports. No external identity, school or employer service is used.

## Authoring and viewing

In **New life**, choose a birth year, month and day. Open **Your parents** to enter each parent's own net worth and appearance. Open **Education, work & CV** to add any number of background entries, up to 100 per section. Starting age determines the latest valid date for prior experience. Empty sections do not manufacture institutions or former employers.

Existing lives use **Character → Edit character**. The **CV & history** tab displays the background and offers **Export CV**, a Markdown document. JSON save exports preserve every structured field, including dates and parent wealth. Birthday editing changes the day/month while retaining the existing birth year, age and timeline.

The creator uses calendar years for CV entries. A record can be ongoing or have an end year. Validation rejects experience before birth, entries after the current year, reversed date ranges, missing required names and more than one current full-time job. Multiple current part-time roles are allowed. Certification expiry dates can be in the future, but cannot precede the date earned.

## Calendar fields

```js
{
  birthYear: 1990,                 // compatibility field; new lives >=1900
  birthDate: {year:1990, month:7, day:9},
  age: 36,
  year: 2026,
  date: {year:2026, month:7, day:9} // current birthday, not a daily clock
}
```

`calendar.js` exports `daysInMonth(year,month)`, `validateBirthDate(raw,birthYear)`, `normalizeBirthDate(raw,birthYear)`, `dateAtAge(birthDate,age)` and `formatDate(date)`. Gregorian leap-year rules are calculated directly, avoiding browser timezone conversions. A 29 February birthday is observed on 28 February in a non-leap year and returns to 29 February in leap years. New dates are validated strictly; malformed imports clamp to a valid date. Old saves with no day/month use 1 January. Earlier calendar migration also shifts CV dates consistently.

## Parents

Each parent relationship stores `netWorth`, a finite signed amount in fictional dollars, bounded to ±1 quadrillion. A negative value represents debt. The mother and father fields are independent; neither is the player's spendable balance. New and upgraded parents default to $50,000 when a value is missing.

Successful requests for money draw a bounded gift from positive parent wealth and deduct the same amount from the parent. A parent without positive wealth cannot give a cash gift. The existing adult-player inheritance route now uses the parent's positive configured estate once, subject to its existing relationship requirements; it does not transfer parental debt. This remains a simplified estate system, without trusts, probate, multiple-heir allocation or asset-by-asset parent accounts.

## Background schema

`src/background.js` exports the versioned normalizer/validator and frozen field metadata. All collections are arrays with stable string record IDs. Unknown keys are ignored on import. The schema is independent of the display and can support later search, CV formats and more detailed school/employer systems.

```js
background: {
  version: 1,
  summary: '',
  contact: {email:'', phone:'', location:'', website:'', linkedin:''},
  educationMode: 'unspecified', // unspecified | none | recorded
  employmentMode: 'unspecified', // unspecified | unemployed | recorded
  education: [],
  workExperience: [],
  skills: [],
  languages: [],
  certifications: [],
  volunteering: [],
  projects: [],
  awards: [],
  interests: [],
  references: []
}
```

| Collection | Record fields, in addition to `id` |
| --- | --- |
| Education | `institution`, `location`, `level`, `qualification`, `field`, `startYear`, `endYear`, `status`, `grade`, `description`, `source` |
| Work experience | `employer`, `title`, `location`, `employmentType`, `startYear`, `endYear`, `current`, optional `annualSalary`, `description`, `achievements`, `source` |
| Skills | `name`, `level`, `category` |
| Languages | `name`, `level` |
| Certifications | `name`, `issuer`, `year`, `expiryYear`, `credentialId` |
| Volunteering | `organisation`, `role`, `location`, `startYear`, `endYear`, `current`, `description` |
| Projects | `name`, `role`, `url`, `startYear`, `endYear`, `current`, `description`, `technologies` |
| Awards | `title`, `issuer`, `year`, `description` |
| Interests | `name`, `description` |
| References | `name`, `relationship`, `organisation`, `email`, `phone`, `notes`, `availableUponRequest` |

Education `level`: `primary`, `secondary`, `trade`, `university`, `graduate`, `other`. Education `status`: `completed`, `attending`, `withdrawn`. Work `employmentType`: `full-time`, `part-time`, `contract`, `self-employed`, `internship`, `apprenticeship`, `other`. `source` is internal provenance (`custom` or `game`), preserved without exposing an implementation control to the player.

Skill proficiency: `beginner`, `intermediate`, `advanced`, `expert`. Language proficiency: `native`, `fluent`, `professional`, `conversational`, `basic`. CV skills and languages are descriptive records; they do not silently overwrite numeric gameplay skills or IQ. Descriptions are bounded to 2,000 characters, the personal summary to 4,000, and short fields to their published metadata limits. URL fields accept HTTP/HTTPS addresses; displayed links remain text. Contact fields describe the fictional character, not an account registration.

Public APIs:

```js
normalizeBackground(raw, {birthYear,age,year}); // tolerant save upgrade
validateBackground(raw, {birthYear,age,year});  // throws on invalid editor input
blankBackgroundRecord('education', context);  // blank authoring defaults
BACKGROUND_COLLECTIONS; BACKGROUND_FIELDS; BACKGROUND_LABELS; BACKGROUND_LIMITS;
```

Normalization is deterministic, whitelists fields, bounds records/content, resolves duplicate IDs within each collection and retains valid history. It does not fabricate former schools or jobs from age. Existing adult starts retain the former default secondary qualification when history is unspecified, while their CV remains empty. Choosing **No formal education** explicitly clears the gameplay qualification.

## Connection to play

When creating or explicitly editing recorded history, the highest completed education determines the gameplay qualification and job/course eligibility. An attending course becomes the current enrolment. The course stores its institution, qualification, CV record ID and remaining duration. Game-generated childhood schooling still transitions at the normal ages; recording a CV does not replace that timetable.

A recorded current job becomes the primary gameplay job, carrying its title, employer, optional annual salary and tenure. A full-time job takes precedence over concurrent part-time entries, then the most recent start year wins. The game currently pays one primary regular job. Omitting its salary gives zero pay; entering past salaries does not create past earnings, savings or debt. Job background changes do not reconstruct prior annual financial reports.

`background-events.js` exports `syncBackgroundProgress(state,before)`. Actual actions and birthdays start, update and close education/work entries for enrolment, graduation, withdrawal, hiring, resignation, firing, retirement, emigration and death. Custom current rows are updated rather than duplicated. Newly earned driving/pilot licences create certification records. Game-generated school/employer names are generic unless a custom record supplies one. Historic unknown institutions, employers and licence issue dates are not invented during import.

Imports sanitize background while retaining the saved current job, performance, salary and course progress. They do not reapply the creation template. Legacy continuation uses the selected heir's own birthday and background; it does not copy the previous player's CV. Specialist career simulations, businesses and freelance gigs do not yet each generate a separate CV role. A future organisational model can extend the schema without losing the current records.

## Verification

`npm run check` includes the background modules and integration tests alongside the existing suite. Coverage includes leap-century rules, birthday editing/save upgrades, independent parent balances, gift funding and positive estates, all CV sections, chronology, safe imports, qualification gates, custom study, primary job selection, school progression, job changes, licences, no past-income grants and legacy continuity. See [VERIFICATION.md](VERIFICATION.md) for browser results.
