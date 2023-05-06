import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

export const ffmpeg = createFFmpeg();

export async function ogaToWav(buffer: Buffer) {
  ffmpeg.FS('writeFile', 'input.oga', await fetchFile(buffer));

  await ffmpeg.run('-i', 'input.oga', 'output.wav');

  await fs.writeFile('output.wav', ffmpeg.FS('readFile', 'output.wav'));

  const file = createReadStream('output.wav') as unknown as File;

  await fs.rm('output.wav');

  return file;
}
