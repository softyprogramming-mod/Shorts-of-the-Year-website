/**
 * SHORTS OF THE YEAR - Google Apps Script
 *
 * Flow:
 * 1. Form submitted → save pending record to Vercel/MongoDB immediately
 * 2. Random 1–3 day delay trigger fires → 99% accept, 1% reject
 * 3. Accept → generate review + send acceptance email
 * 4. Separate 12-hour publish trigger fires → set live in MongoDB
 * 5. Reject → delete from MongoDB, send rejection email
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  API_BASE: 'https://softy-api-phi.vercel.app/api',
  SITE_URL: 'https://shortsoftheyear.com',
  SENDER_NAME: 'SofTY Team',
  ACCEPTANCE_RATE: 0.99,
  MIN_DELAY_HOURS: 24,
  MAX_DELAY_HOURS: 72,
  PUBLISH_DELAY_HOURS_AFTER_ACCEPTANCE: 12,
  BCC_EMAIL: 'softyprogramming@gmail.com',
  ADMIN_EMAIL: 'softyprogramming@gmail.com',
  OWNER_ALERT_EMAIL: 'softyprogramming@gmail.com'
};

const REJECTION_ARC_FIRST_NAMES = [
  'Adrian','Avery','Bennett','Blair','Cameron','Casey','Drew','Elliot','Emerson','Finley',
  'Hayden','Indigo','Jules','Kai','Lane','Logan','Marley','Micah','Milan','Noel',
  'Parker','Quinn','Reese','River','Rowan','Sage','Shiloh','Skyler','Taylor','Wren',
  'Ari','Bailey','Charlie','Dakota','Eden','Frankie','Harper','Jamie','Jordan','Kendall',
  'Morgan','Nico','Oakley','Phoenix','Remy','Riley','Sawyer','Spencer','Tatum','Winter'
];

const REJECTION_ARC_MIDDLE_NAMES = [
  'Ash','Blaine','Cove','Dale','Ellis','Flynn','Gray','Hale','Irwin','Jude',
  'Keir','Lark','Monroe','North','Onyx','Pax','Reign','Slate','True','Vale',
  'Arden','Brooks','Cruz','Dune','Ever','Fox','Gale','Hart','Ira','James',
  'Kit','Lake','Moss','Neal','Orion','Pierce','Rhys','Stone','Troy','Vaughn',
  'Wells','Atlas','Beck','Clove','Dion','Emrys','Frost','Greer','Heath','Knox'
];

const REJECTION_ARC_LAST_NAMES = [
  'Aldridge','Bennion','Carrow','Dempsey','Ellwood','Fairchild','Granger','Hollis','Iverson','Jamison',
  'Kessler','Locke','Marchand','Norridge','Orsini','Pritchard','Quimby','Rivington','Sloane','Thatcher',
  'Underwood','Valez','Whitcomb','Yarrow','Zimmer','Briar','Caldwell','Delaney','Easton','Fletcher',
  'Grafton','Hadley','Ingram','Keating','Lennox','Merritt','Norwood','Prescott','Rosenthal','Sinclair',
  'Tolland','Voss','Winslow','Ames','Bishop','Corbett','Driscoll','Emery','Huxley','Marlowe'
];

const REJECTION_ARC_DELAY_MS = {
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000
};

// Store sensitive values in Apps Script → Project Settings → Script Properties.

// ==================== TEMPLATE SENTENCE LIBRARY ====================


const OPENING_SENTENCES = [
  '{DIRECTOR} brings us {TITLE}, a {GENRE_ADJ} exploration',
  'In {TITLE}, director {DIRECTOR} crafts a {GENRE_ADJ} narrative',
  '{TITLE} marks {DIRECTOR} as a filmmaker with a distinct voice',
  'Director {DIRECTOR} presents {TITLE}, a compelling study',
  'With {TITLE}, {DIRECTOR} delivers a {GENRE_ADJ} work',
  '{DIRECTOR}\'s {TITLE} is a {GENRE_ADJ} achievement',
  'In this {GENRE_ADJ} work, {DIRECTOR} explores',
  '{TITLE} showcases {DIRECTOR}\'s talent for {GENRE_ADJ} storytelling',
  'Director {DIRECTOR}\'s {TITLE} is a confident exploration',
  '{DIRECTOR} demonstrates remarkable control in {TITLE}',
  'Through {TITLE}, {DIRECTOR} examines',
  '{TITLE} is a {GENRE_ADJ} film that resonates',
  '{DIRECTOR} brings a fresh perspective to {GENRE} with {TITLE}',
  'In {TITLE}, {DIRECTOR} weaves together',
  '{TITLE} represents {DIRECTOR}\'s unique approach to {GENRE}',
  'Director {DIRECTOR} crafts something special with {TITLE}',
  '{TITLE} announces {DIRECTOR} as a voice worth following',
  'With {TITLE}, {DIRECTOR} proves adept at {GENRE_ADJ} filmmaking',
  '{DIRECTOR}\'s {TITLE} stands out for its {QUALITY}',
  'In this {GENRE_ADJ} short, {DIRECTOR} delivers',
  '{TITLE} finds {DIRECTOR} in complete command',
  'Director {DIRECTOR} shows maturity beyond expectations in {TITLE}',
  '{TITLE} marks an impressive {GENRE} entry from {DIRECTOR}',
  'Through {TITLE}, director {DIRECTOR} demonstrates',
  '{DIRECTOR} brings authentic vision to {TITLE}',
  'In {TITLE}, {DIRECTOR} balances {QUALITY} with {QUALITY}',
  '{TITLE} showcases {DIRECTOR}\'s keen eye for',
  'Director {DIRECTOR}\'s {TITLE} is a testament to',
  'With {TITLE}, {DIRECTOR} establishes a distinctive style',
  '{TITLE} reflects {DIRECTOR}\'s commitment to',
  'In this {GENRE_ADJ} work, {DIRECTOR} navigates',
  '{DIRECTOR} creates a powerful statement with {TITLE}',
  '{TITLE} finds strength in {DIRECTOR}\'s {QUALITY}',
  'Director {DIRECTOR} approaches {GENRE} with fresh eyes in {TITLE}',
  'Through {TITLE}, {DIRECTOR} invites viewers to',
  '{TITLE} demonstrates {DIRECTOR}\'s understanding of',
  '{DIRECTOR} delivers assured filmmaking with {TITLE}',
  'In {TITLE}, director {DIRECTOR} builds',
  '{TITLE} marks {DIRECTOR} as a filmmaker to watch',
  'Director {DIRECTOR}\'s {TITLE} operates on multiple levels',
  'With {TITLE}, {DIRECTOR} captures something essential',
  '{TITLE} reveals {DIRECTOR}\'s talent for',
  'In this {GENRE_ADJ} piece, {DIRECTOR} explores',
  '{DIRECTOR} shows remarkable restraint in {TITLE}',
  '{TITLE} finds {DIRECTOR} working at the height of creativity',
  'Director {DIRECTOR} brings intelligence to {TITLE}',
  'Through {TITLE}, {DIRECTOR} examines the complexities of',
  '{TITLE} is a {GENRE_ADJ} film that lingers',
  '{DIRECTOR} demonstrates cinematic maturity with {TITLE}',
  'In {TITLE}, {DIRECTOR} creates a world that feels',
  '{DIRECTOR} approaches {TITLE} as a {GENRE_ADJ} exercise',
  'With {TITLE}, {DIRECTOR} offers a {GENRE_ADJ} perspective',
  '{TITLE} finds {DIRECTOR} working within the {GENRE} tradition',
  'In {TITLE}, {DIRECTOR} pursues a {GENRE_ADJ} approach',
  '{DIRECTOR} situates {TITLE} firmly in the realm of {GENRE}',
  '{TITLE} presents {DIRECTOR} at a moment of creative focus',
  '{DIRECTOR} uses {TITLE} as a vehicle for {QUALITY}',
  '{TITLE} reflects {DIRECTOR}\'s interest in {QUALITY}',
  '{DIRECTOR} builds {TITLE} around a foundation of {QUALITY}',
  '{TITLE} represents a considered effort from {DIRECTOR}',
  'With {TITLE}, {DIRECTOR} continues to engage with {GENRE} conventions',
  '{DIRECTOR} frames {TITLE} as a study in {QUALITY}',
  '{TITLE} allows {DIRECTOR} to test the limits of {GENRE}',
  'In {TITLE}, {DIRECTOR} leans into {QUALITY}',
  '{DIRECTOR} delivers {TITLE}, a {GENRE_ADJ} undertaking',
  '{TITLE} sees {DIRECTOR} operating in a {GENRE_ADJ} register',
  'With {TITLE}, {DIRECTOR} attempts a {GENRE_ADJ} recalibration',
  '{DIRECTOR} crafts {TITLE} as a showcase for {QUALITY}',
  '{TITLE} underscores {DIRECTOR}\'s commitment to {QUALITY}',
  'In this {GENRE_ADJ} entry, {DIRECTOR} experiments',
  '{DIRECTOR} returns with {TITLE}, foregrounding {QUALITY}',
  '{TITLE} positions {DIRECTOR} within a broader {GENRE} conversation',
  '{DIRECTOR} treats {TITLE} as an opportunity for {QUALITY}',
  'With {TITLE}, {DIRECTOR} makes a case for {QUALITY}',
  '{TITLE} serves as a platform for {DIRECTOR}\'s {QUALITY}',
  '{DIRECTOR} anchors {TITLE} in {QUALITY}',
  'In {TITLE}, {DIRECTOR} commits to a {GENRE_ADJ} sensibility',
  '{TITLE} reveals {DIRECTOR}\'s ongoing fascination with {QUALITY}',
  '{DIRECTOR} presents {TITLE} as a {GENRE_ADJ} exercise',
  'With {TITLE}, {DIRECTOR} delivers a notably {GENRE_ADJ} effort',
  '{TITLE} finds {DIRECTOR} working in a deliberately {GENRE_ADJ} mode',
  'In {TITLE}, {DIRECTOR} adopts a {GENRE_ADJ} approach',
  '{DIRECTOR} frames {TITLE} within a distinctly {GENRE_ADJ} register',
  '{TITLE} reflects a {GENRE_ADJ} turn for {DIRECTOR}',
  'With {TITLE}, {DIRECTOR} opts for a more {GENRE_ADJ} sensibility',
  '{DIRECTOR} approaches {TITLE} with evident restraint',
  '{TITLE} situates {DIRECTOR} firmly within familiar {GENRE} territory',
  'In this {GENRE_ADJ} entry, {DIRECTOR} works at a measured pace',
  '{DIRECTOR} shapes {TITLE} around its {QUALITY}',
  '{TITLE} leans heavily on {QUALITY} under {DIRECTOR}\'s guidance',
  '{DIRECTOR} builds {TITLE} upon a foundation of {QUALITY}',
  'With {TITLE}, {DIRECTOR} emphasizes {QUALITY}',
  '{TITLE} foregrounds {DIRECTOR}\'s interest in {QUALITY}',
  '{DIRECTOR} returns with {TITLE}, maintaining a {GENRE_ADJ} tone',
  'In {TITLE}, {DIRECTOR} favors {QUALITY} over spectacle',
  '{TITLE} marks a restrained chapter for {DIRECTOR}',
  'With {TITLE}, {DIRECTOR} keeps the focus squarely on {QUALITY}',
  '{DIRECTOR} positions {TITLE} as a study in {QUALITY}',
  '{TITLE} continues {DIRECTOR}\'s engagement with {GENRE} conventions',
  '{DIRECTOR} commits {TITLE} to a {GENRE_ADJ} aesthetic',
  'In {TITLE}, {DIRECTOR} maintains a steady adherence to {QUALITY}',
  '{TITLE} unfolds under {DIRECTOR}\'s controlled hand',
  'With {TITLE}, {DIRECTOR} opts for clarity in {QUALITY}',
  '{DIRECTOR} keeps {TITLE} grounded in {QUALITY}',
  '{TITLE} represents a careful effort from {DIRECTOR}',
  'In this {GENRE_ADJ} work, {DIRECTOR} stays within defined parameters',
  '{DIRECTOR} navigates {TITLE} through a reliance on {QUALITY}',
  '{TITLE} reflects a disciplined, if cautious, approach from {DIRECTOR}',
  '{DIRECTOR} approaches {TITLE} as a meditation',
  'In {TITLE}, {DIRECTOR} constructs a {GENRE_ADJ} inquiry',
  '{DIRECTOR}\'s {TITLE} unfolds as a study',
  '{TITLE} situates {DIRECTOR} within a lineage',
  'With {TITLE}, {DIRECTOR} offers a {GENRE_ADJ} reflection',
  '{DIRECTOR} frames {TITLE} as an examination',
  'In this {GENRE_ADJ} {GENRE}, {DIRECTOR} considers',
  '{TITLE} reveals {DIRECTOR} to be a filmmaker attentive',
  '{DIRECTOR}\'s latest, {TITLE}, emerges as a {GENRE_ADJ} work',
  'Through {TITLE}, {DIRECTOR} engages',
  '{TITLE} confirms {DIRECTOR} as a director invested',
  '{DIRECTOR} situates {TITLE} within a {GENRE_ADJ} tradition',
  'In {TITLE}, a distinctly {GENRE_ADJ} sensibility guides {DIRECTOR}',
  '{DIRECTOR} shapes {TITLE} into a {GENRE_ADJ} exploration',
  '{TITLE} marks a moment in {DIRECTOR}\'s evolving practice',
  '{DIRECTOR} crafts {TITLE} as a vehicle',
  'In this work, {DIRECTOR} advances a {GENRE_ADJ} approach',
  '{TITLE} allows {DIRECTOR} to examine',
  '{DIRECTOR}\'s vision in {TITLE} crystallizes as a {GENRE_ADJ} statement',
  '{TITLE} positions {DIRECTOR} as a filmmaker concerned',
  'With a {GENRE_ADJ} lens, {DIRECTOR} approaches {TITLE}',
  '{DIRECTOR} renders {TITLE} as a formally attentive work',
  '{TITLE} stands as a {GENRE_ADJ} contribution',
  'In {TITLE}, {DIRECTOR} demonstrates a commitment',
  '{DIRECTOR}\'s authorship is evident in {TITLE}, a {GENRE_ADJ} project',
  '{DIRECTOR} situates {TITLE} as a study in {QUALITY}',
  '{TITLE} embodies {DIRECTOR}\'s {GENRE_ADJ} sensibility',
  'Through {TITLE}, {DIRECTOR} explores {QUALITY}',
  'In {TITLE}, {DIRECTOR} negotiates a {GENRE_ADJ} terrain',
  '{DIRECTOR} approaches {TITLE} with {QUALITY} in mind',
  'With {TITLE}, {DIRECTOR} investigates a {GENRE_ADJ} form',
  '{DIRECTOR}\'s {TITLE} is framed by {QUALITY}',
  '{TITLE} exemplifies {DIRECTOR}\'s {GENRE_ADJ} methodology',
  '{DIRECTOR} envisions {TITLE} as a {GENRE_ADJ} exploration',
  'In {TITLE}, {DIRECTOR} foregrounds {QUALITY}',
  '{TITLE} marks {DIRECTOR}\'s commitment to {QUALITY}',
  'With {TITLE}, {DIRECTOR} articulates a {GENRE_ADJ} vision',
  '{DIRECTOR} constructs {TITLE} as a {GENRE_ADJ} experiment',
  'In {TITLE}, {DIRECTOR} orchestrates {QUALITY}',
  '{TITLE} represents {DIRECTOR}\'s {GENRE_ADJ} approach',
  '{DIRECTOR}\'s {TITLE} navigates {QUALITY}',
  '{TITLE} stands out for {DIRECTOR}\'s {GENRE_ADJ} framing',
  '{DIRECTOR} uses {TITLE} to probe {QUALITY}',
  'Through {TITLE}, {DIRECTOR} achieves {GENRE_ADJ} clarity',
  '{TITLE} reflects {DIRECTOR}\'s {GENRE_ADJ} sensibility',
  'With {TITLE}, {DIRECTOR} interrogates {QUALITY}',
  '{DIRECTOR} configures {TITLE} in a {GENRE_ADJ} mode',
  '{TITLE} channels {DIRECTOR}\'s {QUALITY}-oriented vision',
  '{DIRECTOR}\'s {TITLE} foregrounds {QUALITY} and {GENRE_ADJ} perspective',
  'In {TITLE}, {DIRECTOR} balances {QUALITY} with a {GENRE_ADJ} sensibility',
  '{TITLE} exemplifies {DIRECTOR}\'s mastery of {QUALITY} in a {GENRE_ADJ} framework',
  '{DIRECTOR} exposes the contradictions of {TITLE}',
  'In {TITLE}, {DIRECTOR} interrogates class and power',
  '{DIRECTOR}\'s {TITLE} unmasks systemic inequities',
  'Through {TITLE}, {DIRECTOR} explores social hierarchies',
  '{TITLE} reveals the labor structures {DIRECTOR} interrogates',
  'With {TITLE}, {DIRECTOR} examines ideological formations',
  '{DIRECTOR} frames {TITLE} as a critique of capitalism',
  'In {TITLE}, {DIRECTOR} foregrounds social reproduction',
  '{TITLE} situates {DIRECTOR} within a lineage of political critique',
  '{DIRECTOR} uses {TITLE} to probe class struggle',
  'Through {TITLE}, {DIRECTOR} analyzes power relations',
  'In {TITLE}, {DIRECTOR} highlights systemic oppression',
  '{TITLE} exemplifies {DIRECTOR}\'s Marxist critique',
  '{DIRECTOR} interrogates economic disparity in {TITLE}',
  '{TITLE} channels the contradictions {DIRECTOR} exposes in society',
  '{DIRECTOR} foregrounds labor conditions in {TITLE}',
  '{TITLE} operates as a study of class and power under {DIRECTOR}\'s lens',
  '{DIRECTOR}\'s {TITLE} critiques commodification',
  '{TITLE} reflects {DIRECTOR}\'s attention to political economy',
  '{DIRECTOR} situates {TITLE} within systemic critique'
];



const MIDDLE_SENTENCES = [
  'that resonates with authentic emotion',
  'through intimate cinematography and nuanced performances',
  'with remarkable visual sophistication',
  'while maintaining a delicate balance between form and content',
  'that feels both personal and universal',
  'with confident pacing and precise editing',
  'through carefully composed frames',
  'that showcases technical excellence',
  'while allowing moments of silence to speak volumes',
  'with performances that feel lived-in and real',
  'through a distinctive visual language',
  'that demonstrates strong command of the medium',
  'with naturalistic dialogue and authentic performances',
  'while exploring complex themes with subtlety',
  'through evocative sound design',
  'that builds tension masterfully',
  'with a keen sense of atmosphere',
  'while never losing sight of character',
  'through bold creative choices',
  'that rewards close attention',
  'with a striking color palette',
  'while maintaining emotional honesty',
  'through layered storytelling',
  'that feels urgent and necessary',
  'with impressive visual economy',
  'while trusting the audience\'s intelligence',
  'through authentic character development',
  'that demonstrates mature filmmaking',
  'with precise shot composition',
  'while exploring timely themes',
  'through strong directorial vision',
  'that avoids easy answers',
  'with compelling visual metaphors',
  'while maintaining narrative clarity',
  'through thoughtful production design',
  'that feels cinematically alive',
  'with natural lighting that enhances mood',
  'while creating genuine suspense',
  'through economical storytelling',
  'that demonstrates careful craft',
  'with performances that anchor the narrative',
  'while maintaining tonal consistency',
  'through innovative camera work',
  'that feels fresh and original',
  'with a clear point of view',
  'while building to a satisfying conclusion',
  'through deliberate pacing',
  'that earns its emotional moments',
  'with striking visual contrasts',
  'while exploring universal human experiences',
  'through confident direction',
  'that demonstrates technical prowess',
  'with authentic location work',
  'while maintaining thematic focus',
  'through effective use of music',
  'that feels honest and unforced',
  'with careful attention to detail',
  'while creating memorable imagery',
  'through skilled editing',
  'that builds atmosphere effectively',
  'with strong ensemble work',
  'while never feeling derivative',
  'through purposeful cinematography',
  'that demonstrates storytelling confidence',
  'with compelling character arcs',
  'while maintaining visual consistency',
  'through evocative imagery',
  'that feels meticulously crafted',
  'with authentic emotional beats',
  'while exploring difficult subjects with care',
  'through assured performances',
  'that demonstrates visual flair',
  'with effective narrative structure',
  'while creating genuine moments of connection',
  'through thoughtful framing',
  'that feels cinematic in the best sense',
  'with strong thematic coherence',
  'while never overstaying its welcome',
  'through natural performances',
  'that demonstrates clear artistic vision',
  'with impressive production values',
  'while maintaining emotional authenticity',
  'through careful world-building',
  'that rewards repeated viewing',
  'with effective use of silence',
  'while creating visual poetry',
  'through disciplined storytelling',
  'that feels both intimate and expansive',
  'with naturalistic direction',
  'while exploring the human condition',
  'through compelling mise-en-scène',
  'that demonstrates filmmaking skill',
  'with strong visual storytelling',
  'while maintaining audience engagement',
  'through effective symbolism',
  'that feels purposeful and precise',
  'with memorable visual moments',
  'while creating emotional resonance',
  'through confident artistic choices',
  'that avoids sentimentality',
  'with striking visual composition',
  'with a steady visual hand',
  'through deliberate aesthetic choices',
  'while embracing genre conventions',
  'that privileges mood over momentum',
  'with a noticeable attention to detail',
  'through disciplined shot construction',
  'while occasionally overextending its reach',
  'that gestures toward larger ideas',
  'with performances of varying intensity',
  'through a carefully curated tone',
  'while resisting easy resolutions',
  'that favors contemplation over urgency',
  'with an evident respect for craft',
  'through moments of surprising intimacy',
  'while maintaining formal consistency',
  'that leans heavily on atmosphere',
  'with a sincerity that borders on earnestness',
  'through an unwavering stylistic approach',
  'while flirting with excess',
  'that signals ambitious intent',
  'with a deliberate sense of distance',
  'through extended passages of quiet',
  'while navigating uneven rhythms',
  'that aspires to profundity',
  'with an aesthetic that feels meticulously considered',
  'through controlled narrative framing',
  'while occasionally testing audience patience',
  'that suggests a filmmaker thinking aloud',
  'with a confidence that sometimes verges on insistence',
  'through an insistence on tonal cohesion',
  'with a noticeably restrained energy',
  'through deliberate, if predictable, choices',
  'while maintaining a consistent tone',
  'that rarely deviates from its framework',
  'with an emphasis on control',
  'through steady but unhurried pacing',
  'while avoiding dramatic excess',
  'that favors subtlety over impact',
  'with performances that remain measured',
  'through clean, unobtrusive framing',
  'while holding firmly to its structure',
  'that prioritizes coherence over surprise',
  'with a careful attention to continuity',
  'through extended quiet passages',
  'while resisting emotional extremes',
  'that settles into a deliberate rhythm',
  'with an understated visual palette',
  'through repetition of familiar beats',
  'while maintaining narrative focus',
  'that gestures toward larger themes',
  'with a commitment to tonal steadiness',
  'through a practical sense of staging',
  'while remaining comfortably within genre bounds',
  'that leans into its central premise',
  'with a calm, unembellished approach',
  'through functional scene construction',
  'while keeping expectations modest',
  'that signals disciplined restraint',
  'with a sense of creative caution',
  'through choices that emphasize stability',
  'with disciplined formal control', 'through deliberate pacing', 'while sustaining intellectual tension', 'that foregrounds character psychology',
  'with carefully modulated performances', 'through precise visual composition', 'while maintaining tonal equilibrium', 'that privileges thematic coherence',
  'with a measured narrative tempo', 'through rigorous structural design', 'while deepening emotional complexity', 'that articulates a clear artistic vision',
  'with subtle editorial rhythm', 'through restrained dramatic escalation', 'while allowing ideas to resonate', 'that integrates form and meaning',
  'with attentiveness to spatial dynamics', 'through controlled shifts in perspective', 'while refining its thematic focus', 'that unfolds with methodical clarity',
  'with deliberate compositional framing', 'through carefully calibrated tension', 'while sustaining narrative cohesion', 'that reveals disciplined craftsmanship',
  'with a steady formal assurance', 'through nuanced temporal layering', 'while orchestrating visual motifs', 'that sustains tonal coherence',
  'with methodical spatial arrangement', 'through rhythmically precise editing', 'while foregrounding performative subtlety', 'that deepens structural resonance',
  'with thoughtfully integrated mise-en-scène', 'through carefully articulated narrative arcs', 'while balancing emotional cadence', 'that maintains conceptual rigor',
  'with disciplined montage rhythm', 'through strategic visual juxtaposition', 'while exploring temporal elasticity', 'that accentuates formal intentionality',
  'with meticulous framing and focus', 'through layered compositional textures', 'while sustaining dramatic tension', 'that illuminates thematic undercurrents',
  'with spatially attentive design', 'through carefully controlled visual motifs', 'while negotiating tonal complexity', 'that foregrounds authorial intent',
  'with texturally conscious cinematography', 'through orchestrated narrative pacing', 'while maintaining aesthetic cohesion', 'that emphasizes structural clarity',
  'with carefully modulated rhythm', 'through intentional spatial orchestration', 'while articulating performative nuances', 'that underlines conceptual consistency',
  'with sustained formal engagement', 'through methodically considered sequencing', 'while fostering emotional resonance', 'that emphasizes narrative precision',
  'with precision-driven compositional awareness', 'through strategically layered editing', 'while maintaining thematic balance', 'that foregrounds visual intentionality',
  'with structurally deliberate construction', 'through rhythmically coherent cinematography', 'while foregrounding dramatic interplay', 'that enhances narrative clarity',
  'with attentive spatial choreography', 'through modulated temporal structuring', 'while reinforcing conceptual cohesion', 'that integrates performance and composition',
  'with disciplined tonal modulation', 'through precise visual articulation', 'while sustaining rhythmical consistency', 'that clarifies structural intent',
  'with compositional rigor', 'through careful formal articulation', 'while integrating temporal and spatial design', 'that elevates narrative clarity',
  'with conceptual attentiveness', 'through deliberate visual pacing', 'while orchestrating thematic threads', 'that accentuates aesthetic consistency',
  'with focused spatial composition', 'through rhythmically attentive editing', 'while preserving tonal integrity', 'that foregrounds formal precision',
  'with nuanced structural layering', 'through carefully controlled narrative flow', 'while articulating performance subtleties', 'that ensures cohesive visual logic',
  'with precise temporal calibration', 'through controlled visual dynamics', 'while maintaining narrative clarity', 'that reinforces conceptual intention',
  'with measured compositional economy', 'through strategically aligned mise-en-scène', 'while sustaining structural coherence', 'that exemplifies disciplined craft',
  'with attention to formal textures', 'through calibrated spatial orchestration', 'while foregrounding narrative intention', 'that illuminates authorial control',
  'with consistent tonal alignment', 'through structural precision', 'while articulating conceptual nuance', 'that reinforces thematic focus'
];



const CLOSING_SENTENCES = [
  'The film marks {DIRECTOR} as a talent to watch.',
  'A confident work that announces a promising filmmaker.',
  'An impressive achievement in {GENRE} filmmaking.',
  '{DIRECTOR} proves to be a distinctive voice in contemporary cinema.',
  'A must-watch for fans of thoughtful {GENRE}.',
  'The result is a film that lingers long after viewing.',
  '{DIRECTOR} has created something genuinely memorable.',
  'This is {GENRE} filmmaking at its finest.',
  'A remarkable debut that showcases serious talent.',
  'The film demonstrates {DIRECTOR}\'s clear artistic vision.',
  'An assured piece of cinema from a filmmaker in command.',
  '{DIRECTOR} delivers a film worthy of attention.',
  'A strong addition to contemporary {GENRE}.',
  'The film establishes {DIRECTOR} as a name to remember.',
  'An accomplished work that marks a significant achievement.',
  '{DIRECTOR} has crafted something special here.',
  'A film that deserves to find its audience.',
  'This marks {DIRECTOR} as a filmmaker with serious potential.',
  'An impressive entry in the {GENRE} canon.',
  'The result is a film that feels essential.',
  '{DIRECTOR} demonstrates filmmaking maturity beyond experience.',
  'A compelling work from an exciting new voice.',
  'The film showcases {DIRECTOR}\'s considerable talent.',
  'An achievement that announces a genuine filmmaker.',
  '{DIRECTOR} has created a work of substance.',
  'A film that operates on its own terms.',
  'This is confident filmmaking from start to finish.',
  '{DIRECTOR} proves adept at cinematic storytelling.',
  'An impressive showcase for {DIRECTOR}\'s abilities.',
  'The film marks a promising start to what should be a notable career.',
  'A work that demonstrates true cinematic vision.',
  '{DIRECTOR} has delivered something worth celebrating.',
  'An accomplished film that rewards the viewer.',
  'This establishes {DIRECTOR} as a serious talent.',
  'A memorable work from a filmmaker with a future.',
  'The film confirms {DIRECTOR}\'s status as one to watch.',
  'An assured piece of work from a confident filmmaker.',
  '{DIRECTOR} has crafted a film of real merit.',
  'A strong work that demonstrates considerable skill.',
  'This is filmmaking that matters.',
  '{DIRECTOR} shows promise of great things to come.',
  'An effective and memorable piece of cinema.',
  'The film marks {DIRECTOR} as an emerging talent.',
  'A work that showcases genuine filmmaking ability.',
  '{DIRECTOR} delivers a film of substance and style.',
  'An impressive achievement worthy of recognition.',
  'This is {GENRE} done right.',
  '{DIRECTOR} has announced themselves as a filmmaker of note.',
  'A film that achieves exactly what it sets out to do.',
  'The result is something genuinely worthwhile.',
  '{DIRECTOR} delivers a film of quiet conviction.',
  'A thoughtfully constructed piece of {GENRE} cinema.',
  'This affirms {DIRECTOR}\'s dedication to craft.',
  'A measured and deliberate work.',
  '{DIRECTOR} demonstrates commendable ambition.',
  'A film that reflects careful consideration.',
  'This signals continued growth for {DIRECTOR}.',
  'A confident addition to the {GENRE} canon.',
  '{DIRECTOR} brings discipline to the material.',
  'A solid and composed production.',
  'This is a film that clearly values its ideas.',
  '{DIRECTOR} presents a work of notable intention.',
  'A restrained but purposeful entry.',
  'This stands as a testament to methodical filmmaking.',
  '{DIRECTOR} proves willing to take risks.',
  'A film that prioritizes atmosphere over immediacy.',
  'This reveals a filmmaker unafraid of ambition.',
  'A work of evident thoughtfulness.',
  '{DIRECTOR} approaches the genre with seriousness.',
  'A film that commits fully to its vision.',
  'This confirms {DIRECTOR} as a deliberate stylist.',
  'A distinctive, if occasionally self-conscious, effort.',
  '{DIRECTOR} crafts a film of clear intent.',
  'A project that favors precision over flash.',
  'This demonstrates an admirable focus.',
  'A film of evident care and calculation.',
  '{DIRECTOR} shows a willingness to push form.',
  'A work that invites consideration.',
  'This is {GENRE} filmmaking marked by conviction.',
  'A film that lingers, whether quietly or insistently.',
  '{DIRECTOR} delivers a measured contribution to the {GENRE} field.',
  'A restrained and carefully managed production.',
  'This stands as a competent effort from {DIRECTOR}.',
  'A film that remains consistent in its intentions.',
  '{DIRECTOR} demonstrates control, if not urgency.',
  'A modest entry in contemporary {GENRE} cinema.',
  'This reflects a steady hand behind the camera.',
  'A work of clear structure and focus.',
  '{DIRECTOR} maintains a disciplined approach throughout.',
  'A film that values coherence over spectacle.',
  'This signals a thoughtful, if reserved, outing for {DIRECTOR}.',
  'A deliberately constructed piece of filmmaking.',
  '{DIRECTOR} offers a film of quiet determination.',
  'A consistent, if cautious, effort.',
  'This reinforces {DIRECTOR}\'s commitment to form.',
  'A film that adheres closely to its design.',
  '{DIRECTOR} keeps expectations measured.',
  'A project defined by restraint.',
  'This stands as a stable addition to the {GENRE} landscape.',
  'A film that favors steadiness over flourish.',
  '{DIRECTOR} delivers a controlled and deliberate work.',
  'A reserved but cohesive production.',
  'This confirms {DIRECTOR}\'s preference for discipline.',
  'A film that remains faithful to its framework.',
  '{DIRECTOR} prioritizes structure throughout.',
  'A clear, if understated, statement.',
  'This reflects careful, methodical filmmaking.',
  'A work that stays firmly within its boundaries.',
  '{DIRECTOR} opts for consistency above all else.',
  'A film that accomplishes precisely what it sets out to attempt.',
  '{DIRECTOR} demonstrates a command of form and intention.',
  'A work of notable formal intelligence.',
  'This confirms {DIRECTOR} as a filmmaker of serious purpose.',
  'A confident addition to contemporary {GENRE} cinema.',
  '{DIRECTOR} shapes the material with admirable discipline.',
  'A thoughtfully realized cinematic achievement.',
  'This affirms {DIRECTOR}\'s evolving artistic voice.',
  'A film distinguished by its clarity of vision.',
  '{DIRECTOR} approaches the form with admirable rigor.',
  'A compelling example of deliberate craftsmanship.',
  'This work reflects sustained artistic conviction.',
  '{DIRECTOR} reveals a mature command of cinematic language.',
  'A measured yet impactful accomplishment.',
  'This signals {DIRECTOR} as a distinctive presence.',
  'A film of intellectual and formal coherence.',
  '{DIRECTOR} balances ambition with structural discipline.',
  'A precise and thoughtfully constructed piece.',
  'This stands as a testament to focused authorship.',
  '{DIRECTOR} engages the medium with disciplined intent.',
  'A resonant entry in the landscape of {GENRE} filmmaking.',
  'This reflects a filmmaker attentive to craft.',
  '{DIRECTOR} brings clarity and purpose to the material.',
  'A quietly assured work.',
  'This establishes {DIRECTOR} as a director of discernment.',
  'A formally considered and intellectually grounded film.',
  'The work exemplifies {DIRECTOR}\'s structural precision.',
  'A film of careful compositional and narrative balance.',
  '{DIRECTOR} demonstrates nuanced control over rhythm and tone.',
  'This affirms {DIRECTOR}\'s authority over cinematic form.',
  'A disciplined study in narrative and visual interplay.',
  'The film stands as a testament to meticulous craft.',
  '{DIRECTOR}\'s command of space and timing is evident.',
  'A work of controlled, precise cinematic execution.',
  'This confirms {DIRECTOR}\'s status as a thoughtful filmmaker.',
  'A formally rigorous and thematically coherent piece.',
  'The film exemplifies intellectual and artistic discipline.',
  '{DIRECTOR} demonstrates mastery of compositional and temporal structure.',
  'A controlled, elegant exercise in filmmaking craft.',
  'This film reflects {DIRECTOR}\'s precision-driven authorship.',
  'A measured, intellectually attentive cinematic work.',
  '{DIRECTOR} displays deliberate care in every visual and narrative choice.',
  'This stands as a carefully articulated artistic statement.',
  'A film of formal sophistication and narrative clarity.',
  'The work showcases {DIRECTOR}\'s disciplined approach.',
  'A precise, cohesive, and intellectually grounded achievement.',
  '{DIRECTOR} demonstrates attentiveness to performance, composition, and thematic resonance.',
  'A carefully structured and coherent piece of filmmaking.',
  'The film exemplifies intentional and disciplined artistry.',
  '{DIRECTOR} achieves a balance of formal rigor and thematic depth.',
  'This work confirms {DIRECTOR}\'s dedication to craft and structure.',
  'A film of measured, thoughtful execution.',
  'A precisely articulated work that foregrounds {DIRECTOR}\'s vision.',
  'This confirms the filmmaker\'s disciplined approach to cinematic form.',
  'A clear, cohesive, and formally assured piece.',
  'A film that refuses to separate aesthetics from social critique.',
  'This confirms {DIRECTOR}\'s commitment to politically engaged cinema.',
  'An incisive study of class and power dynamics.',
  'A work that foregrounds ideological critique over spectacle.',
  'This positions {DIRECTOR} as a filmmaker attentive to systemic inequities.',
  'A politically aware cinematic investigation.',
  'A radical interrogation of social structures through cinema.',
  'This confirms the enduring relevance of critical, Marxist-informed film practice.',
  'A work that illuminates structural oppression.',
  'A cinema of ideas and social conscience.',
  'This film critiques capitalism without compromising artistic vision.',
  'An ambitious study of power and material conditions.',
  'A cinematic exploration of systemic inequity.',
  'A reflection on class struggle through compelling narrative.',
  'A critical engagement with social hierarchies.',
  'A politically astute, aesthetically precise work.',
  'A study of ideology framed through cinematic craft.',
  'A film that challenges normative social structures.',
  'This demonstrates {DIRECTOR}\'s commitment to socially conscious cinema.'
];



const GENRE_ADJECTIVES = {
  'Drama': ['poignant', 'powerful', 'intimate', 'affecting', 'moving', 'thoughtful', 'restrained', 'meditative', 'character-driven', 'somber', 'earnest', 'quietly observed', 'muted', 'low-key', 'subdued', 'modest', 'unadorned', 'psychologically acute', 'affectively nuanced', 'persona-focused', 'morally probing', 'introspective', 'contemplative', 'microcosmic', 'ethically complex', 'quietly intense', 'attentively documented', 'dialogue-driven', 'formally disciplined', 'thematically focused', 'conduct-aware', 'grounded', 'naturalistic', 'tonally measured', 'reflective', 'deliberate', 'story-attentive', 'dramaturgically controlled', 'emotionally calibrated', 'subtle', 'form-consistent', 'interior', 'culturally attuned', 'quietly affecting', 'psychologically layered', 'restrained yet resonant', 'actor-centered', 'plot-conscious', 'classically structured', 'materially layered', 'observationally detailed', 'ethically engaged', 'temporally deliberate', 'modestly scaled', 'compositionally careful', 'contemplatively paced', 'enveloping', 'socially conscious', 'structurally patient', 'performance-driven', 'thematically grounded', 'emotionally articulate', 'ideologically charged', 'class-conscious', 'socially pointed', 'structurally subversive', 'politically aware', 'materially attentive', 'systemically engaged', 'economically perceptive', 'power-conscious', 'critically reflective', 'formally radical', 'historically informed', 'culturally analytic', 'labor-conscious', 'structurally probing', 'politically urgent', 'psychologically subversive', 'system-aware', 'ethically attentive', 'socially interrogative'],
  'Comedy': ['sharp', 'witty', 'clever', 'observational', 'charming', 'incisive', 'dry', 'deadpan', 'satirical', 'absurdist', 'irreverent', 'playful', 'mildly amusing', 'dryly observational', 'gentle', 'low-energy', 'offbeat', 'understated', 'sharply observed', 'socially attuned', 'dryly incisive', 'character-driven', 'tonally agile', 'wry', 'ironic', 'tempo-disciplined', 'playfully subversive', 'attentively documented', 'culturally literate', 'brisk', 'dialogue-forward', 'structurally playful', 'sly', 'nimble', 'situational', 'conversational', 'tightly paced', 'self-aware', 'knowingly constructed', 'culturally attuned', 'performance-centered', 'textually layered', 'comedic yet restrained', 'sharply timed', 'microcosmic', 'affectively nuanced', 'modest in scope', 'quietly absurd', 'thematically pointed', 'urbanely comic', 'tonally disciplined', 'culturally observant', 'literate', 'irony-inflected', 'humor-driven', 'carefully modulated', 'subtly exaggerated', 'ensemble-focused', 'situationally acute', 'perspective-centered', 'persona-focused', 'dialogue-centered', 'story-attentive', 'gently satirical', 'satirically incisive', 'ideologically sharp', 'class-conscious', 'structurally subversive', 'politically literate', 'socially pointed', 'critically playful', 'economically aware', 'ironically subversive', 'materially observant', 'system-aware', 'wage-conscious', 'production-conscious', 'structurally ironic', 'dialectically tuned', 'labor-minded', 'satire-driven', 'structurally agile', 'ideologically nuanced'],
  'Documentary': ['revealing', 'illuminating', 'compelling', 'insightful', 'engaging', 'thought-provoking', 'observational', 'investigative', 'patient', 'journalistic', 'candid', 'socially conscious', 'observant', 'unembellished', 'straightforward', 'measured', 'plainspoken', 'matter-of-fact', 'attentively documented', 'rigorously researched', 'socially engaged', 'ethically attentive', 'access-driven', 'patiently observed', 'interview-driven', 'vérité-inflected', 'contextually grounded', 'historically aware', 'politically attentive', 'methodically constructed', 'analytically framed', 'structurally disciplined', 'thematically coherent', 'archive-informed', 'enveloping', 'subject-centered', 'inquiry-driven', 'microcosmic', 'formally restrained', 'culturally attuned', 'fact-driven', 'quietly probing', 'longitudinal', 'critically framed', 'research-oriented', 'culturally attentive', 'ethically grounded', 'context-rich', 'carefully assembled', 'institutionally aware', 'systems-conscious', 'perspective-centered', 'documentarianly rigorous', 'witness-oriented', 'methodical', 'socially observant', 'narratively structured', 'field-based', 'critically observant', 'archive-conscious', 'issue-focused', 'discursively framed', 'carefully contextualized', 'structurally measured', 'journalistically informed', 'politically attentive', 'class-conscious', 'ideologically probing', 'structurally investigative', 'systemically aware', 'socially engaged', 'critique-driven', 'materially grounded', 'economically attuned', 'power-conscious', 'historically informed', 'ethically reflective', 'labor-conscious', 'culturally tuned', 'structurally rigorous', 'politically precise', 'textually analytic', 'socially reflective', 'systematically engaged'],
  'Horror': ['unsettling', 'atmospheric', 'tense', 'chilling', 'psychological', 'nightmarish', 'brooding', 'ominous', 'disturbing', 'slow-burning', 'claustrophobic', 'dread-soaked', 'slow-building', 'measured', 'muted', 'atmosphere-driven'],
  'Sci-Fi': ['imaginative', 'cerebral', 'visionary', 'ambitious', 'conceptual', 'speculative', 'futuristic', 'philosophical', 'world-building', 'technologically ambitious', 'high-concept', 'idea-driven', 'concept-heavy', 'austere', 'minimalist', 'deliberate', 'contained', 'thought-oriented'],
  'Thriller': ['gripping', 'taut', 'suspenseful', 'intense', 'riveting', 'edge-of-your-seat', 'propulsive', 'methodical', 'nerve-wracking', 'lean', 'paranoid', 'restrained', 'slow-moving', 'procedural', 'steady', 'controlled'],
  'Animation': ['inventive', 'visually stunning', 'creative', 'imaginative', 'beautifully crafted', 'artistic', 'handcrafted', 'stylized', 'expressive', 'meticulously designed', 'vibrant', 'whimsical', 'minimalist', 'simply rendered', 'pared-down', 'intimate', 'small-scale'],
  'Experimental': ['bold', 'audacious', 'unconventional', 'avant-garde', 'challenging', 'innovative', 'formally daring', 'structurally playful', 'impressionistic', 'deconstructed', 'genre-defying', 'structural', 'rigorous', 'spare', 'concept-driven', 'minimal', 'form-focused', 'structurally unconventional', 'non-narrative', 'materially driven', 'process-oriented', 'structurally fragmentary', 'abstract', 'conceptually driven', 'rhythm-based', 'image-forward', 'temporally elastic', 'structurally deconstructed', 'sensorial', 'formally exploratory', 'medium-conscious', 'texturally driven', 'self-aware', 'durational', 'formally investigative', 'aesthetically radical', 'structurally open-ended', 'perception-focused', 'materially attentive', 'montage-driven', 'non-linear', 'methodologically bold', 'formally interrogative', 'concept-forward', 'materially expressive', 'structurally disruptive', 'aesthetic-centered', 'inquiry-based', 'spatially abstract', 'temporally layered', 'medium-specific', 'visually investigative', 'formally reflexive', 'structurally porous', 'sensory-driven', 'compositionally abstract', 'narratively destabilized', 'ideational', 'materially grounded', 'form-driven', 'structurally iterative', 'aesthetically rigorous', 'perception-oriented', 'conceptually elastic', 'formally ambitious', 'structurally radical', 'ideologically subversive', 'politically challenging', 'systemically probing', 'class-conscious', 'materially investigative', 'socially reflective', 'textually complex', 'critique-driven', 'conceptually rigorous', 'dialectically tuned', 'formally disruptive', 'system-aware', 'materially experimental', 'ideologically inventive', 'socially resonant', 'formally abstract'],
  'Romance': ['tender', 'bittersweet', 'yearning', 'melancholic', 'sincere', 'old-fashioned', 'tentative', 'reserved', 'quiet', 'low-key', 'unvarnished'],
  'Action': ['kinetic', 'muscular', 'high-octane', 'stunt-driven', 'operatic', 'spectacle-forward', 'contained', 'grounded', 'functional', 'practical', 'straightforward', 'economical', 'kinetically driven', 'propulsive', 'tightly structured', 'viscerally staged', 'momentum-focused', 'high-stakes', 'briskly paced', 'tactically composed', 'precision-engineered', 'tension-oriented', 'forward-moving', 'physically grounded', 'energetically mounted', 'spatially aware', 'adrenaline-inflected', 'structurally dynamic', 'impact-driven', 'deliberately escalated', 'spectacle-conscious', 'operationally precise', 'strategically paced', 'enveloping', 'terrain-focused', 'combat-oriented', 'expansively staged', 'tempo-disciplined', 'meticulously choreographed', 'intensity-driven', 'mission-centered', 'scope-conscious', 'structurally escalating', 'controlled yet forceful', 'tactically layered', 'event-driven', 'velocity-conscious', 'crisply executed', 'physically immediate', 'class-conscious', 'structurally charged', 'ideologically alert', 'politically propulsive', 'socially aware', 'materially attuned', 'systemically reflective', 'formally forceful', 'critically kinetic', 'power-conscious', 'dialectically tuned', 'labor-conscious', 'structurally tense', 'politically urgent', 'materially precise', 'economically attuned', 'socially pointed', 'ideologically aggressive', 'formally rigorous', 'system-aware'],
  'Fantasy': ['mythic', 'world-building', 'imaginatively rendered', 'allegorical', 'symbolically layered', 'dreamlike', 'metaphysical', 'mythopoetic', 'visionary', 'atmospherically immersive', 'otherworldly', 'archetypal', 'materially layered', 'cosmologically curious', 'fable-like', 'enchanted', 'speculative', 'richly imagined', 'visually ornate', 'folkloric', 'transcendent', 'realm-spanning', 'spiritually inflected', 'surreal', 'lore-driven', 'imaginatively expansive', 'ritualistic', 'atmospherically textured', 'myth-infused', 'symbolic', 'visionary in scope', 'metaphoric', 'cosmically scaled', 'aesthetically transportive', 'epic', 'dream-inflected', 'transcendentally framed', 'narratively enchanted', 'imaginatively ambitious', 'iconographically rich', 'systemically allegorical', 'ideologically imaginative', 'politically layered', 'class-conscious', 'structurally visionary', 'socially pointed', 'materially speculative', 'dialectically allegorical', 'politically metaphoric', 'system-aware', 'power-conscious', 'historically reflective', 'ideologically dreamlike', 'critique-infused', 'structurally enchanted', 'materially rich', 'socially allegorical', 'formally visionary', 'textually symbolic', 'systemically mythic'],
  'Action/Adventure': ['kinetically driven', 'propulsive', 'tightly structured', 'viscerally staged', 'momentum-focused', 'high-stakes', 'briskly paced', 'muscular', 'tactically composed', 'precision-engineered', 'tension-oriented', 'forward-moving', 'physically grounded', 'energetically mounted', 'spatially aware', 'adrenaline-inflected', 'structurally dynamic', 'impact-driven', 'deliberately escalated', 'large-scale', 'spectacle-conscious', 'disciplined', 'operationally precise', 'strategically paced', 'enveloping', 'terrain-focused', 'combat-oriented', 'expansively staged', 'tempo-disciplined', 'meticulously choreographed', 'intensity-driven', 'mission-centered', 'scope-conscious', 'structurally escalating', 'controlled yet forceful', 'tactically layered', 'event-driven', 'velocity-conscious', 'crisply executed', 'physically immediate', 'class-conscious', 'structurally charged', 'ideologically alert', 'politically propulsive', 'socially aware', 'materially attuned', 'systemically reflective', 'formally forceful', 'critically kinetic', 'power-conscious', 'dialectically tuned', 'labor-conscious', 'structurally tense', 'politically urgent', 'materially precise', 'economically attuned', 'socially pointed', 'ideologically aggressive', 'formally rigorous', 'system-aware'],
  'OTHER': ['formally assured', 'thematically attentive', 'structurally deliberate', 'tonally precise', 'carefully composed', 'thoughtfully mounted', 'story-attentive', 'aesthetically disciplined', 'meticulously crafted', 'visually attentive', 'rigorously constructed', 'affectively nuanced', 'compositionally refined', 'structurally coherent', 'stylistically controlled', 'atmospherically shaped', 'conceptually attentive', 'methodically paced', 'purposefully framed', 'artistically grounded', 'plot-conscious', 'craft-conscious', 'aesthetically measured', 'intention-driven', 'perspective-centered', 'thematically anchored', 'compositionally balanced', 'tempo-disciplined', 'carefully structured', 'form-consistent', 'artistically focused', 'discipline-driven', 'deliberately shaped', 'cinematically articulate', 'thoughtfully realized', 'formally grounded', 'precision-focused', 'structurally refined', 'tonally coherent', 'stylistically measured', 'narratively disciplined', 'carefully articulated', 'aesthetically coherent', 'methodically structured', 'emotionally grounded', 'visually disciplined', 'structurally intentional', 'thematically resonant', 'compositionally assured', 'cinematically focused', 'politically aware', 'ideologically precise', 'structurally attentive', 'class-conscious', 'socially reflective', 'materially disciplined', 'systemically tuned', 'critically framed', 'conceptually grounded', 'behaviorally attentive', 'socially nuanced', 'politically resonant', 'textually layered', 'materially precise', 'ideologically calibrated', 'structurally focused', 'critique-driven']
};



const QUALITIES = [
  'visual storytelling', 'emotional depth', 'technical precision', 'narrative clarity',
  'atmospheric tension', 'character development', 'thematic richness', 'cinematic vision',
  'authentic performances', 'careful pacing', 'visual composition', 'tonal control',
  'formal restraint', 'measured storytelling', 'aesthetic discipline', 'structural ambition',
  'visual confidence', 'narrative ambition', 'editorial precision', 'emotional intelligence',
  'thematic focus', 'dramatic control', 'careful world-building', 'performance direction',
  'subtle character work', 'tonal ambition', 'visual coherence', 'stylistic consistency',
  'formal experimentation', 'deliberate pacing', 'atmospheric control', 'production design detail',
  'conceptual clarity', 'cinematic restraint', 'narrative patience', 'structural discipline',
  'sound design work', 'controlled minimalism', 'measured scope', 'a clear directorial perspective',
  'disciplined execution', 'quiet confidence',
  'formal minimalism', 'measured execution', 'structural simplicity', 'narrative restraint',
  'tonal consistency', 'controlled pacing', 'austere framing', 'modest ambition',
  'thematic directness', 'deliberate repetition', 'subdued performances', 'contained scope',
  'visual restraint', 'narrative economy', 'structural clarity', 'careful construction',
  'tonal steadiness', 'limited scale', 'minimalist design', 'measured atmosphere',
  'intentional stillness', 'understated approach', 'straightforward storytelling',
  'consistent mood', 'disciplined framing', 'pared-down aesthetics', 'practical staging',
  'reserved tone', 'unembellished presentation', 'a clear structural framework',
  'formal precision', 'structural coherence', 'thematic discipline', 'psychological acuity', 'spatial awareness',
  'rhythmic control', 'tonal intelligence', 'visual rigor', 'conceptual clarity',
  'performance calibration', 'dramatic architecture', 'editorial discipline', 'compositional control',
  'aesthetic discipline', 'dramaturgical focus', 'visual intentionality', 'tonal modulation', 'narrative momentum',
  'philosophical inquiry', 'cinematic authorship', 'temporal control', 'expressive economy',
  'architectural framing', 'dialogue precision', 'camera articulation', 'editing subtlety',
  'storytelling clarity', 'suspense calibration', 'textural cohesion', 'rhythmic modulation',
  'spatial composition', 'tonal layering', 'performance nuance', 'visual articulation', 'structural intentionality',
  'narrative pacing', 'emotional layering', 'textural awareness', 'dramaturgical subtlety',
  'conceptual depth', 'medium consciousness', 'formal inventiveness', 'structural elegance', 'expressive restraint',
  'visual economy', 'temporal fluidity', 'editing rhythm', 'performative calibration',
  'textural nuance', 'tonal calibration', 'structural rigor',
  'dialogue layering', 'temporal modulation', 'dramaturgical economy',
  'visual layering', 'architectural clarity', 'formal sophistication', 'conceptual nuance',
  'performance intelligence', 'narrative layering', 'spatial orchestration',
  'medium-specific awareness', 'textural richness', 'formal articulation', 'rhythmic sophistication',
  'emotional cadence', 'conceptual layering', 'dramaturgical intelligence',
  'editing modulation', 'thematic articulation',
  'narrative control', 'spatial sophistication', 'tonal precision', 'performance layering', 'structural clarity',
  'visual intelligence', 'formal layering', 'conceptual sophistication', 'textural precision', 'editorial clarity',
  'dramaturgical calibration', 'narrative sophistication', 'medium-conscious articulation', 'temporal sophistication'
];


// ==================== MAIN FUNCTIONS ====================

function onFormSubmit(e) {
  try {
    autoWorkflowMaintenance_();
    const formData = extractFormData(e);
    const randomHours =
      Math.random() * (CONFIG.MAX_DELAY_HOURS - CONFIG.MIN_DELAY_HOURS) + CONFIG.MIN_DELAY_HOURS;
    const triggerTime = new Date(Date.now() + randomHours * 60 * 60 * 1000);

    const submissionId = 'submission_' + Date.now();
    const props = PropertiesService.getScriptProperties();
    props.setProperty(submissionId, JSON.stringify(formData));

    const trigger = ScriptApp.newTrigger('processSubmission')
      .timeBased()
      .at(triggerTime)
      .create();

    props.setProperty('trigger_' + trigger.getUniqueId(), submissionId);
    Logger.log('Scheduled ' + submissionId + ' at ' + triggerTime.toISOString());

    var receiptSent = false;
    var receiptErrorMessage = '';
    try {
      sendSubmissionReceivedEmail(formData);
      receiptSent = true;
    } catch (receiptError) {
      receiptErrorMessage = String(receiptError && receiptError.message ? receiptError.message : receiptError);
      Logger.log('Submission received email failed: ' + receiptError);
      notifyAdmin_('submission received email failed', receiptError);
    }

    // Save pending record to MongoDB immediately so admin can see it
    savePendingToMongo(formData, submissionId, {
      scheduledDecisionAt: triggerTime.toISOString(),
      submissionReceivedEmailSent: receiptSent,
      submissionReceivedEmailAt: receiptSent ? new Date().toISOString() : '',
      submissionReceivedEmailError: receiptErrorMessage
    });

    sendOwnerAlert_(
      'New SoftY submission: ' + (formData.title || 'Untitled'),
      'New submission received\n\n'
        + 'Title: ' + (formData.title || '') + '\n'
        + 'Director: ' + (formData.director || '') + '\n'
        + 'Email: ' + (formData.email || '') + '\n'
        + 'Film link: ' + (formData.filmLink || '') + '\n'
        + 'Receipt email: ' + (receiptSent ? 'sent' : ('failed/unknown ' + receiptErrorMessage))
    );
  } catch (error) {
    notifyAdmin_('onFormSubmit failed', error);
    Logger.log('Error in onFormSubmit: ' + error);
  }
}

function doPost(e) {
  try {
    autoWorkflowMaintenance_();
    var body = parseWebhookBody_(e);
    var action = String(body.action || '');

    if (action === 'manualApprove') {
      var approveSecret = String(body.secret || '');
      var approveExpected = getWebhookSecret_();
      if (!approveSecret || approveSecret !== approveExpected) {
        return jsonResponse_({ success: false, error: 'Unauthorized' });
      }

      var film = body && body.film ? body.film : {};
      var review = String(body.review || '');
      var formData = {
        title: String(film.title || ''),
        director: String(film.director || ''),
        writer: String(film.writer || ''),
        producer: String(film.producer || ''),
        genre: String(film.genre || ''),
        runtime: String(film.runtime || ''),
        logline: String(film.logline || ''),
        directorStatement: String(film.directorStatement || ''),
        email: String(film.email || ''),
        filmLink: String(film.filmLink || ''),
        twitter: String(film.twitter || ''),
        onlinePremiere: String(film.onlinePremiere || ''),
        completionDate: String(film.completionDate || ''),
        cast: String(film.cast || ''),
        language: String(film.language || '')
      };

      sendAcceptanceEmail(formData, review);
      sendOwnerFilmLiveAlert_(formData);
      return jsonResponse_({
        success: true,
        action: 'manualApprove',
        submissionId: String(body.submissionId || ''),
        emailSent: true
      });
    }

    if (action === 'manualReject') {
      var secret = String(body.secret || '');
      var expected = getWebhookSecret_();
      if (!secret || secret !== expected) {
        return jsonResponse_({ success: false, error: 'Unauthorized' });
      }

      var submissionId = String(body.submissionId || '');
      if (!submissionId) {
        return jsonResponse_({ success: false, error: 'Missing submissionId' });
      }

      var result = manualRejectSubmission_(submissionId);
      return jsonResponse_(result);
    }

    if (action === 'pauseSubmission') {
      var pauseSecret = String(body.secret || '');
      var pauseExpected = getWebhookSecret_();
      if (!pauseSecret || pauseSecret !== pauseExpected) {
        return jsonResponse_({ success: false, error: 'Unauthorized' });
      }
      var pauseSubmissionId = String(body.submissionId || '');
      if (!pauseSubmissionId) {
        return jsonResponse_({ success: false, error: 'Missing submissionId' });
      }
      return jsonResponse_(pauseSubmission_(pauseSubmissionId, body.scheduledDecisionAt || ''));
    }

    if (action === 'resumeSubmission') {
      var resumeSecret = String(body.secret || '');
      var resumeExpected = getWebhookSecret_();
      if (!resumeSecret || resumeSecret !== resumeExpected) {
        return jsonResponse_({ success: false, error: 'Unauthorized' });
      }
      var resumeSubmissionId = String(body.submissionId || '');
      if (!resumeSubmissionId) {
        return jsonResponse_({ success: false, error: 'Missing submissionId' });
      }
      return jsonResponse_(resumeSubmission_(resumeSubmissionId));
    }

    if (action === 'arcTracker') {
      var secret2 = String(body.secret || '');
      var expected2 = getWebhookSecret_();
      if (!secret2 || secret2 !== expected2) {
        return jsonResponse_({ success: false, error: 'Unauthorized' });
      }
      return jsonResponse_({ success: true, arcs: listActiveRejectionArcs_() });
    }

    if (action === 'arcAdvance') {
      var secret3 = String(body.secret || '');
      var expected3 = getWebhookSecret_();
      if (!secret3 || secret3 !== expected3) {
        return jsonResponse_({ success: false, error: 'Unauthorized' });
      }
      var arcId = String(body.arcId || '');
      if (!arcId) {
        return jsonResponse_({ success: false, error: 'Missing arcId' });
      }
      return jsonResponse_(advanceRejectionArcNow_(arcId));
    }

    if (action === 'arcCancel') {
      var secret4 = String(body.secret || '');
      var expected4 = getWebhookSecret_();
      if (!secret4 || secret4 !== expected4) {
        return jsonResponse_({ success: false, error: 'Unauthorized' });
      }
      var arcId2 = String(body.arcId || '');
      if (!arcId2) {
        return jsonResponse_({ success: false, error: 'Missing arcId' });
      }
      return jsonResponse_(cancelRejectionArcNow_(arcId2));
    }

    return jsonResponse_({ success: false, error: 'Invalid action' });
  } catch (error) {
    notifyAdmin_('doPost webhook failed', error);
    Logger.log('doPost webhook error: ' + error);
    return jsonResponse_({ success: false, error: String(error) });
  }
}

function parseWebhookBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  var raw = String(e.postData.contents || '');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj || {}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getWebhookSecret_() {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty('WEBHOOK_SECRET') || getAdminPassword_();
}

function cancelSubmissionTriggerBySubmissionId_(submissionId) {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();
  Object.keys(all).forEach(function(key) {
    if (key.indexOf('trigger_') !== 0) return;
    if (all[key] !== submissionId) return;
    var triggerId = key.replace(/^trigger_/, '');
    try { deleteTrigger(triggerId); } catch (_) {}
    props.deleteProperty(key);
  });
}

function getRejectionArcConfig_() {
  try {
    var adminPassword = getAdminPassword_();
    var res = UrlFetchApp.fetch(CONFIG.API_BASE + '/admin?action=rejectionArc', {
      headers: { 'x-admin-password': adminPassword },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) {
      throw new Error('HTTP ' + res.getResponseCode() + ' ' + res.getContentText());
    }
    var data = JSON.parse(res.getContentText());
    return normalizeRejectionArcConfigForGas_(data && data.config ? data.config : null);
  } catch (error) {
    Logger.log('Failed to fetch rejection arc config: ' + error);
    return null;
  }
}

function normalizeRejectionArcConfigForGas_(raw) {
  var cfg = raw && typeof raw === 'object' ? raw : {};
  var steps = Array.isArray(cfg.steps) ? cfg.steps : [];
  var normalized = [];
  for (var i = 0; i < steps.length; i++) {
    var step = normalizeRejectionArcStepForGas_(steps[i], i);
    if (step && step.enabled) normalized.push(step);
  }
  return {
    enabled: cfg.enabled !== false,
    steps: normalized
  };
}

function normalizeRejectionArcStepForGas_(raw, index) {
  var step = raw && typeof raw === 'object' ? raw : {};
  var delayUnit = String(step.delayUnit || 'hours').toLowerCase();
  if (!REJECTION_ARC_DELAY_MS.hasOwnProperty(delayUnit)) delayUnit = 'hours';
  var delayAmount = Math.max(0, Math.round(Number(step.delayAmount || 0)));
  var stepType = String(step.stepType || 'custom').toLowerCase();
  if (stepType !== 'acceptance_builtin') stepType = 'custom';
  return {
    id: String(step.id || ('step_' + (index + 1))),
    name: String(step.name || ('Email ' + (index + 1))),
    senderName: String(step.senderName || CONFIG.SENDER_NAME),
    subject: String(step.subject || ''),
    body: String(step.body || ''),
    delayAmount: delayAmount,
    delayUnit: delayUnit,
    enabled: step.enabled !== false,
    stepType: stepType,
    triggerAcceptanceFollowup: stepType === 'acceptance_builtin' || step.triggerAcceptanceFollowup === true
  };
}

function generateRejectionArcRandomName_() {
  var first = randomChoice(REJECTION_ARC_FIRST_NAMES);
  var middle = randomChoice(REJECTION_ARC_MIDDLE_NAMES);
  var last = randomChoice(REJECTION_ARC_LAST_NAMES);
  return first + ' ' + middle + ' ' + last;
}

function markRejectionArcStepSent_(arcState, step) {
  if (!arcState || !step) return arcState;
  arcState.sentStepsCount = Math.max(0, Number(arcState.sentStepsCount || 0)) + 1;
  if (!Array.isArray(arcState.sentSteps)) arcState.sentSteps = [];
  arcState.sentSteps.push({
    id: step.id || '',
    name: step.name || '',
    stepType: step.stepType || 'custom',
    sentAt: new Date().toISOString()
  });
  arcState.lastSentAt = new Date().toISOString();
  arcState.lastSentStepName = step.name || step.id || '';
  return arcState;
}

function applyArcTokens_(text, formData, arcState) {
  var out = String(text || '');
  var filmName = (formData && formData.title) ? String(formData.title) : 'your film';
  var submitterName = (formData && formData.director)
    ? String(formatNames(String(formData.director)))
    : 'there';
  var randomName = (arcState && arcState.randomName) ? String(arcState.randomName) : '';
  out = out.replace(/\[FILM NAME\]/g, filmName);
  out = out.replace(/\[SUBMITTERS NAME\]/g, submitterName);
  out = out.replace(/\[RANDOM NAME\]/g, randomName);
  return out;
}

function sendRejectionArcCustomEmail_(step, formData, arcState) {
  var recipient = normalizeEmail_(formData && formData.email);
  if (!recipient) throw new Error('Missing/invalid recipient email (rejection arc custom step).');
  var subject = applyArcTokens_(step.subject || 'Your submission to Shorts of the Year', formData, arcState);
  var body = applyArcTokens_(step.body || '', formData, arcState);
  var senderName = applyArcTokens_(step.senderName || CONFIG.SENDER_NAME, formData, arcState);
  var htmlBody = plainTextToHtmlEmail_(body);
  sendEmailWithBcc_(recipient, subject, body, htmlBody, senderName);
}

function executeRejectionArcStep_(step, arcState) {
  var formData = arcState && arcState.formData ? arcState.formData : {};
  if (!step || !step.enabled) return arcState;
  if (step.stepType === 'acceptance_builtin') {
    var review = generateReview(formData);
    sendAcceptanceEmail(formData, review);
    if (arcState && arcState.submissionId) {
      schedulePublishTrigger_(arcState.submissionId, formData, review);
    }
    arcState.acceptanceTriggered = true;
    arcState.acceptanceTriggeredAt = new Date().toISOString();
    arcState = markRejectionArcStepSent_(arcState, step);
    Logger.log('Rejection arc acceptance step sent for ' + (formData.title || '(no title)'));
    return arcState;
  }

  sendRejectionArcCustomEmail_(step, formData, arcState);
  arcState = markRejectionArcStepSent_(arcState, step);
  Logger.log('Rejection arc step sent: ' + (step.name || step.id || '(unnamed)') + ' for ' + (formData.title || '(no title)'));
  return arcState;
}

function saveRejectionArcState_(stateKey, arcState) {
  PropertiesService.getScriptProperties().setProperty(stateKey, JSON.stringify(arcState));
}

function scheduleRejectionArcStepTrigger_(arcStateKey, arcState, scheduledStep) {
  var props = PropertiesService.getScriptProperties();
  var unitMs = REJECTION_ARC_DELAY_MS[scheduledStep.delayUnit] || REJECTION_ARC_DELAY_MS.hours;
  var delayMs = Math.max(0, Number(scheduledStep.delayAmount || 0)) * unitMs;
  var runAt = new Date(Date.now() + delayMs);
  // Apps Script time-based triggers are more reliable at least ~1 minute ahead.
  if (runAt.getTime() - Date.now() < 60 * 1000) {
    runAt = new Date(Date.now() + 60 * 1000);
  }

  var payloadKey = 'rejection_arc_step_' + arcState.arcId + '_' + Math.random().toString(36).slice(2, 8);
  props.setProperty(payloadKey, JSON.stringify({
    arcStateKey: arcStateKey,
    stepIndex: Number(scheduledStep.stepIndex || 0),
    stepId: scheduledStep.stepId || ('step_' + (Number(scheduledStep.stepIndex || 0) + 1))
  }));

  var trigger = null;
  try {
    trigger = ScriptApp.newTrigger('processRejectionArcStep')
      .timeBased()
      .at(runAt)
      .create();
  } catch (err) {
    var msg = String(err || '');
    if (/too many triggers/i.test(msg)) {
      cleanupStaleRejectionArcTriggerMappings_();
      trigger = ScriptApp.newTrigger('processRejectionArcStep')
        .timeBased()
        .at(runAt)
        .create();
    } else {
      throw err;
    }
  }
  props.setProperty('rejection_arc_trigger_' + trigger.getUniqueId(), payloadKey);

  if (!arcState.scheduledStepPayloadKeys) arcState.scheduledStepPayloadKeys = [];
  arcState.scheduledStepPayloadKeys.push(payloadKey);
  if (!Array.isArray(arcState.scheduledSteps)) arcState.scheduledSteps = [];
  arcState.scheduledSteps.push({
    payloadKey: payloadKey,
    stepId: scheduledStep.stepId || ('step_' + (Number(scheduledStep.stepIndex || 0) + 1)),
    stepName: scheduledStep.stepName || ('Email ' + (Number(scheduledStep.stepIndex || 0) + 1)),
    stepType: scheduledStep.stepType || 'custom',
    delayAmount: Math.max(0, Number(scheduledStep.delayAmount || 0)),
    delayUnit: scheduledStep.delayUnit || 'hours',
    runAt: runAt.toISOString()
  });
  Logger.log(
    'Scheduled rejection arc step ' +
    (scheduledStep.stepName || scheduledStep.stepId || Number(scheduledStep.stepIndex || 0)) +
    ' at ' + runAt.toISOString()
  );
}

function cleanupStaleRejectionArcTriggerMappings_() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();
  var liveTriggers = ScriptApp.getProjectTriggers();
  var liveTriggerIds = {};
  liveTriggers.forEach(function(t) {
    liveTriggerIds[t.getUniqueId()] = t;
  });

  Object.keys(all).forEach(function(key) {
    if (key.indexOf('rejection_arc_trigger_') !== 0) return;
    var triggerId = key.replace(/^rejection_arc_trigger_/, '');
    var payloadKey = all[key];
    if (!liveTriggerIds[triggerId]) {
      props.deleteProperty(key);
      if (payloadKey) props.deleteProperty(payloadKey);
      return;
    }

    var payloadJson = payloadKey ? props.getProperty(payloadKey) : '';
    if (!payloadJson) {
      try { ScriptApp.deleteTrigger(liveTriggerIds[triggerId]); } catch (_) {}
      props.deleteProperty(key);
      if (payloadKey) props.deleteProperty(payloadKey);
      return;
    }

    try {
      var payload = JSON.parse(payloadJson);
      var stateKey = payload && payload.arcStateKey ? String(payload.arcStateKey) : '';
      if (!stateKey || !props.getProperty(stateKey)) {
        try { ScriptApp.deleteTrigger(liveTriggerIds[triggerId]); } catch (_) {}
        props.deleteProperty(key);
        if (payloadKey) props.deleteProperty(payloadKey);
      }
    } catch (_) {
      try { ScriptApp.deleteTrigger(liveTriggerIds[triggerId]); } catch (_) {}
      props.deleteProperty(key);
      if (payloadKey) props.deleteProperty(payloadKey);
    }
  });

  // Remove orphan processRejectionArcStep triggers that have no mapping.
  liveTriggers.forEach(function(t) {
    var fn = String(t.getHandlerFunction() || '');
    if (fn !== 'processRejectionArcStep') return;
    var triggerId = t.getUniqueId();
    var mapKey = 'rejection_arc_trigger_' + triggerId;
    if (!props.getProperty(mapKey)) {
      try { ScriptApp.deleteTrigger(t); } catch (_) {}
    }
  });
}

function cleanupStalePointerTriggers_(pointerPrefix, handlerName) {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();
  var liveTriggers = ScriptApp.getProjectTriggers();
  var liveById = {};
  liveTriggers.forEach(function(t) {
    liveById[t.getUniqueId()] = t;
  });

  Object.keys(all).forEach(function(key) {
    if (key.indexOf(pointerPrefix) !== 0) return;
    var triggerId = key.replace(new RegExp('^' + pointerPrefix), '');
    var payloadKey = all[key];
    var trigger = liveById[triggerId];

    if (!trigger) {
      props.deleteProperty(key);
      if (payloadKey) props.deleteProperty(payloadKey);
      return;
    }

    var payloadJson = payloadKey ? props.getProperty(payloadKey) : '';
    if (!payloadJson) {
      try { ScriptApp.deleteTrigger(trigger); } catch (_) {}
      props.deleteProperty(key);
      if (payloadKey) props.deleteProperty(payloadKey);
    }
  });

  liveTriggers.forEach(function(t) {
    var fn = String(t.getHandlerFunction() || '');
    if (fn !== handlerName) return;
    var mapKey = pointerPrefix + t.getUniqueId();
    if (!props.getProperty(mapKey)) {
      try { ScriptApp.deleteTrigger(t); } catch (_) {}
    }
  });
}

function ensureSingleOnFormSubmitTrigger_() {
  var formSubmitTriggers = ScriptApp.getProjectTriggers().filter(function(t) {
    var fn = String(t.getHandlerFunction() || '');
    return fn === 'onFormSubmit' && String(t.getEventType && t.getEventType() || '') === 'ON_FORM_SUBMIT';
  });
  if (formSubmitTriggers.length <= 1) return;
  for (var i = 1; i < formSubmitTriggers.length; i++) {
    try { ScriptApp.deleteTrigger(formSubmitTriggers[i]); } catch (_) {}
  }
}

function autoWorkflowMaintenance_() {
  cleanupStaleRejectionArcTriggerMappings_();
  cleanupStalePointerTriggers_('trigger_', 'processSubmission');
  cleanupStalePointerTriggers_('publish_trigger_', 'publishAcceptedSubmission');
  ensureSingleOnFormSubmitTrigger_();
}

// One-time maintenance helper: cancels all active rejection arc schedules/states.
// Run manually from Apps Script editor only if you need a clean reset.
function purgeAllRejectionArcState_() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();
  var triggerMap = {};
  Object.keys(all).forEach(function(key) {
    if (key.indexOf('rejection_arc_trigger_') === 0) {
      var triggerId = key.replace(/^rejection_arc_trigger_/, '');
      triggerMap[triggerId] = all[key] || '';
    }
  });

  ScriptApp.getProjectTriggers().forEach(function(t) {
    var fn = String(t.getHandlerFunction() || '');
    if (fn !== 'processRejectionArcStep') return;
    var tid = t.getUniqueId();
    try { ScriptApp.deleteTrigger(t); } catch (_) {}
    var payloadKey = triggerMap[tid];
    if (payloadKey) props.deleteProperty(payloadKey);
    props.deleteProperty('rejection_arc_trigger_' + tid);
  });

  Object.keys(all).forEach(function(key) {
    if (key.indexOf('rejection_arc_state_') === 0 || key.indexOf('rejection_arc_step_') === 0 || key.indexOf('rejection_arc_trigger_') === 0) {
      props.deleteProperty(key);
    }
  });
}

// Emergency maintenance: clears time-based workflow trigger backlog
// and matching script properties for submissions/publish/rejection-arc flows.
// Does NOT remove the form submit trigger itself.
function resetWorkflowTriggerBacklog_() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();
  var triggerPayloadPrefixes = ['trigger_', 'publish_trigger_', 'rejection_arc_trigger_'];
  var payloadKeyPrefixes = ['publish_', 'rejection_arc_step_', 'rejection_arc_state_'];

  ScriptApp.getProjectTriggers().forEach(function(t) {
    var fn = String(t.getHandlerFunction() || '');
    if (fn !== 'processSubmission' && fn !== 'publishAcceptedSubmission' && fn !== 'processRejectionArcStep') return;
    var tid = t.getUniqueId();
    try { ScriptApp.deleteTrigger(t); } catch (_) {}
    triggerPayloadPrefixes.forEach(function(prefix) {
      var pointerKey = prefix + tid;
      var payloadKey = props.getProperty(pointerKey);
      props.deleteProperty(pointerKey);
      if (payloadKey) props.deleteProperty(payloadKey);
    });
  });

  Object.keys(all).forEach(function(key) {
    for (var i = 0; i < payloadKeyPrefixes.length; i++) {
      if (key.indexOf(payloadKeyPrefixes[i]) === 0) {
        props.deleteProperty(key);
        return;
      }
    }
  });
}

function scheduleNextRejectionArcStep_(arcStateKey, arcState) {
  if (!arcState || !Array.isArray(arcState.futureSteps) || arcState.futureSteps.length === 0) return false;
  var next = arcState.futureSteps.shift();
  if (!next) return false;
  scheduleRejectionArcStepTrigger_(arcStateKey, arcState, next);
  return true;
}

function startConfiguredRejectionArcOrFallback_(formData, submissionId) {
  var config = getRejectionArcConfig_();
  if (!config || config.enabled === false || !config.steps || config.steps.length === 0) {
    sendRejectionEmail(formData);
    deleteFromMongo(submissionId);
    return { mode: 'simple', started: false, hasAcceptanceStep: false, pendingRecordRetained: false };
  }

  var arcId = 'arc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  var arcStateKey = 'rejection_arc_state_' + arcId;
  var hasAcceptanceStep = config.steps.some(function(step) { return step.stepType === 'acceptance_builtin'; });
  var arcState = {
    arcId: arcId,
    submissionId: submissionId,
    formData: formData,
    randomName: generateRejectionArcRandomName_(),
    createdAt: new Date().toISOString(),
    acceptanceTriggered: false,
    hasAcceptanceStep: hasAcceptanceStep,
    mongoDeleted: false,
    scheduledStepPayloadKeys: [],
    scheduledSteps: [],
    futureSteps: [],
    sentStepsCount: 0,
    sentSteps: [],
    totalStepCount: config.steps.length
  };

  var queuedMode = false;
  for (var i = 0; i < config.steps.length; i++) {
    var step = config.steps[i];
    var unitMs = REJECTION_ARC_DELAY_MS[step.delayUnit] || REJECTION_ARC_DELAY_MS.hours;
    var delayMs = Math.max(0, Number(step.delayAmount || 0)) * unitMs;
    if (!queuedMode && delayMs <= 0) {
      arcState = executeRejectionArcStep_(step, arcState);
      continue;
    }
    queuedMode = true;
    arcState.futureSteps.push({
      stepIndex: i,
      stepId: step.id || ('step_' + (i + 1)),
      stepName: step.name || ('Email ' + (i + 1)),
      stepType: step.stepType || 'custom',
      delayAmount: Math.max(0, Number(step.delayAmount || 0)),
      delayUnit: step.delayUnit || 'hours'
    });
  }

  if (!hasAcceptanceStep) {
    deleteFromMongo(submissionId);
    arcState.mongoDeleted = true;
  }

  if (arcState.futureSteps.length > 0) {
    scheduleNextRejectionArcStep_(arcStateKey, arcState);
  }

  if (arcState.scheduledStepPayloadKeys.length > 0 || (arcState.futureSteps && arcState.futureSteps.length > 0)) {
    saveRejectionArcState_(arcStateKey, arcState);
  } else {
    // Arc completed synchronously
    if (!arcState.mongoDeleted && !arcState.acceptanceTriggered && !hasAcceptanceStep) {
      deleteFromMongo(submissionId);
    }
  }

  Logger.log(
    'Rejection arc started for ' + (formData.title || '(no title)') +
    ' with ' + config.steps.length + ' step(s); random name: ' + arcState.randomName
  );
  return {
    mode: 'arc',
    started: true,
    arcId: arcId,
    hasAcceptanceStep: hasAcceptanceStep,
    pendingRecordRetained: !!hasAcceptanceStep
  };
}

function processRejectionArcStep(e) {
  var props = PropertiesService.getScriptProperties();
  var triggerId = e && e.triggerUid ? e.triggerUid : null;
  var payloadKey = null;
  var arcStateKey = null;
  try {
    if (!triggerId) throw new Error('Missing triggerUid for processRejectionArcStep');
    payloadKey = props.getProperty('rejection_arc_trigger_' + triggerId);
    if (!payloadKey) throw new Error('No rejection arc payload key for trigger ' + triggerId);
    var payloadJson = props.getProperty(payloadKey);
    if (!payloadJson) throw new Error('No rejection arc payload for key ' + payloadKey);
    var payload = JSON.parse(payloadJson);
    arcStateKey = String(payload.arcStateKey || '');
    if (!arcStateKey) throw new Error('Arc payload missing arcStateKey');

    var arcStateJson = props.getProperty(arcStateKey);
    if (!arcStateJson) throw new Error('No arc state for ' + arcStateKey);
    var arcState = JSON.parse(arcStateJson);

    var config = getRejectionArcConfig_();
    if (!config || !config.enabled) throw new Error('Rejection arc config disabled or unavailable');

    var step = null;
    if (payload.stepId) {
      step = (config.steps || []).find(function(s) { return s.id === payload.stepId; }) || null;
    }
    if (!step && typeof payload.stepIndex === 'number') {
      step = config.steps[payload.stepIndex] || null;
    }
    if (!step) throw new Error('Scheduled rejection arc step not found in current config');

    arcState = executeRejectionArcStep_(step, arcState);

    if (Array.isArray(arcState.scheduledStepPayloadKeys)) {
      arcState.scheduledStepPayloadKeys = arcState.scheduledStepPayloadKeys.filter(function(k) { return k !== payloadKey; });
    }
    if (Array.isArray(arcState.scheduledSteps)) {
      arcState.scheduledSteps = arcState.scheduledSteps.filter(function(s) { return s && s.payloadKey !== payloadKey; });
    }

    if (!arcState.scheduledStepPayloadKeys || arcState.scheduledStepPayloadKeys.length === 0) {
      var queuedNext = scheduleNextRejectionArcStep_(arcStateKey, arcState);
      if (!queuedNext) {
        props.deleteProperty(arcStateKey);
      } else {
        saveRejectionArcState_(arcStateKey, arcState);
      }
    } else {
      saveRejectionArcState_(arcStateKey, arcState);
    }
  } catch (error) {
    notifyAdmin_('processRejectionArcStep failed', error);
    Logger.log('Error in processRejectionArcStep: ' + error);
  } finally {
    if (payloadKey) props.deleteProperty(payloadKey);
    if (triggerId) {
      props.deleteProperty('rejection_arc_trigger_' + triggerId);
      deleteTrigger(triggerId);
    }
  }
}

function listActiveRejectionArcs_() {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();
  var arcs = [];
  Object.keys(all).forEach(function(key) {
    if (key.indexOf('rejection_arc_state_') !== 0) return;
    try {
      var arc = JSON.parse(all[key]);
      if (!arc || typeof arc !== 'object') return;
      var arcId = arc.arcId || key.replace(/^rejection_arc_state_/, '');
      if (props.getProperty('rejection_arc_canceled_' + arcId)) {
        return;
      }
      var formData = arc.formData || {};
      var scheduledSteps = Array.isArray(arc.scheduledSteps) ? arc.scheduledSteps.slice() : [];
      scheduledSteps.sort(function(a, b) {
        var at = a && a.runAt ? new Date(a.runAt).getTime() : 0;
        var bt = b && b.runAt ? new Date(b.runAt).getTime() : 0;
        return at - bt;
      });
      var nextStep = scheduledSteps.length ? scheduledSteps[0] : null;
      arcs.push({
        arcId: arcId,
        submissionId: arc.submissionId || '',
        title: String(formData.title || ''),
        submitterName: String(formData.director || ''),
        recipient: String(formData.email || ''),
        randomName: String(arc.randomName || ''),
        sentCount: Math.max(0, Number(arc.sentStepsCount || 0)),
        totalCount: Math.max(0, Number(arc.totalStepCount || 0)),
        acceptanceTriggered: arc.acceptanceTriggered === true,
        createdAt: arc.createdAt || null,
        lastSentAt: arc.lastSentAt || null,
        lastSentStepName: arc.lastSentStepName || '',
        nextStepName: nextStep ? String(nextStep.stepName || '') : '',
        nextStepAt: nextStep ? (nextStep.runAt || null) : null
      });
    } catch (error) {
      Logger.log('Failed to parse rejection arc state for tracker: ' + key + ' ' + error);
    }
  });
  arcs.sort(function(a, b) {
    var at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    var bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });
  return arcs;
}

function cancelRejectionArcTriggerByPayloadKey_(payloadKey) {
  if (!payloadKey) return;
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();
  Object.keys(all).forEach(function(key) {
    if (key.indexOf('rejection_arc_trigger_') !== 0) return;
    if (all[key] !== payloadKey) return;
    var triggerId = key.replace(/^rejection_arc_trigger_/, '');
    try { deleteTrigger(triggerId); } catch (_) {}
    props.deleteProperty(key);
  });
}

function cancelRejectionArcByStateKey_(arcStateKey) {
  var props = PropertiesService.getScriptProperties();
  var arcStateJson = props.getProperty(arcStateKey);
  if (!arcStateJson) return { success: false, error: 'Arc not found' };
  var arcState = JSON.parse(arcStateJson);
  var arcId = arcState.arcId || arcStateKey.replace(/^rejection_arc_state_/, '');
  var payloadKeys = Array.isArray(arcState.scheduledStepPayloadKeys) ? arcState.scheduledStepPayloadKeys.slice() : [];
  payloadKeys.forEach(function(payloadKey) {
    try { cancelRejectionArcTriggerByPayloadKey_(payloadKey); } catch (_) {}
    props.deleteProperty(payloadKey);
  });
  props.setProperty('rejection_arc_canceled_' + arcId, new Date().toISOString());
  props.deleteProperty(arcStateKey);
  return {
    success: true,
    arcId: arcId,
    submissionId: arcState.submissionId || '',
    canceledSteps: payloadKeys.length,
    sentCount: Math.max(0, Number(arcState.sentStepsCount || 0)),
    totalCount: Math.max(0, Number(arcState.totalStepCount || 0))
  };
}

function advanceRejectionArcNow_(arcId) {
  var props = PropertiesService.getScriptProperties();
  var arcStateKey = 'rejection_arc_state_' + arcId;
  var arcStateJson = props.getProperty(arcStateKey);
  if (!arcStateJson) {
    return { success: false, error: 'Arc not found', arcId: arcId };
  }

  try {
    var arcState = JSON.parse(arcStateJson);
    var scheduledSteps = Array.isArray(arcState.scheduledSteps) ? arcState.scheduledSteps.slice() : [];
    if (!scheduledSteps.length) {
      return { success: false, error: 'No scheduled steps to advance', arcId: arcId };
    }

    scheduledSteps.sort(function(a, b) {
      var at = a && a.runAt ? new Date(a.runAt).getTime() : 0;
      var bt = b && b.runAt ? new Date(b.runAt).getTime() : 0;
      return at - bt;
    });
    var nextScheduled = scheduledSteps[0];
    var payloadKey = nextScheduled.payloadKey;
    if (!payloadKey) {
      return { success: false, error: 'Next scheduled step payload missing', arcId: arcId };
    }

    var payloadJson = props.getProperty(payloadKey);
    if (!payloadJson) {
      // Clean stale schedule refs if payload is missing.
      if (Array.isArray(arcState.scheduledStepPayloadKeys)) {
        arcState.scheduledStepPayloadKeys = arcState.scheduledStepPayloadKeys.filter(function(k) { return k !== payloadKey; });
      }
      if (Array.isArray(arcState.scheduledSteps)) {
        arcState.scheduledSteps = arcState.scheduledSteps.filter(function(s) { return s && s.payloadKey !== payloadKey; });
      }
      saveRejectionArcState_(arcStateKey, arcState);
      return { success: false, error: 'Scheduled step payload not found', arcId: arcId };
    }

    var payload = JSON.parse(payloadJson);
    var config = getRejectionArcConfig_();
    if (!config || !config.enabled) {
      return { success: false, error: 'Rejection arc config disabled or unavailable', arcId: arcId };
    }

    var step = null;
    if (payload.stepId) {
      step = (config.steps || []).find(function(s) { return s.id === payload.stepId; }) || null;
    }
    if (!step && typeof payload.stepIndex === 'number') {
      step = config.steps[payload.stepIndex] || null;
    }
    if (!step) {
      return { success: false, error: 'Step not found in current config', arcId: arcId };
    }

    arcState = executeRejectionArcStep_(step, arcState);

    if (Array.isArray(arcState.scheduledStepPayloadKeys)) {
      arcState.scheduledStepPayloadKeys = arcState.scheduledStepPayloadKeys.filter(function(k) { return k !== payloadKey; });
    }
    if (Array.isArray(arcState.scheduledSteps)) {
      arcState.scheduledSteps = arcState.scheduledSteps.filter(function(s) { return s && s.payloadKey !== payloadKey; });
    }

    cancelRejectionArcTriggerByPayloadKey_(payloadKey);
    props.deleteProperty(payloadKey);

    if (!arcState.scheduledStepPayloadKeys || arcState.scheduledStepPayloadKeys.length === 0) {
      var queuedNext2 = scheduleNextRejectionArcStep_(arcStateKey, arcState);
      if (!queuedNext2) {
        props.deleteProperty(arcStateKey);
      } else {
        saveRejectionArcState_(arcStateKey, arcState);
      }
    } else {
      saveRejectionArcState_(arcStateKey, arcState);
    }

    return {
      success: true,
      arcId: arcId,
      advancedStepName: step.name || step.id || '',
      sentCount: Math.max(0, Number(arcState.sentStepsCount || 0)),
      totalCount: Math.max(0, Number(arcState.totalStepCount || 0))
    };
  } catch (error) {
    notifyAdmin_('advanceRejectionArcNow failed', error);
    Logger.log('advanceRejectionArcNow error: ' + error);
    return { success: false, error: String(error), arcId: arcId };
  }
}

function cancelRejectionArcNow_(arcId) {
  var arcStateKey = 'rejection_arc_state_' + arcId;
  try {
    var props = PropertiesService.getScriptProperties();
    if (!props.getProperty(arcStateKey) && props.getProperty('rejection_arc_canceled_' + arcId)) {
      return { success: true, arcId: arcId, submissionId: '', canceledSteps: 0, sentCount: 0, totalCount: 0 };
    }
    return cancelRejectionArcByStateKey_(arcStateKey);
  } catch (error) {
    notifyAdmin_('cancelRejectionArcNow failed', error);
    Logger.log('cancelRejectionArcNow error: ' + error);
    return { success: false, error: String(error), arcId: arcId };
  }
}

// Manual maintenance helper for a single stuck arc.
// Run from Apps Script editor with the exact arc id, for example:
// forceDeleteRejectionArcById_('arc_12345_abcd')
function forceDeleteRejectionArcById_(arcId) {
  var id = String(arcId || '').trim();
  if (!id) throw new Error('Missing arcId');
  var props = PropertiesService.getScriptProperties();
  var stateKey = 'rejection_arc_state_' + id;
  var stateJson = props.getProperty(stateKey);
  var state = null;
  if (stateJson) {
    try { state = JSON.parse(stateJson); } catch (_) {}
  }

  var payloadKeys = state && Array.isArray(state.scheduledStepPayloadKeys)
    ? state.scheduledStepPayloadKeys.slice()
    : [];

  payloadKeys.forEach(function(payloadKey) {
    try { cancelRejectionArcTriggerByPayloadKey_(payloadKey); } catch (_) {}
    props.deleteProperty(payloadKey);
  });

  var all = props.getProperties();
  Object.keys(all).forEach(function(key) {
    if (key.indexOf('rejection_arc_trigger_') !== 0) return;
    var payloadKey = all[key];
    if (!payloadKey) return;
    var payloadJson = props.getProperty(payloadKey);
    if (!payloadJson) return;
    try {
      var payload = JSON.parse(payloadJson);
      if (String(payload.arcStateKey || '') === stateKey) {
        try { cancelRejectionArcTriggerByPayloadKey_(payloadKey); } catch (_) {}
        props.deleteProperty(payloadKey);
      }
    } catch (_) {}
  });

  props.setProperty('rejection_arc_canceled_' + id, new Date().toISOString());
  props.deleteProperty(stateKey);

  return {
    success: true,
    arcId: id,
    submissionId: state && state.submissionId ? state.submissionId : '',
    removed: true
  };
}

function manualRejectSubmission_(submissionId) {
  var props = PropertiesService.getScriptProperties();
  var formDataJson = props.getProperty(submissionId);
  if (!formDataJson) {
    var fallbackFilm = getFilmBySubmissionId_(submissionId);
    if (fallbackFilm) {
      var fallbackArcStart = startConfiguredRejectionArcOrFallback_(fallbackFilm, submissionId);
      cancelSubmissionTriggerBySubmissionId_(submissionId);
      Logger.log('Manual rejection flow started from Mongo fallback: ' + submissionId);
      return {
        success: true,
        submissionId: submissionId,
        rejectionMode: fallbackArcStart && fallbackArcStart.mode ? fallbackArcStart.mode : 'simple',
        rejectionArcStarted: !!(fallbackArcStart && fallbackArcStart.started),
        rejectionArcId: fallbackArcStart && fallbackArcStart.arcId ? fallbackArcStart.arcId : '',
        rejectionArcHasAcceptanceStep: !!(fallbackArcStart && fallbackArcStart.hasAcceptanceStep),
        rejectionArcPendingRetained: !!(fallbackArcStart && fallbackArcStart.pendingRecordRetained)
      };
    }

    cancelSubmissionTriggerBySubmissionId_(submissionId);
    deleteFromMongo(submissionId);
    return { success: false, error: 'Submission data not found (email not sent)', submissionId: submissionId };
  }

  var formData = JSON.parse(formDataJson);
  var arcStart = startConfiguredRejectionArcOrFallback_(formData, submissionId);
  cancelSubmissionTriggerBySubmissionId_(submissionId);
  props.deleteProperty(submissionId);

  Logger.log('Manual rejection flow started: ' + submissionId);
  return {
    success: true,
    submissionId: submissionId,
    rejectionMode: arcStart && arcStart.mode ? arcStart.mode : 'simple',
    rejectionArcStarted: !!(arcStart && arcStart.started),
    rejectionArcId: arcStart && arcStart.arcId ? arcStart.arcId : '',
    rejectionArcHasAcceptanceStep: !!(arcStart && arcStart.hasAcceptanceStep),
    rejectionArcPendingRetained: !!(arcStart && arcStart.pendingRecordRetained)
  };
}

function schedulePublishTrigger_(submissionId, formData, review) {
  autoWorkflowMaintenance_();
  const props = PropertiesService.getScriptProperties();
  const publishTime = new Date(Date.now() + CONFIG.PUBLISH_DELAY_HOURS_AFTER_ACCEPTANCE * 60 * 60 * 1000);
  const publishPayloadKey =
    'publish_' + submissionId + '_' + Math.random().toString(36).slice(2, 8);

  props.setProperty(publishPayloadKey, JSON.stringify({
    submissionId: submissionId,
    title: formData && formData.title ? formData.title : '',
    review: review || '',
    scheduledAt: publishTime.toISOString()
  }));

  const publishTrigger = ScriptApp.newTrigger('publishAcceptedSubmission')
    .timeBased()
    .at(publishTime)
    .create();

  props.setProperty('publish_trigger_' + publishTrigger.getUniqueId(), publishPayloadKey);
  Logger.log(
    'Scheduled publish for ' + submissionId + ' at ' + publishTime.toISOString() +
    ' (+' + CONFIG.PUBLISH_DELAY_HOURS_AFTER_ACCEPTANCE + 'h after acceptance email)'
  );
}

function findSubmissionTriggerId_(submissionId) {
  var props = PropertiesService.getScriptProperties();
  var all = props.getProperties();
  var liveTriggers = ScriptApp.getProjectTriggers();
  var liveTriggerIds = {};
  liveTriggers.forEach(function(t) {
    if (String(t.getHandlerFunction() || '') === 'processSubmission') {
      liveTriggerIds[t.getUniqueId()] = true;
    }
  });

  var keys = Object.keys(all);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key.indexOf('trigger_') !== 0) continue;
    if (all[key] !== submissionId) continue;
    var triggerId = key.replace(/^trigger_/, '');
    if (liveTriggerIds[triggerId]) return triggerId;
  }
  return '';
}

function pauseSubmission_(submissionId, scheduledDecisionAt) {
  var props = PropertiesService.getScriptProperties();
  var formDataJson = props.getProperty(submissionId);
  if (!formDataJson) {
    return { success: false, error: 'No active Apps Script submission data for ' + submissionId };
  }

  var triggerId = findSubmissionTriggerId_(submissionId);
  var now = Date.now();
  var scheduledMs = scheduledDecisionAt ? new Date(String(scheduledDecisionAt)).getTime() : NaN;
  var remainingMs = Number.isFinite(scheduledMs) ? Math.max(60 * 1000, scheduledMs - now) : 0;
  if (!remainingMs) {
    remainingMs = Math.round(
      (Math.random() * (CONFIG.MAX_DELAY_HOURS - CONFIG.MIN_DELAY_HOURS) + CONFIG.MIN_DELAY_HOURS)
      * 60 * 60 * 1000
    );
  }

  if (triggerId) {
    deleteTrigger(triggerId);
    props.deleteProperty('trigger_' + triggerId);
  }

  var pausedAt = new Date().toISOString();
  props.setProperty('paused_' + submissionId, JSON.stringify({
    submissionId: submissionId,
    pausedAt: pausedAt,
    remainingMs: remainingMs
  }));

  return {
    success: true,
    submissionId: submissionId,
    pausedAt: pausedAt,
    remainingMs: remainingMs,
    triggerDeleted: !!triggerId
  };
}

function resumeSubmission_(submissionId) {
  var props = PropertiesService.getScriptProperties();
  var formDataJson = props.getProperty(submissionId);
  if (!formDataJson) {
    return { success: false, error: 'No active Apps Script submission data for ' + submissionId };
  }

  var existingTriggerId = findSubmissionTriggerId_(submissionId);
  if (existingTriggerId) {
    return { success: false, error: 'Submission already has an active trigger' };
  }

  var pausedJson = props.getProperty('paused_' + submissionId);
  var paused = {};
  try { paused = pausedJson ? JSON.parse(pausedJson) : {}; } catch (_) {}
  var remainingMs = Math.max(60 * 1000, Number(paused.remainingMs || 0));
  if (!remainingMs) {
    remainingMs = Math.round(
      (Math.random() * (CONFIG.MAX_DELAY_HOURS - CONFIG.MIN_DELAY_HOURS) + CONFIG.MIN_DELAY_HOURS)
      * 60 * 60 * 1000
    );
  }

  var scheduledAt = new Date(Date.now() + remainingMs);
  var trigger = ScriptApp.newTrigger('processSubmission')
    .timeBased()
    .at(scheduledAt)
    .create();

  props.setProperty('trigger_' + trigger.getUniqueId(), submissionId);
  props.deleteProperty('paused_' + submissionId);

  return {
    success: true,
    submissionId: submissionId,
    scheduledDecisionAt: scheduledAt.toISOString(),
    remainingMs: remainingMs,
    triggerId: trigger.getUniqueId()
  };
}

function processSubmission(e) {
  const props = PropertiesService.getScriptProperties();
  const triggerId = e && e.triggerUid ? e.triggerUid : null;
  let submissionId = null;

  try {
    if (!triggerId) throw new Error('Missing triggerUid');

    submissionId = props.getProperty('trigger_' + triggerId);
    if (!submissionId) throw new Error('No submission ID for trigger ' + triggerId);

    const formDataJson = props.getProperty(submissionId);
    if (!formDataJson) throw new Error('No submission data for ' + submissionId);

    const formData = JSON.parse(formDataJson);
    Logger.log('Processing: ' + (formData.title || '(no title)'));

    const isAccepted = Math.random() < CONFIG.ACCEPTANCE_RATE;
    if (isAccepted) {
      handleAcceptance(formData, submissionId);
    } else {
      handleRejection(formData, submissionId);
    }
  } catch (error) {
    notifyAdmin_('processSubmission failed', error);
    Logger.log('Error in processSubmission: ' + error);
  } finally {
    if (submissionId) props.deleteProperty(submissionId);
    if (triggerId) {
      props.deleteProperty('trigger_' + triggerId);
      deleteTrigger(triggerId);
    }
  }
}

function handleAcceptance(formData, submissionId) {
  const review = generateReview(formData);
  const approved = approveInMongo(submissionId, review);
  if (!approved || approved.success !== true) {
    throw new Error('approveInMongo failed during acceptance for ' + submissionId);
  }
  sendAcceptanceEmail(formData, review);
  sendOwnerFilmLiveAlert_(Object.assign({}, formData, {
    slug: approved.slug || formData.slug || '',
    email: approved.email || formData.email || '',
    title: approved.title || formData.title || '',
    director: approved.director || formData.director || ''
  }));
  Logger.log('Acceptance email sent; film published immediately: ' + (formData.title || '(no title)'));
}

function handleRejection(formData, submissionId) {
  startConfiguredRejectionArcOrFallback_(formData, submissionId);
  Logger.log('Rejected: ' + (formData.title || '(no title)'));
}

function publishAcceptedSubmission(e) {
  const props = PropertiesService.getScriptProperties();
  const triggerId = e && e.triggerUid ? e.triggerUid : null;
  let publishPayloadKey = null;
  let shouldDeletePayload = false;

  try {
    if (!triggerId) throw new Error('Missing triggerUid for publishAcceptedSubmission');

    publishPayloadKey = props.getProperty('publish_trigger_' + triggerId);
    if (!publishPayloadKey) throw new Error('No publish payload key for trigger ' + triggerId);

    const payloadJson = props.getProperty(publishPayloadKey);
    if (!payloadJson) throw new Error('No publish payload for key ' + publishPayloadKey);

    const payload = JSON.parse(payloadJson);
    if (!payload.submissionId) throw new Error('Publish payload missing submissionId');

    const approved = approveInMongo(payload.submissionId, payload.review || '');
    if (!approved || approved.success !== true) {
      throw new Error('approveInMongo failed during delayed publish for ' + payload.submissionId);
    }

    sendFilmNowLiveEmail_({
      title: approved.title || payload.title || '',
      director: approved.director || '',
      email: approved.email || '',
      slug: approved.slug || ''
    });
    sendOwnerFilmLiveAlert_({
      title: approved.title || payload.title || '',
      director: approved.director || '',
      email: approved.email || '',
      slug: approved.slug || ''
    });

    shouldDeletePayload = true;
    Logger.log('Published after delayed acceptance: ' + (payload.title || payload.submissionId));
  } catch (error) {
    notifyAdmin_('publishAcceptedSubmission failed', error);
    Logger.log('Error in publishAcceptedSubmission: ' + error);
  } finally {
    if (shouldDeletePayload && publishPayloadKey) props.deleteProperty(publishPayloadKey);
    if (triggerId) {
      props.deleteProperty('publish_trigger_' + triggerId);
      deleteTrigger(triggerId);
    }
  }
}

// ==================== REVIEW GENERATION ====================

function parseDirectorNames(str) {
  return String(str || '').split(',').map(function(n) { return n.trim(); }).filter(Boolean);
}

function formatNames(str) {
  const names = parseDirectorNames(str);
  if (names.length === 0) return 'the director';
  if (names.length === 1) return names[0];
  if (names.length === 2) return names[0] + ' and ' + names[1];
  return names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
}

function escapeRegex_(str) {
  return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyDirectorAgreement_(text, director, isPlural) {
  if (!isPlural) return text;

  var out = text;
  var directVerbPairs = [
    ['is', 'are'],
    ['has', 'have'],
    ['demonstrates', 'demonstrate'],
    ['creates', 'create'],
    ['crafts', 'craft'],
    ['delivers', 'deliver'],
    ['proves', 'prove'],
    ['shows', 'show'],
    ['reveals', 'reveal'],
    ['finds', 'find'],
    ['situates', 'situate'],
    ['frames', 'frame'],
    ['uses', 'use'],
    ['builds', 'build'],
    ['returns', 'return'],
    ['approaches', 'approach'],
    ['balances', 'balance'],
    ['navigates', 'navigate'],
    ['examines', 'examine'],
    ['positions', 'position'],
    ['treats', 'treat'],
    ['anchors', 'anchor'],
    ['foregrounds', 'foreground'],
    ['commits', 'commit'],
    ['keeps', 'keep'],
    ['opts', 'opt'],
    ['maintains', 'maintain'],
    ['prioritizes', 'prioritize'],
    ['confirms', 'confirm'],
    ['configures', 'configure']
  ];

  directVerbPairs.forEach(function(pair) {
    var rx = new RegExp(escapeRegex_(director) + ' ' + pair[0] + '\\b', 'g');
    out = out.replace(rx, director + ' ' + pair[1]);
  });

  out = out
    .replace(new RegExp('\\bdirector ' + escapeRegex_(director) + '\\b', 'g'), 'directors ' + director)
    .replace(new RegExp('\\bDirector ' + escapeRegex_(director) + '\\b', 'g'), 'Directors ' + director)
    .replace(/\ba promising filmmaker\b/g, 'promising filmmakers')
    .replace(/\ba filmmaker with serious potential\b/g, 'filmmakers with serious potential')
    .replace(/\ba filmmaker to watch\b/g, 'filmmakers to watch');

  return out;
}

function normalizeReviewText_(text) {
  var out = String(text || '')
    .replace(/\s+/g, ' ')
    // Avoid duplicated "balances X with X..." constructions.
    .replace(/\bbalances ([^,.;]+?) with \1(\b[^,.;]*)/gi, 'balances $1$2')
    .replace(/,\s+(that\b)/gi, ' $1')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])([^\s])/g, '$1 $2')
    .replace(/\.\s*\./g, '.')
    .trim();

  out = out.replace(/([.!?]\s+)([a-z])/g, function(_, p1, p2) { return p1 + p2.toUpperCase(); });
  if (out && !/[.!?]$/.test(out)) out += '.';
  return out;
}

function getMiddleFragmentLead_(fragment) {
  var s = String(fragment || '').trim().toLowerCase();
  if (s.indexOf('through ') === 0) return 'through';
  if (s.indexOf('with ') === 0) return 'with';
  if (s.indexOf('while ') === 0) return 'while';
  if (s.indexOf('that ') === 0) return 'that';
  return 'other';
}

function getMiddleFragmentFirstWord_(fragment) {
  var m = String(fragment || '').trim().toLowerCase().match(/^([a-z]+)/);
  return m && m[1] ? m[1] : '';
}

function pickMiddleSentences_() {
  var selected = [];
  var usedText = {};
  var usedLead = {};
  var usedFirstWord = {};
  var attempts = 0;

  while (selected.length < 3 && attempts < 300) {
    attempts += 1;
    var candidate = randomChoice(MIDDLE_SENTENCES);
    if (!candidate || usedText[candidate]) continue;

    var lead = getMiddleFragmentLead_(candidate);
    var firstWord = getMiddleFragmentFirstWord_(candidate);

    // Keep middle fragments from sounding like a broken list:
    // don't repeat the same connector style (especially "through").
    if (lead !== 'other' && usedLead[lead]) continue;
    if (firstWord && usedFirstWord[firstWord]) continue;

    usedText[candidate] = true;
    if (lead !== 'other') usedLead[lead] = true;
    if (firstWord) usedFirstWord[firstWord] = true;
    selected.push(candidate);
  }

  // Relax connector restrictions if needed, but still avoid exact duplicates
  // and repeated leading words.
  attempts = 0;
  while (selected.length < 3 && attempts < 300) {
    attempts += 1;
    var candidate2 = randomChoice(MIDDLE_SENTENCES);
    if (!candidate2 || usedText[candidate2]) continue;
    var firstWord2 = getMiddleFragmentFirstWord_(candidate2);
    if (firstWord2 && usedFirstWord[firstWord2]) continue;
    usedText[candidate2] = true;
    if (firstWord2) usedFirstWord[firstWord2] = true;
    selected.push(candidate2);
  }

  // Absolute fallback: unique text only.
  attempts = 0;
  while (selected.length < 3 && attempts < 300) {
    attempts += 1;
    var candidate3 = randomChoice(MIDDLE_SENTENCES);
    if (!candidate3 || usedText[candidate3]) continue;
    usedText[candidate3] = true;
    selected.push(candidate3);
  }

  // If a restrictive "that ..." clause is present, place it first so it
  // attaches to the opening phrase instead of to a prior comma phrase.
  selected.sort(function(a, b) {
    var aThat = getMiddleFragmentLead_(a) === 'that' ? 0 : 1;
    var bThat = getMiddleFragmentLead_(b) === 'that' ? 0 : 1;
    return aThat - bThat;
  });

  return selected;
}

function buildReviewSentence_(opening, middles) {
  var parts = Array.isArray(middles) ? middles.slice(0) : [];
  var out = String(opening || '');

  parts.forEach(function(fragment, idx) {
    if (!fragment) return;
    var lead = getMiddleFragmentLead_(fragment);
    if (idx === 0) {
      out += ' ' + fragment;
      return;
    }
    if (lead === 'that') {
      out += ' ' + fragment;
      return;
    }
    out += ', ' + fragment;
  });

  return out;
}

function generateReview(formData) {
  const opening = randomChoice(OPENING_SENTENCES);
  const middles = pickMiddleSentences_();
  const closing = randomChoice(CLOSING_SENTENCES);

  const genre = (formData.genre || 'film').toString();
  const genreAdjs = GENRE_ADJECTIVES[genre] || ['compelling', 'engaging', 'thoughtful'];
  const genreAdj = randomChoice(genreAdjs);
  const quality1 = randomChoice(QUALITIES);
  const quality2 = randomChoice(QUALITIES.filter(function(q) { return q !== quality1; }));
  const directorNames = parseDirectorNames(formData.director);
  const isPluralDirector = directorNames.length > 1;
  const director = formatNames(formData.director);

  let review = buildReviewSentence_(opening, middles) + '. ' + closing;

  review = review
    .replace(/{TITLE}/g, formData.title || 'this film')
    .replace(/{DIRECTOR}/g, director)
    .replace(/{GENRE}/g, genre.toLowerCase())
    .replace(/{GENRE_ADJ}/g, genreAdj);

  let qualityCounter = 0;
  review = review.replace(/{QUALITY}/g, function() {
    qualityCounter += 1;
    return qualityCounter === 1 ? quality1 : quality2;
  });

  review = applyDirectorAgreement_(review, director, isPluralDirector);
  return normalizeReviewText_(review);
}

// ==================== MONGODB / VERCEL API ====================

function getApiSecret_() {
  const secret = PropertiesService.getScriptProperties().getProperty('API_SECRET');
  if (!secret) throw new Error('Missing Script Property: API_SECRET');
  return secret;
}

/**
 * POST a pending submission to MongoDB immediately on form receipt
 */
