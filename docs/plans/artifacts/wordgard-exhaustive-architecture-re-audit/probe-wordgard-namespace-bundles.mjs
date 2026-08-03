#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactRoot, '../../../..');
const wordgard = resolve(root, '../wordgard');
const packageDirectory = readdirSync(resolve(root, 'node_modules/.pnpm')).find(
  (name) => name.startsWith('rolldown@') && !name.startsWith('rolldown-plugin')
);
if (!packageDirectory) throw new Error('Rolldown is not installed.');
const { rolldown } = await import(
  pathToFileURL(
    resolve(
      root,
      'node_modules/.pnpm',
      packageDirectory,
      'node_modules/rolldown/dist/index.mjs'
    )
  ).href
);
const esbuild = resolve(root, 'node_modules/.pnpm/node_modules/.bin/esbuild');

const cases = [
  {
    exportName: 'heading',
    id: 'heading.keyBindings',
    member: 'keyBindings',
    module: 'dist/schema.js',
    siblingSentinels: ['heading_1', '^(#{1,6}) $'],
  },
  {
    exportName: 'heading',
    id: 'heading.createOnHash',
    member: 'createOnHash',
    module: 'dist/schema.js',
    siblingSentinels: ['Ctrl-Shift-1', 'heading_1'],
  },
  {
    exportName: 'imageResizing',
    id: 'imageResizing.keyBindings',
    member: 'keyBindings',
    module: 'dist/schema.js',
    siblingSentinels: ['resizeHandle', 'selectedImage'],
  },
  {
    exportName: 'Command',
    id: 'Command.bind',
    member: 'bind',
    module: 'dist/command.js',
    siblingSentinels: ['Menu', 'toggleBlock'],
  },
];

const temporary = mkdtempSync(join(tmpdir(), 'wordgard-namespace-probe-'));
const results = [];

try {
  for (const probe of cases) {
    const entry = resolve(temporary, `${probe.id.replaceAll('.', '-')}.mjs`);
    const source = resolve(wordgard, probe.module);
    writeFileSync(
      entry,
      `import { ${probe.exportName} } from ${JSON.stringify(source)};\nexport const selected = ${probe.exportName}.${probe.member};\n`
    );

    const bundle = await rolldown({ input: entry });
    const generated = await bundle.generate({ format: 'esm' });
    const rolldownCode = generated.output
      .filter((item) => item.type === 'chunk')
      .map((item) => item.code)
      .join('\n');
    await bundle.close();

    const esbuildOutput = resolve(
      temporary,
      `${probe.id.replaceAll('.', '-')}-esbuild.mjs`
    );
    execFileSync(
      esbuild,
      [
        entry,
        '--bundle',
        '--format=esm',
        '--log-level=silent',
        '--minify',
        '--tsconfig-raw={"compilerOptions":{}}',
        `--outfile=${esbuildOutput}`,
      ],
      { cwd: wordgard, encoding: 'utf8' }
    );
    const esbuildCode = readFileSync(esbuildOutput, 'utf8');

    results.push({
      id: probe.id,
      module: probe.module,
      sourceBytes: Buffer.byteLength(readFileSync(source)),
      rolldown: {
        bytes: Buffer.byteLength(rolldownCode),
        gzipBytes: gzipSync(rolldownCode).byteLength,
        siblingSentinels: Object.fromEntries(
          probe.siblingSentinels.map((sentinel) => [
            sentinel,
            rolldownCode.includes(sentinel),
          ])
        ),
      },
      esbuild: {
        bytes: Buffer.byteLength(esbuildCode),
        gzipBytes: gzipSync(esbuildCode).byteLength,
        siblingSentinels: Object.fromEntries(
          probe.siblingSentinels.map((sentinel) => [
            sentinel,
            esbuildCode.includes(sentinel),
          ])
        ),
      },
    });
  }
} finally {
  rmSync(temporary, { force: true, recursive: true });
}

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  method:
    'Bundle one property from Wordgard current dist namespace objects with Rolldown and esbuild; report byte/gzip size and concept-specific sibling sentinels.',
  rolldown: packageDirectory,
  esbuild: execFileSync(esbuild, ['--version'], { encoding: 'utf8' }).trim(),
  wordgardHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: wordgard,
    encoding: 'utf8',
  }).trim(),
  results,
};

writeFileSync(
  resolve(artifactRoot, 'wordgard-namespace-bundle-probe.json'),
  `${JSON.stringify(output, null, 2)}\n`
);
process.stdout.write(`${JSON.stringify(output)}\n`);
