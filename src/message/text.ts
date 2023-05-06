import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { message } from 'telegraf/filters';

import { bot, showSpinner } from '../bot';
import { createMessage, getMessagesByUserId } from '../db';
import { openai } from '../openai';

bot.on(message('text'), async (ctx) => {
  let hideSpinner;

  try {
    hideSpinner = await showSpinner(ctx, 'Generating answer');

    const userId = ctx.from.id;

    const { message_id: messageId, text: content } = ctx.message;

    await createMessage({
      id: messageId.toString(),
      userId: userId.toString(),
      role: ChatCompletionRequestMessageRoleEnum.User,
      content,
      createdAt: new Date(Date.now()).toISOString(),
    });

    const messages = await getMessagesByUserId({ id: userId.toString() });

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });

    await hideSpinner();

    await ctx.reply(completion.data.choices[0].message.content);

    await createMessage({
      id: completion.data.id,
      userId: userId.toString(),
      role: ChatCompletionRequestMessageRoleEnum.Assistant,
      content: completion.data.choices[0].message.content,
      createdAt: new Date(Date.now()).toISOString(),
    });
  } catch (error) {
    await hideSpinner();

    await ctx.replyWithHTML(/* HTML */ `
      <b>Error</b>: <tg-spoiler><i>${error.message}</i></tg-spoiler>
    `);

    console.error(error);
  }
});
