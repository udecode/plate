#!/usr/bin/env node
// Bundles minimal production imports of plitejs/react and platejs/react with
// and without installBrowserHandle(), and fails when a bundle that never
// installs the handle still carries it.
// Usage: node tooling/scripts/measure-browser-handle.mjs [--skip-build]

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const tempDir = join(repo, 'node_modules/.cache/plate-proof/browser-handle');
const HANDLE_KEY = '__pliteBrowserHandle';

const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: repo, stdio: 'inherit' });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited ${result.status}`);
  }
};

const surfaces = {
  plate: {
    entry: join(repo, 'packages/platejs/dist/react/index.js'),
    names: ['createEditor', 'EditorContent', 'EditorRoot'],
  },
  plite: {
    entry: join(repo, 'packages/plitejs/dist/react/index.js'),
    names: ['createEditor', 'Editable', 'EditorRoot'],
  },
};

const bundle = (surface, install) => {
  const { entry, names } = surfaces[surface];
  const imported = install ? [...names, 'installBrowserHandle'] : names;
  const name = `${surface}-${install ? 'installed' : 'production'}`;
  const entryPath = join(tempDir, `${name}.mjs`);
  const outPath = join(tempDir, `${name}.js`);

  writeFileSync(
    entryPath,
    [
      `import { ${imported.join(', ')} } from ${JSON.stringify(entry)};`,
      install ? 'installBrowserHandle();' : '',
      `globalThis.keep = [${names.join(', ')}];`,
    ].join('\n')
  );
  run('bun', [
    'build',
    entryPath,
    '--target=browser',
    '--format=esm',
    '--minify',
    '--define',
    'process.env.NODE_ENV="production"',
    '--outfile',
    outPath,
  ]);

  const code = readFileSync(outPath, 'utf-8');

  return {
    bytes: Buffer.byteLength(code),
    handleKeyCount: code.split(HANDLE_KEY).length - 1,
  };
};

if (!process.argv.includes('--skip-build')) {
  run('pnpm', ['--filter', 'plitejs', 'build']);
  run('pnpm', ['--filter', 'platejs', 'build']);
}

rmSync(tempDir, { force: true, recursive: true });
mkdirSync(tempDir, { recursive: true });

const report = {};
const failures = [];

for (const surface of Object.keys(surfaces)) {
  const production = bundle(surface, false);
  const installed = bundle(surface, true);

  report[surface] = {
    handleBytes: installed.bytes - production.bytes,
    installed,
    production,
  };

  if (production.handleKeyCount > 0) {
    failures.push(`${surface} production bundle still contains ${HANDLE_KEY}`);
  }
  if (installed.handleKeyCount === 0) {
    failures.push(`${surface} installed bundle lacks ${HANDLE_KEY}`);
  }
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (failures.length > 0) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}
