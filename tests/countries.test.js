import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES, countriesForYear, countryForYear } from '../src/countries.js';

// Independent coverage fixture: all 193 UN members, using gb -> existing save id uk.
// Source: https://research.un.org/en/unmembers/currentmembers (checked 19 Oct 2026).
const UN_MEMBERS = `af al dz ad ao ag ar am au at az bs bh bd bb by be bz bj bt bo ba bw br bn bg bf bi cv kh cm ca cf td cl cn co km cg cr ci hr cu cy cz kp cd dk dj dm do ec eg sv gq er ee sz et fj fi fr ga gm ge de gh gr gd gt gn gw gy ht hn hu is in id ir iq ie il it jm jp jo kz ke ki kw kg la lv lb ls lr ly li lt lu mg mw my mv ml mt mh mr mu mx fm mc mn me ma mz mm na nr np nl nz ni ne ng mk no om pk pw pa pg py pe ph pl pt qa kr md ro ru rw kn lc vc ws sm st sa sn rs sc sl sg sk si sb so za ss es lk sd sr se ch sy tj th tl tg to tt tn tr tm tv ug ua ae uk tz us uy uz vu ve vn ye zm zw`.split(' ');
const EXTRAS = ['tw','ps','va','xk'];
const ids = list => list.map(country => country.id).sort();

test('modern catalogue covers the exact 193 UN geography ids plus four requested extras', () => {
  assert.equal(UN_MEMBERS.length,193);
  assert.equal(new Set(UN_MEMBERS).size,193);
  assert.deepEqual(ids(COUNTRIES),[...UN_MEMBERS,...EXTRAS].sort());
  assert.equal(new Set(COUNTRIES.map(c => c.id)).size,197);
});

test('original twenty save ids and economic balance remain compatible', () => {
  const expected = { uk:[.24,1],us:[.26,1.15],ca:[.27,1.05],au:[.25,1.08],nz:[.23,1.02],ie:[.23,1.02],fr:[.28,1],de:[.29,.98],es:[.22,.85],se:[.32,1.04],jp:[.25,1.01],kr:[.23,.95],in:[.18,.56],br:[.19,.65],mx:[.18,.62],za:[.19,.66],ng:[.15,.52],sg:[.14,1.2],ae:[.08,1.12],it:[.26,.92] };
  for (const [id,values] of Object.entries(expected)) {
    const record = countryForYear(id,2026);
    assert.equal(record.id,id);
    assert.deepEqual([record.tax,record.cost],values);
  }
});

test('every year keeps complete independent geographic choices with bounded game economics', () => {
  for (const year of [1900,1901,1914,1918,1922,1939,1945,1949,1960,1971,1991,1993,2026,2100,Number.MAX_SAFE_INTEGER]) {
    const records = countriesForYear(year);
    assert.deepEqual(ids(records),ids(COUNTRIES));
    assert.equal(new Set(records.map(c => c.name)).size,197,`Labels must disambiguate geography in ${year}`);
    for (const record of records) {
      assert.ok(record.name && record.flag && record.cities.length,`${year}:${record.id}`);
      assert.equal(new Set(record.cities).size,record.cities.length);
      assert.ok(Number.isFinite(record.tax) && record.tax >= 0 && record.tax <= 1);
      assert.ok(Number.isFinite(record.cost) && record.cost > 0);
      for (const city of record.cities) assert.equal(record.cityAliases[city],city);
    }
  }
});

test('1900 contains no future Soviet, Yugoslav, partition or Gulf federation entities', () => {
  for (const record of countriesForYear(1900)) assert.doesNotMatch(record.name,/Soviet Union|Yugoslavia|Czechoslovakia|United Arab Emirates|Bangladesh|Myanmar|Namibia|Burkina Faso|Saudi Arabia|South Sudan|North Korea|South Korea|Malaysia|Timor-Leste/);
  assert.match(countryForYear('pk',1900).name,/British India.*Punjab and Sindh/);
  assert.match(countryForYear('bd',1900).name,/British India.*East Bengal/);
  assert.notEqual(countryForYear('pk',1900).name,countryForYear('in',1900).name);
  assert.match(countryForYear('ae',1900).name,/Trucial States/);
  assert.match(countryForYear('kr',1900).name,/Korean Empire/);
});

