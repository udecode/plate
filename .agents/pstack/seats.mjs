#!/usr/bin/env node
// Installed by the sync-pstack skill.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ask } from './cross.mjs';

const SEAT = /^([\w-]+)=(claude|codex|agy):([^@\s]+)(?:@(\w+))?$/u;
const CLAUDE_SEAT_NOTE = 'You run in plan mode and cannot leave it. Read-only commands work, and expect every write to be refused, a scratch copy included. Prove what a read-only command can prove, and name each probe that needs a write, with its commands, so the lead can run it.';
const usage = 'Usage: node .agents/pstack/seats.mjs --dir <answer dir> (--prompt-file <path> | --prompt <prompt>) [--timeout <seconds>] [--read-dir <dir>]... [--offline] [--effort-root <dir>] <name>=<claude|codex|agy>:<model>[@<effort>]...';

function mainCheckout() {
  try {
    return dirname(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim());
  } catch {
    return null;
  }
}

export async function main(argv) {
  const seats = [];
  const readDirs = [];
  let dir;
  let prompt;
  let timeout;
  let offline = false;
  let effortRoot;
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
    else if (arg === '--offline') offline = true;
    else if (arg === '--effort-root') {
      const value = argv[++index];
      if (value === undefined) {
        console.error(usage);
        return 2;
      }
      effortRoot = resolve(value);
    }
    else if (arg === '--read-dir') {
      const value = argv[++index];
      if (value === undefined) {
        console.error(usage);
        return 2;
      }
      readDirs.push(resolve(value));
    }
    else {
      const match = arg.match(SEAT);
      if (!match || seats.some((seat) => seat.name === match[1])) {
        console.error(`${match ? 'seat name given twice' : 'bad seat'}: ${arg}\n${usage}`);
        return 2;
      }
      seats.push({ name: match[1], runtime: match[2], model: match[3], effort: match[4] });
    }
  }
  if (!dir || !prompt?.trim() || seats.length === 0 || !(timeout === undefined || timeout > 0)) {
    console.error(usage);
    return 2;
  }
  mkdirSync(dir, { recursive: true });
  const seatDirs = [...new Set([mainCheckout(), ...readDirs].filter(Boolean))];
  const answers = await Promise.all(
    seats.map(async (seat) => {
      const answer = await ask(seat.runtime, seat.runtime === 'claude' ? `${CLAUDE_SEAT_NOTE}\n\n${prompt}` : prompt, { timeout, model: seat.model, effort: seat.effort, effortRoot, reach: seat.runtime === 'codex' && !offline, offline, readDirs: seat.runtime === 'codex' ? [] : seatDirs }).catch((error) => ({ ok: false, text: error.message }));
      try {
        writeFileSync(join(dir, `${seat.name}.err`), `${answer.ok ? '' : `${answer.text}\n`}${answer.refused ? `refused: ${answer.refused}\n` : ''}${answer.seat ? `seat: ${answer.seat}\n` : ''}`);
        writeFileSync(join(dir, `${seat.name}.md`), answer.ok ? `${answer.text}\n` : '');
        return { ...seat, ...answer };
      } catch (error) {
        return { ...seat, ...answer, ok: false, refused: null, text: error.message };
      }
    }),
  );
  const skipped = (answer) => !answer.ok && (answer.refused || answer.runtime === 'agy');
  for (const answer of answers) {
    const reason = answer.text.split('\n')[0];
    const outcome = answer.ok ? 'ok' : answer.refused ? `skipped, its provider refused the prompt for ${answer.refused}` : skipped(answer) ? `skipped, ${reason}` : `failed, ${reason}`;
    console.info(`${answer.name}: ${outcome}${answer.seat ? `, seat: ${answer.seat}` : ''}`);
  }
  return answers.every((answer) => answer.ok || skipped(answer)) && answers.some((answer) => answer.ok) ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => {
    process.exit(code);
  });
}