function savePendingToMongo(formData, submissionId, tracker) {
  try {
    tracker = tracker || {};
    const pendingFilm = {
      submissionId: submissionId,
      timestamp: new Date().toISOString(),
      title: formData.title || '',
      director: formData.director || '',
      writer: formData.writer || '',
      producer: formData.producer || '',
      genre: formData.genre || '',
      runtime: formData.runtime || '',
      logline: formData.logline || '',
      directorStatement: formData.directorStatement || '',
      email: formData.email || '',
      filmLink: formData.filmLink || '',
      twitter: formData.twitter || '',
      onlinePremiere: formData.onlinePremiere || '',
      completionDate: formData.completionDate || '',
      cast: formData.cast || '',
      language: formData.language || '',
      thumbnail: extractThumbnail(formData.filmLink || ''),
      slug: generateSlug(formData.title || 'untitled'),
      review: '',
      pending: true,
      live: false,
      accepted: false,
      submissionReceivedEmailSent: tracker.submissionReceivedEmailSent === true,
      submissionReceivedEmailAt: tracker.submissionReceivedEmailAt || '',
      submissionReceivedEmailError: tracker.submissionReceivedEmailError || '',
      scheduledDecisionAt: tracker.scheduledDecisionAt || '',
      autoDecisionMinHours: CONFIG.MIN_DELAY_HOURS,
      autoDecisionMaxHours: CONFIG.MAX_DELAY_HOURS
    };

    UrlFetchApp.fetch(CONFIG.API_BASE + '/films', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': getApiSecret_()
      },
      payload: JSON.stringify(pendingFilm),
      muteHttpExceptions: true
    });

    Logger.log('Pending submission saved to MongoDB: ' + formData.title);
  } catch (error) {
    Logger.log('Failed to save pending submission to MongoDB: ' + error);
    // Non-fatal — auto-processing will still proceed
  }
}

