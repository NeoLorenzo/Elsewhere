// Geographic identities are stable; display names follow an intentionally simplified yearly timeline.
// Tax and cost values are fictional game balance, not historical or current economic estimates.
const ROWS = `
uk|United Kingdom|London,Manchester,Edinburgh,Bristol,Cardiff|eu
us|United States|New York,Los Angeles,Chicago,Austin,Seattle|am
ca|Canada|Toronto,Vancouver,Montreal,Halifax|am
au|Australia|Sydney,Melbourne,Perth,Brisbane|oc
nz|New Zealand|Auckland,Wellington,Christchurch|oc
ie|Ireland|Dublin,Cork,Galway|eu
fr|France|Paris,Lyon,Bordeaux,Marseille|eu
de|Germany|Berlin,Hamburg,Munich,Cologne|eu
es|Spain|Madrid,Barcelona,Valencia,Seville|eu
se|Sweden|Stockholm,Gothenburg,Malmö|eu
jp|Japan|Tokyo,Osaka,Kyoto,Sapporo|as
kr|South Korea|Seoul,Busan,Incheon|as
in|India|Mumbai,Delhi,Bengaluru,Chennai,Kolkata|as
br|Brazil|São Paulo,Rio de Janeiro,Salvador,Recife|am
mx|Mexico|Mexico City,Guadalajara,Monterrey|am
za|South Africa|Cape Town,Johannesburg,Durban|af
ng|Nigeria|Lagos,Abuja,Ibadan|af
sg|Singapore|Singapore|as
ae|United Arab Emirates|Dubai,Abu Dhabi,Sharjah|as
it|Italy|Rome,Milan,Naples,Florence|eu
af|Afghanistan|Kabul,Herat,Kandahar|as
al|Albania|Tirana,Durrës,Shkodër|eu
dz|Algeria|Algiers,Oran,Constantine|af
ad|Andorra|Andorra la Vella,Escaldes-Engordany|eu
ao|Angola|Luanda,Benguela,Huambo|af
ag|Antigua and Barbuda|Saint John's,All Saints|am
ar|Argentina|Buenos Aires,Córdoba,Rosario|am
am|Armenia|Yerevan,Gyumri|as
at|Austria|Vienna,Graz,Salzburg|eu
az|Azerbaijan|Baku,Ganja|as
bs|Bahamas|Nassau,Freeport|am
bh|Bahrain|Manama,Muharraq|as
bd|Bangladesh|Dhaka,Chattogram,Sylhet|as
bb|Barbados|Bridgetown,Speightstown|am
by|Belarus|Minsk,Gomel|eu
be|Belgium|Brussels,Antwerp,Ghent|eu
bz|Belize|Belize City,Belmopan|am
bj|Benin|Cotonou,Porto-Novo|af
bt|Bhutan|Thimphu,Paro|as
bo|Bolivia|La Paz,Sucre,Santa Cruz de la Sierra|am
ba|Bosnia and Herzegovina|Sarajevo,Mostar,Banja Luka|eu
bw|Botswana|Gaborone,Francistown|af
bn|Brunei|Bandar Seri Begawan,Kuala Belait|as
bg|Bulgaria|Sofia,Plovdiv,Varna|eu
bf|Burkina Faso|Ouagadougou,Bobo-Dioulasso|af
bi|Burundi|Bujumbura,Gitega|af
cv|Cabo Verde|Praia,Mindelo|af
kh|Cambodia|Phnom Penh,Siem Reap|as
cm|Cameroon|Douala,Yaoundé|af
cf|Central African Republic|Bangui,Berbérati|af
td|Chad|N'Djamena,Moundou|af
cl|Chile|Santiago,Valparaíso,Concepción|am
cn|China|Beijing,Shanghai,Guangzhou,Chengdu|as
co|Colombia|Bogotá,Medellín,Cali|am
km|Comoros|Moroni,Mutsamudu|af
cg|Republic of the Congo|Brazzaville,Pointe-Noire|af
cd|Democratic Republic of the Congo|Kinshasa,Lubumbashi,Kisangani|af
cr|Costa Rica|San José,Alajuela|am
ci|Côte d'Ivoire|Abidjan,Yamoussoukro,Bouaké|af
hr|Croatia|Zagreb,Split,Rijeka|eu
cu|Cuba|Havana,Santiago de Cuba|am
cy|Cyprus|Nicosia,Limassol,Larnaca|eu
cz|Czechia|Prague,Brno,Ostrava|eu
dk|Denmark|Copenhagen,Aarhus,Odense|eu
dj|Djibouti|Djibouti,Ali Sabieh|af
dm|Dominica|Roseau,Portsmouth|am
do|Dominican Republic|Santo Domingo,Santiago de los Caballeros|am
ec|Ecuador|Quito,Guayaquil,Cuenca|am
eg|Egypt|Cairo,Alexandria,Luxor|af
sv|El Salvador|San Salvador,Santa Ana|am
gq|Equatorial Guinea|Malabo,Bata|af
er|Eritrea|Asmara,Massawa|af
ee|Estonia|Tallinn,Tartu|eu
sz|Eswatini|Mbabane,Manzini|af
et|Ethiopia|Addis Ababa,Gondar,Dire Dawa|af
fj|Fiji|Suva,Lautoka,Nadi|oc
fi|Finland|Helsinki,Tampere,Turku|eu
ga|Gabon|Libreville,Port-Gentil|af
gm|Gambia|Banjul,Serekunda|af
ge|Georgia|Tbilisi,Batumi,Kutaisi|as
gh|Ghana|Accra,Kumasi,Cape Coast|af
gr|Greece|Athens,Thessaloniki,Patras|eu
gd|Grenada|Saint George's,Gouyave|am
gt|Guatemala|Guatemala City,Quetzaltenango|am
gn|Guinea|Conakry,Kankan|af
gw|Guinea-Bissau|Bissau,Bafatá|af
gy|Guyana|Georgetown,New Amsterdam|am
ht|Haiti|Port-au-Prince,Cap-Haïtien|am
hn|Honduras|Tegucigalpa,San Pedro Sula|am
hu|Hungary|Budapest,Debrecen,Szeged|eu
is|Iceland|Reykjavík,Akureyri|eu
id|Indonesia|Jakarta,Surabaya,Bandung,Medan|as
ir|Iran|Tehran,Isfahan,Shiraz|as
iq|Iraq|Baghdad,Basra,Mosul|as
il|Israel|Jerusalem,Tel Aviv,Haifa|as
jm|Jamaica|Kingston,Montego Bay|am
jo|Jordan|Amman,Irbid,Aqaba|as
kz|Kazakhstan|Almaty,Astana,Shymkent|as
ke|Kenya|Nairobi,Mombasa,Kisumu|af
ki|Kiribati|South Tarawa,Betio|oc
kp|North Korea|Pyongyang,Hamhung,Kaesong|as
kw|Kuwait|Kuwait City,Al Jahra|as
kg|Kyrgyzstan|Bishkek,Osh|as
la|Laos|Vientiane,Luang Prabang,Pakse|as
lv|Latvia|Riga,Daugavpils,Liepāja|eu
lb|Lebanon|Beirut,Tripoli,Sidon|as
ls|Lesotho|Maseru,Teyateyaneng|af
lr|Liberia|Monrovia,Buchanan|af
ly|Libya|Tripoli,Benghazi,Misrata|af
li|Liechtenstein|Vaduz,Schaan|eu
lt|Lithuania|Vilnius,Kaunas,Klaipėda|eu
lu|Luxembourg|Luxembourg,Esch-sur-Alzette|eu
mg|Madagascar|Antananarivo,Toamasina,Antsirabe|af
mw|Malawi|Lilongwe,Blantyre,Mzuzu|af
my|Malaysia|Kuala Lumpur,George Town,Johor Bahru,Kuching|as
mv|Maldives|Malé,Addu City|as
ml|Mali|Bamako,Timbuktu,Sikasso|af
mt|Malta|Valletta,Birkirkara,Mosta|eu
mh|Marshall Islands|Majuro,Ebeye|oc
mr|Mauritania|Nouakchott,Nouadhibou|af
mu|Mauritius|Port Louis,Curepipe|af
fm|Micronesia|Palikir,Weno|oc
md|Moldova|Chișinău,Bălți|eu
mc|Monaco|Monaco,Monte Carlo|eu
mn|Mongolia|Ulaanbaatar,Erdenet|as
me|Montenegro|Podgorica,Nikšić,Cetinje|eu
ma|Morocco|Rabat,Casablanca,Marrakesh,Fez|af
mz|Mozambique|Maputo,Beira,Nampula|af
mm|Myanmar|Yangon,Mandalay,Mawlamyine|as
na|Namibia|Windhoek,Swakopmund,Walvis Bay|af
nr|Nauru|Yaren,Aiwo|oc
np|Nepal|Kathmandu,Pokhara,Lalitpur|as
nl|Netherlands|Amsterdam,Rotterdam,Utrecht|eu
ni|Nicaragua|Managua,León,Granada|am
ne|Niger|Niamey,Zinder,Maradi|af
mk|North Macedonia|Skopje,Bitola,Ohrid|eu
no|Norway|Oslo,Bergen,Trondheim|eu
om|Oman|Muscat,Salalah,Sohar|as
pk|Pakistan|Karachi,Lahore,Rawalpindi,Peshawar|as
pw|Palau|Koror,Ngerulmud|oc
pa|Panama|Panama City,Colón,David|am
pg|Papua New Guinea|Port Moresby,Lae,Madang|oc
py|Paraguay|Asunción,Ciudad del Este,Encarnación|am
pe|Peru|Lima,Arequipa,Cusco|am
ph|Philippines|Manila,Cebu,Davao|as
pl|Poland|Warsaw,Kraków,Gdańsk|eu
pt|Portugal|Lisbon,Porto,Coimbra|eu
qa|Qatar|Doha,Al Wakrah|as
ro|Romania|Bucharest,Cluj-Napoca,Timișoara|eu
ru|Russia|Moscow,Saint Petersburg,Kazan,Novosibirsk|eu
rw|Rwanda|Kigali,Butare|af
kn|Saint Kitts and Nevis|Basseterre,Charlestown|am
lc|Saint Lucia|Castries,Soufrière|am
vc|Saint Vincent and the Grenadines|Kingstown,Georgetown|am
ws|Samoa|Apia,Salelologa|oc
sm|San Marino|San Marino,Serravalle|eu
st|São Tomé and Príncipe|São Tomé,Santo António|af
sa|Saudi Arabia|Riyadh,Jeddah,Mecca,Medina|as
sn|Senegal|Dakar,Saint-Louis,Thiès|af
rs|Serbia|Belgrade,Novi Sad,Niš|eu
sc|Seychelles|Victoria,Anse Boileau|af
sl|Sierra Leone|Freetown,Bo,Kenema|af
sk|Slovakia|Bratislava,Košice,Žilina|eu
si|Slovenia|Ljubljana,Maribor,Koper|eu
sb|Solomon Islands|Honiara,Auki,Gizo|oc
so|Somalia|Mogadishu,Hargeisa,Kismayo|af
ss|South Sudan|Juba,Wau,Malakal|af
lk|Sri Lanka|Colombo,Kandy,Galle|as
sd|Sudan|Khartoum,Omdurman,Port Sudan|af
sr|Suriname|Paramaribo,Lelydorp|am
ch|Switzerland|Bern,Zurich,Geneva,Basel|eu
sy|Syria|Damascus,Aleppo,Homs|as
tj|Tajikistan|Dushanbe,Khujand|as
tz|Tanzania|Dar es Salaam,Dodoma,Arusha,Zanzibar City|af
th|Thailand|Bangkok,Chiang Mai,Phuket|as
tl|Timor-Leste|Dili,Baucau|as
tg|Togo|Lomé,Sokodé,Kara|af
to|Tonga|Nukuʻalofa,Neiafu|oc
tt|Trinidad and Tobago|Port of Spain,San Fernando,Scarborough|am
tn|Tunisia|Tunis,Sfax,Sousse|af
tr|Türkiye|Istanbul,Ankara,Izmir|as
tm|Turkmenistan|Ashgabat,Turkmenabat,Mary|as
tv|Tuvalu|Funafuti,Vaitupu|oc
ug|Uganda|Kampala,Entebbe,Jinja|af
ua|Ukraine|Kyiv,Lviv,Odesa,Kharkiv|eu
uy|Uruguay|Montevideo,Salto,Paysandú|am
uz|Uzbekistan|Tashkent,Samarkand,Bukhara|as
vu|Vanuatu|Port Vila,Luganville|oc
ve|Venezuela|Caracas,Maracaibo,Valencia|am
vn|Vietnam|Hanoi,Ho Chi Minh City,Da Nang|as
ye|Yemen|Sana'a,Aden,Taiz|as
zm|Zambia|Lusaka,Ndola,Livingstone|af
zw|Zimbabwe|Harare,Bulawayo,Mutare|af
tw|Taiwan|Taipei,Tainan,Taichung|as
ps|Palestine|Ramallah,Gaza,Nablus|as
va|Vatican City|Vatican City|eu
xk|Kosovo|Pristina,Prizren,Peja|eu
`.trim();

