export interface Character {
  id: string;
  name: string;
  domain: string;
  hints: string[];
  aliases?: string[];
}

export const characters: Character[] = [
  // --- MARVEL ---
  {
    id: "m1", name: "Spider-Man", domain: "Marvel",
    aliases: ["Spiderman", "Peter Parker"],
    hints: [
      "I was raised by my aunt and uncle.",
      "I work as a freelance photographer.",
      "My arch-nemesis rides a glider and throws pumpkin bombs.",
      "I swing through New York City.",
      "With great power comes great responsibility.",
      "I was bitten by a radioactive spider."
    ]
  },
  {
    id: "m2", name: "Iron Man", domain: "Marvel",
    aliases: ["Tony Stark", "Ironman"],
    hints: [
      "I am a billionaire, genius, playboy, philanthropist.",
      "My power comes from technology, not biology.",
      "I built a cave to escape captivity.",
      "My armor is mostly red and gold.",
      "I am a founding member of the Avengers.",
      "My alter-ego is Tony Stark."
    ]
  },
  {
    id: "m3", name: "Captain America", domain: "Marvel",
    aliases: ["Steve Rogers", "Cap", "Captain"],
    hints: [
      "I was a frail young man from Brooklyn.",
      "My best friend became a brainwashed assassin.",
      "I was frozen in ice for decades.",
      "I lead the Avengers.",
      "I wield a circular vibranium shield.",
      "My real name is Steve Rogers."
    ]
  },
  {
    id: "m4", name: "Wolverine", domain: "Marvel",
    aliases: ["Logan", "James Howlett", "Weapon X"],
    hints: [
      "I am a Canadian mutant.",
      "My catchphrase is: 'I'm the best there is at what I do'.",
      "I have an incredible healing factor.",
      "My skeleton is coated in unbreakable metal.",
      "I have three retractable claws in each hand.",
      "I am the most famous member of the X-Men."
    ]
  },
  {
    id: "m5", name: "Deadpool", domain: "Marvel",
    aliases: ["Wade Wilson", "Merc with a Mouth"],
    hints: [
      "I am a mercenary who repeatedly breaks the fourth wall.",
      "I have an unrequited crush on Wolverine.",
      "I got my powers from a rogue experiment to cure my cancer.",
      "I am known as the 'Merc with a Mouth'.",
      "My suit is red so bad guys can't see me bleed.",
      "My real name is Wade Wilson."
    ]
  },
  {
    id: "m6", name: "Thor", domain: "Marvel",
    aliases: ["God of Thunder", "Thor Odinson"],
    hints: [
      "My mother's name is Frigga.",
      "I am an alien prince from a realm connected by the Rainbow Bridge.",
      "I lost my eye facing my evil sister, Hela.",
      "I summon lightning to strike my foes.",
      "I am the God of Thunder from Asgard.",
      "I wield the magical hammer Mjolnir."
    ]
  },
  {
    id: "m7", name: "Hulk", domain: "Marvel",
    aliases: ["Bruce Banner", "The Hulk", "Incredible Hulk"],
    hints: [
      "I am a brilliant scientist with a severe anger management issue.",
      "I was created due to accidental exposure to gamma radiation.",
      "My catchphrase is simply 'SMASH!'.",
      "My alter-ego is Dr. Bruce Banner.",
      "I transform into a massive, unstoppable monster.",
      "I am a giant green Avenger."
    ]
  },
  {
    id: "m8", name: "Thanos", domain: "Marvel",
    aliases: ["The Mad Titan"],
    hints: [
      "I have two adopted daughters who despise me.",
      "I am burdened with glorious purpose to balance the universe.",
      "My home planet was named Titan.",
      "I sit on a floating throne in deep space.",
      "I wiped out half of all life with a snap.",
      "I collected all six Infinity Stones."
    ]
  },
  {
    id: "m9", name: "Loki", domain: "Marvel",
    aliases: ["God of Mischief", "Loki Laufeyson"],
    hints: [
      "I am technically a Frost Giant by birth.",
      "I brought the Chitauri army to invade New York.",
      "I wear a helmet with large golden horns.",
      "I rely on illusions and trickery in combat.",
      "I am the adopted brother of Thor.",
      "I am the Asgardian God of Mischief."
    ]
  },
  {
    id: "m10", name: "Kang the Conqueror", domain: "Marvel",
    aliases: ["Kang", "Nathaniel Richards", "He Who Remains"],
    hints: [
      "I have ruled under names like Rama-Tut and Scarlet Centurion.",
      "My primary motivation is to prevent worse versions of myself from ruling the multiverse.",
      "I use highly advanced armor and technology, possessing no innate powers.",
      "I created the Time Variance Authority.",
      "I am a time-traveling despotic ruler from the 31st Century.",
      "I am the multiversal villain known as Kang."
    ]
  },
  {
    id: "m11", name: "Doctor Strange", domain: "Marvel",
    aliases: ["Stephen Strange", "Dr Strange", "Dr. Strange"],
    hints: [
      "I suffered severe nerve damage in a car accident.",
      "I traveled to Kamar-Taj to seek healing.",
      "I am the guardian of the New York Sanctum.",
      "I wield the Cloak of Levitation.",
      "I use the Eye of Agamotto to manipulate time.",
      "I am the Sorcerer Supreme of Earth."
    ]
  },
  {
    id: "m12", name: "Black Panther", domain: "Marvel",
    aliases: ["T'Challa", "TChalla"],
    hints: [
      "My sister Shuri handles most of my technological upgrades.",
      "I eat a heart-shaped herb to gain enhanced abilities.",
      "My suit absorbs kinetic energy and releases it as a powerful blast.",
      "My kingdom remained hidden from the world for centuries.",
      "I rule the technologically advanced African nation of Wakanda.",
      "I am King T'Challa."
    ]
  },
  {
    id: "m13", name: "Daredevil", domain: "Marvel",
    aliases: ["Matt Murdock", "Matthew Murdock", "The Man Without Fear"],
    hints: [
      "My father was a boxer who refused to throw a fight.",
      "I operate extensively in Hell's Kitchen.",
      "I have heightened remaining senses to compensate for my lack of sight.",
      "My civilian job is working as a defense attorney.",
      "I am known as 'The Man Without Fear'.",
      "I am the blind superhero, Matt Murdock."
    ]
  },
  {
    id: "m14", name: "Venom", domain: "Marvel",
    aliases: ["Eddie Brock", "Symbiote"],
    hints: [
      "I frequently refer to myself using the plural 'We'.",
      "My two greatest weaknesses are extreme heat and incredibly loud sounds.",
      "I am fundamentally a corrupted counterpart to Spider-Man.",
      "I am an amorphous extraterrestrial organism.",
      "My most famous human host is Eddie Brock.",
      "I am a black, muscular symbiote with a terrifying jaw."
    ]
  },
  {
    id: "m15", name: "Magneto", domain: "Marvel",
    aliases: ["Erik Lehnsherr", "Max Eisenhardt", "Master of Magnetism"],
    hints: [
      "My children have occasionally included Scarlet Witch and Quicksilver.",
      "I survived the Holocaust as a young boy.",
      "I founded the Brotherhood of Mutants.",
      "I wear a special helmet specifically to block telepathic attacks.",
      "I believe mutants are the superior next step in human evolution.",
      "I have absolute mastery over magnetic fields and metal."
    ]
  },
  {
    id: "m16", name: "Scarlet Witch", domain: "Marvel",
    aliases: ["Wanda Maximoff", "Wanda"],
    hints: [
      "My brother is a speedster.",
      "I temporarily trapped an entire town in a sitcom reality.",
      "I destroyed the Darkhold.",
      "I fell in love with a synthetic android named Vision.",
      "My powers revolve around chaos magic and reality warping.",
      "My real name is Wanda Maximoff."
    ]
  },
  {
    id: "m17", name: "Star-Lord", domain: "Marvel",
    aliases: ["Peter Quill", "Starlord"],
    hints: [
      "My father is a living celestial planet.",
      "I was abducted from Earth by space pirates called Ravagers.",
      "I listen to an 'Awesome Mix' tape on my walkman.",
      "I pilot a ship called the Milano.",
      "I am the leader of the Guardians of the Galaxy.",
      "My real name is Peter Quill."
    ]
  },
  {
    id: "m18", name: "Rocket Raccoon", domain: "Marvel",
    aliases: ["Rocket"],
    hints: [
      "I was illegally and painfully augmented through cybernetic experiments.",
      "I have a strange obsession with stealing people's prosthetic limbs.",
      "I am a brilliant engineer and tactical genius.",
      "My best friend is a walking tree.",
      "I am a prominent member of the Guardians of the Galaxy.",
      "I am an anthropomorphic raccoon heavily armed with guns."
    ]
  },
  {
    id: "m19", name: "Groot", domain: "Marvel",
    aliases: ["Tree", "I am Groot"],
    hints: [
      "My vocabulary is famously restricted to three specific words.",
      "I sacrificed myself to save my team, regrowing from a tiny sapling.",
      "My best friend is an angry, heavily armed raccoon.",
      "I am a member of the Guardians of the Galaxy.",
      "I am a walking, sentient tree.",
      "I consistently say 'I am Groot'."
    ]
  },
  {
    id: "m20", name: "Ant-Man", domain: "Marvel",
    aliases: ["Scott Lang", "Hank Pym", "Ant Man", "Antman"],
    hints: [
      "I have a history of burglary and thievery.",
      "I travel into the Quantum Realm.",
      "I ride flying insects into battle.",
      "My suit uses special 'Pym Particles'.",
      "I can shrink down to microscopic size or grow into a giant.",
      "My real name is Scott Lang."
    ]
  },

  // --- DC ---
  {
    id: "d1", name: "Superman", domain: "DC",
    aliases: ["Clark Kent", "Kal-El", "Man of Steel"],
    hints: [
      "I was raised by farmers in Smallville, Kansas.",
      "My civilian job is working as a reporter for the Daily Planet.",
      "My primary weakness is a green glowing rock from my homeworld.",
      "I derive my immense powers from Earth's yellow sun.",
      "I am the last son of Krypton.",
      "I wear a blue suit with a red 'S' on my chest."
    ]
  },
  {
    id: "d2", name: "Batman", domain: "DC",
    aliases: ["Bruce Wayne", "The Dark Knight", "Caped Crusader"],
    hints: [
      "I was heavily trained by the League of Assassins.",
      "I operate primarily out of a massive cave beneath my manor.",
      "I have no actual superpowers, relying entirely on intellect and gadgets.",
      "I am driven by the tragic murder of my parents in an alleyway.",
      "My arch-nemesis is completely unhinged and dresses like a clown.",
      "I am the billionaire vigilante of Gotham City."
    ]
  },
  {
    id: "d3", name: "Wonder Woman", domain: "DC",
    aliases: ["Diana Prince", "Princess Diana"],
    hints: [
      "I am formed from clay and given life by mythology.",
      "I fought on the front lines of World War I in my cinematic debut.",
      "I cross my indestructible bracelets to deflect gunfire.",
      "I wield the Lasso of Truth.",
      "I am an Amazonian princess from Themyscira.",
      "My civilian disguise name is Diana Prince."
    ]
  },
  {
    id: "d4", name: "The Flash", domain: "DC",
    aliases: ["Flash", "Barry Allen", "Wally West"],
    hints: [
      "My mother's murder led to my father being falsely imprisoned.",
      "I gained my powers when lightning struck a shelf of chemicals.",
      "I can vibrate my molecules to phase entirely through solid objects.",
      "I changed the entire timeline by running back to save my mother in 'Flashpoint'.",
      "I am connected to the Speed Force.",
      "I am the fastest man alive, Barry Allen."
    ]
  },
  {
    id: "d5", name: "Aquaman", domain: "DC",
    aliases: ["Arthur Curry", "King of Atlantis"],
    hints: [
      "My true heritage makes me a bridge between the land and the ocean.",
      "My primary weapon is an incredibly powerful, magical trident.",
      "My wife's name is Mera.",
      "I am frequently mocked for my ability to communicate with fish.",
      "I rule over the hidden underwater kingdom of Atlantis.",
      "My real name is Arthur Curry."
    ]
  },
  {
    id: "d6", name: "Green Lantern", domain: "DC",
    aliases: ["Hal Jordan", "John Stewart", "Kyle Rayner"],
    hints: [
      "I am a member of an intergalactic police force.",
      "My power source is completely useless against the color yellow.",
      "I was chosen by my weapon for demonstrating the ability to overcome great fear.",
      "I am a former hotshot test pilot.",
      "I can create hard-light constructs entirely based on my willpower.",
      "I am Hal Jordan, wielder of a power ring."
    ]
  },
  {
    id: "d7", name: "The Joker", domain: "DC",
    aliases: ["Joker", "Clown Prince of Crime"],
    hints: [
      "I brutally killed the second Robin, Jason Todd.",
      "My origin frequently heavily involves falling into a vat of chemicals.",
      "I find absolute hilarity in chaos, anarchy, and madness.",
      "I am deeply obsessed with a man who dresses like a bat.",
      "My signature weapon is a deadly, laughing gas.",
      "I possess a terrifying permanent smile and green hair."
    ]
  },
  {
    id: "d8", name: "Harley Quinn", domain: "DC",
    aliases: ["Harleen Quinzel", "Harley"],
    hints: [
      "I first appeared in an animated television series before moving to comics.",
      "I eventually broke away to form the Birds of Prey.",
      "I was formerly a licensed psychiatrist at Arkham Asylum.",
      "I wield a massive, cartoonish mallet or baseball bat.",
      "I was violently manipulated and infatuated with 'Mr. J'.",
      "My real name is Dr. Harleen Quinzel."
    ]
  },
  {
    id: "d9", name: "Lex Luthor", domain: "DC",
    aliases: ["Lex", "Alexander Luthor"],
    hints: [
      "I once successfully campaigned to become President of the United States.",
      "I wear a heavy battle-suit powered by Kryptonite.",
      "I believe aliens are a dangerous crutch preventing true human potential.",
      "I am a ruthless billionaire industrialist operating in Metropolis.",
      "I am completely bald and deeply arrogant.",
      "I am the greatest arch-nemesis of Superman."
    ]
  },
  {
    id: "d10", name: "Darkseid", domain: "DC",
    aliases: ["Uxas"],
    hints: [
      "I fired eye beams known as 'Omega Beams' that track their target.",
      "I command the ruthless generals Steppenwolf and Kalibak.",
      "My ultimate goal is the discovery of the Anti-Life Equation.",
      "I rule a fiery, hellish planet full of parademons.",
      "I am the absolute dictator of Apokolips.",
      "I am the primary cosmic antagonist of the Justice League."
    ]
  },
  {
    id: "d11", name: "Martian Manhunter", domain: "DC",
    aliases: ["J'onn J'onzz", "John Jones", "Martian"],
    hints: [
      "I have a deep psychological and physical weakness to fire.",
      "I have a serious, unexplained addiction to Chocos cookies.",
      "I am one of the most powerful functioning telepaths in the universe.",
      "I am a green-skinned alien refugee hiding in plain sight on Earth.",
      "I can shapeshift, turn invisible, and phase through walls.",
      "My real name is J'onn J'onzz."
    ]
  },
  {
    id: "d12", name: "Nightwing", domain: "DC",
    aliases: ["Dick Grayson", "Robin"],
    hints: [
      "I was raised as part of the 'Flying Graysons' circus act.",
      "I lead a group known as the Teen Titans.",
      "I dropped my original mantle to escape the shadow of my mentor.",
      "I fight crime using dual escrima sticks.",
      "I protect the city of Blüdhaven.",
      "I am Dick Grayson, the man who used to be the first Robin."
    ]
  },
  {
    id: "d13", name: "Green Arrow", domain: "DC",
    aliases: ["Oliver Queen", "Ollie"],
    hints: [
      "I spent five years stranded on a hellish island named Lian Yu.",
      "My partner and lover is the sonic-screaming Black Canary.",
      "I lack superpowers, relying entirely on extreme archery skills.",
      "I famously use a ridiculous 'Boxing Glove' trick shot.",
      "I am the goatee-wearing billionaire mayor of Star City.",
      "My real name is Oliver Queen."
    ]
  },
  {
    id: "d14", name: "Bane", domain: "DC",
    aliases: ["Dorrance"],
    hints: [
      "I was born and raised in an incredibly harsh underground prison.",
      "I spent my childhood studying and building immense intellect behind bars.",
      "My physical strength is dramatically increased via tubes hooked to my brain.",
      "The chemical I am addicted to is called 'Venom'.",
      "I am the villain who famously 'broke the Bat'.",
      "I wear a distinctive luchador-style mask."
    ]
  },
  {
    id: "d15", name: "Catwoman", domain: "DC",
    aliases: ["Selina Kyle"],
    hints: [
      "I have a complicated, romantic, on-again-off-again relationship with a vigilante.",
      "I utilize incredibly sharp retractable claws.",
      "My primary weapon is a bullwhip.",
      "I am a world-renowned cat burglar living in Gotham.",
      "I dress in a tight, black leather suit.",
      "My real name is Selina Kyle."
    ]
  },
  {
    id: "d16", name: "Cyborg", domain: "DC",
    aliases: ["Victor Stone", "Vic Stone"],
    hints: [
      "I was a star high school football player before a horrific accident.",
      "My body was rebuilt by my father using a Mother Box.",
      "I can effortlessly interface with almost any computer system on Earth.",
      "My signature weapon is a sonic cannon built into my arm.",
      "I frequently yell the catchphrase 'Booyah!'.",
      "My human name is Victor Stone."
    ]
  },
  {
    id: "d17", name: "Shazam", domain: "DC",
    aliases: ["Captain Marvel", "Billy Batson"],
    hints: [
      "I draw my power from Solomon, Hercules, Atlas, Zeus, Achilles, and Mercury.",
      "My foremost nemesis is fundamentally Dr. Sivana, though Black Adam is more famous.",
      "I am technically a 12-year-old orphan inside the body of a demi-god.",
      "My transformation requires shouting a specific magical acronym.",
      "I wear a bright red suit with a massive lightning bolt.",
      "My real name is Billy Batson."
    ]
  },
  {
    id: "d18", name: "Black Adam", domain: "DC",
    aliases: ["Teth-Adam"],
    hints: [
      "I am the tyrannical ruler of the Middle Eastern nation of Kahndaq.",
      "I draw my powers from ancient Egyptian gods, not greek ones.",
      "My wife, Isis, was tragically killed, turning me fully against humanity.",
      "I was chosen by a wizard thousands of years before Billy Batson.",
      "I am an anti-hero who fundamentally mirrors Shazam.",
      "I wear a black suit with a yellow lightning bolt."
    ]
  },
  {
    id: "d19", name: "Supergirl", domain: "DC",
    aliases: ["Kara Zor-El", "Kara Danvers"],
    hints: [
      "I initially hid my identity by working as a media assistant for Cat Grant.",
      "My pod was knocked off course and trapped in the phantom zone.",
      "I am actually biologically older than my much more famous relative.",
      "I share the exact same solar-based powers as my cousin.",
      "I am the protective cousin of Superman.",
      "My Kryptonian name is Kara Zor-El."
    ]
  },
  {
    id: "d20", name: "Robin", domain: "DC",
    aliases: ["Damian Wayne", "Tim Drake", "Jason Todd", "The Boy Wonder"],
    hints: [
      "My mantle has been held by many young wards over the decades.",
      "One version of me was violently killed with a crowbar.",
      "One version of me was raised by the League of Assassins.",
      "The first version of me left to lead the Titans as Nightwing.",
      "I am the hyper-colorful sidekick to a dark, brooding vigilante.",
      "I am known as 'The Boy Wonder'."
    ]
  },

  // --- ANIME ---
  {
    id: "a1", name: "Gojo Satoru", domain: "Anime",
    aliases: ["Gojo", "Satoru Gojo"],
    hints: [
      "I am a teacher at a specialized high school.",
      "My clan passed down a special visual ability called the Six Eyes.",
      "I am known as the strongest sorcerer in my universe.",
      "My abilities manipulate space and infinity.",
      "To limit my visual overload, I constantly wear a blindfold.",
      "I am a prominent character in Jujutsu Kaisen."
    ]
  },
  {
    id: "a2", name: "Naruto Uzumaki", domain: "Anime",
    aliases: ["Naruto", "Uzumaki Naruto"],
    hints: [
      "I grew up isolated and shunned by my village.",
      "My signature meal is a large bowl of Ichiraku ramen.",
      "I have a powerful nine-tailed beast sealed inside of me.",
      "My catchphrase is 'Believe it!'.",
      "I use powerful shadow clones and spinning energy spheres.",
      "My goal was to become the Hokage of the leaf village."
    ]
  },
  {
    id: "a3", name: "Son Goku", domain: "Anime",
    aliases: ["Goku", "Kakarot"],
    hints: [
      "I hit my head as a baby, erasing my violent planetary programming.",
      "I travel around searching for seven mystical wish-granting orbs.",
      "My best attack is gathered from the surrounding life energy.",
      "I have an aggressive rival who is the Prince of our fallen race.",
      "I am a martial arts master who turns blonde when I get incredibly angry.",
      "I fire the 'Kamehameha' wave."
    ]
  },
  {
    id: "a4", name: "Luffy", domain: "Anime",
    aliases: ["Monkey D Luffy", "Monkey D. Luffy", "Straw Hat Luffy"],
    hints: [
      "I have a scar with two stitches under my left eye.",
      "I ate a terribly tasting fruit that prevents me from ever swimming.",
      "I sail on ships called the Going Merry and the Thousand Sunny.",
      "My body possesses properties identical to rubber.",
      "I am the captain of the Straw Hat pirates.",
      "My ultimate goal is to become the Pirate King."
    ]
  },
  {
    id: "a5", name: "Saitama", domain: "Anime",
    aliases: ["Caped Baldy", "One Punch Man"],
    hints: [
      "My hero association name is deeply insulting.",
      "My workout routine of pushups and running caused all my hair to fall out.",
      "I am constantly bored because I lack a truly challenging opponent.",
      "My disciple is an intense cyborg named Genos.",
      "I can obliterate absolutely any monster in a single strike.",
      "I am the protagonist of One Punch Man."
    ]
  },
  {
    id: "a6", name: "Levi Ackerman", domain: "Anime",
    aliases: ["Levi", "Captain Levi", "Humanity's Strongest Soldier"],
    hints: [
      "I grew up as a violent thug in the impoverished underground.",
      "I hold my dual blades in a bizarre, reversed grip.",
      "I have a deep, borderline obsessive fixation on cleaning.",
      "I belong to the Survey Corps.",
      "I am known as Humanity's Strongest Soldier.",
      "I am the notoriously short, lethal captain from Attack on Titan."
    ]
  },
  {
    id: "a7", name: "Light Yagami", domain: "Anime",
    aliases: ["Light", "Kira"],
    hints: [
      "I am an absurdly intelligent top-scoring high school student.",
      "I operate publicly under the alias 'Kira'.",
      "I am constantly followed by an apple-eating Shinigami.",
      "I engage in a deadly battle of wits against a detective named 'L'.",
      "I can kill anyone instantly just by knowing their name and face.",
      "I found a supernatural notebook dropped in the human world."
    ]
  },
  {
    id: "a8", name: "Edward Elric", domain: "Anime",
    aliases: ["Edward", "Ed", "Fullmetal Alchemist"],
    hints: [
      "I violently lost my right arm and left leg in a tragic ritual.",
      "My younger brother's soul is bound to a massive hollow suit of armor.",
      "I am deeply insecure and rage-prone when anyone mentions my small height.",
      "My limbs have been replaced with mechanical 'auto-mail'.",
      "I search for the Philosopher's Stone to restore my body.",
      "I am the Fullmetal Alchemist."
    ]
  },
  {
    id: "a9", name: "Tanjiro Kamado", domain: "Anime",
    aliases: ["Tanjiro"],
    hints: [
      "I have a highly enhanced sense of smell, able to detect the 'opening thread'.",
      "My entire family was massacred while I was selling charcoal in town.",
      "I carry a wooden box on my back during the day.",
      "My sister turns into a demon but refuses to consume humans.",
      "I wield a specialized Nichirin sword to behead targets.",
      "I am the primary protagonist of Demon Slayer."
    ]
  },
  {
    id: "a10", name: "Izuku Midoriya", domain: "Anime",
    aliases: ["Deku", "Midoriya"],
    hints: [
      "I meticulously analyze and take notes on all professional heroes.",
      "I was heavily bullied by my explosive childhood friend, Bakugo.",
      "I was born completely without a supernatural 'Quirk'.",
      "I inherited my immense power from All Might.",
      "My hero name was originally an insult that I proudly reclaimed.",
      "I go by the name Deku."
    ]
  },

  // --- MOVIES / NOVELS ---
  {
    id: "f1", name: "Darth Vader", domain: "Movies",
    aliases: ["Anakin Skywalker", "Vader", "Lord Vader"],
    hints: [
      "I was heavily manipulated by a scheming political Chancellor.",
      "I was once prophesied to bring balance to the Force.",
      "I lost a significant duel near lava, which physically ruined me.",
      "My breathing is loud, heavy, and mechanical.",
      "I wield a red energy sword and command extreme telekinesis.",
      "I am the tragic, masked father of Luke and Leia."
    ]
  },
  {
    id: "f2", name: "Harry Potter", domain: "Movies",
    aliases: ["Harry", "The Boy Who Lived"],
    hints: [
      "I spent a decade living miserably in a cupboard under the stairs.",
      "I am exceptionally talented at riding broomsticks.",
      "My core group of friends features a brilliant bookworm and a red-headed boy.",
      "A dark, snake-like wizard is deeply obsessed with killing me.",
      "I am known in my universe as 'The Boy Who Lived'.",
      "I have a prominent lightning-bolt scar on my forehead."
    ]
  },
  {
    id: "f3", name: "Indiana Jones", domain: "Movies",
    aliases: ["Indy", "Dr. Jones", "Henry Jones Jr"],
    hints: [
      "I work as a college professor of history when I am not traveling.",
      "I possess a massive, crippling fear of snakes.",
      "I constantly fight off Nazis looking for powerful religious artifacts.",
      "I successfully recovered the Ark of the Covenant.",
      "My signature look involves a fedora hat.",
      "I am a rugged archaeologist who wields a bullwhip."
    ]
  },
  {
    id: "f4", name: "James Bond", domain: "Movies",
    aliases: ["007", "Bond"],
    hints: [
      "I prefer my martinis shaken, not stirred.",
      "I work heavily with Q Branch, utilizing cars equipped with missiles.",
      "I am an incredibly suave, womanizing assassin.",
      "I hold a 'license to kill' for the British government.",
      "My codename consists of two zeroes and a seven.",
      "I introduce myself by saying my last name first."
    ]
  },
  {
    id: "f5", name: "John Wick", domain: "Movies",
    aliases: ["Baba Yaga", "The Boogeyman", "Wick"],
    hints: [
      "I once successfully killed three men in a bar with a simple pencil.",
      "I use a secretive hotel chain known as The Continental.",
      "I was comfortably retired until Russian gangsters broke into my home.",
      "I wear immaculate, specialized, bullet-proof formal suits.",
      "My murderous revenge rampage was triggered by the death of my puppy.",
      "I am an unstoppable, legendary hitman played by Keanu Reeves."
    ]
  },
  {
    id: "f6", name: "Neo", domain: "Movies",
    aliases: ["Thomas Anderson", "The One"],
    hints: [
      "I operate primarily inside a massive, simulated reality.",
      "I work a boring day job as a programmer named Thomas Anderson.",
      "I chose to ingest a red pill instead of a blue pill.",
      "I can download extreme martial arts training instantly into my brain.",
      "I am destined to save Zion from the machines as 'The One'.",
      "I am the black-coat-wearing protagonist of the Matrix."
    ]
  },
  {
    id: "f7", name: "Yoda", domain: "Movies",
    aliases: ["Master Yoda"],
    hints: [
      "I survived the horrific aftermath of Order 66 by fleeing into exile.",
      "I speak with a unique, backward-structured, object-subject-verb syntax.",
      "I exiled myself to the murky swamp planet of Dagobah.",
      "Despite my small size, I am one of the most powerful telekinetic fighters ever.",
      "I trained Luke Skywalker.",
      "I am a small, green, incredibly ancient Jedi Master."
    ]
  },
  {
    id: "f8", name: "Jack Sparrow", domain: "Movies",
    aliases: ["Captain Jack Sparrow", "Jack"],
    hints: [
      "I constantly lose and steal my prized ship, the Black Pearl.",
      "I possess a magical compass that points towards the thing I want most.",
      "I rely heavily on slurred speech, swaying walks, and bizarre negotiations.",
      "I have a deep, unquenchable thirst for rum.",
      "I am an absolutely eccentric, eyeliner-wearing swashbuckler.",
      "I insist on being called *Captain* Jack Sparrow."
    ]
  },
  {
    id: "f9", name: "Lord Voldemort", domain: "Movies",
    aliases: ["Voldemort", "Tom Riddle", "He Who Must Not Be Named", "Dark Lord"],
    hints: [
      "I opened the Chamber of Secrets when I was just sixteen.",
      "I split my soul into seven hidden objects called Horcruxes.",
      "My followers wear masks and refer to themselves as Death Eaters.",
      "I lost my physical body trying to assassinate an infant.",
      "I possess a terrifying, completely flat snake-like nose.",
      "I am the great antagonist of the Harry Potter universe."
    ]
  },
  {
    id: "f10", name: "Terminator", domain: "Movies",
    aliases: ["T-800", "The Terminator"],
    hints: [
      "I operate utilizing a specialized red heads-up display.",
      "I was originally sent through time to murder a woman named Sarah.",
      "I am a cybernetic organism wrapped in living human tissue.",
      "I demand 'your clothes, your boots, and your motorcycle'.",
      "My famous departing catchphrase is 'I'll be back'.",
      "I am the heavily armed cyborg portrayed by Arnold Schwarzenegger."
    ]
  }
];
