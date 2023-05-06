import { type TextBasedChannel } from 'discord.js-selfbot-v13';

import { discord } from './discord';

const { DISCORD_TOKEN, DISCORD_CHANNEL_ID, MIDJOURNEY_BOT_ID } = process.env;

class Midjourney {
  private channel: TextBasedChannel;

  public async launch() {
    await discord.login(DISCORD_TOKEN);

    this.channel = (await discord.channels.fetch(
      DISCORD_CHANNEL_ID,
    )) as TextBasedChannel;
  }

  public async createImageVariations(prompt: string) {
    await this.channel.sendSlash(
      MIDJOURNEY_BOT_ID,
      'imagine',
      `prompt: ${prompt}`,
    );

    const messages = await this.channel.awaitMessages({
      filter: (message) => {
        return (
          message.author.id === MIDJOURNEY_BOT_ID &&
          message.components.length > 1 &&
          message.content.includes('(fast)') &&
          message.mentions.members.first().id == discord.user.id
        );
      },
      max: 1,
    });

    const message = messages.first();

    return {
      messageId: message.id,
      url: message.attachments.first().url,
    };
  }

  public async upscaleImage(messageId: string, index: number) {
    const imageVariationsMessage = await this.channel.messages.fetch(messageId);

    await imageVariationsMessage.clickButton(
      [...imageVariationsMessage.components.values()][0].components[index]
        .customId,
    );

    const messages = await this.channel.awaitMessages({
      filter: (message) => {
        return (
          message.author.id === MIDJOURNEY_BOT_ID &&
          message.components.length >= 1 &&
          message.content.includes('Upscaled') &&
          message.mentions.members.first().id == discord.user.id
        );
      },
      max: 1,
    });

    const message = messages.first();

    return {
      messageId: message.id,
      url: message.attachments.first().url,
    };
  }
}

export const midjourney = new Midjourney();
