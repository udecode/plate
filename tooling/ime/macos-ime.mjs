// Node front end for tooling/ime/macos-ime.swift: compiles it once per source
// hash and runs one command per call.

import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'macos-ime.swift');
const cacheDirectory = join(here, '../../node_modules/.cache/plate-proof');

export const PINYIN_SIMPLIFIED = 'com.apple.inputmethod.SCIM.ITABC';

const binary = () => {
  const digest = createHash('sha256')
    .update(readFileSync(source))
    .digest('hex')
    .slice(0, 16);
  const path = join(cacheDirectory, `macos-ime-${digest}`);

  if (!existsSync(path)) {
    mkdirSync(cacheDirectory, { recursive: true });
    execFileSync('xcrun', ['swiftc', '-O', source, '-o', path], {
      stdio: 'inherit',
    });
  }

  return path;
};

const run = (args) => {
  const result = spawnSync(binary(), args, { encoding: 'utf-8' });
  const output = result.stdout.trim();
  const value = output ? JSON.parse(output) : {};

  if (result.status !== 0) {
    const error = new Error(
      `macos-ime ${args[0]} failed: ${value.error ?? result.stderr.trim()}`
    );
    error.result = value;
    throw error;
  }

  return value;
};

export const imeStatus = (mode = PINYIN_SIMPLIFIED) => run(['status', mode]);

export const findWindow = (title) => run(['window', title]);

export const selectInputSource = (id, owner = process.pid) =>
  run(['select', id, '--owner', String(owner)]);

export const postKeys = (
  pid,
  keys,
  { hid = false, owner = process.pid } = {}
) =>
  run([
    'post',
    String(pid),
    keys,
    '--owner',
    String(owner),
    ...(hid ? ['--hid'] : []),
  ]);

export const restoreInputSource = (owner = process.pid) =>
  run(['restore', '--owner', String(owner)]);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, ...rest] = process.argv.slice(2);
  const commands = {
    restore: () => restoreInputSource(),
    status: () => imeStatus(rest[0]),
  };

  if (!commands[command]) {
    process.stderr.write(
      'usage: node tooling/ime/macos-ime.mjs status [mode] | restore\n'
    );
    process.exit(64);
  }

  process.stdout.write(`${JSON.stringify(commands[command](), null, 2)}\n`);
}
