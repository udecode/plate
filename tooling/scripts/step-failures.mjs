import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { stripVTControlCharacters } from 'node:util';

const TEST_FILE = /\.(?:spec|test)\.[cm]?[jt]sx?$/u;
// turbo starts each line of a package task with its id, such as
// `plitejs:test:partition:core: `.
const TASK_PREFIX = /^((@?[\w.-]+(?:\/[\w.-]+)?):[\w-]+(?::[\w-]+)*): /u;

export const failureKey = ({ file, test }) => `${file ?? '?'} › ${test}`;
export const failureFile = (key) => {
  const file = key.slice(0, key.indexOf(' › '));
  return file === '?' ? null : file;
};
export const stepOutput = (log, step) => {
  const lines = log.split('\n');
  const start = lines.findIndex((line) => line.startsWith(`[check] ${step}: `));
  if (start === -1) return log;
  const end = lines.findIndex(
    (line, index) =>
      index > start &&
      [' ok in ', ' failed ', ' interrupted in '].some((state) =>
        line.startsWith(`[check] ${step}${state}`)
      )
  );
  return lines.slice(start, end === -1 ? undefined : end).join('\n');
};

const resolver = (root) => {
  const folders = ['apps', 'packages'].flatMap((parent) =>
    existsSync(join(root, parent))
      ? readdirSync(join(root, parent)).map((name) => `${parent}/${name}`)
      : []
  );
  const named = new Map(
    folders.flatMap((folder) => {
      const manifest = join(root, folder, 'package.json');
      return existsSync(manifest)
        ? [[JSON.parse(readFileSync(manifest, 'utf-8')).name, folder]]
        : [];
    })
  );
  return (file, task) => {
    const own = named.get(task);
    if (own && existsSync(join(root, own, file))) return `${own}/${file}`;
    if (existsSync(join(root, file))) return file;
    const found = folders.filter((folder) =>
      existsSync(join(root, folder, file))
    );
    return found.length === 1 ? `${found[0]}/${file}` : null;
  };
};

export const failuresOf = (output, root) => {
  const resolve = resolver(root);
  const failures = new Map();
  const headers = new Map();
  const summaries = new Set();
  let nodeFile;
  const add = (file, test) => {
    const failure = { file, test: test.trim() };
    failures.set(failureKey(failure), failure);
  };
  for (const raw of output.split('\n')) {
    const plain = stripVTControlCharacters(raw);
    const prefix = TASK_PREFIX.exec(plain);
    const task = prefix?.[1];
    const packageName = prefix?.[2];
    const line = prefix ? plain.slice(prefix[0].length) : plain;
    const header = /^(\S+):$/u.exec(line);
    if (header && TEST_FILE.test(header[1])) {
      headers.set(task, resolve(header[1], packageName));
      continue;
    }
    if (line.startsWith('bun test v')) {
      summaries.delete(task);
      continue;
    }
    // Bun repeats each failure in a summary after the last file's header.
    if (/^\d+ tests? failed:$/u.test(line)) {
      summaries.add(task);
      continue;
    }
    const bun = /^\(fail\) (.+?)(?: \[[\d.]+m?s\])?$/u.exec(line);
    if (bun) {
      if (!summaries.has(task)) add(headers.get(task) ?? null, bun[1]);
      continue;
    }
    const at = /^test at (\S+?):\d+:\d+$/u.exec(line);
    if (at) {
      nodeFile = resolve(at[1], packageName);
      continue;
    }
    const node = /^✖ (.+?)(?: \([\d.]+m?s\))?$/u.exec(line);
    if (node && nodeFile !== undefined) {
      add(nodeFile, node[1]);
      nodeFile = undefined;
      continue;
    }
    const vitest =
      /^\s*FAIL\s+(\S+?\.(?:spec|test)\.[cm]?[jt]sx?) > (.+)$/u.exec(line);
    if (vitest) {
      add(resolve(vitest[1], packageName), vitest[2]);
      continue;
    }
    const playwright = /^\s*\d+\) \[[\w-]+\] › (\S+?):\d+:\d+ › (.+)$/u.exec(
      line
    );
    if (playwright) {
      add(resolve(playwright[1], packageName), playwright[2]);
      continue;
    }
    const audit = /^- (\S+?):\d+:\d+: (.+)$/u.exec(line);
    if (audit) add(resolve(audit[1], packageName) ?? audit[1], audit[2]);
  }
  return failures;
};