/**
 * Update the pending record in MongoDB to live=true, pending=false, add review
 */
function approveInMongo(submissionId, review) {
  try {
    const adminPassword = getAdminPassword_();

    // First find the record by submissionId
    const listRes = UrlFetchApp.fetch(CONFIG.API_BASE + '/admin?action=list', {
      headers: { 'x-admin-password': adminPassword },
      muteHttpExceptions: true
    });

    if (listRes.getResponseCode() !== 200) {
      throw new Error('Could not fetch film list. HTTP ' + listRes.getResponseCode() + ' ' + listRes.getContentText());
    }

    const data = JSON.parse(listRes.getContentText());
    const film = (data.films || []).find(function(f) { return f.submissionId === submissionId; });

    if (!film) {
      Logger.log('Could not find pending record for ' + submissionId + ' — may have already been processed');
      return false;
    }

    const mongoId = film._id && film._id.$oid ? film._id.$oid : String(film._id);

    const approveRes = UrlFetchApp.fetch(CONFIG.API_BASE + '/admin?action=approve&id=' + mongoId, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword
      },
      payload: JSON.stringify({ review: review, skipEmail: true }),
      muteHttpExceptions: true
    });

    if (approveRes.getResponseCode() !== 200) {
      throw new Error('Approve failed. HTTP ' + approveRes.getResponseCode() + ' ' + approveRes.getContentText());
    }

    Logger.log('Film approved in MongoDB: ' + submissionId);
    return {
      success: true,
      submissionId: submissionId,
      slug: film.slug || '',
      title: film.title || '',
      director: film.director || '',
      email: film.email || ''
    };
  } catch (error) {
    Logger.log('Failed to approve in MongoDB: ' + error);
    notifyAdmin_('approveInMongo failed', error);
    return { success: false, error: String(error), submissionId: submissionId };
  }
}

