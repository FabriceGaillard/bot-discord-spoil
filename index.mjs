import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import 'dotenv/config';

// ======================
// CONFIG
// ======================
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

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
// EVENTS
// ======================
client.once('ready', () => {
  console.log(`Bot prêt (${client.user?.tag})`);
});

client.on('messageCreate', async (message) => {
  try {
    // ❌ ignore bots
    if (message.author.bot) return;

    // ❌ mauvais channel
    if (message.channel.id !== CHANNEL_ID) return;

    // ❌ pas d’images
    if (message.attachments.size === 0) return;

    // filtre uniquement images
    const imageAttachments = message.attachments.filter((att) =>
      att.contentType?.startsWith('image/'),
    );

    if (imageAttachments.size === 0) return;

    // ======================
    // DOWNLOAD DES IMAGES
    // ======================
    const files = [];

    for (const attachment of imageAttachments.values()) {
      const res = await fetch(attachment.url);
      const buffer = Buffer.from(await res.arrayBuffer());

      const file = new AttachmentBuilder(buffer, {
        name: attachment.name || 'image.png',
      }).setSpoiler(true);

      files.push(file);
    }

    const content = message.content;

    // ======================
    // DELETE ORIGINAL
    // ======================
    await message.delete();

    // ======================
    // REPOST
    // ======================
    await message.channel.send({
      content: content
        ? `**${message.author.username}** : ${content}`
        : `**${message.author.username}** a envoyé une image`,
      files,
    });
  } catch (err) {
    console.error('Erreur:', err);
  }
});

// ======================
// LOGIN
// ======================
client.login(TOKEN);
