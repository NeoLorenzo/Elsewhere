// All names, writing, scenarios and balance values are original to Elsewhere.
// Costs and taxes are fictional game balance, not real-world financial estimates.
export { COUNTRIES } from './countries.js';

export const FIRST_NAMES = {
  female:['Amelia','Sofia','Maya','Zara','Isla','Amara','Mei','Priya','Nora','Aisha','Valentina','Freya','Hana','Elena','Imani','Lucia','Chloe','Leila','Sienna','Anika','Evelyn','Iris','Grace','Fatima','Naomi','Keira','Yuna','Camila','Ada','Dalia'],
  male:['Oliver','Leo','Noah','Arjun','Mateo','Hugo','Kai','Omar','Ethan','Luca','Theo','Daniel','Samir','Jin','Rafael','Emmanuel','Isaac','Felix','Yusuf','Arthur','Finn','Gabriel','Oscar','Adrian','Tariq','Kenji','Louis','Elijah','Nikhil','Andre'],
  neutral:['Alex','Robin','Charlie','Sam','Taylor','Jordan','River','Avery','Morgan','Quinn','Casey','Rowan','Jamie','Sky','Sage','Remy','Jules','Ellis','Drew','Harper']
};
export const LAST_NAMES = ['Reed','Bennett','Patel','Okafor','Chen','Garcia','Kim','Sato','Wilson','Singh','Costa','Murphy','Ahmed','Dubois','Rossi','Müller','Silva','Andersen','Khan','Williams','Thompson','Davis','Nguyen','Clark','Santos','Novak','Jensen','Ali','Park','Mensah','Brooks','Campbell','Taylor','Moreau','Evans','Tan','Walker','Ibrahim','Diaz','Shaw'];

// Generic education gates intentionally leave room for later vocational schools.
const job = (id,title,salary,education,minSmarts,track) => ({id,title,salary,education,minSmarts,track});
export const JOBS = [
  job('dishwasher','Dishwasher',19500,'none',0,'hospitality'),
  job('barista','Barista',24000,'none',15,'hospitality'),
  job('server','Restaurant Server',25500,'none',15,'hospitality'),
  job('housekeeper','Housekeeper',23000,'none',10,'service'),
  job('warehouse','Warehouse Associate',28000,'none',15,'logistics'),
  job('cleaner','Commercial Cleaner',24500,'none',0,'service'),
  job('retail','Shop Assistant',23500,'none',10,'retail'),
  job('gardener','Gardener',27000,'none',15,'trade'),
  job('farmhand','Farm Worker',25000,'none',10,'agriculture'),
  job('dogwalker','Dog Walker',22000,'none',5,'animals'),
  job('courier','Bicycle Courier',26500,'none',15,'logistics'),
  job('porter','Hospital Porter',26000,'none',20,'health'),
  job('laundry','Laundry Attendant',22500,'none',5,'service'),
  job('shelf','Stockroom Assistant',24500,'none',10,'retail'),
  job('streetcleaner','Street Cleaner',28500,'none',10,'public'),
  job('kitchen','Kitchen Assistant',24000,'none',10,'hospitality'),
  job('receptionist','Receptionist',28000,'secondary',25,'administration'),
  job('admin','Administrative Assistant',30000,'secondary',30,'administration'),
  job('callcentre','Customer Support Agent',29000,'secondary',25,'service'),
  job('security','Security Officer',31000,'secondary',20,'security'),
  job('firefighter','Firefighter',36500,'secondary',35,'public'),
  job('police','Police Officer',38000,'secondary',40,'public'),
  job('postal','Postal Worker',32500,'secondary',25,'logistics'),
  job('busdriver','Bus Driver',35000,'secondary',25,'transport'),
  job('traindriver','Train Driver',54000,'secondary',45,'transport'),
  job('mechanic','Vehicle Mechanic',38500,'secondary',35,'trade'),
  job('electrician','Electrician',42500,'secondary',45,'trade'),
  job('plumber','Plumber',43000,'secondary',35,'trade'),
  job('carpenter','Carpenter',39000,'secondary',30,'trade'),
  job('welder','Welder',40000,'secondary',35,'trade'),
  job('chef','Chef',38000,'secondary',35,'hospitality'),
  job('baker','Baker',31500,'secondary',25,'hospitality'),
  job('hairstylist','Hair Stylist',33000,'secondary',20,'beauty'),
  job('florist','Florist',29000,'secondary',20,'retail'),
  job('estateagent','Estate Agent',42500,'secondary',35,'property'),
  job('sales','Sales Representative',40000,'secondary',30,'business'),
  job('insurance','Insurance Adviser',43000,'secondary',40,'finance'),
  job('bookkeeper','Bookkeeper',37000,'secondary',45,'finance'),
  job('dentalassistant','Dental Assistant',34500,'secondary',35,'health'),
  job('flightattendant','Cabin Crew Member',37000,'secondary',35,'aviation'),
  job('soldier','Army Recruit',31000,'secondary',25,'military'),
  job('sailor','Navy Recruit',31500,'secondary',30,'military'),
  job('aircrew','Air Force Technician',35000,'secondary',40,'military'),
  job('personaltrainer','Personal Trainer',38000,'secondary',25,'fitness'),
  job('photographer','Photographer',39000,'secondary',30,'creative'),
  job('tattooartist','Tattoo Artist',41000,'secondary',30,'creative'),
  job('librarianassistant','Library Assistant',30500,'secondary',40,'education'),
  job('zookeeper','Animal Care Technician',32000,'secondary',40,'animals'),
  job('teacher','School Teacher',44000,'university',55,'education'),
  job('nurse','Registered Nurse',49000,'university',55,'health'),
  job('physiotherapist','Physiotherapist',52000,'university',60,'health'),
  job('socialworker','Social Worker',44000,'university',50,'public'),
  job('programmer','Software Developer',72000,'university',65,'technology'),
  job('cybersecurity','Cybersecurity Analyst',76000,'university',70,'technology'),
  job('dataanalyst','Data Analyst',63000,'university',65,'technology'),
  job('engineer','Civil Engineer',62000,'university',65,'engineering'),
  job('mechanicalengineer','Mechanical Engineer',65000,'university',65,'engineering'),
  job('architect','Architect',60000,'university',60,'design'),
  job('designer','Product Designer',55000,'university',50,'design'),
  job('animator','Animator',50000,'university',50,'creative'),
  job('journalist','Journalist',47000,'university',55,'media'),
  job('editor','Book Editor',49000,'university',60,'media'),
  job('accountant','Accountant',59000,'university',60,'finance'),
  job('banker','Investment Analyst',77000,'university',70,'finance'),
  job('marketing','Marketing Manager',61000,'university',55,'business'),
  job('hrmanager','People Operations Manager',58000,'university',50,'business'),
  job('pilot','Commercial Pilot',86000,'university',65,'aviation'),
  job('biologist','Wildlife Biologist',51000,'university',65,'science'),
  job('environmental','Environmental Scientist',56000,'university',65,'science'),
  job('translator','Translator',46000,'university',60,'language'),
  job('officer','Military Officer',58000,'university',55,'military'),
  job('curator','Museum Curator',48000,'university',60,'arts'),
  job('doctor','Family Doctor',125000,'graduate',75,'medicine'),
  job('surgeon','Surgeon',185000,'graduate',85,'medicine'),
  job('psychiatrist','Psychiatrist',138000,'graduate',78,'medicine'),
  job('dentist','Dentist',112000,'graduate',72,'medicine'),
  job('veterinarian','Veterinarian',85000,'graduate',70,'animals'),
  job('pharmacist','Pharmacist',84000,'graduate',72,'medicine'),
  job('lawyer','Lawyer',99000,'graduate',75,'law'),
  job('judge','Judge',145000,'graduate',85,'law'),
  job('professor','University Lecturer',74000,'graduate',80,'education'),
  job('researcher','Research Scientist',79000,'graduate',82,'science'),
  job('economist','Economist',92000,'graduate',80,'finance'),
  job('psychologist','Clinical Psychologist',88000,'graduate',75,'health'),
  job('diplomat','Diplomat',84000,'graduate',75,'public')
];

