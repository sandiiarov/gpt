import { type Context, Telegraf } from 'telegraf';

export const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

export async function showSpinner(ctx: Context, info = 'Loading') {
  const spinner = '⠋⠙⠴⠦';
  let index = 0;

  const message = await ctx.reply(`${spinner[spinner.length - 1]} ${info}`);

  const interval = setInterval(async () => {
    index = index === spinner.length - 1 ? 0 : index + 1;

    await ctx.telegram.editMessageText(
      message.chat.id,
      message.message_id,
      undefined,
      `${spinner[index]} ${info}`,
    );
  }, 480);

  return async () => {
    clearInterval(interval);
    await ctx.deleteMessage(message.message_id);
    await new Promise((res) => setTimeout(res, 500));
  };
}
