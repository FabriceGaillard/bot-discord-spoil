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

  // tout ce qui ressemble à rat / ratou / raton
  const ratRegex = /\br+a+t+o*u*n*\b/;

  // lemon + snug/slug, lettres étirées acceptées
  const lemonRegex = /\bl+e+m+o+n+.*(s+n+u+g+|s+l+u+g+)\b/;

  return ratRegex.test(text) || lemonRegex.test(text);
}

// ======================
// TEXTES
// ======================
const SNUG_INTERJECT = [
  'câlin aussi 🥺',
  'moi aussi 🥺',
  'et moi ? 🥺',
  'moi aussi, un peu 🥺',
  'câlin pour moi aussi 🥺',
  'je peux avoir un câlin aussi ? 🥺',
  'un petit câlin pour moi ? 🥺',
  'si jamais, je veux bien un câlin 🥺',
  'je veux bien venir pour le câlin 😶',
  'je peux me joindre au câlin ? 🥺',
  'je dérange pas si je prends un câlin ? 🥺',
  'je peux attendre, mais j’en veux bien un 🥺',
  'juste un petit câlin, si c’est ok 🥺',
  'je prends pas beaucoup de place, promis 🥺',
  'je peux être là aussi ? 🥺',
  'est-ce que je peux avoir un câlin ? 🥺',
  'je veux bien un câlin moi aussi 🥺',
  'un câlin aussi, s’il te plaît 🥺',
  'je peux avoir ma part de câlin ? 🥺',
  'ça serait possible pour moi aussi ? 🥺',

  'je veux pas forcer, mais moi aussi 🥺',
  'si ça gêne pas, un câlin pour moi 🥺',
  'je peux passer aussi ? 🥺',
  'je m’incruste un peu ? 🥺',
  'je peux rester là pour le câlin ? 🥺',

  'c’est bizarre si je regarde ? 😶',
  'je fais pas peur, hein ? 😶',
  'je voulais pas espionner 😶',
  'je savais pas quand parler 😶',
  'je vous dérange pas trop ? 😶',
  'je regarde, mais j’aimerais bien venir 😶',
  'je reste dans le coin. pour l’instant 😶',
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
  'ok… mais après je fais pipi 😳',
  'merci… je m’accroche un peu 🥺',
  '🥺🫂 je rends le câlin',
];

const SNUG_GIVE = [
  'ok… je vais faire un câlin à %USER% 🥺🫂',
  'viens là %USER% 🫂',
  'un câlin tout doux pour %USER% 😶🫂',
  'je me glisse vers %USER% pour un câlin 🥺',
  'hop… câlin déposé pour %USER% 🫂🥺',
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
  const hasCalin = /c+a+l+i+n+/.test(content);
  const isQuestion = content.includes('?');
  const priority = hasPriorityKeyword(content);
  const hasMention = message.mentions.users.size > 0;

  // ======================
  // 2️⃣ PAS DE CÂLIN → RIEN
  // ======================
  if (!hasCalin) return;

  const target = message.mentions.users.first();
  if (hasMention && priority) {
    let reply = '';
    console.log(target.id, client.user.id);
    if (target.id === client.user.id) {
      reply = "Méééé, c'est à toi que je veux faire un calin euh 🥺";
    } else {
      reply = pick(SNUG_GIVE).replace('%USER%', `<@${target.id}>`);
    }
    await message.reply(reply);
    return;
  }

  // ======================
  // 3️⃣ QUESTION + PRIORITÉ
  // ======================
  if (isQuestion && priority) {
    await message.reply('👀');
    return;
  }

  // ======================
  // 4️⃣ CÂLIN ADRESSÉ AU BOT
  // ======================
  if (priority) {
    await message.reply(pick(SNUG_RECEIVE));
    return;
  }

  // ======================
  // 5️⃣ INTERJECTION ALÉATOIRE
  // ======================
  if (shouldRandomReply()) {
    await message.reply(pick(SNUG_INTERJECT));
  }
});

// ======================
// LOGIN
// ======================
client.login(TOKEN);