const REGIONS = { eu: [.25, .92], as: [.20, .72], af: [.18, .60], am: [.20, .80], oc: [.20, .86] };
const ORIGINAL_BALANCE = {
  uk:[.24,1],us:[.26,1.15],ca:[.27,1.05],au:[.25,1.08],nz:[.23,1.02],ie:[.23,1.02],fr:[.28,1],de:[.29,.98],es:[.22,.85],se:[.32,1.04],jp:[.25,1.01],kr:[.23,.95],in:[.18,.56],br:[.19,.65],mx:[.18,.62],za:[.19,.66],ng:[.15,.52],sg:[.14,1.2],ae:[.08,1.12],it:[.26,.92],
};
const flag = code => code === 'uk' ? '🇬🇧' : code === 'empire' ? '🏳️' : code === 'soviet' ? '🚩' : /^[a-z]{2}$/.test(code) ? [...code.toUpperCase()].map(char => String.fromCodePoint(char.charCodeAt(0) + 127397)).join('') : '🌐';
export const COUNTRIES = Object.freeze(ROWS.split('\n').map(row => {
  const [id,name,cityList,region] = row.split('|'), [tax,cost] = ORIGINAL_BALANCE[id] || REGIONS[region];
  return Object.freeze({ id,name,flag:flag(id),cities:Object.freeze(cityList.split(',')),tax,cost });
}));

