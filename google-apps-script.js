/**
 * SHORTS OF THE YEAR - Google Apps Script
 * 
 * This script handles:
 * - Form submission processing
 * - 24-hour delay
 * - 99% acceptance / 1% rejection
 * - Auto-generated reviews from templates
 * - Email notifications
 * - Instagram posting notifications
 * - Updates films.json via GitHub API
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Apps Script project
 * 2. Paste this code
 * 3. Set up the trigger for onFormSubmit
 * 4. Configure the CONFIG object below
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  GITHUB_TOKEN: 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN', // Create at github.com/settings/tokens
  GITHUB_REPO: 'YOUR_USERNAME/shortsoftheyear', // Your GitHub repo
  GITHUB_FILE_PATH: 'films.json', // Path to films.json in repo
  EMAIL_FROM: 'shortsoftheyear@gmail.com',
  ACCEPTANCE_RATE: 0.99, // 99% acceptance
  DELAY_HOURS: 24,
  INSTAGRAM_NOTIFICATION_EMAIL: 'your-email@example.com' // Where to send Instagram notifications
};

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
  'In {TITLE}, {DIRECTOR} creates a world that feels'
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
  'with striking visual composition'
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
  'The result is something genuinely worthwhile.'
];

// Genre adjectives
const GENRE_ADJECTIVES = {
  'Drama': ['poignant', 'powerful', 'intimate', 'affecting', 'moving', 'thoughtful'],
  'Comedy': ['sharp', 'witty', 'clever', 'observational', 'charming', 'incisive'],
  'Documentary': ['revealing', 'illuminating', 'compelling', 'insightful', 'engaging', 'thought-provoking'],
  'Horror': ['unsettling', 'atmospheric', 'tense', 'chilling', 'psychological', 'nightmarish'],
  'Sci-Fi': ['imaginative', 'cerebral', 'visionary', 'ambitious', 'conceptual', 'speculative'],
  'Thriller': ['gripping', 'taut', 'suspenseful', 'intense', 'riveting', 'edge-of-your-seat'],
  'Animation': ['inventive', 'visually stunning', 'creative', 'imaginative', 'beautifully crafted', 'artistic'],
  'Experimental': ['bold', 'audacious', 'unconventional', 'avant-garde', 'challenging', 'innovative']
};

// Quality descriptors
const QUALITIES = [
  'visual storytelling', 'emotional depth', 'technical precision', 'narrative clarity',
  'atmospheric tension', 'character development', 'thematic richness', 'cinematic vision',
  'authentic performances', 'careful pacing', 'visual composition', 'tonal control'
];

// ==================== MAIN FUNCTIONS ====================

/**
 * Trigger function when form is submitted
 * Set this up in Apps Script triggers
 */
function onFormSubmit(e) {
  try {
    const formData = extractFormData(e);
    
    // Schedule the email for 24 hours later
    const triggerTime = new Date(new Date().getTime() + CONFIG.DELAY_HOURS * 60 * 60 * 1000);
    
    // Store submission data in Script Properties
    const submissionId = Utilities.getUuid();
    PropertiesService.getScriptProperties().setProperty(
      submissionId,
      JSON.stringify(formData)
    );
    
    // Create time-based trigger
    ScriptApp.newTrigger('processSubmission')
      .timeBased()
      .at(triggerTime)
      .create()
      .setUniqueId(submissionId);
    
    Logger.log('Submission scheduled for processing in 24 hours');
  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error);
  }
}

/**
 * Process the submission after 24 hours
 */
function processSubmission(e) {
  try {
    const triggerId = e.triggerUid;
    const props = PropertiesService.getScriptProperties();
    const formDataJson = props.getProperty(triggerId);
    
    if (!formDataJson) {
      Logger.log('No data found for trigger: ' + triggerId);
      return;
    }
    
    const formData = JSON.parse(formDataJson);
    
    // Decide acceptance (99% yes, 1% no)
    const isAccepted = Math.random() < CONFIG.ACCEPTANCE_RATE;
    
    if (isAccepted) {
      handleAcceptance(formData);
    } else {
      handleRejection(formData);
    }
    
    // Clean up
    props.deleteProperty(triggerId);
    deleteTrigger(triggerId);
    
  } catch (error) {
    Logger.log('Error in processSubmission: ' + error);
  }
}

