const { Configuration, OpenAIApi } = require("openai");
const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const LocalSession = require("telegraf-session-local");

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(new LocalSession({ database: "db.json" }).middleware());

bot.command("start", (ctx) => {
  ctx.session.messages = [];
});

bot.command("clear", (ctx) => {
  ctx.session.messages = [];
});

bot.on(message("text"), async (ctx) => {
  ctx.session.messages.push({
    role: "user",
    content: ctx.message.text,
  });

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: ctx.session.messages,
  });

  ctx.session.messages.push({
    role: "assistant",
    content: completion.data.choices[0].message.content,
  });

  return ctx.reply(
    completion.data.choices[0].message.content
    // { parse_mode: 'MarkdownV2' }
  );
});

// bot.on(message('voice'), async (ctx) => {
//   const file = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
//   console.log(file.href);

//   return ctx.reply(file.href);
// });

bot.launch();
