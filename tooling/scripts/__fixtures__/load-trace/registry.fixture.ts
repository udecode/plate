import { expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const fixture = (...parts: string[]) =>
  path.join(import.meta.dir, parts.join(''));

test('loads a module through every form the trace must see', async () => {
  await import(fixture('comp', 'uted.ts'));
  await import(`./query.ts?v=${1}`);
  await import(fixture('da', 'ta.json'));
  createRequire(import.meta.url)(fixture('com', 'mon.cjs'));

  for (const args of [
    ['run', fixture('chi', 'ld.ts')],
    ['--eval', `await import(${JSON.stringify(fixture('evalu', 'ated.ts'))})`],
    [fixture('exi', 'ting.ts')],
  ]) {
    expect(spawnSync(process.execPath, args, { stdio: 'inherit' }).status).toBe(
      0
    );
  }
});
