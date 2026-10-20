import { spawnSync } from 'node:child_process';

import { reach } from './imported.ts';
import type { Read } from './typed.ts';

export const run = (file: string, read: Read) =>
  spawnSync(process.execPath, [file, reach, String(read)]);
