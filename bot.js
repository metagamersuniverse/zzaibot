const { TelegramClient, events } = require('telegram');
const replicate = require('replicate');
require('dotenv').config();

const API_ID = "25301791";
const API_HASH = "77d74707a1e5fdb73c828a26d4e2012a36db2dad";
const BOT_TOKEN = process.env.BOT_TOKEN;  // Use environment variable for bot token

const imagebot = new TelegramClient('imagebot', {
  apiId: API_ID,
  apiHash: API_HASH,
  botToken: BOT_TOKEN,
});

imagebot.on(events.NewMessage({ pattern: /^[?!/]start/ }), async (event) => {
  console.log('Received /start command');
  const welcomeMessage = "Hi! Welcome to AI POP bot. Send me a photo and I'll generate a description for you. Type 'help' if you need assistance. Let's get started!";
  await event.reply(welcomeMessage);
});

imagebot.on(events.NewMessage({ pattern: /^[?!/]help/ }), async (event) => {
  console.log('Received /help command');
  const helpMessage = "Hi! I'm here to help you with the bot.\n\nTo get started, simply send me a photo and I'll generate a description for you.\n\nIf you need additional assistance, you can check out our guide at this link: https://docs.ai-pop.com/guides/ai-pop-bot-use\n\nIf you have any questions or need further assistance, feel free to ask in chat!";
  await event.reply(helpMessage);
});

imagebot.on(events.NewMessage({ incoming: true }), async (event) => {
  if (event.text.startsWith("/")) {
    return;
  }
  if (!event.media) {
    console.log('Received message without media');
    await event.reply("```Don't send just text please. Please send an image.```");
    return;
  }
  const file = await event.client.downloadMedia(event.media);
  const model = replicate.models.get("salesforce/blip");
  const version = model.versions.get("2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746");
  const inputs = {
    image: file,
    task: "image_captioning",
  };
  const output = await version.predict(inputs);
  console.log('Image caption generated:', output);
  await event.reply(output);
  let result = output.caption;
  result = result.replace("Caption: ", "");
  await event.reply(result);
});

imagebot.start();
imagebot.runUntilDisconnected();