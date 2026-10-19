# Geographic catalogue and historical display names

Implemented and checked 19 October 2026 in `src/countries.js`. The modern catalogue covers the exact geographic IDs corresponding to all 193 UN member states, plus Taiwan, Palestine, Vatican City and Kosovo: 197 choices. It uses familiar English names rather than requiring every formal diplomatic title. Inclusion is a game setting choice, not a statement of universal recognition or sovereignty.

## API and compatibility

```js
import { COUNTRIES, countriesForYear, countryForYear } from './countries.js';

COUNTRIES;                          // frozen modern geographic catalogue
countriesForYear(1900);              // 197 fresh records with historical display names
countryForYear('in', 1930);          // British India; Bombay/Madras/Bangalore/Calcutta
countryForYear('India', 2026);       // same stable id; current city display names
countryForYear('unknown', 1930);     // United Kingdom fallback
```

Each record contains `id`, `name`, `flag`, `cities`, `tax` and `cost`. Resolved records also include `cityAliases`: a mapping from a modern or historical city spelling to the display spelling in the selected year. This allows a stored `Bombay` location to become `Mumbai` when the year changes, and a modern-name import to resolve to an older spelling where appropriate. `countryForYear` accepts an ID, recognised modern/historical name, or an object containing an ID/name.

The original twenty save IDs are unchanged: `uk us ca au nz ie fr de es se jp kr in br mx za ng sg ae it`. The remaining IDs follow modern two-letter geographic codes, with `xk` for Kosovo. The existing `uk` code remains in place rather than switching saves to `gb`; both resolve successfully. Aliases cover common alternative names such as Burma/Myanmar, Zaire/DR Congo, Turkey/Türkiye, Ivory Coast/Côte d'Ivoire and Congo-Brazzaville.

`countriesForYear` does not mutate the modern catalogue. Each result has a fresh city list and alias map. Invalid years fall back to 2026; years before the game's 1900 starting floor use the 1900 snapshot. Future years retain the latest defined labels rather than predicting new states.

## Historical representation

The country ID identifies a stable modern geographic area. The displayed historical name identifies the governing arrangement or broad region at that time. Every geographic area remains selectable, including territories that had not yet become independent. Distinct territories of one empire have distinct labels, using period geography where practical:

| Geographic ID | 1900 display | Selected later change |
| --- | --- | --- |
| `in` | British India — Indian provinces and princely states | India from 1947 |
| `pk` | British India — Punjab and Sindh | Pakistan from 1947 |
| `bd` | British India — East Bengal | East Pakistan, then Bangladesh from 1971 |
| `ru` | Russian Empire — Russian lands | Soviet Union from 1922, Russia from 1991 |
| `ua` | Russian Empire and Habsburg lands — Ukraine | Soviet and independent periods retain `ua` |
| `de` | German Empire | Republic, occupation, divided Germany and 1990 reunification |
| `cz` | Austria-Hungary — Bohemian lands | Czechoslovakia, Czech Republic and Czechia |
| `hr` | Austria-Hungary — Croatian lands | Yugoslav periods, then Croatia from 1991 |
| `cd` | Congo Free State | Belgian Congo, independent Congo, Zaire and DR Congo |
| `mm` | British Burma | Burma from 1948; Myanmar from 1989 |
| `gh` | Gold Coast | Ghana from 1957 |
| `ng` | Northern and Southern Nigeria protectorates | Nigeria from 1960 |
| `ae` | Trucial States | United Arab Emirates from 1971 |
| `kr` | Korean Empire — southern peninsula | Japanese rule, US administration and South Korea |
| `sg` | Straits Settlements — Singapore | Colony, self-government, Malaysian merger, independent Singapore |
| `na` | German South West Africa | South African administration, then Namibia from 1990 |

Additional transitions cover colonial Africa, Caribbean independence, Pacific mandates/trust territories, Ottoman successor areas, Soviet republics, Baltic independence/occupation, the breakup of Yugoslavia, divided Vietnam/Yemen and other major name or constitutional changes.

The catalogue never treats UN admission as the date a country became independent. For example, Bangladesh uses 1971 rather than its 1974 UN admission; Finland uses 1917 rather than 1955; Nauru uses 1968 rather than 1999. Membership is used only to audit the modern coverage set.

## Cities

Historical city labels include Bombay/Mumbai, Madras/Chennai, Bangalore/Bengaluru, Calcutta/Kolkata, Rangoon/Yangon, Léopoldville/Kinshasa, Salisbury/Harare, Lourenço Marques/Maputo, Bathurst/Banjul, Petrograd/Leningrad/Saint Petersburg, Batavia/Jakarta and selected other changes. These are simplified English display conventions; local names and alternative transliterations often coexisted.