export const MAJORS = ['Computer Science','Engineering','Medicine','Biology','Chemistry','Physics','Mathematics','Economics','Finance','Accounting','Business','Law','Education','Psychology','Sociology','Political Science','Journalism','Literature','History','Languages','Art & Design','Music','Film','Environmental Science','Nursing','Architecture','Veterinary Science','Sports Science'];

export const ASSETS = [
  {id:'bicycle',name:'City Bicycle',type:'vehicle',value:450},
  {id:'scooter',name:'Electric Scooter',type:'vehicle',value:1800},
  {id:'hatchback',name:'Used Hatchback',type:'vehicle',value:8500},
  {id:'sedan',name:'Family Sedan',type:'vehicle',value:28000},
  {id:'electric',name:'Electric Crossover',type:'vehicle',value:47000},
  {id:'sportscar',name:'Grand Touring Coupe',type:'vehicle',value:125000},
  {id:'supercar',name:'Limited Edition Supercar',type:'vehicle',value:620000},
  {id:'studio',name:'Studio Apartment',type:'property',value:95000},
  {id:'apartment',name:'City Apartment',type:'property',value:225000},
  {id:'cottage',name:'Country Cottage',type:'property',value:285000},
  {id:'townhouse',name:'Three Bedroom Townhouse',type:'property',value:420000},
  {id:'penthouse',name:'Skyline Penthouse',type:'property',value:1450000},
  {id:'mansion',name:'Lakeside Mansion',type:'property',value:5200000},
  {id:'estate',name:'Historic Estate',type:'property',value:18500000},
  {id:'dinghy',name:'Sailing Dinghy',type:'boat',value:6200},
  {id:'speedboat',name:'Coastal Speedboat',type:'boat',value:78000},
  {id:'yacht',name:'Ocean Yacht',type:'boat',value:4200000},
  {id:'lightplane',name:'Two Seat Light Aircraft',type:'aircraft',value:165000},
  {id:'helicopter',name:'Private Helicopter',type:'aircraft',value:1850000},
  {id:'jet',name:'Executive Jet',type:'aircraft',value:23000000},
  {id:'watch',name:'Mechanical Wristwatch',type:'jewelry',value:5500},
  {id:'necklace',name:'Sapphire Necklace',type:'jewelry',value:18000},
  {id:'ring',name:'Diamond Ring',type:'jewelry',value:12000},
  {id:'painting',name:'Emerging Artist Painting',type:'collectible',value:3200},
  {id:'violin',name:'Antique Concert Violin',type:'collectible',value:44000},
  {id:'manuscript',name:'Rare First Edition',type:'collectible',value:14500},
  {id:'meteorite',name:'Authenticated Meteorite',type:'collectible',value:86000}
];

export const SPECIAL_CAREERS = [
  {id:'musician',title:'Recording Artist',description:'Develop your sound, release music and build an audience.',skill:'music',cost:2500},
  {id:'actor',title:'Screen Actor',description:'Audition for productions and work your way into leading roles.',skill:'acting',cost:1800},
  {id:'athlete',title:'Professional Athlete',description:'Train for the big leagues and pursue a championship career.',skill:'athletics',cost:3000},
  {id:'politician',title:'Public Representative',description:'Campaign for office and build public trust.',skill:'writing',cost:12000},
  {id:'astronaut',title:'Space Explorer',description:'Prepare for missions through technical and physical training.',skill:'coding',cost:18000},
  {id:'writer',title:'Independent Author',description:'Publish original books and grow a readership.',skill:'writing',cost:800},
  {id:'influencer',title:'Digital Creator',description:'Make videos, cultivate a community and earn partnerships.',skill:'acting',cost:600},
  {id:'fighter',title:'Professional Fighter',description:'Condition your body and compete in regulated bouts.',skill:'fitness',cost:2800},
  {id:'director',title:'Film Director',description:'Lead a production from its first script to opening night.',skill:'acting',cost:15000},
  {id:'model',title:'Fashion Model',description:'Build a portfolio and compete for editorial bookings.',skill:'fitness',cost:2200},
  {id:'street_performer',title:'Street Performer',description:'Turn a practiced talent into a crowd pleasing act.',skill:'music',cost:200},
  {id:'crime_family',title:'Underworld Associate',description:'A dangerous fictional path with money, notoriety and consequences.',skill:'crime',cost:1500}
];