function getFilmBySubmissionId_(submissionId) {
  try {
    const adminPassword = getAdminPassword_();
    const listRes = UrlFetchApp.fetch(CONFIG.API_BASE + '/admin?action=list', {
      headers: { 'x-admin-password': adminPassword },
      muteHttpExceptions: true
    });

    if (listRes.getResponseCode() !== 200) {
      throw new Error('Could not fetch film list. HTTP ' + listRes.getResponseCode() + ' ' + listRes.getContentText());
    }

    const data = JSON.parse(listRes.getContentText());
    return (data.films || []).find(function(f) { return f.submissionId === submissionId; }) || null;
  } catch (error) {
    Logger.log('Failed to fetch film by submissionId: ' + error);
    return null;
  }
}

function sendFilmNowLiveEmail_(filmData) {
  var recipient = normalizeEmail_(filmData && filmData.email);
  if (!recipient) {
    Logger.log('Skipping live email: missing/invalid recipient');
    return;
  }

  var title = String((filmData && filmData.title) || 'Your film');
  var submitterName = String(formatNames((filmData && filmData.director) || '') || 'there');
  var slug = String((filmData && filmData.slug) || '').trim();
  var filmLink = slug
    ? CONFIG.SITE_URL.replace(/\/$/, '') + '/film.html?id=' + encodeURIComponent(slug)
    : CONFIG.SITE_URL.replace(/\/$/, '');

  var subject = title + ' is now live on SoftY!';
  var plainBody =
    'Congratulations ' + submitterName + ',\n\n' +
    'Your film and review is now up on Shorts of the Year at this link: ' + filmLink;
  var htmlBody = ''
    + '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#222;">'
    + '<p style="margin:0 0 16px 0;">Congratulations ' + escapeHtml_(submitterName) + ',</p>'
    + '<p style="margin:0 0 16px 0;">Your film and review is now up on Shorts of the Year at this link: '
    + '<a href="' + escapeHtml_(filmLink) + '">' + escapeHtml_(filmLink) + '</a></p>'
    + '</div>';

  sendEmailWithBcc_(recipient, subject, plainBody, htmlBody);
}