const BY_ID = new Map(COUNTRIES.map(country => [country.id,country]));
const eras = new Map();
const timeline = (id, rows) => eras.set(id, rows.map(([from,name,flagCode]) => ({ from,name,flag:flagCode ? flag(flagCode) : BY_ID.get(id).flag })));
const transition = (id, independence, before, power, after) => timeline(id, [[1900,before,power],[independence,after || BY_ID.get(id).name]]);

// Colonial transitions are independence/proclamation or constitutional transitions, never UN admission.
for (const [id,year,label] of [
  ['ag',1981,'British Leeward Islands — Antigua and Barbuda'],['bs',1973,'British Bahamas'],['bb',1966,'British Barbados'],
  ['bh',1971,'British-protected Bahrain'],['bw',1966,'Bechuanaland Protectorate'],['dm',1978,'British Dominica'],
  ['fj',1970,'Colony of Fiji'],['gm',1965,'British Gambia'],['gh',1957,'Gold Coast'],['gd',1974,'British Grenada'],
  ['jm',1962,'Colony of Jamaica'],['kw',1961,'British-protected Kuwait'],['ls',1966,'Basutoland'],['mv',1965,'British-protected Maldives'],
  ['mt',1964,'Colony of Malta'],['mu',1968,'British Mauritius'],['kn',1983,'British Leeward Islands — Saint Kitts and Nevis'],
  ['lc',1979,'British Saint Lucia'],['vc',1979,'British Saint Vincent'],['sc',1976,'British Seychelles'],
  ['sl',1961,'British Sierra Leone'],['sb',1978,'British Solomon Islands Protectorate'],['tt',1962,'Colony of Trinidad and Tobago'],
  ['ug',1962,'Uganda Protectorate'],['qa',1971,'Qatar under Ottoman suzerainty'],
]) transition(id,year,label,id === 'qa' ? 'tr' : 'uk');
for (const [id,year,label] of [
  ['dz',1962,'French Algeria'],['km',1975,'French Comoros'],['ci',1960,'French Ivory Coast'],['gn',1958,'French Guinea'],
  ['mg',1960,'French Madagascar'],['ml',1960,'French Sudan'],['mr',1960,'French West Africa — Mauritanian territories'],
  ['ne',1960,'French West Africa — Niger territories'],['sn',1960,'French Senegal'],['tn',1956,'French Protectorate of Tunisia'],
]) transition(id,year,label,'fr');
for (const [id,year,label] of [
  ['ao',1975,'Portuguese Angola'],['cv',1975,'Portuguese Cape Verde'],['gw',1974,'Portuguese Guinea'],
  ['mz',1975,'Portuguese Mozambique'],['st',1975,'Portuguese São Tomé and Príncipe'],
]) transition(id,year,label,'pt');

