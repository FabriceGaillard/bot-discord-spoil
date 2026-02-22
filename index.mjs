import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import 'dotenv/config';

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!TOKEN) {
  console.error('DISCORD_TOKEN manquant');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Bot prêt (${client.user?.tag})`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;
    if (message.attachments.size === 0) return;

    // ✅ images + vidéos
    const mediaAttachments = message.attachments.filter(
      (att) =>
        att.contentType?.startsWith('image/') ||
        att.contentType?.startsWith('video/'),
    );

    if (mediaAttachments.size === 0) return;

    const files = [];

    for (const attachment of mediaAttachments.values()) {
      const res = await fetch(attachment.url);
      const buffer = Buffer.from(await res.arrayBuffer());

      const file = new AttachmentBuilder(buffer, {
        name: attachment.name || 'file',
      }).setSpoiler(true); // 🔥 spoiler image ET vidéo

      files.push(file);
    }

    const content = message.content;

    await message.delete();

    await message.channel.send({
      content: content
        ? `**${message.author.username}** : ${content}`
        : `**${message.author.username}** a envoyé un média`,
      files,
    });
  } catch (err) {
    console.error('Erreur:', err);
  }
});

client.login(TOKEN);
