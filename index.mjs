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

function isPureHugMessage(content) {
  const text = normalize(content)
    // on enlève la ponctuation mais on garde les lettres
    .replace(/[^\p{L}\s]/gu, '');

  const words = text.split(/\s+/).filter(Boolean);

  // trop long = non
  if (words.length > 3) return false;

  // au moins un mot "calin" (avec lettres répétées)
  const hasCalin = words.some((word) => /^c+a+l+i+n+$/.test(word));

  return hasCalin;
}

// ======================
// TEXTES — MICRO INTERJECTION
// ======================
const SNUG_LINES = [
  'câlin aussi 🥺',
  "j'ai le droit à un calin moi aussi ? 😶",
  'câlin 😌',
  'moi aussi je veux, câlin 🥺',
  'câlin… 😭',
  'et moi euh ! 😳',
  'câlin pour moi 🥺',
  'je veux bien un calin moi aussi 🥺',
  'câlin 🫂😌',
  'moi aussi, un tout petit, promis 😶',
  'câlin 🥰',
  'moi aussi, j’aime bien les calins 🥺',
];

// ======================
// GÉNÉRATEUR
// ======================
function lemonSnugHug(userMention) {
  return `${pick(SNUG_LINES)}`;
}

// ======================
// EVENTS
// ======================
client.once('ready', () => {
  console.log(`Lemon Snug prêt (${client.user.tag})`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!isPureHugMessage(message.content)) return;

  try {
    await message.reply(lemonSnugHug(`<@${message.author.id}>`));
  } catch (err) {
    console.error('Erreur Lemon Snug:', err);
  }
});

// ======================
// LOGIN
// ======================
client.login(TOKEN);