Several clearly later-founded cities are omitted before their selected settlement threshold, including Abuja, Belmopan, Freeport, Ngerulmud, Erdenet and Honiara. Brasília and Islamabad are absent from this catalogue, so older starts use established alternatives. The first city is a convenient valid starting settlement, not a declaration that it was the national capital in every year.

## Research and source boundaries

- [UN Dag Hammarskjöld Library: current members](https://research.un.org/en/unmembers/currentmembers) supplies the modern 193-member coverage checklist. Its membership dates are not independence dates.
- [UK National Archives: partition of British India](https://www.nationalarchives.gov.uk/education/teaching-resources/partition-of-british-india/) documents the 1947 division into India and Pakistan. The original [Indian Independence Act](https://www.legislation.gov.uk/ukpga/Geo6/10-11/30) is the legislative source for the constitutional transition.
- [US Office of the Historian: dissolution of the USSR](https://2001-2009.state.gov/r/pa/ho/time/pcw/108229.htm) identifies formation in 1922 and dissolution in 1991; the [Armenia country guide](https://history.state.gov/countries/armenia) distinguishes the short independent republic from its subsequent Soviet period.
- [US Office of the Historian: Serbia/Yugoslavia](https://history.state.gov/countries/kingdom-of-yugoslavia) distinguishes the 1918 union, 1929 name change and later breakup. The [Germany guide](https://history.state.gov/countries/germany) and [East Germany guide](https://history.state.gov/countries/german-democratic-republic) document empire, postwar division and reunification.
- [US Office of the Historian: DR Congo](https://history.state.gov/countries/congo-democratic-republic) explicitly identifies independence on 30 June 1960; the [Namibia guide](https://history.state.gov/countries/namibia) identifies independence in 1990. These are different matters from the dates of UN membership.
- [National Archives of Singapore: constitutional documents](https://corporate.nas.gov.sg/discover-archives/media/lawoftheland/) describes Straits Settlements, the 1963 merger and the 1965 separation. [Singapore's Independence Act](https://sso.agc.gov.sg/Act/RSIA1965) is the corresponding legislative source.
- [US Office of the Historian: Burma](https://history.state.gov/countries/burma) identifies formal independence in 1948. Its [South Asia crisis account](https://history.state.gov/milestones/1969-1976/south-asia) distinguishes Bangladesh's 1971 founding from later UN membership.
- [UK government country-name timeline](https://www.gov.uk/government/publications/country-names/timeline-of-country-name-changes-in-hmg-use-1919-to-present) provides an official reference for name changes. Dates of British diplomatic usage can differ from local adoption; the simulation does not conflate those concepts.
- [Mumbai Suburban District collectorate](https://mumbaisuburban.gov.in/en/collectrate/) records the Bombay/Mumbai change in 1995–96. City aliases are display conveniences, not claims that only one local name was valid.

These sources support the coverage method and representative historical transitions. The complete yearly label table is an authored simulation approximation; it has not been independently verified as a full legal or geopolitical atlas, and not every row has a separately fetched primary-source citation. [The Office of the Historian's country index](https://history.state.gov/countries/all) is a useful starting point for deeper per-country audits, while remembering that US recognition, formal independence and effective control may differ.

## Deliberate limits

- Years have no month/day resolution. A transition applies to the entire milestone year; a life can therefore see a late-year change earlier than its exact historical day.
- Modern geographic areas can cross historical frontiers. The model uses combined descriptions where one ID spans several states, protectorates, mandates or occupied zones. Germany remains one geographic choice during division; this does not simulate the two states separately.
- Historical borders, every wartime occupation, local governments, disputed claims and all brief regimes are not exhaustively modelled. The labels do not settle territorial disputes.
- Flag emoji identify a modern state, administering power or broad historical category. White/red symbols stand in where no suitable historical emoji exists. They are not exact historical flag artwork.
- Most city history is selective. Not every foundation date, spelling, local-language name or historical jurisdiction has been researched. A fuller gazetteer would need its own sources and tests.
- `tax` and `cost` are fictional gameplay parameters, held constant across eras. This feature does not introduce historical technology, professions, wages, laws, borders or economic conditions.
- The catalogue does not include every dependency or disputed territory beyond the four requested extra geographic choices.

## Verification

Run `node --test tests/countries.test.js`. Thirteen tests verify the explicit 193-member ID fixture plus four extras, original save/economic compatibility, complete unique choices across representative years, major independence and empire transitions, historical city aliases, omitted future cities, safe fallbacks and mutation isolation. A matching record count alone is insufficient; the exact expected ID set is asserted.
