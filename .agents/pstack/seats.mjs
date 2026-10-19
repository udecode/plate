#!/usr/bin/env node
// Installed by the sync-pstack skill.

import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ask } from './cross.mjs';

const SEAT = /^([\w-]+)=(claude|codex):([^@\s]+)(?:@(\w+))?$/u;
const usage = 'Usage: node .agents/pstack/seats.mjs --dir <answer dir> (--prompt-file <path> | --prompt <prompt>) [--timeout <seconds>] <name>=<claude|codex>:<model>[@<effort>]...';

export async function main(argv) {
  const seats = [];
  let dir;
  let prompt;
  let timeout = 1800;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dir') dir = argv[++index];
    else if (arg === '--prompt-file' || arg === '--prompt') {
      const value = argv[++index];
      if (prompt !== undefined || value === undefined) {
        console.error(`give one prompt, with --prompt-file or --prompt\n${usage}`);
        return 2;
      }
      prompt = arg === '--prompt' ? value : readFileSync(value, 'utf8');
    } else if (arg === '--timeout') timeout = Number(argv[++index]);
    else {
      const match = arg.match(SEAT);
      if (!match || seats.some((seat) => seat.name === match[1])) {
        console.error(`${match ? 'seat name given twice' : 'bad seat'}: ${arg}\n${usage}`);
        return 2;
      }
      seats.push({ name: match[1], runtime: match[2], model: match[3], effort: match[4] });
    }
  }
  if (!dir || !prompt?.trim() || seats.length === 0 || !(timeout > 0 && timeout <= 3600)) {
    console.error(usage);
    return 2;
  }
  mkdirSync(dir, { recursive: true });
  const answers = await Promise.all(
    seats.map(async (seat) => {
      let answer;
      try {
        answer = await ask(seat.runtime, prompt, { timeout, model: seat.model, effort: seat.effort, reach: seat.runtime === 'codex' });
        writeFileSync(join(dir, `${seat.name}.err`), `${answer.ok ? '' : `${answer.text}\n`}${answer.seat ? `seat: ${answer.seat}\n` : ''}`);
        writeFileSync(join(dir, `${seat.name}.md`), answer.ok ? `${answer.text}\n` : '');
      } catch (error) {
        answer = { seat: answer?.seat, ok: false, text: error.message };
      }
      return { ...seat, ...answer };
    }),
  );
  for (const answer of answers) {
    console.info(`${answer.name}: ${answer.ok ? 'ok' : `failed, ${answer.text.split('\n')[0]}`}${answer.seat ? `, seat: ${answer.seat}` : ''}`);
  }
  return answers.every((answer) => answer.ok) ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => {
    process.exit(code);
  });
}