timeline('au',[[1900,'British Australian colonies','uk'],[1901,'Commonwealth of Australia']]);
timeline('nz',[[1900,'Colony of New Zealand','uk'],[1907,'Dominion of New Zealand'],[1947,'New Zealand']]);
timeline('ca',[[1900,'Dominion of Canada'],[1931,'Canada']]);
timeline('ie',[[1900,'United Kingdom — Ireland','uk'],[1922,'Irish Free State'],[1937,'Ireland']]);
timeline('at',[[1900,'Austria-Hungary — Austrian lands','empire'],[1918,'Austria'],[1938,'German annexation — Austria','empire'],[1945,'Austria']]);
timeline('hu',[[1900,'Austria-Hungary — Hungarian lands','empire'],[1918,'Hungary']]);
timeline('cz',[[1900,'Austria-Hungary — Bohemian lands','empire'],[1918,'Czechoslovakia — Czech lands'],[1939,'German Protectorate of Bohemia and Moravia','empire'],[1945,'Czechoslovakia — Czech lands'],[1993,'Czech Republic'],[2016,'Czechia']]);
timeline('sk',[[1900,'Austria-Hungary — Slovak lands','empire'],[1918,'Czechoslovakia — Slovak lands'],[1939,'Slovak Republic'],[1945,'Czechoslovakia — Slovak lands'],[1993,'Slovakia']]);
timeline('de',[[1900,'German Empire','empire'],[1919,'German Republic'],[1933,'Germany under Nazi rule','empire'],[1945,'Allied-occupied Germany','empire'],[1949,'Divided Germany — West and East'],[1990,'Germany']]);
timeline('fi',[[1900,'Russian Empire — Grand Duchy of Finland','empire'],[1917,'Finland']]);
timeline('no',[[1900,'Sweden–Norway — Norway'],[1905,'Norway']]);
timeline('is',[[1900,'Danish-administered Iceland','dk'],[1918,'Kingdom of Iceland'],[1944,'Iceland']]);
timeline('al',[[1900,'Ottoman Empire — Albanian lands','tr'],[1912,'Albania']]);
timeline('bg',[[1900,'Principality of Bulgaria'],[1908,'Kingdom of Bulgaria'],[1946,'Bulgaria']]);
timeline('pl',[[1900,'Partitioned Polish lands','empire'],[1918,'Poland'],[1939,'Occupied Polish lands','empire'],[1945,'Poland']]);

// A single stable geography may encompass several historical states or occupied zones.
for (const [id,place,independence] of [['hr','Croatian lands',1991],['si','Slovenian lands',1991],['ba','Bosnia and Herzegovina',1992],['mk','Vardar Macedonia',1991]]) {
  timeline(id,[[1900,id === 'mk' ? 'Ottoman Empire — Vardar Macedonia' : `Austria-Hungary — ${place}`,id === 'mk' ? 'tr' : 'empire'],
    ...(id === 'mk' ? [[1913,'Kingdom of Serbia — Vardar Macedonia','rs']] : []),
    [1918,`Kingdom of Serbs, Croats and Slovenes — ${place}`,'empire'],[1929,`Yugoslavia — ${place}`,'empire'],
    [1941,`Wartime occupied territories — ${place}`,'empire'],[1945,`Yugoslavia — ${place}`,'empire'],[independence,id === 'mk' ? 'Macedonia' : BY_ID.get(id).name],
    ...(id === 'mk' ? [[2019,'North Macedonia']] : [])]);
}
timeline('rs',[[1900,'Kingdom of Serbia'],[1918,'Kingdom of Serbs, Croats and Slovenes — Serbia','empire'],[1929,'Yugoslavia — Serbia','empire'],[1941,'Occupied Serbia','empire'],[1945,'Yugoslavia — Serbia','empire'],[1992,'Federal Republic of Yugoslavia — Serbia','empire'],[2003,'Serbia and Montenegro — Serbia','empire'],[2006,'Serbia']]);
timeline('me',[[1900,'Principality of Montenegro'],[1910,'Kingdom of Montenegro'],[1918,'Kingdom of Serbs, Croats and Slovenes — Montenegro','empire'],[1929,'Yugoslavia — Montenegro','empire'],[1941,'Occupied Montenegro','empire'],[1945,'Yugoslavia — Montenegro','empire'],[1992,'Federal Republic of Yugoslavia — Montenegro','empire'],[2003,'Serbia and Montenegro — Montenegro','empire'],[2006,'Montenegro']]);
timeline('xk',[[1900,'Ottoman Empire — Kosovo','tr'],[1912,'Serbian and Montenegrin administration — Kosovo','rs'],[1918,'Kingdom of Serbs, Croats and Slovenes — Kosovo','empire'],[1929,'Yugoslavia — Kosovo','empire'],[1941,'Wartime occupied Kosovo','empire'],[1945,'Yugoslavia — Kosovo','empire'],[1992,'Federal Republic of Yugoslavia — Kosovo','empire'],[1999,'UN-administered Kosovo','empire'],[2008,'Kosovo']]);
timeline('ru',[[1900,'Russian Empire — Russian lands','empire'],[1917,'Revolutionary and civil-war Russia','empire'],[1922,'Soviet Union — Russia','soviet'],[1991,'Russia']]);
for (const [id,place] of [['ua','Ukraine'],['by','Belarus'],['am','Armenia'],['az','Azerbaijan'],['ge','Georgia']]) {
  timeline(id,[[1900,`Russian Empire${id === 'ua' ? ' and Habsburg lands' : ''} — ${place}`,'empire'],[1918,`${place} — independence and contested rule`,'empire'],[id === 'am' || id === 'az' ? 1920 : id === 'ge' ? 1921 : 1919,`${place} — Soviet and contested territories`,'soviet'],[1922,`Soviet Union — ${place}`,'soviet'],[1991,BY_ID.get(id).name]]);
}
for (const [id,place] of [['ee','Estonia'],['lv','Latvia'],['lt','Lithuania']]) timeline(id,[[1900,`Russian Empire — ${place}`,'empire'],[1918,place],[1940,`Soviet-occupied ${place}`,'soviet'],[1941,`German-occupied ${place}`,'empire'],[1944,`Soviet Union — ${place}`,'soviet'],[1991,place]]);
for (const [id,place] of [['kz','Kazakh lands'],['kg','Kyrgyz lands'],['tj','Tajik lands'],['tm','Turkmen lands'],['uz','Uzbek lands']]) timeline(id,[[1900,`Russian Empire and Central Asian states — ${place}`,'empire'],[1917,`Revolutionary Central Asia — ${place}`,'empire'],[1922,`Soviet Union — ${place}`,'soviet'],[1991,BY_ID.get(id).name]]);
timeline('md',[[1900,'Russian Empire — Bessarabia','empire'],[1918,'Romania — Bessarabia','ro'],[1940,'Soviet Moldavia','soviet'],[1941,'Romanian-administered Bessarabia','ro'],[1944,'Soviet Union — Moldavia','soviet'],[1991,'Moldova']]);