export const ACHIEVEMENTS = [
  {id:'first_job',title:'First Paycheck',description:'Begin your first paid career.',icon:'💼'},
  {id:'graduate',title:'A World of Possibility',description:'Earn a university degree.',icon:'🎓'},
  {id:'millionaire',title:'Seven Figures',description:'Reach a net worth of one million.',icon:'💎'},
  {id:'billionaire',title:'Another Comma',description:'Reach a net worth of one billion.',icon:'🏙️'},
  {id:'centenarian',title:'A Whole Century',description:'Celebrate your hundredth birthday.',icon:'🎂'},
  {id:'family',title:'A Growing Family',description:'Have three living children.',icon:'🍼'},
  {id:'homeowner',title:'Your Own Front Door',description:'Buy a home.',icon:'🏡'},
  {id:'globetrotter',title:'New Horizons',description:'Take five journeys to explore the world.',icon:'🌍'},
  {id:'celebrity',title:'Household Name',description:'Reach 75 fame.',icon:'⭐'},
  {id:'entrepreneur',title:'Open for Business',description:'Launch your own company.',icon:'🚀'},
  {id:'comeback',title:'Second Act',description:'Build 100,000 in cash after release from prison.',icon:'🌅'},
  {id:'legacy',title:'The Story Continues',description:'Continue playing as a child in your family.',icon:'🌳'},
  {id:'scholar',title:'Letters After Your Name',description:'Complete graduate education.',icon:'📚'},
  {id:'athlete',title:'In the Big League',description:'Develop your athletics skill to 90.',icon:'🏆'},
  {id:'artist',title:'Made It',description:'Develop music, acting or writing to 90.',icon:'🎭'},
  {id:'clean_slate',title:'A Fresh Start',description:'Find employment after release from prison.',icon:'🕊️'},
  {id:'investor',title:'Skin in the Game',description:'Hold three investments at once.',icon:'📈'},
  {id:'philanthropist',title:'Pay It Forward',description:'Donate a total of 100,000 to good causes.',icon:'🤲'},
  {id:'collector',title:'Curated Life',description:'Own five assets at once.',icon:'🖼️'},
  {id:'golden_years',title:'Well Earned Rest',description:'Reach age 65 with a net worth of 250,000.',icon:'🌻'},
  {id:'polymath',title:'Many Talents',description:'Develop four skills to 70.',icon:'🧠'},
  {id:'survivor',title:'Still Here',description:'Celebrate your eightieth birthday.',icon:'❤️'}
];