test('independence transitions use historical years rather than UN admission years', () => {
  for (const [id,year,prior,current] of [
    ['bd',1971,/East Pakistan/,'Bangladesh'], // UN membership came in 1974.
    ['fi',1917,/Russian Empire/,'Finland'], // UN membership came in 1955.
    ['nr',1968,/Australian administration/,'Nauru'], // UN membership came in 1999.
    ['er',1993,/Ethiopia/,'Eritrea'],
    ['ss',2011,/Sudan/,'South Sudan'],
    ['ng',1960,/Colony and Protectorate/,'Nigeria'],
    ['gh',1957,/Gold Coast/,'Ghana'],
    ['na',1990,/South West Africa/,'Namibia'],
    ['ke',1963,/Colony and Protectorate/,'Kenya'],
    ['tl',2002,/UN-administered/,'Timor-Leste'],
    ['pk',1947,/British India/,'Pakistan'],
    ['ae',1971,/Trucial States/,'United Arab Emirates'],
  ]) {
    assert.match(countryForYear(id,year-1).name,prior,`${id} before ${year}`);
    assert.equal(countryForYear(id,year).name,current,`${id} in ${year}`);
  }
});

test('Russian and Soviet transformations retain individual geographic identities', () => {
  assert.match(countryForYear('ru',1900).name,/Russian Empire/);
  assert.doesNotMatch(countryForYear('ru',1921).name,/Soviet Union/);
  for (const id of ['ru','ua','by','am','az','ge','kz','kg','tj','tm','uz']) {
    assert.match(countryForYear(id,1922).name,/Soviet Union/);
    assert.equal(countryForYear(id,1991).id,id);
    assert.doesNotMatch(countryForYear(id,1991).name,/Soviet Union/);
  }
  assert.equal(countryForYear('lv',1930).name,'Latvia');
  assert.match(countryForYear('lv',1950).name,/Soviet Union/);
  assert.equal(countryForYear('lv',1991).name,'Latvia');
});

test('German, Habsburg, Czechoslovak and Yugoslav eras resolve at major boundaries', () => {
  assert.equal(countryForYear('de',1900).name,'German Empire');
  assert.match(countryForYear('de',1970).name,/Divided Germany/);
  assert.equal(countryForYear('de',1990).name,'Germany');
  assert.match(countryForYear('at',1900).name,/Austria-Hungary/);
  assert.match(countryForYear('cz',1930).name,/Czechoslovakia/);
  assert.match(countryForYear('sk',1930).name,/Czechoslovakia/);
  assert.equal(countryForYear('sk',1993).name,'Slovakia');
  assert.match(countryForYear('hr',1930).name,/Yugoslavia/);
  assert.equal(countryForYear('hr',1991).name,'Croatia');
  assert.match(countryForYear('me',2004).name,/Serbia and Montenegro/);
  assert.equal(countryForYear('me',2006).name,'Montenegro');
  assert.match(countryForYear('xk',2000).name,/UN-administered/);
  assert.equal(countryForYear('xk',2008).name,'Kosovo');
});

test('colonies, name changes and distinct Congos are not collapsed into generic modern labels', () => {
  assert.equal(countryForYear('cd',1900).name,'Congo Free State');
  assert.equal(countryForYear('cd',1908).name,'Belgian Congo');
  assert.match(countryForYear('cd',1960).name,/Léopoldville/);
  assert.equal(countryForYear('cd',1980).name,'Zaire');
  assert.equal(countryForYear('cd',1997).name,'Democratic Republic of the Congo');
  assert.match(countryForYear('cg',1900).name,/French Congo/);
  assert.equal(countryForYear('mm',1900).name,'British Burma');
  assert.equal(countryForYear('mm',1948).name,'Burma');
  assert.equal(countryForYear('mm',1989).name,'Myanmar');
  assert.equal(countryForYear('bf',1983).name,'Upper Volta');
  assert.equal(countryForYear('bf',1984).name,'Burkina Faso');
  assert.equal(countryForYear('sz',2017).name,'Swaziland');
  assert.equal(countryForYear('sz',2018).name,'Eswatini');
});

