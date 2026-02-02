import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

// ======================
// CONFIG
// ======================
const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error('DISCORD_TOKEN manquant');
  process.exit(1);
}

// ======================
// CLIENT
// ======================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ======================
// UTILS
// ======================
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shouldRandomReply() {
  // 1 chance sur 5
  return Math.floor(Math.random() * 5) === 0;
}

function hasPriorityKeyword(content) {
  const text = normalize(content);
  return text.includes('petit ratou') || text.includes('lemon slug');
}

function isPureHugMessage(content) {
  const text = normalize(content).replace(/[^\p{L}\s]/gu, '');
  const words = text.split(/\s+/).filter(Boolean);

  // trop long
  if (words.length > 4) return false;

  // random ici
  if (!shouldRandomReply()) return false;

  // mot "calin" avec répétitions
  return words.some((word) => /^c+a+l+i+n+$/.test(word));
}

function isQuestionHug(content) {
  const text = normalize(content);

  const hasCalin = /c+a+l+i+n+/.test(text);
  const hasQuestionMark = content.includes('?');

  return hasCalin && hasQuestionMark;
}

function isHugAddressedToRatou(content) {
  const text = normalize(content);

  const hasCalin = /c+a+l+i+n+/.test(text);
  const hasName = text.includes('petit ratou') || text.includes('lemon slug');

  return hasCalin && hasName;
}

// ======================
// TEXTES
// ======================
const SNUG_INTERJECT = [
  // existantes
  'câlin aussi 🥺',
  "j'ai le droit à un calin moi aussi ? 😶",
  'et moi euh ! 😳',
  'câlin pour moi 🥺',
  'moi aussi, un tout petit, promis 😶',

  'hé… moi aussi peut-être ? 🥺',
  'un petit câlin par ici ? 😶',
  'euh… j’peux venir ? 😳',
  'juste un, après j’arrête 😶',
  'je prends pas beaucoup de place 🥺',

  '… moi aussi 🥺',
  'si jamais il en reste 😶',
  'je demande pas grand-chose 😳',
  'juste un petit 🥺',
  'je veux bien attendre mon tour 😶',

  // nouvelles — très discrètes
  'je regarde… et peut-être moi aussi 🥺',
  'si c’est pas trop demander 😶',
  'je dérange pas hein 😳',
  'je peux me glisser là ? 🥺',
  'je fais tout petit 😶',

  'je suis là… au cas où 🥺',
  'si y a une place 😶',
  'je viens pas souvent 😳',
  'juste de passage 🥺',
  'je reste au bord 😶',

  // nouvelles — un peu plus expressives mais safe
  'bon… moi aussi alors 🥺',
  'ça a l’air sympa 😶',
  'je dis pas non 😳',
  'ok mais doucement 🥺',
  'je veux bien essayer 😶',

  'je lève la patte 🥺',
  'si jamais… moi 😶',
  'je suis prêt 😳',
  'je peux attendre encore 🥺',
  'je prends ce qu’il y a 😶',
];

const SNUG_RECEIVE = [
  // existantes
  'oooh merci 🥺 … ça te dérange si je le garde rien que pour moi ? 😶',
  'câlin… tout doux 😌',
  "Tu peux m'en faire un autre ? 😶",
  'câlin vi, un gros et un grand, aussi grand que je peux écarter avec mes patounes 🥺',
  'je prends… et je t’en rends un peu 🥺',
  '🥺🫂 câlin',

  'merci… viens là 🥺🫂',
  'reçu… je serre pas trop promis 😌',
  'ok… mais juste un petit encore 😶',
  'ça fait du bien… vraiment 🥺',
  'je le prends doucement… 🫂',
  'mmh… câlin validé 😌',

  'attends… viens là 🫂🥺',
  'je garde celui-là précieusement 😳',
  'un câlin comme ça, ça se refuse pas 🥺',
  'ok… mais après je te lâche hein 😶',
  'bon… d’accord… viens 🫂',
  '🥺 viens là toi',

  // nouvelles — réception douce
  'oh… merci… je m’y attendais pas 🥺',
  'reçu… je me détends un peu 😌',
  'je le prends avec soin 🫂',
  'merci… ça compte 😳',
  'tout doux… oui comme ça 😌',
  'je ferme un peu les yeux 🥺',

  // nouvelles — réception + léger retour
  'merci… tiens, je te serre un peu 🫂',
  'ok… je rends juste ce qu’il faut 😶',
  'je prends… et hop, retour discret 🥺',
  'viens là… juste un instant 🫂',
  'merci… je te lâche pas trop vite 😳',
  'je garde un bras pour toi 🥺',

  // nouvelles — timide / affectueux
  'euh… merci… vraiment 😶',
  'ça me surprend toujours 🥺',
  'je reste là encore un peu 😌',
  'ok… mais doucement alors 😳',
  'merci… je fais pas le malin là 🥺',
  'je me pose là… 🫂',

  // nouvelles — un peu plus expressives mais safe
  'bon… viens… je suis prêt 🫂',
  'je dis oui sans réfléchir 🥺',
  'ça fait longtemps que j’en voulais un 😶',
  'ok… mais après je souris 😳',
  'merci… je m’accroche un peu 🥺',
  '🥺🫂 je rends le câlin',
];

// ======================
// GÉNÉRATEUR
// ======================
function lemonSnugHug(isAddressed) {
  return pick(isAddressed ? SNUG_RECEIVE : SNUG_INTERJECT);
}

// ======================
// EVENTS
// ======================
client.once('ready', () => {
  console.log(`Lemon Snug prêt (${client.user.tag})`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content;

  // 👀 priorité ABSOLUE
  if (isQuestionHug(content)) {
    await message.reply('👀');
    return;
  }

  const priority = hasPriorityKeyword(content);
  const isPureHug = isPureHugMessage(content);

  if (!priority && !isPureHug) return;

  const addressed = isHugAddressedToRatou(content);

  try {
    await message.reply(lemonSnugHug(addressed));
  } catch (err) {
    console.error('Erreur Lemon Snug:', err);
  }
});

// ======================
// LOGIN
// ======================
client.login(TOKEN);
