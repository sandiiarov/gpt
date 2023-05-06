import { ChatCompletionRequestMessageRoleEnum } from 'openai';

import { bot, showSpinner } from '../bot';
import { createMessage, createUser } from '../db';

bot.command('start', async (ctx) => {
  let hideSpinner;

  try {
    hideSpinner = await showSpinner(ctx);

    const {
      id: userId,
      username,
      first_name: firstName = '',
      last_name: lastName = '',
    } = ctx.from;

    const { message_id: messageId } = ctx.message;

    await createUser({
      id: userId.toString(),
      username,
      firstName,
      lastName,
      createdAt: new Date(Date.now()).toISOString(),
    });

    // await createMessage({
    //   id: messageId.toString(),
    //   userId: userId.toString(),
    //   role: ChatCompletionRequestMessageRoleEnum.System,
    //   content: '', // TODO: Add context here
    //   createdAt: new Date(Date.now()).toISOString(),
    // });

    await createMessage({
      id: messageId.toString(),
      userId: userId.toString(),
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `My name is - ${firstName} ${lastName}. My username - ${username}.`, // TODO: Add more context here
      createdAt: new Date(Date.now()).toISOString(),
    });

    await hideSpinner();

    await ctx.reply('Hello!'); // TODO: Use open-ai for this response
  } catch (error) {
    await hideSpinner();

    await ctx.replyWithHTML(/* HTML */ `
      <b>Error</b>: <tg-spoiler><i>${error.message}</i></tg-spoiler>
    `);

    console.error(error);
  }
});