/**
 * Handle accepted submission
 */
function handleAcceptance(formData) {
  // Generate review
  const review = generateReview(formData);
  
  // Create film object
  const film = {
    id: generateSlug(formData.title),
    timestamp: new Date().toISOString(),
    title: formData.title,
    director: formData.director,
    writer: formData.writer,
    producer: formData.producer,
    genre: formData.genre,
    runtime: formData.runtime,
    logline: formData.logline,
    directorStatement: formData.directorStatement,
    email: formData.email,
    filmLink: formData.filmLink,
    password: formData.password,
    twitter: formData.twitter,
    onlinePremiere: formData.onlinePremiere,
    thumbnail: extractThumbnail(formData.filmLink),
    review: review,
    slug: generateSlug(formData.title),
    accepted: true,
    live: true
  };
  
  // Send acceptance email
  sendAcceptanceEmail(formData, review);
  
  // Send Instagram notification
  sendInstagramNotification(film);
  
  // Update GitHub (films.json)
  updateGitHubFilmsJson(film);
  
  Logger.log('Film accepted: ' + formData.title);
}

/**
 * Handle rejected submission
 */
function handleRejection(formData) {
  sendRejectionEmail(formData);
  Logger.log('Film rejected: ' + formData.title);
}

// ==================== REVIEW GENERATION ====================

/**
 * Generate a review using template sentences
 */
function generateReview(formData) {
  const opening = randomChoice(OPENING_SENTENCES);
  const middle1 = randomChoice(MIDDLE_SENTENCES);
  const middle2 = randomChoice(MIDDLE_SENTENCES);
  const middle3 = randomChoice(MIDDLE_SENTENCES);
  const closing = randomChoice(CLOSING_SENTENCES);
  
  // Get genre adjective
  const genreAdjs = GENRE_ADJECTIVES[formData.genre] || ['compelling', 'engaging', 'thoughtful'];
  const genreAdj = randomChoice(genreAdjs);
  
  const quality1 = randomChoice(QUALITIES);
  const quality2 = randomChoice(QUALITIES.filter(q => q !== quality1));
  
  // Combine sentences
  let review = `${opening} ${middle1}, ${middle2}. ${middle3}. ${closing}`;
  
  // Replace placeholders
  review = review
    .replace(/{TITLE}/g, formData.title)
    .replace(/{DIRECTOR}/g, formData.director)
    .replace(/{GENRE}/g, formData.genre.toLowerCase())
    .replace(/{GENRE_ADJ}/g, genreAdj)
    .replace(/{QUALITY}/g, quality1)
    .replace(/{QUALITY}/g, quality2);
  
  return review;
}

// ==================== EMAIL FUNCTIONS ====================

/**
 * Send acceptance email
 */
function sendAcceptanceEmail(formData, review) {
  const subject = `🎬 Your film "${formData.title}" has been selected!`;
  
  const body = `
Dear ${formData.director},

Congratulations! We're thrilled to inform you that "${formData.title}" has been selected for Shorts of the Year.

Your film will be featured on our website at www.shortsoftheyear.com within the next 48 hours.

Here's the review we've written for your film:

"${review}"

We'll also be sharing your film on our social media channels. If you have a Twitter/Instagram handle you'd like us to tag, please reply to this email.

Thank you for sharing your work with us. We're excited to showcase "${formData.title}" to our audience.

Best regards,
The Shorts of the Year Team

---
www.shortsoftheyear.com
@shortsoftheyear
  `.trim();
  
  MailApp.sendEmail({
    to: formData.email,
    subject: subject,
    body: body
  });
}

/**
 * Send rejection email
 */
function sendRejectionEmail(formData) {
  const subject = `Re: Your submission to Shorts of the Year`;
  
  const body = `
Dear ${formData.director},

Thank you for submitting "${formData.title}" to Shorts of the Year.

After careful consideration, we've decided not to feature your film at this time. Please know that this decision doesn't reflect on the quality of your work—we receive many excellent submissions and can only select a limited number.

We encourage you to continue creating and to submit future projects.

Best of luck with your filmmaking journey.

Best regards,
The Shorts of the Year Team

---
www.shortsoftheyear.com
  `.trim();
  
  MailApp.sendEmail({
    to: formData.email,
    subject: subject,
    body: body
  });
}

