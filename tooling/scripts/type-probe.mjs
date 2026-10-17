#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const USAGE =
  'Usage: node tooling/scripts/type-probe.mjs [--tree <checkout>] [--package <name>] [--tsc <bin>] [--out <dir>] <probe.ts>...';
const DIAGNOSTIC = /^(.+)\((\d+),(\d+)\): error (TS\d+): (.*)$/;
const checkout = resolve(import.meta.dirname, '../..');

const real = (file) => (existsSync(file) ? realpathSync(file) : file);

const PROBE_ERRORS = 1;
const NO_RESULT = 2;

const fail = (message) => {
  console.error(message);
  process.exit(NO_RESULT);
};

const parse = (argv) => {
  const options = {
    package: 'plate',
    tree: checkout,
    tsc: join(checkout, 'node_modules/.bin/tsc'),
  };
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      args: argv,
      options: {
        out: { type: 'string' },
        package: { type: 'string' },
        tree: { type: 'string' },
        tsc: { type: 'string' },
      },
    });
  } catch (error) {
    fail(`${error.message}\n${USAGE}`);
  }
  Object.assign(options, parsed.values);
  options.probes = parsed.positionals.map((probe) => resolve(probe));
  if (options.probes.length === 0) fail(USAGE);
  if (options.tsc.includes('/')) options.tsc = resolve(options.tsc);
  return options;
};

const options = parse(process.argv.slice(2));
const tree = resolve(options.tree);
const tsconfig = join(tree, 'packages', options.package, 'tsconfig.json');
for (const file of [tsconfig, ...options.probes]) {
  if (!existsSync(file)) fail(`no file at ${file}`);
}
options.probes = options.probes.map(real);
const out = resolve(options.out ?? dirname(options.probes[0]));
mkdirSync(out, { recursive: true });
const config = join(out, 'tsconfig.type-probe.json');
writeFileSync(
  config,
  `${JSON.stringify(
    {
      compilerOptions: {
        composite: false,
        incremental: false,
        noEmit: true,
        rootDir: '/',
        typeRoots: [join(tree, 'node_modules/@types')],
        types: [],
      },
      extends: tsconfig,
      files: [...options.probes, join(tree, 'tooling/config/global.d.ts')],
      include: [],
    },
    null,
    2
  )}\n`
);

const result = spawnSync(
  options.tsc,
  ['-p', config, '--pretty', 'false', '--listFiles'],
  {
    cwd: tree,
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
  }
);
const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
writeFileSync(join(out, 'tsc.out'), output);

const diagnostics = [];
for (const line of output.split('\n')) {
  const match = DIAGNOSTIC.exec(line);
  if (match) {
    const [, file, row, column, code, message] = match;
    diagnostics.push({
      code,
      column,
      file: real(resolve(tree, file)),
      lines: [message],
      row,
    });
  } else if (diagnostics.length > 0 && /^\s+\S/.test(line)) {
    diagnostics.at(-1).lines.push(line.trim());
  }
}

if (result.error || result.signal || result.status === null) {
  fail(
    `tsc did not run: ${result.error?.message ?? `signal ${result.signal}`}`
  );
}
if (result.status !== 0 && diagnostics.length === 0) {
  fail(`tsc exited ${result.status} without a diagnostic:\n${output.trim()}`);
}
const listed = new Set(
  output
    .split('\n')
    .filter((line) => line.trim() && !DIAGNOSTIC.test(line))
    .map((line) => real(resolve(tree, line.trim())))
);
const unread = options.probes.filter((probe) => !listed.has(probe));
if (unread.length > 0) {
  fail(`tsc did not list ${unread.join(', ')} among the files it read`);
}

const probes = new Set(options.probes);
const own = diagnostics.filter((diagnostic) => probes.has(diagnostic.file));
for (const { code, column, file, lines, row } of own) {
  console.log(
    `${relative(process.cwd(), file)}:${row}:${column} ${code} ${lines.join(' ')}`
  );
}
const stray = diagnostics.length - own.length;
if (stray > 0) {
  console.log(
    `${stray} error(s) outside the probes; see ${join(out, 'tsc.out')}`
  );
}
console.log(`${own.length} error(s) in ${options.probes.length} probe(s)`);
process.exit(own.length > 0 ? PROBE_ERRORS : 0);