function getOwnerAlertRecipients_() {
  var props = PropertiesService.getScriptProperties();
  var recipients = [];
  var email = normalizeEmail_(props.getProperty('OWNER_ALERT_EMAIL') || CONFIG.OWNER_ALERT_EMAIL);
  var sms = normalizeEmail_(props.getProperty('OWNER_SMS_EMAIL'));
  if (email) recipients.push(email);
  if (sms && recipients.indexOf(sms) === -1) recipients.push(sms);
  return recipients;
}

function sendOwnerAlert_(subject, body) {
  var recipients = getOwnerAlertRecipients_();
  if (!recipients.length) return;
  try {
    MailApp.sendEmail({
      to: recipients.join(','),
      subject: String(subject || 'SoftY alert').slice(0, 180),
      body: String(body || '')
    });
  } catch (error) {
    Logger.log('Owner alert failed: ' + error);
  }
}

function sendOwnerFilmLiveAlert_(filmData) {
  var title = String((filmData && filmData.title) || 'Untitled');
  var director = String((filmData && filmData.director) || '');
  var slug = String((filmData && filmData.slug) || '').trim();
  var link = slug
    ? CONFIG.SITE_URL.replace(/\/$/, '') + '/film.html?id=' + encodeURIComponent(slug)
    : CONFIG.SITE_URL.replace(/\/$/, '');
  sendOwnerAlert_(
    'SoftY film live: ' + title,
    'Film is live on Shorts of the Year\n\n'
      + 'Title: ' + title + '\n'
      + 'Director: ' + director + '\n'
      + 'Link: ' + link
  );
}