timeline('in',[[1900,'British India — Indian provinces and princely states','uk'],[1947,'India']]);
timeline('pk',[[1900,'British India — Punjab and Sindh','uk'],[1947,'Pakistan']]);
timeline('bd',[[1900,'British India — East Bengal','uk'],[1947,'Pakistan — East Bengal','pk'],[1955,'East Pakistan','pk'],[1971,'Bangladesh']]);
timeline('mm',[[1900,'British Burma','uk'],[1942,'Japanese-occupied Burma','jp'],[1945,'British Burma','uk'],[1948,'Burma'],[1989,'Myanmar']]);
timeline('lk',[[1900,'British Ceylon','uk'],[1948,'Ceylon'],[1972,'Sri Lanka']]);
timeline('my',[[1900,'British Malaya and Borneo protectorates','uk'],[1942,'Japanese-occupied Malaya and Borneo','jp'],[1945,'British Malaya and Borneo territories','uk'],[1957,'Federation of Malaya and British Borneo','my'],[1963,'Malaysia']]);
timeline('sg',[[1900,'Straits Settlements — Singapore','uk'],[1942,'Japanese-occupied Singapore','jp'],[1945,'British-administered Singapore','uk'],[1946,'Colony of Singapore','uk'],[1959,'Self-governing Singapore','sg'],[1963,'Malaysia — Singapore','my'],[1965,'Singapore']]);
timeline('bn',[[1900,'British-protected Brunei','uk'],[1942,'Japanese-occupied Brunei','jp'],[1945,'British-protected Brunei','uk'],[1984,'Brunei']]);
timeline('id',[[1900,'Dutch East Indies','nl'],[1942,'Japanese-occupied East Indies','jp'],[1945,'Indonesia — independence and revolution'],[1949,'Indonesia']]);
timeline('tl',[[1900,'Portuguese Timor','pt'],[1942,'Japanese-occupied Timor','jp'],[1945,'Portuguese Timor','pt'],[1975,'East Timor — contested transition','empire'],[1976,'Indonesian-occupied East Timor','id'],[1999,'UN-administered East Timor','empire'],[2002,'Timor-Leste']]);
timeline('ph',[[1900,'US-administered Philippine Islands','us'],[1935,'Commonwealth of the Philippines','us'],[1942,'Japanese-occupied Philippines','jp'],[1945,'Commonwealth of the Philippines','us'],[1946,'Philippines']]);
timeline('cn',[[1900,'Qing Empire — China','empire'],[1912,'Republic of China — mainland','tw'],[1949,'China']]);
timeline('tw',[[1900,'Japanese-administered Formosa','jp'],[1945,'Republic of China — Taiwan'],[1949,'Taiwan']]);
timeline('mn',[[1900,'Qing Empire — Outer Mongolia','empire'],[1911,'Bogd Khanate of Mongolia','empire'],[1919,'Chinese-occupied Outer Mongolia','tw'],[1921,'Mongolia — revolutionary period'],[1924,'Mongolia']]);
for (const [id,part] of [['kr','southern peninsula'],['kp','northern peninsula']]) timeline(id,[[1900,`Korean Empire — ${part}`,'empire'],[1910,`Japanese-ruled Korea — ${part}`,'jp'],[1945,`${id === 'kr' ? 'US' : 'Soviet'}-administered Korea — ${part}`,id === 'kr' ? 'us' : 'soviet'],[1948,BY_ID.get(id).name]]);
transition('kh',1953,'French Indochina — Cambodia','fr');
transition('la',1953,'French Indochina — Laos','fr');
timeline('vn',[[1900,'French Indochina — Vietnamese territories','fr'],[1945,'Vietnam — independence and colonial war','empire'],[1954,'Divided Vietnam — North and South','empire'],[1976,'Vietnam']]);
timeline('th',[[1900,'Siam'],[1939,'Thailand'],[1945,'Siam'],[1949,'Thailand']]);
timeline('ir',[[1900,'Persia'],[1935,'Iran']]);
timeline('af',[[1900,'Emirate of Afghanistan'],[1919,'Afghanistan']]);
timeline('np',[[1900,'Kingdom of Nepal'],[2008,'Nepal']]);

timeline('tr',[[1900,'Ottoman Empire — Anatolia and Eastern Thrace','tr'],[1923,'Turkey'],[2022,'Türkiye']]);
timeline('iq',[[1900,'Ottoman Empire — Mesopotamia','tr'],[1918,'British-occupied Mesopotamia','uk'],[1920,'British Mandate of Mesopotamia','uk'],[1921,'Kingdom of Iraq under British mandate','uk'],[1932,'Iraq']]);
timeline('sy',[[1900,'Ottoman Empire — Syrian lands','tr'],[1918,'Occupied Enemy Territory — Syria','empire'],[1920,'French Mandate — Syria','fr'],[1946,'Syria']]);
timeline('lb',[[1900,'Ottoman Empire — Lebanese coast and Mount Lebanon','tr'],[1918,'Occupied Enemy Territory — Lebanese coast','empire'],[1920,'French Mandate — Greater Lebanon','fr'],[1943,'Lebanon']]);
timeline('jo',[[1900,'Ottoman Empire — Transjordan','tr'],[1918,'British-administered Transjordan','uk'],[1921,'Emirate of Transjordan','uk'],[1946,'Kingdom of Transjordan'],[1949,'Jordan']]);
timeline('il',[[1900,'Ottoman Palestine — Jerusalem and coastal districts','tr'],[1917,'British-occupied Palestine — Jerusalem and coastal districts','uk'],[1920,'British Mandate Palestine — Jerusalem and coastal districts','uk'],[1948,'Israel']]);
timeline('ps',[[1900,'Ottoman Palestine — central hills and Gaza','tr'],[1917,'British-occupied Palestine — central hills and Gaza','uk'],[1920,'British Mandate Palestine — central hills and Gaza','uk'],[1948,'Palestinian territories under Egyptian and Jordanian administration','empire'],[1967,'Occupied Palestinian territories'],[1988,'Palestine']]);
timeline('ae',[[1900,'Trucial States','uk'],[1971,'United Arab Emirates']]);
timeline('qa',[[1900,'Qatar under Ottoman suzerainty','tr'],[1916,'British-protected Qatar','uk'],[1971,'Qatar']]);
timeline('om',[[1900,'Muscat and Oman'],[1970,'Oman']]);
timeline('sa',[[1900,'Ottoman Hejaz and Arabian emirates','tr'],[1916,'Hejaz and Nejd — Arabian states','empire'],[1926,'Kingdom of Hejaz and Nejd','empire'],[1932,'Saudi Arabia']]);
timeline('ye',[[1900,'Ottoman Yemen and British Aden','empire'],[1918,'North Yemen and British Aden','empire'],[1967,'Divided Yemen — North and South','empire'],[1990,'Yemen']]);
transition('cy',1960,'British-administered Cyprus','uk');

