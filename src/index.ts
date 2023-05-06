/* eslint-disable import/first */
import dotenv from 'dotenv';

dotenv.config();

import './commands/start';
import './commands/clear';
import './commands/image';
import './message/text';
import './message/voice';

import { bot } from './bot';
import { ffmpeg } from './ffmpeg';
import { midjourney } from './midjourney';

async function run() {
  await ffmpeg.load();
  await midjourney.launch();

  bot.launch({ dropPendingUpdates: true });

  console.info('Bot is ready!');
}

run();