/**
 * Delete a pending record from MongoDB on rejection
 */
function deleteFromMongo(submissionId) {
  try {
    const adminPassword = getAdminPassword_();

    const listRes = UrlFetchApp.fetch(CONFIG.API_BASE + '/admin?action=list', {
      headers: { 'x-admin-password': adminPassword },
      muteHttpExceptions: true
    });

    if (listRes.getResponseCode() !== 200) {
      throw new Error('Could not fetch film list for delete. HTTP ' + listRes.getResponseCode() + ' ' + listRes.getContentText());
    }

    const data = JSON.parse(listRes.getContentText());
    const film = (data.films || []).find(function(f) { return f.submissionId === submissionId; });
    if (!film) return;

    const mongoId = film._id && film._id.$oid ? film._id.$oid : String(film._id);

    const deleteRes = UrlFetchApp.fetch(CONFIG.API_BASE + '/admin?action=delete&id=' + mongoId, {
      method: 'delete',
      headers: { 'x-admin-password': adminPassword },
      muteHttpExceptions: true
    });

    if (deleteRes.getResponseCode() !== 200) {
      throw new Error('Delete failed. HTTP ' + deleteRes.getResponseCode() + ' ' + deleteRes.getContentText());
    }

    Logger.log('Rejected film deleted from MongoDB: ' + submissionId);
  } catch (error) {
    Logger.log('Failed to delete rejected film from MongoDB: ' + error);
  }
}