timeline('za',[[1900,'British colonies and Boer republics — southern Africa','empire'],[1902,'British South African colonies','uk'],[1910,'Union of South Africa'],[1961,'South Africa']]);
timeline('ng',[[1900,'Northern and Southern Nigeria protectorates','uk'],[1914,'Colony and Protectorate of Nigeria','uk'],[1960,'Nigeria']]);
timeline('ke',[[1900,'East Africa Protectorate','uk'],[1920,'Kenya Colony and Protectorate','uk'],[1963,'Kenya']]);
timeline('mw',[[1900,'British Central Africa Protectorate','uk'],[1907,'Nyasaland','uk'],[1953,'Federation of Rhodesia and Nyasaland — Nyasaland','uk'],[1964,'Malawi']]);
timeline('zm',[[1900,'North-Eastern and North-Western Rhodesia','uk'],[1911,'Northern Rhodesia','uk'],[1953,'Federation of Rhodesia and Nyasaland — Northern Rhodesia','uk'],[1964,'Zambia']]);
timeline('zw',[[1900,'Southern Rhodesia','uk'],[1953,'Federation of Rhodesia and Nyasaland — Southern Rhodesia','uk'],[1964,'Southern Rhodesia','uk'],[1965,'Rhodesia','empire'],[1979,'Zimbabwe Rhodesia and British transition','empire'],[1980,'Zimbabwe']]);
timeline('sz',[[1900,'Swaziland — contested Boer and British administration','empire'],[1903,'British-protected Swaziland','uk'],[1968,'Swaziland'],[2018,'Eswatini']]);
timeline('sd',[[1900,'Anglo-Egyptian Sudan — northern territories','uk'],[1956,'Sudan']]);
timeline('ss',[[1900,'Anglo-Egyptian Sudan — southern territories','uk'],[1956,'Sudan — southern territories','sd'],[2011,'South Sudan']]);
timeline('eg',[[1900,'Khedivate of Egypt under British occupation','uk'],[1914,'British Protectorate of Egypt','uk'],[1922,'Kingdom of Egypt'],[1953,'Republic of Egypt'],[1958,'United Arab Republic — Egypt'],[1971,'Egypt']]);
timeline('ma',[[1900,'Sultanate of Morocco'],[1912,'French and Spanish protectorates — Morocco','empire'],[1956,'Morocco']]);
timeline('ly',[[1900,'Ottoman Tripolitania and Cyrenaica','tr'],[1912,'Italian Libya','it'],[1943,'Allied-administered Libya','empire'],[1951,'Kingdom of Libya'],[1969,'Libya']]);
timeline('et',[[1900,'Ethiopian Empire'],[1936,'Italian-occupied Ethiopia','it'],[1941,'Ethiopian Empire'],[1974,'Ethiopia']]);
timeline('er',[[1900,'Italian Eritrea','it'],[1941,'British-administered Eritrea','uk'],[1952,'Federation of Ethiopia and Eritrea','et'],[1962,'Ethiopia — Eritrea','et'],[1993,'Eritrea']]);
timeline('so',[[1900,'British and Italian Somaliland','empire'],[1960,'Somalia']]);
timeline('dj',[[1900,'French Somaliland','fr'],[1967,'French Territory of the Afars and the Issas','fr'],[1977,'Djibouti']]);
timeline('tz',[[1900,'German East Africa and Zanzibar','empire'],[1919,'Tanganyika Territory and Zanzibar','uk'],[1961,'Tanganyika and Zanzibar','empire'],[1964,'Tanzania']]);
timeline('na',[[1900,'German South West Africa','empire'],[1915,'South African-administered South West Africa','za'],[1990,'Namibia']]);
for (const [id,place] of [['rw','Ruanda'],['bi','Urundi']]) timeline(id,[[1900,`German East Africa — ${place}`,'empire'],[1916,`Belgian Ruanda-Urundi — ${place}`,'be'],[1962,BY_ID.get(id).name]]);
timeline('cm',[[1900,'German Kamerun','empire'],[1916,'French and British Cameroons','empire'],[1960,'Cameroon']]);
timeline('tg',[[1900,'German Togoland','empire'],[1914,'French and British Togoland','empire'],[1960,'Togo']]);
timeline('cd',[[1900,'Congo Free State','empire'],[1908,'Belgian Congo','be'],[1960,'Republic of the Congo — Léopoldville'],[1964,'Democratic Republic of the Congo'],[1971,'Zaire'],[1997,'Democratic Republic of the Congo']]);
timeline('cg',[[1900,'French Congo — Brazzaville territories','fr'],[1910,'French Equatorial Africa — Middle Congo','fr'],[1960,'Republic of the Congo']]);
timeline('ga',[[1900,'French Congo — Gabon','fr'],[1910,'French Equatorial Africa — Gabon','fr'],[1960,'Gabon']]);
timeline('cf',[[1900,'French Congo — Ubangi basin','fr'],[1903,'French Ubangi-Shari','fr'],[1910,'French Equatorial Africa — Ubangi-Shari','fr'],[1960,'Central African Republic'],[1976,'Central African Empire'],[1979,'Central African Republic']]);
timeline('td',[[1900,'French-controlled Chad territories','fr'],[1910,'French Equatorial Africa — Chad','fr'],[1960,'Chad']]);
timeline('bj',[[1900,'French Dahomey','fr'],[1960,'Dahomey'],[1975,'Benin']]);
timeline('bf',[[1900,'French West Africa — Volta basin','fr'],[1919,'French Upper Volta','fr'],[1932,'French West Africa — Volta territories','fr'],[1947,'French Upper Volta','fr'],[1960,'Upper Volta'],[1984,'Burkina Faso']]);
transition('gq',1968,'Spanish Guinea','es');

