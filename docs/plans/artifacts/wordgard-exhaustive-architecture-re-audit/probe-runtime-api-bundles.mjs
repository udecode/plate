#!/usr/bin/env node

import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactRoot, '../../../..');
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

const cases = Object.freeze([
  [
    'NodeApi.string',
    'packages/plite/src/interfaces/node.ts',
    'NodeApi',
    'string',
  ],
  [
    'NodeApi.isText',
    'packages/plite/src/interfaces/node.ts',
    'NodeApi',
    'isText',
  ],
  [
    'PathApi.equals',
    'packages/plite/src/interfaces/path.ts',
    'PathApi',
    'equals',
  ],
  [
    'PointApi.equals',
    'packages/plite/src/interfaces/point.ts',
    'PointApi',
    'equals',
  ],
  [
    'TextApi.isText',
    'packages/plite/src/interfaces/text.ts',
    'TextApi',
    'isText',
  ],
]);
const temporary = mkdtempSync(join(tmpdir(), 'plite-runtime-api-probe-'));
const results = [];

try {
  for (const [id, source, objectName, method] of cases) {
    const entry = resolve(temporary, `${id.replaceAll('.', '-')}.ts`);
    const absoluteSource = resolve(root, source);
    writeFileSync(
      entry,
      `import { ${objectName} } from ${JSON.stringify(absoluteSource)};\nexport const selected = ${objectName}.${method};\n`
    );
    const bundle = await rolldown({ input: entry });
    const generated = await bundle.generate({ format: 'esm' });
    const code = generated.output
      .filter((item) => item.type === 'chunk')
      .map((item) => item.code)
      .join('\n');
    results.push({
      bytes: Buffer.byteLength(code),
      id,
      source,
      sourceBytes: Buffer.byteLength(readFileSync(absoluteSource)),
    });
    await bundle.close();
  }
} finally {
  rmSync(temporary, { force: true, recursive: true });
}

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  method:
    'Rolldown source-entry ESM bundle exporting one method selected from the current frozen runtime API object; unminified output bytes.',
  plateHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim(),
  rolldown: packageDirectory,
  results,
};
writeFileSync(
  resolve(artifactRoot, 'runtime-api-bundle-probe.json'),
  `${JSON.stringify(output, null, 2)}\n`
);
process.stdout.write(`${JSON.stringify(output)}\n`);