test('Singapore and nearby geographies follow different merger and independence timelines', () => {
  assert.match(countryForYear('sg',1900).name,/Straits Settlements/);
  assert.match(countryForYear('sg',1964).name,/Malaysia/);
  assert.equal(countryForYear('sg',1965).name,'Singapore');
  assert.match(countryForYear('my',1962).name,/Malaya/);
  assert.equal(countryForYear('my',1963).name,'Malaysia');
  assert.equal(countryForYear('bn',1984).name,'Brunei');
  assert.match(countryForYear('tw',1900).name,/Japanese.*Formosa/);
});

test('historic city names and aliases preserve a stored location through name changes', () => {
  const oldIndia = countryForYear('in',1930), modernIndia = countryForYear('in',2026);
  assert.deepEqual(oldIndia.cities,['Bombay','Delhi','Bangalore','Madras','Calcutta']);
  assert.equal(oldIndia.cityAliases.Mumbai,'Bombay');
  assert.equal(modernIndia.cityAliases.Bombay,'Mumbai');
  assert.equal(modernIndia.cityAliases.Madras,'Chennai');
  assert.equal(countryForYear('in',2013).cityAliases.Bengaluru,'Bangalore');
  assert.equal(countryForYear('in',2014).cityAliases.Bangalore,'Bengaluru');
  assert.equal(countryForYear('ru',1950).cityAliases['Saint Petersburg'],'Leningrad');
  assert.equal(countryForYear('ru',2026).cityAliases.Leningrad,'Saint Petersburg');
  assert.equal(countryForYear('cd',1900).cityAliases.Kinshasa,'Léopoldville');
  assert.equal(countryForYear('zw',1930).cityAliases.Harare,'Salisbury');
});

test('new cities do not appear before their chosen settlement threshold', () => {
  for (const [id,city,year] of [['ng','Abuja',1976],['bz','Belmopan',1970],['bs','Freeport',1955],['pw','Ngerulmud',2006],['mn','Erdenet',1974],['sb','Honiara',1942]]) {
    assert.ok(!countryForYear(id,year-1).cities.includes(city),`${city} before ${year}`);
    assert.ok(countryForYear(id,year).cities.includes(city),`${city} from ${year}`);
  }
  assert.ok(!COUNTRIES.some(c => c.cities.includes('Brasília') || c.cities.includes('Islamabad')));
});

test('modern aliases, accents, disambiguated historical labels and safe fallback work', () => {
  for (const [input,id] of [['GB','uk'],['United States of America','us'],['Côte d’Ivoire','ci'],['Burma','mm'],['Zaire','cd'],['Congo-Brazzaville','cg'],['Czech Republic','cz'],['Turkey','tr'],['Holy See','va'],['Republic of Korea','kr']]) assert.equal(countryForYear(input,1900).id,id);
  const label = countryForYear('pk',1900).name;
  assert.equal(countryForYear(label,2026).id,'pk');
  for (const value of [null,undefined,{},'unknown country',42]) assert.equal(countryForYear(value,1900).id,'uk');
  assert.equal(countryForYear({id:'in'},1930).id,'in');
});

test('year validation, fresh records and a frozen modern catalogue prevent cross-life mutation', () => {
  assert.deepEqual(countriesForYear(1800),countriesForYear(1900));
  for (const value of [NaN,Infinity,{},'',undefined]) assert.deepEqual(countriesForYear(value),countriesForYear(2026));
  assert.deepEqual(countriesForYear('1930'),countriesForYear(1930));
  const first = countryForYear('in',1900);
  first.cities.push('Imaginary City'); first.cityAliases.Mumbai = 'Changed'; first.name = 'Changed';
  assert.ok(!countryForYear('in',1900).cities.includes('Imaginary City'));
  assert.equal(countryForYear('in',1900).cityAliases.Mumbai,'Bombay');
  assert.equal(COUNTRIES.find(c => c.id === 'in').name,'India');
  assert.throws(() => COUNTRIES.find(c => c.id === 'in').cities.push('Changed'),TypeError);
});