// ==================== EMAIL FUNCTIONS ====================

function sendSubmissionReceivedEmail(formData) {
  var recipient = normalizeEmail_(formData.email);
  if (!recipient) {
    Logger.log('Skipping submission received email: missing/invalid recipient');
    return;
  }

  var title = formData.title || 'your film';
  var director = formData.director || 'there';
  var subject = 'We received your submission to Shorts of the Year';

  var htmlBody = ''
    + '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">'
    + '<p>Dear ' + escapeHtml_(director) + ',</p>'
    + '<p>Thank you for submitting "<strong>' + escapeHtml_(title) + '</strong>" to Shorts of the Year.</p>'
    + '<p>Your submission has been received. One of our jurors will watch it soon, and we’ll get back to you once a decision has been made.</p>'
    + '<p>Best regards,<br><strong>The Shorts of the Year Team</strong></p>'
    + '<p style="color:#999; font-size:12px;">www.shortsoftheyear.com &nbsp;|&nbsp; @shortsoftheyear</p>'
    + '</div>';

  var plainBody = ''
    + 'Dear ' + director + ',\n\n'
    + 'Thank you for submitting "' + title + '" to Shorts of the Year.\n\n'
    + 'Your submission has been received. One of our jurors will watch it soon, and we’ll get back to you once a decision has been made.\n\n'
    + 'Best regards,\nThe Shorts of the Year Team\n\nwww.shortsoftheyear.com | @shortsoftheyear';

  sendEmailWithBcc_(recipient, subject, plainBody, htmlBody);
}

