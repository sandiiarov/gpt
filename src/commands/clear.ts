import { bot, showSpinner } from '../bot';
import { deleteMessagesByUserId } from '../db';

bot.command('clear', async (ctx) => {
  let hideSpinner;

  try {
    hideSpinner = await showSpinner(ctx, 'Removing messages');

    const { id: userId } = ctx.from;

    await deleteMessagesByUserId({ id: userId.toString() });

    await hideSpinner();

    await ctx.reply('Messages were removed successfully! 👍');
  } catch (error) {
    await hideSpinner();

    ctx.replyWithHTML(/* HTML */ `
      <b>Error</b>: <tg-spoiler><i>${error.message}</i></tg-spoiler>
    `);

    console.error(error);
  }
});
