import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { Markup } from 'telegraf';

import { bot, showSpinner } from '../bot';
import { midjourney } from '../midjourney';
import { openai } from '../openai';

bot.action(/upscale_image/, async (ctx) => {
  let hideSpinner;

  try {
    const [messageId, index] = ctx.match.input
      .replace('upscale_image_', '')
      .split('.');

    hideSpinner = await showSpinner(ctx, `Upscale image #${Number(index) + 1}`);

    const { url } = await midjourney.upscaleImage(messageId, Number(index));

    await hideSpinner();

    await ctx.replyWithPhoto(url);
  } catch (error) {
    await hideSpinner();

    await ctx.replyWithHTML(/* HTML */ `
      <b>Error</b>: <tg-spoiler><i>${error.message}</i></tg-spoiler>
    `);

    console.error(error);
  }
});

// TODO: save data to database
bot.command('image', async (ctx) => {
  let hideCompletionSpinner;
  let hideImageSpinner;

  try {
    hideCompletionSpinner = await showSpinner(
      ctx,
      'Generating prompt for Midjourney',
    );

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: `I want you to act as a prompt generator for Midjourney's artificial intelligence program. Your job is to provide detailed and creative descriptions that will inspire unique and interesting images from the AI. Keep in mind that the AI is capable of understanding a wide range of language and can interpret abstract concepts, so feel free to be as imaginative and descriptive as possible. For example, you could describe a scene from a futuristic city, or a surreal landscape filled with strange creatures. The more detailed and imaginative your description, the more interesting the resulting image will be. Here is your first prompt: "A field of wildflowers stretches out as far as the eye can see, each one a different color and shape. In the distance, a massive tree towers over the landscape, its branches reaching up to the sky like tentacles.`,
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: ctx.message.text.replace('/image ', ''),
        },
      ],
    });

    await hideCompletionSpinner();

    const prompt = completion.data.choices[0].message.content;

    await ctx.reply(`The prompt generated for Midjourney by GPT:\n\n${prompt}`);

    hideImageSpinner = await showSpinner(
      ctx,
      'Generating the image variations',
    );

    const { messageId, url } = await midjourney.createImageVariations(prompt);

    await hideImageSpinner();

    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('1️⃣', `upscale_image_${messageId}.${0}`),
      Markup.button.callback('2️⃣', `upscale_image_${messageId}.${1}`),
      Markup.button.callback('3️⃣', `upscale_image_${messageId}.${2}`),
      Markup.button.callback('4️⃣', `upscale_image_${messageId}.${3}`),
    ]);

    await ctx.replyWithPhoto(url, keyboard);
  } catch (error) {
    await hideCompletionSpinner();
    await hideImageSpinner();

    await ctx.replyWithHTML(/* HTML */ `
      <b>Error</b>: <tg-spoiler><i>${error.message}</i></tg-spoiler>
    `);

    console.error(error);
  }
});