/**
 * Send Instagram notification to admin
 */
function sendInstagramNotification(film) {
  const subject = `📱 New Film Ready for Instagram: ${film.title}`;
  
  const caption = `NEW SHORT: "${film.title}" by ${film.director}

${film.logline}

Watch now at shortsoftheyear.com

#shortfilm #filmmaking #indiefilm #${film.genre.toLowerCase()}`;
  
  const body = `
A new film is ready to post on Instagram!

FILM: ${film.title}
DIRECTOR: ${film.director}
LINK: www.shortsoftheyear.com/film.html?id=${film.slug}

SUGGESTED INSTAGRAM CAPTION:
${caption}

THUMBNAIL URL:
${film.thumbnail}

Post this to Instagram when ready!
  `.trim();
  
  MailApp.sendEmail({
    to: CONFIG.INSTAGRAM_NOTIFICATION_EMAIL,
    subject: subject,
    body: body
  });
}

// ==================== GITHUB INTEGRATION ====================

/**
 * Update films.json on GitHub
 */
function updateGitHubFilmsJson(newFilm) {
  try {
    const url = `https://api.github.com/repos/${CONFIG.GITHUB_REPO}/contents/${CONFIG.GITHUB_FILE_PATH}`;
    
    // Get current file
    const getResponse = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'token ' + CONFIG.GITHUB_TOKEN,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const fileData = JSON.parse(getResponse.getContentText());
    const currentContent = Utilities.newBlob(Utilities.base64Decode(fileData.content)).getDataAsString();
    const filmsData = JSON.parse(currentContent);
    
    // Add new film
    filmsData.films.unshift(newFilm); // Add to beginning
    
    // Update file on GitHub
    const updatePayload = {
      message: `Add new film: ${newFilm.title}`,
      content: Utilities.base64Encode(JSON.stringify(filmsData, null, 2)),
      sha: fileData.sha
    };
    
    UrlFetchApp.fetch(url, {
      method: 'put',
      headers: {
        'Authorization': 'token ' + CONFIG.GITHUB_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(updatePayload)
    });
    
    Logger.log('Successfully updated films.json on GitHub');
  } catch (error) {
    Logger.log('Error updating GitHub: ' + error);
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Extract form data from submission event
 */
function extractFormData(e) {
  const responses = e.response.getItemResponses();
  const data = {};
  
  responses.forEach(response => {
    const question = response.getItem().getTitle();
    const answer = response.getResponse();
    
    // Map form questions to data fields
    if (question.includes('Title')) data.title = answer;
    if (question.includes('Director')) data.director = answer;
    if (question.includes('Writer')) data.writer = answer;
    if (question.includes('Producer')) data.producer = answer;
    if (question.includes('Genre')) data.genre = answer;
    if (question.includes('Runtime')) data.runtime = answer;
    if (question.includes('Logline')) data.logline = answer;
    if (question.includes('Statement')) data.directorStatement = answer;
    if (question.includes('Email')) data.email = answer;
    if (question.includes('Link')) data.filmLink = answer;
    if (question.includes('Password')) data.password = answer;
    if (question.includes('Twitter') || question.includes('handle')) data.twitter = answer;
    if (question.includes('Premiere')) data.onlinePremiere = answer;
  });
  
  return data;
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now();
}

/**
 * Extract thumbnail from Vimeo/YouTube URL
 */
function extractThumbnail(url) {
  if (url.includes('vimeo.com')) {
    const vimeoId = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoId) {
      // This is a placeholder - in production you'd call Vimeo API
      return `https://i.vimeocdn.com/video/${vimeoId[1]}_640.jpg`;
    }
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId[1]}/maxresdefault.jpg`;
    }
  }
  return 'https://via.placeholder.com/640x360/333/fff?text=Film+Thumbnail';
}

/**
 * Get random item from array
 */
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Delete a trigger by ID
 */
function deleteTrigger(triggerId) {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getUniqueId() === triggerId) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}
