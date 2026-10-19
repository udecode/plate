#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const platePackage = path.join(repoRoot, 'packages/platejs');
const requireFromPlate = createRequire(path.join(platePackage, 'package.json'));

const baselinePath = path.join(
  repoRoot,
  'tooling/entrypoints/declaration-consumer-baseline.json'
);
const update = process.argv.includes('--update-baseline');
const extraTscArgs = process.argv
  .slice(2)
  .filter((argument) => argument !== '--update-baseline');

const plateConsumers = {
  consumerPlugin: `import { definePlugin } from 'platejs';
export const consumerPlugin = definePlugin('consumerPlugin', {});
`,
  deleteWordBackward: `import { defineCommand } from 'platejs';
export const deleteWordBackward = defineCommand('consumer.delete-word-backward', {
  build: ({ state }) =>
    state.transaction((tx) => {
      tx.text.delete({ reverse: true, unit: 'word' });
    }),
});
`,
  documentTitle: `import { defineStateField, valueCodecs } from 'platejs';
export const documentTitle = defineStateField({
  key: 'consumer.title',
  collab: 'shared',
  history: 'push',
  initial: () => 'Untitled',
  persist: { ...valueCodecs.string, version: 1 },
});
`,
  headerView: `import { createEditor, createEditorView } from 'platejs';
export const headerView = createEditorView(createEditor(), { root: 'header' });
`,
  plateEditor: `import { createEditor, definePlugin } from 'platejs';
export const plateEditor = createEditor({
  plugins: [definePlugin('consumerPlugin', {})],
});
`,
  textSchema: `import { defineEditorSchema, schema } from 'platejs';
export const textSchema = defineEditorSchema('schema:consumer-text', {
  elements: {
    paragraph: { content: schema.content.text({ min: 0 }) },
  },
  id: 'consumer-text',
  root: schema.content.types(['paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  version: 1,
});
`,
};

const rawConsumers = {
  rawEditor: `import { createEditor } from 'plitejs';
export const rawEditor = createEditor();
`,
  rawPlugin: `import { definePlugin } from 'plitejs';
export const rawPlugin = definePlugin('rawPlugin', {});
`,
  rawSchema: `import { defineEditorSchema, schema } from 'plitejs';
export const rawSchema = defineEditorSchema('schema:raw-consumer', {
  elements: {
    paragraph: { content: schema.content.text({ min: 0 }) },
  },
  id: 'raw-consumer',
  root: schema.content.types(['paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  version: 1,
});
`,
};

const packageDirectory = (name) =>
  path.dirname(requireFromPlate.resolve(`${name}/package.json`));

const problems = [];
const unnamedType =
  /([\w-]+)\.ts\(\d+,\d+\): error (TS2742|TS2883): The inferred type of '([^']+)' cannot be named without a reference to '([^']+)' from '([^']+)'/u;

// Chunk file names carry a content hash, so the baseline keeps their stable
// part: `./node_modules/platejs/dist/core-BgPx2azl` becomes `platejs/dist/core`.
const stableOrigin = (origin) =>
  origin.replace(/^\.\/node_modules\//u, '').replace(/(?:-[\w-]{8})+$/u, '');

const runProject = (packageName, consumers) => {
  const project = mkdtempSync(
    path.join(tmpdir(), 'plate-declaration-consumer-')
  );
  const nodeModules = path.join(project, 'node_modules');

  mkdirSync(path.join(nodeModules, '@types'), { recursive: true });
  symlinkSync(
    path.join(repoRoot, 'packages', packageName),
    path.join(nodeModules, packageName),
    'dir'
  );

  for (const name of [
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom',
  ]) {
    symlinkSync(packageDirectory(name), path.join(nodeModules, name), 'dir');
  }

  for (const [name, source] of Object.entries(consumers)) {
    writeFileSync(path.join(project, `${name}.ts`), source);
  }

  writeFileSync(
    path.join(project, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true,
        jsx: 'react-jsx',
        lib: ['ES2022', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        outDir: 'out',
        skipLibCheck: true,
        strict: true,
        target: 'ES2022',
        types: [],
      },
      files: Object.keys(consumers).map((name) => `${name}.ts`),
    })
  );

  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, 'node_modules/typescript/bin/tsc'),
      '-p',
      path.join(project, 'tsconfig.json'),
      ...extraTscArgs,
    ],
    { encoding: 'utf-8' }
  );
  const findings = [];

  for (const line of `${result.stdout}${result.stderr}`.split('\n')) {
    if (!line.includes(': error TS')) continue;

    const match = unnamedType.exec(line);

    if (match) {
      findings.push(
        `${match[2]} ${match[3]} needs ${match[4]} from ${stableOrigin(match[5])}`
      );
    } else {
      problems.push(`${packageName}: ${line}`);
    }
  }

  const blocked = new Set(findings.map((finding) => finding.split(' ')[1]));

  for (const name of Object.keys(consumers)) {
    const file = path.join(project, 'out', `${name}.d.ts`);
    const declarations = existsSync(file) ? readFileSync(file, 'utf-8') : '';

    if (declarations.includes('plitejs/internal')) {
      problems.push(`${name}.d.ts names plitejs/internal`);
    } else if (
      !blocked.has(name) &&
      !declarations.includes(`export declare const ${name}`)
    ) {
      problems.push(`no declaration emitted for ${name}`);
    }
  }

  rmSync(project, { force: true, recursive: true });

  return {
    blocked: blocked.size,
    emitted: Object.keys(consumers).length - blocked.size,
    findings,
  };
};

const plate = runProject('platejs', plateConsumers);
const raw = runProject('plitejs', rawConsumers);
const findings = [...plate.findings, ...raw.findings].toSorted();
const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, 'utf-8'))
  : [];

if (update) {
  const remaining = [...findings];
  const kept = baseline.filter((entry) => {
    const index = remaining.indexOf(entry);

    if (index === -1) return false;
    remaining.splice(index, 1);
    return true;
  });

  writeFileSync(baselinePath, `${JSON.stringify(kept, null, 2)}\n`);
  console.log(
    `check-declaration-consumer: baseline keeps ${kept.length} of ${baseline.length}`
  );
  process.exit(0);
}

const unmatched = [...baseline];

for (const finding of findings) {
  const index = unmatched.indexOf(finding);

  if (index === -1) problems.push(`new: ${finding}`);
  else unmatched.splice(index, 1);
}

for (const entry of unmatched) {
  problems.push(`fixed, drop it with --update-baseline: ${entry}`);
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error('check-declaration-consumer: failed');
  process.exit(1);
}

console.log(
  `check-declaration-consumer: ${plate.emitted + raw.emitted} exports emitted without private paths, ${findings.length} baselined findings`
);