timeline('bz',[[1900,'British Honduras','uk'],[1973,'Belize under British administration','uk'],[1981,'Belize']]);
transition('gy',1966,'British Guiana','uk');
transition('sr',1975,'Dutch Guiana — Suriname','nl');
timeline('cu',[[1900,'US-occupied Cuba','us'],[1902,'Cuba']]);
timeline('pa',[[1900,'Colombia — Isthmus of Panama','co'],[1903,'Panama']]);

timeline('ki',[[1900,'British Gilbert Islands Protectorate','uk'],[1916,'Gilbert and Ellice Islands — Gilbert Islands','uk'],[1979,'Kiribati']]);
timeline('tv',[[1900,'British Ellice Islands Protectorate','uk'],[1916,'Gilbert and Ellice Islands — Ellice Islands','uk'],[1976,'British Tuvalu','uk'],[1978,'Tuvalu']]);
timeline('vu',[[1900,'New Hebrides — Anglo-French naval administration','empire'],[1906,'Anglo-French New Hebrides','empire'],[1980,'Vanuatu']]);
timeline('ws',[[1900,'German Samoa','empire'],[1914,'New Zealand-administered Western Samoa','nz'],[1962,'Western Samoa'],[1997,'Samoa']]);
timeline('to',[[1900,'British-protected Kingdom of Tonga','uk'],[1970,'Tonga']]);
timeline('pg',[[1900,'British New Guinea and German New Guinea','empire'],[1906,'Australian Papua and German New Guinea','empire'],[1914,'Australian-administered Papua and New Guinea','au'],[1942,'Papua and New Guinea — wartime occupation','empire'],[1945,'Australian-administered Papua and New Guinea','au'],[1975,'Papua New Guinea']]);
for (const [id,place,independence] of [['mh','Marshall Islands',1986],['fm','Caroline Islands',1986],['pw','Palau',1994]]) timeline(id,[[1900,`German Pacific territories — ${place}`,'empire'],[1914,`Japanese South Seas territories — ${place}`,'jp'],[1944,`US-administered Pacific islands — ${place}`,'us'],[1947,`UN Trust Territory — ${place}`,'us'],[independence,BY_ID.get(id).name]]);
timeline('nr',[[1900,'German Nauru','empire'],[1914,'Allied-administered Nauru','empire'],[1920,'Nauru under Australian-administered mandate','au'],[1942,'Japanese-occupied Nauru','jp'],[1945,'Nauru under Australian administration','au'],[1968,'Nauru']]);
timeline('va',[[1900,'Holy See — Vatican enclave in Rome','va'],[1929,'Vatican City']]);

// The catalogue remains geographic: established cities that did not yet exist are omitted.
const CITY_HISTORY = {
  in: { Mumbai:[[1900,'Bombay'],[1995,'Mumbai']], Chennai:[[1900,'Madras'],[1996,'Chennai']], Bengaluru:[[1900,'Bangalore'],[2014,'Bengaluru']], Kolkata:[[1900,'Calcutta'],[2001,'Kolkata']] },
  bd: { Dhaka:[[1900,'Dacca'],[1982,'Dhaka']], Chattogram:[[1900,'Chittagong'],[2018,'Chattogram']] },
  mm: { Yangon:[[1900,'Rangoon'],[1989,'Yangon']], Mawlamyine:[[1900,'Moulmein'],[1989,'Mawlamyine']] },
  cd: { Kinshasa:[[1900,'Léopoldville'],[1966,'Kinshasa']], Lubumbashi:[[1910,'Élisabethville'],[1966,'Lubumbashi']], Kisangani:[[1900,'Stanleyville'],[1966,'Kisangani']] },
  zm: { Ndola:[[1904,'Ndola']], Lusaka:[[1905,'Lusaka']] },
  zw: { Harare:[[1900,'Salisbury'],[1982,'Harare']], Mutare:[[1900,'Umtali'],[1982,'Mutare']] },
  mz: { Maputo:[[1900,'Lourenço Marques'],[1976,'Maputo']] },
  na: { Swakopmund:[[1900,'Swakopmund']] },
  tz: { Dodoma:[[1907,'Dodoma']] },
  td: { "N'Djamena":[[1900,'Fort-Lamy'],[1973,"N'Djamena"]] },
  ng: { Abuja:[[1976,'Abuja']] },
  ci: { Yamoussoukro:[[1900,'Yamoussoukro']] },
  bw: { Gaborone:[[1964,'Gaberones'],[1969,'Gaborone']] },
  bj: { Cotonou:[[1900,'Cotonou']] },
  gm: { Banjul:[[1900,'Bathurst'],[1973,'Banjul']] },
  sz: { Mbabane:[[1902,'Mbabane']] },
  af: { Kabul:[[1900,'Kabul']] },
  kz: { Almaty:[[1900,'Verny'],[1921,'Alma-Ata'],[1993,'Almaty']], Astana:[[1900,'Akmolinsk'],[1961,'Tselinograd'],[1992,'Akmola'],[1998,'Astana'],[2019,'Nur-Sultan'],[2022,'Astana']], Shymkent:[[1900,'Chimkent'],[1993,'Shymkent']] },
  kg: { Bishkek:[[1900,'Pishpek'],[1926,'Frunze'],[1991,'Bishkek']] },
  tj: { Dushanbe:[[1900,'Dushanbe'],[1929,'Stalinabad'],[1961,'Dushanbe']], Khujand:[[1900,'Khujand'],[1936,'Leninabad'],[1991,'Khujand']] },
  tm: { Ashgabat:[[1900,'Ashkhabad'],[1991,'Ashgabat']], Turkmenabat:[[1900,'Chardzhou'],[1999,'Turkmenabat']], Mary:[[1900,'Merv'],[1937,'Mary']] },
  ru: { 'Saint Petersburg':[[1900,'Saint Petersburg'],[1914,'Petrograd'],[1924,'Leningrad'],[1991,'Saint Petersburg']], Novosibirsk:[[1900,'Novonikolayevsk'],[1926,'Novosibirsk']] },
  ua: { Kyiv:[[1900,'Kiev'],[1995,'Kyiv']], Odesa:[[1900,'Odessa'],[1995,'Odesa']], Lviv:[[1900,'Lemberg'],[1918,'Lwów'],[1945,'Lvov'],[1991,'Lviv']] },
  ge: { Tbilisi:[[1900,'Tiflis'],[1936,'Tbilisi']] },
  am: { Yerevan:[[1900,'Erivan'],[1936,'Yerevan']], Gyumri:[[1900,'Alexandropol'],[1924,'Leninakan'],[1990,'Kumayri'],[1992,'Gyumri']] },
  az: { Ganja:[[1900,'Elisavetpol'],[1918,'Ganja'],[1935,'Kirovabad'],[1989,'Ganja']] },
  me: { Podgorica:[[1900,'Podgorica'],[1946,'Titograd'],[1992,'Podgorica']] },
  sk: { Bratislava:[[1900,'Pressburg'],[1919,'Bratislava']] },
  pl: { 'Gdańsk':[[1900,'Danzig'],[1945,'Gdańsk']] },
  no: { Oslo:[[1900,'Kristiania'],[1925,'Oslo']] },
  tr: { Istanbul:[[1900,'Constantinople'],[1930,'Istanbul']], Ankara:[[1900,'Angora'],[1930,'Ankara']], Izmir:[[1900,'Smyrna'],[1930,'Izmir']] },
  id: { Jakarta:[[1900,'Batavia'],[1942,'Djakarta'],[1972,'Jakarta']] },
  my: { 'George Town':[[1900,'George Town']] },
  bn: { 'Bandar Seri Begawan':[[1900,'Brunei Town'],[1970,'Bandar Seri Begawan']] },
  vn: { 'Ho Chi Minh City':[[1900,'Saigon'],[1976,'Ho Chi Minh City']] },
  mn: { Ulaanbaatar:[[1900,'Urga'],[1924,'Ulaanbaatar']], Erdenet:[[1974,'Erdenet']] },
  cn: { Beijing:[[1900,'Peking'],[1949,'Beijing']], Guangzhou:[[1900,'Canton'],[1949,'Guangzhou']] },
  kr: { Seoul:[[1900,'Hanseong'],[1910,'Keijō'],[1945,'Seoul']] },
  fm: { Palikir:[[1900,'Palikir']] },
  pw: { Ngerulmud:[[2006,'Ngerulmud']] },
  bz: { Belmopan:[[1970,'Belmopan']] },
  bs: { Freeport:[[1955,'Freeport']] },
  sb: { Honiara:[[1942,'Honiara']] },
};