function sendAcceptanceEmail(formData, review) {
  var recipient = normalizeEmail_(formData.email);
  if (!recipient) throw new Error("Missing/invalid recipient email (acceptance).");

  var title = formData.title || "";
  var director = formData.director || "there";
  var subject = "Your film \"" + title + "\" has been selected!";

  var htmlBody = ""
    + "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;\">"
    + "<p>Dear " + escapeHtml_(director) + ",</p>"
    + "<p>Congratulations! We're thrilled to inform you that \"<strong>" + escapeHtml_(title) + "</strong>\" has been selected for Shorts of the Year.</p>"
    + "<p>Your film is now featured on our website at <a href=\"https://www.shortsoftheyear.com\">www.shortsoftheyear.com</a>.</p>"
    + "<p>Keep your eyes peeled for your review to be featured on the site soon.</p>"
    + "<p>As an official selection, you can use our laurel on your poster and promotional materials!</p>"
    + "<div style=\"text-align: center; margin: 20px 0;\">"
    + "<img src=\"https://raw.githubusercontent.com/softyprogramming-mod/Shorts-of-the-Year-website/main/images/SOFTY_Laurel4.png\" alt=\"Shorts of the Year Official Selection\" style=\"max-width: 300px; height: auto;\">"
    + "</div>"
    + "<p>We'll also be sharing your film on our social media channels. If you have a Twitter/Instagram handle you'd like us to tag, please reply to this email.</p>"
    + "<p>Thank you for sharing your work with us. We're excited to showcase \"" + escapeHtml_(title) + "\" to our audience.</p>"
    + "<p>Best regards,<br><strong>The Shorts of the Year Team</strong></p>"
    + "<p style=\"color:#999; font-size:12px;\">www.shortsoftheyear.com &nbsp;|&nbsp; @shortsoftheyear</p>"
    + "</div>";

  var plainBody = ""
    + "Dear " + director + ",\n\n"
    + "Congratulations! We're thrilled to inform you that \"" + title + "\" has been selected for Shorts of the Year.\n\n"
    + "Your film is now featured on our website at www.shortsoftheyear.com.\n\n"
    + "Keep your eyes peeled for your review to be featured on the site soon.\n\n"
    + "As an official selection, you can use our laurel on your poster and promotional materials!\n\n"
    + "We'll also be sharing your film on our social media channels. If you have a Twitter/Instagram handle you'd like us to tag, please reply to this email.\n\n"
    + "Thank you for sharing your work with us. We're excited to showcase \"" + title + "\" to our audience.\n\n"
    + "Best regards,\nThe Shorts of the Year Team\n\nwww.shortsoftheyear.com | @shortsoftheyear";

  sendEmailWithBcc_(recipient, subject, plainBody, htmlBody);
}

function sendRejectionEmail(formData) {
  var recipient = normalizeEmail_(formData.email);
  if (!recipient) throw new Error("Missing/invalid recipient email (rejection).");

  var subject = "Re: Your submission to Shorts of the Year";
  var body = "Dear " + (formData.director || "there") + ",\n\n"
    + "Unfortunately, your film is not one of the year.\n\n"
    + "SofTY Team\nwww.shortsoftheyear.com";

  sendEmailWithBcc_(recipient, subject, body, null);
}

function sendEmailWithBcc_(to, subject, body, htmlBody, senderName) {
  const payload = {
    to: to,
    subject: subject,
    body: body,
    name: senderName || CONFIG.SENDER_NAME,
    bcc: CONFIG.BCC_EMAIL
  };
  if (htmlBody) payload.htmlBody = htmlBody;
  MailApp.sendEmail(payload);
  Logger.log('Email sent to ' + to + ' (bcc: ' + CONFIG.BCC_EMAIL + ')');
}

// ==================== HELPER FUNCTIONS ====================

function extractFormData(e) {
  const data = {};

  if (e && e.response && typeof e.response.getRespondentEmail === 'function') {
    const respondentEmail = e.response.getRespondentEmail();
    if (respondentEmail) data.email = respondentEmail.trim();
  }

  if (e && e.response && typeof e.response.getItemResponses === 'function') {
    const responses = e.response.getItemResponses();
    responses.forEach(function(r) { assignFromQuestion_(r.getItem().getTitle(), r.getResponse(), data); });
  }

  if (e && e.namedValues) {
    Object.keys(e.namedValues).forEach(function(q) {
      const ans = Array.isArray(e.namedValues[q]) ? e.namedValues[q][0] : e.namedValues[q];
      assignFromQuestion_(q, ans, data);
    });
  }

  if (!data.email) Logger.log('Warning: No email captured for submission');
  return data;
}

function assignFromQuestion_(question, answerRaw, data) {
  const q = String(question || '').toLowerCase();
  const answer = Array.isArray(answerRaw) ? answerRaw.join(', ').trim() : String(answerRaw || '').trim();

  if (q.includes('statement'))                         data.directorStatement = answer;
  else if (q.includes('director'))                     data.director = answer;
  else if (q.includes('title'))                        data.title = answer;
  else if (q.includes('writer'))                       data.writer = answer;
  else if (q.includes('producer'))                     data.producer = answer;
  else if (q.includes('genre'))                        data.genre = answer;
  else if (q.includes('runtime'))                      data.runtime = answer;
  else if (q.includes('email') || q.includes('e-mail')) data.email = answer;
  else if (q.includes('link'))                         data.filmLink = answer;
  else if (q.includes('password'))                     { /* Do not persist submission passwords */ }
  else if (q.includes('twitter') || q.includes('handle')) data.twitter = answer;
  else if (q.includes('premiere'))                     data.onlinePremiere = answer;
  else if (q.includes('completion'))                   data.completionDate = answer;
  else if (q.includes('logline'))                      data.logline = answer;
  else if (q.includes('cast'))                         data.cast = answer;
  else if (q.includes('language'))                     data.language = answer;
}

function getApiSecret_() {
  const secret = PropertiesService.getScriptProperties().getProperty('API_SECRET');
  if (!secret) throw new Error('Missing Script Property: API_SECRET');
  return secret;
}

function getAdminPassword_() {
  const adminPassword = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!adminPassword) {
    throw new Error('Missing Script Property: ADMIN_PASSWORD');
  }
  return adminPassword;
}

function normalizeEmail_(value) {
  const email = String(value || '').trim();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return ok ? email : '';
}

function notifyAdmin_(context, error) {
  try {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: 'Apps Script Error: ' + context,
      body: context + '\n\n' + (error && error.stack ? error.stack : error)
    });
  } catch (notifyErr) {
    Logger.log('Failed admin alert: ' + notifyErr);
  }
}

function escapeHtml_(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plainTextToHtmlEmail_(text) {
  var safe = escapeHtml_(String(text || '')).replace(/\r\n/g, '\n');
  var paragraphs = safe.split(/\n{2,}/).filter(function(p) { return p.trim().length > 0; });
  if (paragraphs.length === 0) return '<p></p>';
  var html = paragraphs.map(function(p) {
    return '<p style="margin:0 0 16px 0;">' + p.replace(/\n/g, '<br>') + '</p>';
  }).join('');
  return '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#222;">' + html + '</div>';
}

function generateSlug(title) {
  return String(title || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now();
}

function extractThumbnail(url) {
  var u = String(url || '');
  var driveId = extractGoogleDriveId_(u);
  if (driveId) {
    return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(driveId) + '&sz=w1280';
  }

  if (u.includes('vimeo.com')) {
    try {
      // Use oEmbed API — works for private/unlisted videos with hash
      var oembedUrl = 'https://vimeo.com/api/oembed.json?url=' + encodeURIComponent(u) + '&width=1280';
      var res = UrlFetchApp.fetch(oembedUrl, { muteHttpExceptions: true });
      if (res.getResponseCode() === 200) {
        var data = JSON.parse(res.getContentText());
        if (data.thumbnail_url) {
          // Request highest quality version by replacing size suffix
          return data.thumbnail_url.replace(/_\d+x\d+\./, '_1280.');
        }
      }
    } catch (err) {
      Logger.log('Vimeo oEmbed failed, falling back: ' + err);
    }
    // Fallback: try vumbnail for public videos
    var m = u.match(/vimeo\.com\/(\d+)/);
    if (m) return 'https://vumbnail.com/' + m[1] + '.jpg';
  } else if (u.includes('youtube.com') || u.includes('youtu.be')) {
    var m2 = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (m2) {
      var ytId = m2[1];
      var variants = ['maxresdefault', 'hq720', 'sddefault', 'hqdefault'];
      for (var i = 0; i < variants.length; i++) {
        var candidate = 'https://i.ytimg.com/vi/' + ytId + '/' + variants[i] + '.jpg';
        try {
          var thumbRes = UrlFetchApp.fetch(candidate, { muteHttpExceptions: true, followRedirects: true });
          if (thumbRes.getResponseCode() === 200) return candidate;
        } catch (err2) {
          // try next candidate
        }
      }
      return 'https://i.ytimg.com/vi/' + ytId + '/hqdefault.jpg';
    }
  }
  return 'https://raw.githubusercontent.com/softyprogramming-mod/Shorts-of-the-Year-website/main/images/placeholder.jpg';
}

function extractGoogleDriveId_(url) {
  try {
    var parsed = new URL(String(url || ''));
    var fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch && fileMatch[1]) return fileMatch[1];
    var idParam = parsed.searchParams.get('id');
    if (idParam) return idParam;
  } catch (_) {
    var m = String(url || '').match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    return m && m[1] ? m[1] : '';
  }
  return '';
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function deleteTrigger(triggerId) {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getUniqueId() === triggerId) ScriptApp.deleteTrigger(trigger);
  });
}
