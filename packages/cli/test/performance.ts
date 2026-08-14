import {
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateEditor } from '../src/generate';
import { NativeTypeScriptSession } from '../src/typescript';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '../..');
const fixtureDirectory = join(
  repoRoot,
  'apps/www/tmp/cli-performance',
  String(process.pid)
);
const sourceEditorPath = join(
  repoRoot,
  'apps/www/src/registry/components/editor/editor.ts'
);
const editorImport = relative(fixtureDirectory, sourceEditorPath)
  .replaceAll('\\', '/')
  .replace(/\.ts$/, '');
const entryPath = join(fixtureDirectory, 'editor.ts');
const typesPath = join(fixtureDirectory, 'editor.generated.ts');
const schemaPath = join(fixtureDirectory, 'editor.schema.json');
const collectTiming = process.env.PLATE_CLI_TIMING === '1';
const runCount = Number(process.env.PLATE_CLI_RUNS ?? 10);

if (!Number.isSafeInteger(runCount) || runCount < 1 || runCount > 100) {
  throw new Error('PLATE_CLI_RUNS must be an integer between 1 and 100.');
}
const session = new NativeTypeScriptSession(repoRoot, collectTiming);
const renderEditor = (
  version: number
) => `export { EditorKit as BenchmarkKit } from ${JSON.stringify(editorImport.startsWith('.') ? editorImport : `./${editorImport}`)};

export const BenchmarkSchema = { id: 'plate-cli-benchmark', version: ${version} } as const;
`;

try {
  mkdirSync(fixtureDirectory, { recursive: true });
  writeFileSync(entryPath, renderEditor(1));
  await generateEditor(entryPath, { cwd: repoRoot }, session);
  const runs: number[] = [];

  for (let version = 2; version <= runCount + 1; version++) {
    writeFileSync(entryPath, renderEditor(version));
    session.recordFileChange('change', entryPath);
    const start = performance.now();

    const result = await generateEditor(entryPath, { cwd: repoRoot }, session);
    runs.push((performance.now() - start) / 1000);
    const emittedSchema = JSON.parse(readFileSync(schemaPath, 'utf8')) as {
      identity?: { version?: number };
    };

    if (
      result.status !== 'generated' ||
      emittedSchema.identity?.version !== version
    ) {
      throw new Error(
        `Warm generation did not publish schema version ${version}.`
      );
    }
  }
  const sorted = [...runs].sort((left, right) => left - right);
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1]!;
  const typesMtime = statSync(typesPath).mtimeMs;
  const schemaMtime = statSync(schemaPath).mtimeMs;

  const unchanged = await generateEditor(entryPath, { cwd: repoRoot }, session);
  if (unchanged.status !== 'upToDate') {
    throw new Error('An unchanged warm generation did not report up to date.');
  }
  if (
    statSync(typesPath).mtimeMs !== typesMtime ||
    statSync(schemaPath).mtimeMs !== schemaMtime
  ) {
    throw new Error('An unchanged warm generation rewrote its artifacts.');
  }
  process.stdout.write(
    `${JSON.stringify(
      {
        median: sorted[Math.floor(sorted.length / 2)],
        p95,
        runs,
        ...(collectTiming ? { typescript: await session.getTimingInfo() } : {}),
        typesHashInputBytes: readFileSync(typesPath).byteLength,
      },
      null,
      2
    )}\n`
  );
  if (p95 > 12) {
    throw new Error(`Warm affected-editor p95 ${p95.toFixed(3)}s exceeds 12s.`);
  }
} finally {
  try {
    await session.close();
  } finally {
    rmSync(fixtureDirectory, { force: true, recursive: true });
  }
}