const folded = value => typeof value === 'string' ? value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim() : '';
const ALIASES = {
  gb:'uk',gbr:'uk',britain:'uk','great britain':'uk',usa:'us','united states of america':'us',uae:'ae',
  'republic of korea':'kr','korea south':'kr','democratic people s republic of korea':'kp','korea north':'kp',
  'dr congo':'cd',drc:'cd',zaire:'cd','congo kinshasa':'cd','congo brazzaville':'cg','burma':'mm','czech republic':'cz',
  'cape verde':'cv','swaziland':'sz','east timor':'tl','turkey':'tr','viet nam':'vn','ivory coast':'ci','cote d ivoire':'ci',
  'russian federation':'ru','soviet union':'ru','ussr':'ru','byelorussia':'by','moldavia':'md','holy see':'va','vatican':'va',
  'federated states of micronesia':'fm','micronesia federated states of':'fm','republic of moldova':'md','lao people s democratic republic':'la',
  'brunei darussalam':'bn','bolivia plurinational state of':'bo','venezuela bolivarian republic of':'ve',
  'united republic of tanzania':'tz','syrian arab republic':'sy','iran islamic republic of':'ir','the bahamas':'bs','the gambia':'gm',
};
const NAMES = new Map(COUNTRIES.map(country => [folded(country.name),country.id]));
for (const [name,id] of Object.entries(ALIASES)) NAMES.set(folded(name),id);
// Exact disambiguated historical names also resolve after a save/import or year change.
for (const [id,rows] of eras) for (const row of rows) if (!NAMES.has(folded(row.name))) NAMES.set(folded(row.name),id);

function gameYear(value) {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isSafeInteger(parsed) ? Math.max(1900,parsed) : 2026;
}

function cityData(country,year) {
  const changes = CITY_HISTORY[country.id] || {}, cities = [], cityAliases = {};
  for (const modern of country.cities) {
    const rows = changes[modern];
    const selected = rows ? rows.filter(([from]) => from <= year).at(-1)?.[1] : modern;
    if (!selected) continue;
    cities.push(selected); cityAliases[modern] = selected; cityAliases[selected] = selected;
    if (rows) for (const [,name] of rows) cityAliases[name] = selected;
  }
  // Every geography keeps at least one selectable established settlement.
  if (!cities.length) { cities.push(country.cities[0]); cityAliases[country.cities[0]] = country.cities[0]; }
  return { cities,cityAliases };
}

/** Resolve a stable modern geographic id/name to a display record for a simulation year. */
export function countryForYear(value,year = 2026) {
  const requested = typeof value === 'object' && value ? value.id || value.name : value;
  const key = folded(requested), id = BY_ID.has(key) ? key : NAMES.get(key) || 'uk', country = BY_ID.get(id);
  const when = gameYear(year), era = eras.get(id)?.filter(row => row.from <= when).at(-1);
  return { ...country,...(era ? {name:era.name,flag:era.flag} : {}),...cityData(country,when) };
}

/** All 197 geographic choices remain selectable; modern borders are not a historical atlas. */
export function countriesForYear(year = 2026) {
  return COUNTRIES.map(country => countryForYear(country.id,year));
}
