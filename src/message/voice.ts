import axios from 'axios';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { message } from 'telegraf/filters';

import { bot, showSpinner } from '../bot';
import { createMessage, getMessagesByUserId } from '../db';
import { ogaToWav } from '../ffmpeg';
import { openai } from '../openai';

bot.on(message('voice'), async (ctx) => {
  let hideSpeechToTextSpinner;
  let hideCompletionSpinner;

  try {
    hideSpeechToTextSpinner = await showSpinner(
      ctx,
      'Transforming speech to text',
    );

    const userId = ctx.from.id;

    const { message_id: messageId, voice } = ctx.message;

    const { href: url } = await ctx.telegram.getFileLink(voice.file_id);

    const { data: buffer } = await axios<Buffer>(url, {
      responseType: 'arraybuffer',
    });

    const file = await ogaToWav(buffer);

    const transcription = await openai.createTranscription(file, 'whisper-1');

    await hideSpeechToTextSpinner();

    await ctx.reply(`The generated text:\n\n${transcription.data.text}`);

    hideCompletionSpinner = await showSpinner(ctx, 'Generating answer');

    await createMessage({
      id: messageId.toString(),
      userId: userId.toString(),
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: transcription.data.text,
      createdAt: new Date(Date.now()).toISOString(),
    });

    const messages = await getMessagesByUserId({ id: userId.toString() });

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });

    await hideCompletionSpinner();

    await ctx.reply(completion.data.choices[0].message.content);

    await createMessage({
      id: completion.data.id,
      userId: userId.toString(),
      role: ChatCompletionRequestMessageRoleEnum.Assistant,
      content: completion.data.choices[0].message.content,
      createdAt: new Date(Date.now()).toISOString(),
    });
  } catch (error) {
    await hideSpeechToTextSpinner();
    await hideCompletionSpinner();

    await ctx.replyWithHTML(/* HTML */ `
      <b>Error</b>: <tg-spoiler><i>${error.message}</i></tg-spoiler>
    `);

    console.error(error);
  }
});