const choice = (label,effects,result) => ({label,effects,result});
const event = (id,minAge,maxAge,title,text,category,choices,requires) => ({id,minAge,maxAge,title,text,category,choices,...(requires?{requires}:{})});
export const EVENTS = [
  event('first_snow',1,5,'A World Turned White','You wake up to the first snowfall you can remember. The garden has become another planet.','childhood',[
    choice('Build something enormous',{happiness:7,health:1},'Your lopsided snow creature becomes a family legend.'),choice('Watch from the window',{smarts:2,happiness:2},'You trace the falling flakes with a warm finger on cold glass.')]),
  event('blanket',0,3,'The Missing Blanket','Your favourite blanket has vanished just before bedtime.','childhood',[
    choice('Start a thorough search',{discipline:2,happiness:3},'It was hiding inside a pillowcase all along.'),choice('Try a different comfort',{happiness:2,karma:1},'A soft toy gets promoted to night duty.')]),
  event('puddle',2,6,'The Largest Puddle','A magnificent puddle blocks the pavement. Your new shoes are very clean.','childhood',[
    choice('Make a splash',{happiness:6,looks:-1},'For three glorious seconds, you are a fountain.'),choice('Find a careful route',{discipline:3,smarts:1},'You complete the crossing without losing a sock.')]),
  event('library_dragon',3,9,'A Dragon in the Library','A librarian needs someone to roar during a story reading.','childhood',[
    choice('Give your biggest roar',{happiness:5,fame:1},'Several toddlers look impressed. One looks concerned.'),choice('Help turn the pages',{smarts:3,karma:2},'You discover the quiet satisfaction of good timing.')]),
  event('broken_vase',4,10,'A Terrible Crash','Your indoor ball game ends beside a broken vase. Nobody saw it happen.','family',[
    choice('Own up to the accident',{karma:6,discipline:3,happiness:-2},'You help clean up and learn why indoor football has rules.'),choice('Blame the mysterious wind',{karma:-5,happiness:1},'Your explanation is creative. Your family is unconvinced.')]),
  event('stray_cat',5,12,'A Visitor at the Gate','A thin cat follows you home and waits outside your door.','animals',[
    choice('Ask an adult to find its owner',{karma:5,happiness:4},'A relieved neighbour arrives with a photograph and a thank you.'),choice('Offer it water',{karma:3,happiness:2},'Your new acquaintance approves of the service.')]),
  event('school_seat',5,8,'An Empty Seat','On your first week at school, a nervous new pupil is eating alone.','school',[
    choice('Sit beside them',{karma:4,happiness:4},'You discover a shared obsession with dinosaurs.'),choice('Stay with your usual group',{happiness:1},'Lunch feels familiar, though you keep glancing across the room.')]),
  event('school_play',6,12,'Curtain Up','Your teacher offers you a speaking role in the school play.','school',[
    choice('Learn every line',{discipline:4,smarts:2,happiness:4},'The performance earns warm applause and one very blurry family video.'),choice('Join the stage crew',{smarts:3,karma:2},'You rescue the scenery when a cardboard tree begins to lean.')]),
  event('lost_lunch',6,13,'Lunch Money','You find a small envelope of lunch money beside a school bag.','school',[
    choice('Hand it to the office',{karma:6,happiness:2},'The owner can afford lunch and you can enjoy a clear conscience.'),choice('Keep the money',{cash:15,karma:-7},'You pocket the envelope, then spend the afternoon avoiding eye contact.')]),
  event('sciencefair',8,15,'The Science Fair','Your homemade water filter has qualified for a local school exhibition.','school',[
    choice('Refine the experiment',{smarts:6,discipline:3},'Your careful notes earn a commendation.'),choice('Make a spectacular display',{happiness:4,looks:1},'The filter works reasonably well. The glitter works exceptionally well.')]),
  event('bicycle_race',7,13,'The Hill Challenge','Friends dare you to race down a steep hill with a tight corner at the bottom.','childhood',[
    choice('Suggest a safer route',{smarts:3,health:2,karma:2},'A flatter course still produces plenty of shouting.'),choice('Take the dare',{happiness:5,health:-8},'You cross the line triumphantly and introduce your knee to the pavement.')]),
  event('spelling',7,12,'One Last Word','You reach the final round of a spelling competition. The next word is unfamiliar.','school',[
    choice('Think about the roots',{smarts:4,discipline:2},'You work through the sounds and surprise yourself.'),choice('Guess with confidence',{happiness:3},'Your answer is wrong, but your bow is excellent.')]),
  event('family_recipe',7,17,'The Secret Ingredient','An older relative offers to teach you a treasured family recipe.','family',[
    choice('Write everything down',{smarts:3,karma:3,happiness:3},'You preserve the recipe, including the instruction to stop measuring everything.'),choice('Volunteer as the taste tester',{happiness:6},'You take your responsibilities very seriously.')]),
  event('bully',8,16,'The Corridor','You see an older student teasing someone who cannot get away.','school',[
    choice('Get a trusted teacher',{karma:6,discipline:2},'An adult steps in and the student thanks you later.'),choice('Offer to walk with them',{karma:4,happiness:2},'A little company makes the corridor feel less threatening.'),choice('Keep walking',{karma:-3,happiness:-2},'You avoid trouble, but the scene stays with you.')]),
  event('exam_cheat',11,18,'Answers on a Phone','A classmate offers you the answers to tomorrow’s test.','school',[
    choice('Study your own notes',{smarts:4,discipline:5},'You earn a result that actually belongs to you.'),choice('Accept the shortcut',{smarts:-3,karma:-5,discipline:-4},'The score looks good. The gaps in your understanding remain.')]),
  event('school_trip',10,17,'The Optional Trip','Your class is visiting a science museum, but the ticket costs a little money.','school',[
    choice('Buy a ticket',{cash:-25,smarts:5,happiness:3},'A planetarium show makes the universe feel impossibly large.'),choice('Explore the free online tour',{smarts:3,discipline:2},'You finish the virtual exhibit and save a few favourite pages.')]),
  event('band_invite',11,18,'Three Chords','Friends have formed a band and need someone who can keep time.','school',[
    choice('Join their rehearsals',{happiness:6,discipline:2},'Your first performance is mostly feedback and enormous enthusiasm.'),choice('Design their poster',{smarts:2,happiness:3},'Your poster promises more musical competence than the band can yet supply.')]),
  event('first_crush',12,18,'A Folded Note','Someone passes you a note asking if you would like to hang out after school.','relationships',[
    choice('Say yes',{happiness:6,looks:1},'An awkward walk becomes a surprisingly good conversation.'),choice('Reply kindly that you are not interested',{karma:3,discipline:2},'You make your feelings clear without making someone feel small.')]),
  event('social_dare',13,20,'The Trending Dare','An online challenge involves a stunt that looks painful even when it works.','social',[
    choice('Make a harmless parody',{happiness:5,smarts:2,fame:1},'Your version features a cushion and impressively dramatic editing.'),choice('Attempt the stunt',{health:-12,happiness:3,fame:2},'The video gets attention. So does the bruise.')]),
  event('weekend_job',13,18,'A Neighbour Needs Help','A neighbour offers you money to sort a chaotic garage.','career',[
    choice('Take the afternoon job',{cash:80,discipline:4,health:-1},'You discover six broken umbrellas and earn your pay.'),choice('Help for an hour without charging',{karma:4,happiness:2},'You leave the bicycles reachable and the neighbour grateful.')]),
  event('identity_style',13,22,'Trying Something New','You want to change your personal style, but worry about what everyone will say.','identity',[
    choice('Wear what feels like you',{happiness:6,looks:3},'It takes a day to stop checking every reflective surface.'),choice('Experiment a little at a time',{happiness:3,discipline:2},'Small changes give you room to discover what you like.')]),
  event('friend_secret',14,24,'In Confidence','A close friend shares a private worry and asks you to keep it between you.','relationships',[
    choice('Listen and respect their privacy',{karma:5,happiness:2},'They leave feeling less alone.'),choice('Turn it into gossip',{karma:-7,fame:1,happiness:-3},'The story spreads much further than your friendship can stretch.')]),
  event('exam_pressure',15,22,'Everything at Once','Deadlines pile up, sleep gets shorter, and every small problem feels enormous.','education',[
    choice('Ask for help and make a schedule',{discipline:5,smarts:2,health:3},'A realistic plan makes tomorrow look manageable.'),choice('Work through every night',{smarts:4,health:-7,happiness:-4},'You finish the work, then fall asleep halfway through a sentence.'),choice('Take a full day to recover',{health:5,happiness:4,discipline:-1},'A little rest helps you return with a clearer head.')]),
  event('volunteer',14,35,'A Saturday Well Spent','A local group needs volunteers to restore a neglected community garden.','community',[
    choice('Bring gloves and show up',{karma:6,health:2,happiness:4},'You leave with muddy hands and three new acquaintances.'),choice('Donate supplies',{cash:-60,karma:5},'The organisers put your contribution straight to work.')]),
  event('scholarship_essay',16,22,'Your Own Story','A local foundation invites you to submit an essay for a small education award.','education',[
    choice('Write something honest',{cash:500,smarts:4,discipline:3},'Your thoughtful essay earns a modest bursary.'),choice('Help a friend with their draft',{karma:4,smarts:2},'Helping them sharpen their argument improves your own writing too.')]),
  event('festival',16,35,'One Perfect Evening','Your favourite independent festival has a last minute ticket available.','leisure',[
    choice('Go and enjoy it',{cash:-120,happiness:9,health:-2},'You return hoarse, tired and delighted.'),choice('Host a listening party instead',{cash:-20,happiness:5},'The speakers are small. The conversation is excellent.')]),
  event('flatmate',18,35,'The Vanishing Groceries','Your flatmate keeps eating food labelled with your name.','relationships',[
    choice('Agree on shared food rules',{discipline:3,karma:2,happiness:2},'A shopping rota ends the mystery of the disappearing cheese.'),choice('Say nothing',{cash:-60,happiness:-4},'The fridge continues its one sided arrangement.')]),
  event('scam_message',18,100,'An Urgent Message','A message claims your bank account will close unless you pay a verification fee.','finance',[
    choice('Check with the bank directly',{smarts:3,discipline:2},'The bank confirms the message is fraudulent.'),choice('Pay the supposed fee',{cash:-350,happiness:-6},'The sender disappears along with your money.')]),
  event('wallet',16,100,'A Wallet in the Rain','You find a wallet containing cash and a photograph of two children.','community',[
    choice('Return it through the nearest desk',{karma:7,happiness:3},'Its owner is far more relieved about the photograph than the cash.'),choice('Take the cash and leave it',{cash:140,karma:-8},'The rain washes your footprints away. It does less for your conscience.')]),
  event('bad_date',18,75,'The Three Hour Monologue','Your date has spent the evening explaining their ranking of every motorway service station.','relationships',[
    choice('Change the subject kindly',{happiness:3,karma:1},'It turns out they were nervous. The conversation finally becomes mutual.'),choice('End the evening politely',{discipline:3,happiness:1},'You wish them well and reclaim your evening.')]),
  event('mentor',18,70,'An Unexpected Mentor','A professional you admire offers to review your plans over coffee.','career',[
    choice('Prepare thoughtful questions',{smarts:5,discipline:3,cash:-10},'One piece of advice changes how you see the next five years.'),choice('Ask for a quick introduction',{smarts:2,happiness:2},'They point you toward someone working in your area of interest.')]),
  event('office_credit',18,75,'Who Did the Work?','A colleague presents your idea as their own in a meeting.','career',[
    choice('Document your contribution calmly',{discipline:4,smarts:2},'Your notes settle the question without a shouting match.'),choice('Confront them in front of everyone',{happiness:-3,discipline:-2},'You make your point, but the room remembers the argument.'),choice('Let it pass this time',{karma:1,happiness:-4},'The meeting moves on. You start keeping better records.')],'job'),
  event('overtime',18,75,'A Deadline Approaches','Your manager offers extra pay for a weekend of urgent work.','career',[
    choice('Take the overtime',{cash:650,discipline:3,health:-4,happiness:-2},'The project goes out on time. Your weekend does not.'),choice('Protect your time off',{health:3,happiness:4},'You return on Monday with considerably more energy.')],'job'),
  event('union',18,75,'A Workplace Petition','Colleagues ask you to support a request for safer working conditions.','career',[
    choice('Add your name',{karma:5,discipline:2},'A collective request finally gets a meeting on the calendar.'),choice('Offer evidence privately',{smarts:2,karma:3},'Your careful records give the organisers useful detail.')],'job'),
  event('remote_work',18,75,'The Home Office Experiment','Your workplace trials flexible working, but your kitchen table is hardly an office.','career',[
    choice('Create a proper routine',{cash:-200,discipline:5,health:2},'A desk lamp and regular breaks make a remarkable difference.'),choice('Work from the sofa',{happiness:3,health:-3,discipline:-2},'Comfort wins the first week. Your back files a complaint in the second.')],'job'),
  event('error_report',18,75,'A Costly Typo','You discover an error in a report after it has been sent to your manager.','career',[
    choice('Flag it and send a correction',{karma:4,discipline:4,happiness:-1},'Your manager appreciates hearing it from you first.'),choice('Hope nobody notices',{karma:-4,discipline:-3,happiness:-3},'You spend the week staring anxiously at your inbox.')],'job'),
  event('job_burnout',20,75,'Running on Empty','You catch yourself opening work messages before you even get out of bed.','career',[
    choice('Set firmer boundaries',{health:6,happiness:5,discipline:2},'Work stops following you into every quiet moment.'),choice('Keep pushing',{cash:350,health:-7,happiness:-5},'You stay productive at a price your body keeps tracking.')],'job'),
  event('surprise_bonus',18,75,'Recognition','A completed project earns your team a small performance bonus.','career',[
    choice('Save your share',{cash:1100,discipline:4},'You give your future self a little more breathing room.'),choice('Celebrate with the team',{cash:750,happiness:7,karma:2},'A shared meal turns a difficult project into a good memory.')],'job'),
  event('career_switch',25,65,'The Other Path','An evening class makes you wonder whether you chose the right profession.','career',[
    choice('Explore before deciding',{cash:-180,smarts:4,discipline:3},'You leave with clearer questions and a practical reading list.'),choice('Focus on what you enjoy now',{happiness:4,discipline:2},'You find a part of your current work worth developing.')]),
  event('reunion',20,75,'The Reunion Invitation','Former classmates organise a reunion. You cannot decide whether nostalgia is worth the ticket.','relationships',[
    choice('See who everyone became',{cash:-65,happiness:6},'A shy classmate now tells the funniest stories in the room.'),choice('Reconnect with one old friend',{happiness:4,karma:2},'A quiet coffee gives you more time than a crowded ballroom would.')]),
  event('partner_travel',18,80,'Two Different Holidays','Your partner wants an adventure. You have been dreaming of doing absolutely nothing.','relationships',[
    choice('Plan a little of both',{cash:-450,happiness:7,karma:2},'A walking trail ends at a very comfortable hotel.'),choice('Insist on your own plan',{happiness:-5,karma:-2},'You get the holiday you wanted and more silence than expected.')],'partner'),
  event('partner_anniversary',18,95,'An Ordinary Tuesday?','You suddenly realise today is an anniversary your partner has been mentioning for weeks.','relationships',[
    choice('Plan something thoughtful',{cash:-120,happiness:6,karma:3},'A handwritten letter turns the evening around.'),choice('Admit you forgot and apologise',{karma:4,happiness:1},'Honesty does more work than a hurried excuse could.'),choice('Pretend you have a surprise coming',{karma:-4,happiness:-4},'Keeping the story straight becomes the least romantic part of the day.')],'partner'),
  event('partner_opportunity',22,70,'An Offer Far Away','Your partner is considering a professional opportunity in another city.','relationships',[
    choice('Talk through everyone’s needs',{karma:4,discipline:2,happiness:3},'A difficult conversation becomes a shared plan.'),choice('Demand they turn it down',{karma:-4,happiness:-6},'The offer expires. The resentment takes longer.')],'partner'),
  event('child_talent',22,80,'A Living Room Performance','Your child proudly presents a performance that involves three instruments and a saucepan.','family',[
    choice('Encourage their enthusiasm',{cash:-90,happiness:6,karma:4},'Lessons provide a little structure without reducing the volume.'),choice('Join in with another saucepan',{happiness:7,karma:2},'The neighbours hear the debut of an extremely unusual duet.')],'child'),
  event('child_question',22,90,'A Very Big Question','Your child asks why adults sometimes say one thing and do another.','family',[
    choice('Answer honestly',{karma:4,smarts:2,happiness:2},'The conversation is uncomfortable in a useful way.'),choice('Change the subject',{happiness:-2,karma:-1},'They notice the irony immediately.')],'child'),
  event('school_fee',22,80,'The School Trip Form','Your child brings home a form for a residential school trip.','family',[
    choice('Pay for the trip',{cash:-420,happiness:5,karma:2},'They return with muddy boots and a story for every hour away.'),choice('Plan an affordable family day instead',{cash:-40,happiness:3},'A picnic and a borrowed kite create a different kind of adventure.')],'child'),
  event('family_archive',30,100,'A Box of Photographs','While clearing a cupboard, you find photos nobody has labelled.','family',[
    choice('Record the family stories',{smarts:3,karma:3,happiness:5},'You preserve names and memories that were nearly lost.'),choice('Frame your favourite',{cash:-35,happiness:4},'A small piece of family history gets a place on the wall.')]),
  event('friend_loan',20,85,'A Friend in a Tight Spot','A friend asks for a short loan after an unexpected bill.','relationships',[
    choice('Lend what you can afford',{cash:-300,karma:5,happiness:1},'You make clear that friendship matters more than a quick repayment.'),choice('Help them find practical support',{smarts:2,karma:3},'An hour of paperwork proves more useful than either of you expected.'),choice('Decline respectfully',{discipline:3},'You explain your own limits without judging theirs.')]),
  event('neighbour_noise',18,100,'Through the Wall','A neighbour has started practising the trumpet very early every morning.','community',[
    choice('Agree on practice hours',{karma:3,happiness:3},'You negotiate peace with a person who is still learning the scales.'),choice('Buy good earplugs',{cash:-25,health:2},'A small purchase returns a large amount of sleep.'),choice('Start a noise contest',{happiness:-4,karma:-3},'The building learns that you also own speakers.')]),
  event('repair_bill',18,100,'A Drip in the Ceiling','A small leak threatens to become a very expensive indoor waterfall.','assets',[
    choice('Arrange a prompt repair',{cash:-650,discipline:3},'The plumber catches the problem before it spreads.'),choice('Put a bucket underneath',{cash:-80,happiness:-4},'The bucket works until the plaster stops cooperating.')],'asset'),
  event('car_scratch',18,95,'A Note on the Windscreen','You return to your vehicle and discover a scratch, an apology, and a phone number.','assets',[
    choice('Resolve it calmly',{cash:-100,karma:3},'The other driver pays their share and thanks you for being reasonable.'),choice('Leave the scratch alone',{discipline:1,happiness:-1},'Your vehicle acquires a small mark and a slightly larger story.')],'asset'),
  event('auction_find',18,100,'The Dusty Auction Lot','A box of old prints at a local auction looks more interesting than its label suggests.','assets',[
    choice('Buy it after checking provenance',{cash:450,smarts:3},'One print is worth enough to cover the whole box and a little extra.'),choice('Enjoy looking and walk away',{smarts:2,discipline:2},'You leave with a better eye and your money still in your pocket.')]),
  event('market_panic',18,100,'Red Numbers','A dramatic headline makes everyone around you sound certain the economy is ending.','finance',[
    choice('Review your budget calmly',{discipline:5,smarts:3},'Your plan survives a headline that is forgotten by next week.'),choice('Pay for an urgent prediction service',{cash:-250,happiness:-3},'The newsletter predicts several contradictory disasters.')]),
  event('windfall',18,100,'A Forgotten Account','A letter arrives about a small savings account opened for you years ago.','finance',[
    choice('Add it to your savings',{cash:850,discipline:3},'An old act of kindness becomes a useful financial cushion.'),choice('Share the surprise',{cash:500,karma:4,happiness:5},'You put some away and use the rest to brighten someone else’s week.')]),
  event('charity_pitch',18,100,'A Cause Close to Home','A local shelter launches an appeal to keep its doors open through winter.','community',[
    choice('Contribute to the appeal',{cash:-200,karma:6,happiness:3},'The shelter posts an update showing exactly where donations went.'),choice('Volunteer your time',{karma:5,health:1,happiness:3},'You finish a long shift tired and glad you came.')]),
  event('lottery_email',18,100,'Congratulations, Apparently','An email says you won a lottery you cannot remember entering.','finance',[
    choice('Delete and report it',{smarts:3,discipline:2},'You win the quiet satisfaction of not being scammed.'),choice('Pay the processing charge',{cash:-700,happiness:-7},'The prize remains imaginary. The charge does not.')]),
  event('restaurant_bill',18,100,'The Extra Zero','A restaurant accidentally refunds ten times the amount it owes you.','finance',[
    choice('Point out the mistake',{cash:25,karma:6,happiness:2},'The grateful manager sends a small thank you voucher.'),choice('Stay quiet',{cash:225,karma:-6},'The balance rises. You decide not to mention how.')]),
  event('health_check',20,100,'A Routine Reminder','A reminder for a routine health check has been sitting in your inbox.','health',[
    choice('Book the appointment',{cash:-90,health:6,discipline:3},'A useful conversation helps you choose a manageable health goal.'),choice('Keep postponing it',{health:-3,discipline:-2},'The reminder remains unread for another month.')]),
  event('sleep',18,100,'The Midnight Scroll','You reach for your phone at bedtime and notice the clock says 2:14 a.m.','health',[
    choice('Keep the phone outside the bedroom',{health:5,discipline:4,happiness:2},'The first night feels strange. The second morning feels wonderful.'),choice('Watch just a few more clips',{health:-5,discipline:-3,happiness:1},'The next video is always more interesting than the alarm.')]),
  event('fun_run',16,80,'The Community Run','A friend invites you to a relaxed charity fun run. Fancy dress is optional.','health',[
    choice('Train gently and join in',{cash:-25,health:5,happiness:5,karma:2},'You finish at a sensible pace beside someone dressed as a carrot.'),choice('Cheer from the finish line',{happiness:4,karma:3},'You become an enthusiastic supplier of applause and water.')]),
  event('cooking_class',18,95,'Something New for Dinner','A community centre offers an evening course in cooking food you have never tried.','leisure',[
    choice('Take the class',{cash:-80,health:3,smarts:3,happiness:4},'You learn a new recipe and stop fearing one unfamiliar ingredient.'),choice('Try a recipe at home',{cash:-25,smarts:2,happiness:3},'Dinner takes twice as long as the instructions suggested, but tastes excellent.')]),
  event('book_club',18,100,'A Different Perspective','A book club chooses a novel you would never have picked for yourself.','leisure',[
    choice('Read it with an open mind',{smarts:5,happiness:3},'The conversation changes your opinion of the ending.'),choice('Suggest another title respectfully',{karma:2,smarts:2},'You add something new to next month’s discussion.')]),
  event('dance',18,90,'Two Left Feet','A friend signs up for a beginner dance class and begs you to come along.','leisure',[
    choice('Embrace being a beginner',{cash:-45,health:3,happiness:6},'You step on no more toes than the average student.'),choice('Watch their first performance',{happiness:3,karma:2},'Your loud applause makes up for their nervous entrance.')]),
  event('weather',18,100,'The Power Goes Out','A storm cuts the electricity just as the evening begins.','community',[
    choice('Check on nearby neighbours',{karma:5,happiness:3,discipline:2},'A few torches and a shared kettle turn the landing into a meeting place.'),choice('Make a quiet evening of it',{happiness:4,health:2},'Without a screen, you finally finish the book on your bedside table.')]),
  event('viral_pet',18,100,'An Accidental Audience','A video of a neighbour’s dog stealing your picnic begins spreading online.','social',[
    choice('Share a good natured follow up',{happiness:5,fame:4},'The dog gains admirers. You gain requests for more picnic content.'),choice('Enjoy it and move on',{happiness:3,discipline:2},'You replace your sandwich and keep the memory.')]),
  event('online_argument',16,100,'Someone Is Wrong Online','A stranger misrepresents something you posted and a long argument begins.','social',[
    choice('Clarify once and step away',{discipline:5,health:2},'The thread eventually finds something else to be angry about.'),choice('Argue until dawn',{health:-5,happiness:-5,fame:2},'You win no consensus and lose a perfectly good night’s sleep.')]),
  event('public_mistake',18,90,'A Quote Without Context','An old remark is circulating without the rest of your explanation.','fame',[
    choice('Respond clearly and take responsibility',{karma:4,discipline:3,fame:2},'A considered response steadies the conversation.'),choice('Blame everyone else',{karma:-5,fame:-7,happiness:-4},'The response attracts more attention than the original remark.')],'fame'),
  event('sponsorship',18,90,'An Uncomfortable Offer','A brand offers you money to praise a product you have never used.','fame',[
    choice('Insist on testing it first',{cash:2500,discipline:3,karma:3},'A smaller honest partnership feels like a better fit.'),choice('Say anything for the fee',{cash:6000,karma:-7,fame:-4},'The cheque clears before the complaints arrive.'),choice('Decline the offer',{karma:5,happiness:2},'You keep the trust that made the offer possible.')],'fame'),
  event('business_supplier',18,90,'A Supplier Falls Behind','A supplier warns that an important delivery will arrive late.','business',[
    choice('Pay for a reliable alternative',{cash:-1800,discipline:3},'The order reaches your customers on schedule.'),choice('Explain the delay to customers',{cash:-500,karma:4},'Some customers cancel, but most appreciate the early warning.')],'business'),
  event('business_employee',18,90,'A Valuable Suggestion','An employee spots a simple improvement nobody in management noticed.','business',[
    choice('Credit them and try it',{cash:1400,karma:4,smarts:3},'A small change saves time across the whole team.'),choice('Dismiss the idea',{cash:-500,karma:-3},'The bottleneck remains. Suggestions become less frequent.')],'business'),
  event('business_review',18,90,'The One Star Review','A customer writes an angry review describing a problem you can actually fix.','business',[
    choice('Apologise and put it right',{cash:-250,karma:4,discipline:3},'The customer updates the review to praise your response.'),choice('Argue in the comments',{cash:-1200,karma:-4,fame:-2},'Screenshots travel further than your explanation.')],'business'),
  event('career_audition',18,80,'A Last Minute Opening','Someone cancels and your agent offers you a bigger opportunity than expected.','special',[
    choice('Prepare and take the chance',{cash:1200,fame:5,discipline:3},'You are nervous, prepared, and ready when it matters.'),choice('Ask for something more manageable',{discipline:3,happiness:2},'Your agent appreciates a realistic answer.')],'special'),
  event('career_press',18,90,'Off the Record','A reporter asks you to share gossip about someone in your field.','special',[
    choice('Discuss your own work instead',{karma:4,fame:2},'The resulting interview gives people something worthwhile to read.'),choice('Repeat an unverified rumour',{karma:-6,fame:4,happiness:-3},'A short burst of attention brings a much longer disagreement.')],'special'),
  event('prison_library',18,100,'The Library Cart','A volunteer brings a cart of books past your cell.','prison',[
    choice('Choose something challenging',{smarts:5,discipline:3,happiness:2},'The book gives structure to several difficult afternoons.'),choice('Choose a comforting story',{happiness:5,health:1},'For a little while, the walls feel further away.')],'prison'),
  event('prison_conflict',18,100,'A Brewing Argument','A disagreement in the common room is getting louder.','prison',[
    choice('Move away and alert staff',{discipline:4,health:2},'You avoid being drawn into the confrontation.'),choice('Take a side',{health:-10,happiness:-4,karma:-3},'A small argument becomes a painful afternoon.')],'prison'),
  event('prison_letter',18,100,'A Letter from Outside','A kind letter reminds you that someone is waiting for your return.','prison',[
    choice('Write a thoughtful reply',{karma:4,happiness:6,discipline:2},'Putting plans on paper makes them feel possible.'),choice('Keep it somewhere safe',{happiness:4},'You reread the last paragraph whenever the day feels long.')],'prison'),
  event('middleage',35,60,'The Question at the Party','Someone asks whether your younger self would be proud of your life.','identity',[
    choice('Think about what matters now',{happiness:5,discipline:3},'You choose a goal that fits the person you have become.'),choice('Buy something dramatic',{cash:-900,happiness:4,looks:2},'The new look is exciting, though the question remains.')]),
  event('old_friend',35,100,'A Familiar Voice','An old friend calls after years without contact. Neither of you knows how the silence got so long.','relationships',[
    choice('Make time for a proper conversation',{happiness:6,karma:3},'You spend the first hour catching up and the next remembering why you were friends.'),choice('Arrange a short coffee',{cash:-15,happiness:4},'A small meeting is enough to begin again.')]),
  event('back_pain',35,100,'A Complaint from Your Back','You discover that carrying every shopping bag at once was not the achievement you imagined.','health',[
    choice('Rest and arrange sensible care',{cash:-110,health:5,discipline:3},'Recovery is unglamorous and effective.'),choice('Ignore it and keep lifting',{health:-7,happiness:-3},'Your back repeats its opinion more loudly.')]),
  event('downsizing',50,100,'Less to Carry','Sorting through years of belongings leaves you wondering how much of it you still need.','identity',[
    choice('Donate useful things',{karma:5,happiness:4},'A clearer room makes your thoughts feel less crowded.'),choice('Sell a few unused items',{cash:420,discipline:3},'You make space and discover that someone really did want that lamp.')]),
  event('retirement_hobby',55,100,'Time for Something Else','A community workshop has a place available in a course you once meant to take.','leisure',[
    choice('Become a beginner again',{cash:-160,smarts:4,happiness:6},'Your first attempt is crooked. You are enormously proud of it.'),choice('Teach something you already know',{karma:5,happiness:5},'Passing on a skill reminds you how much you have learned.')]),
  event('grand_story',55,110,'Tell Me About Before','A younger relative asks what the world was like when you were their age.','family',[
    choice('Tell the honest version',{karma:3,happiness:5,smarts:2},'The small details fascinate them more than the grand events.'),choice('Embellish a little',{happiness:4,fame:1},'Your account contains a suspiciously heroic bicycle escape.')]),
  event('old_photo',45,110,'Someone You Used to Be','An old photograph catches you in a year you thought you had forgotten.','identity',[
    choice('Appreciate how far you have come',{happiness:6,karma:2},'You find room for a little kindness toward your younger self.'),choice('Contact someone from that time',{cash:-10,happiness:5},'A familiar laugh makes the years feel briefly transparent.')]),
  event('walking_group',60,110,'The Morning Route','A walking group invites you to join a gentle route with a reliable tea stop.','health',[
    choice('Join at your own pace',{health:5,happiness:5},'The company proves just as valuable as the exercise.'),choice('Meet them for tea afterwards',{cash:-8,happiness:4,karma:1},'You still hear every story from the walk.')]),
  event('digital_lessons',60,110,'A New Little Screen','A new device seems determined to hide every useful button.','education',[
    choice('Ask someone to teach you',{smarts:4,happiness:3,karma:2},'You write down the steps and then teach someone else.'),choice('Explore one feature at a time',{smarts:3,discipline:3},'By the weekend, you are sending photographs with confidence.')]),
  event('birthday_surprise',70,110,'More Candles','People you care about organise a surprise birthday gathering.','family',[
    choice('Enjoy every minute',{happiness:8,health:2},'You lose count of the candles and gain several excellent memories.'),choice('Give a little speech',{happiness:5,karma:3},'You thank the people who made the years worth celebrating.')]),
  event('memoir',65,110,'A Story Worth Keeping','Someone suggests recording your memories before the little details fade.','legacy',[
    choice('Start with one ordinary day',{smarts:3,happiness:5,discipline:3},'The first page leads to another. Ordinary days turn out to matter.'),choice('Record conversations instead',{happiness:5,karma:3},'Your voice preserves the pauses and laughter that writing might miss.')]),
  event('birdsong',75,115,'A Quiet Morning','You wake early to birdsong and find yourself remembering a place you loved long ago.','identity',[
    choice('Share the memory with someone',{happiness:6,karma:2},'The telling gives the place another small life.'),choice('Sit and enjoy the moment',{health:3,happiness:5},'For a while, there is nothing you need to hurry toward.')]),
  event('unexpected_rain',8,110,'Caught in the Rain','The sky opens during a walk and every sensible shelter seems very far away.','everyday',[
    choice('Laugh and find a dry doorway',{happiness:4,health:1},'A stranger makes room and you compare weather predictions.'),choice('Make a dramatic dash for home',{health:-2,happiness:3},'You arrive soaked, breathless and oddly exhilarated.')]),
  event('wrong_delivery',18,110,'The Wrong Parcel','An expensive parcel arrives at your address with somebody else’s name.','community',[
    choice('Arrange its return',{karma:6,discipline:2},'The intended recipient is grateful for an uncomplicated ending.'),choice('Keep it',{cash:180,karma:-7},'You sell the contents and avoid thinking about the label.')]),
  event('public_piano',10,105,'A Piano at the Station','A public piano stands beside a sign inviting anyone to play.','leisure',[
    choice('Try a tune you know',{happiness:5,fame:1},'A few travellers slow down long enough to listen.'),choice('Listen to the next person',{happiness:4,smarts:1},'Someone plays beautifully, then quietly catches their train.')]),
  event('time_capsule',12,110,'A Message for Later','A community project invites residents to leave a letter for a future time capsule.','legacy',[
    choice('Write about everyday life',{smarts:3,karma:2,happiness:3},'You describe something ordinary that might someday seem extraordinary.'),choice('Write down your hopes',{discipline:3,happiness:4},'You seal the letter with a clearer idea of what to do next.')])
];

export const ACTIVITIES = [
  {id:'walk',title:'Take a Walk',icon:'🚶',description:'Clear your head with a change of scenery.'},
  {id:'read',title:'Read a Book',icon:'📖',description:'Spend some time with a different perspective.'},
  {id:'gym',title:'Visit the Gym',icon:'🏋️',description:'Build a sustainable fitness routine.'},
  {id:'meditate',title:'Meditate',icon:'🧘',description:'Practise a little stillness.'},
  {id:'volunteer',title:'Volunteer',icon:'🤝',description:'Make a useful contribution to your community.'},
  {id:'holiday',title:'Take a Holiday',icon:'🏖️',description:'Go somewhere new and make a memory.'}
];
