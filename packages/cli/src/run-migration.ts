import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { build } from 'esbuild';

import { replaceArtifacts } from './generate';

const CSS_FILE_PATTERN = /\.css$/;
const ANY_FILE_PATTERN = /.*/;

const JSON_EQUAL_SOURCE = `
const jsonEqual = (left, right) => {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonEqual(value, right[index]));
  }
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
    return false;
  }
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length &&
    keys.every((key) => Object.hasOwn(right, key) && jsonEqual(left[key], right[key]));
};
`;

export type RunEditorMigrationsOptions = Readonly<{
  check?: boolean;
  cwd?: string;
  write?: boolean;
}>;

export type EditorMigrationRunResult = Readonly<{
  changed: number;
  files: ReadonlyArray<
    Readonly<{
      applied: readonly number[];
      changed: boolean;
      outputText: string;
      path: string;
    }>
  >;
}>;

export type EditorMigrationInputResult = Readonly<{
  applied: readonly number[];
  changed: boolean;
  outputText: string;
}>;

const evaluate = (
  bundlePath: string,
  requestPath: string,
  resultPath: string,
  cwd: string
) =>
  new Promise<void>((resolvePromise, reject) => {
    execFile(
      process.execPath,
      [bundlePath, requestPath, resultPath],
      { cwd, maxBuffer: 16 * 1024 * 1024 },
      (error, _stdout, stderr) => {
        if (!error) {
          resolvePromise();
          return;
        }
        reject(
          new Error(
            stderr.trim() ||
              `Plate could not run the bundled migration: ${error.message}`
          )
        );
      }
    );
  });

export const runEditorMigrations = async (
  entry: string,
  files: readonly string[],
  options: RunEditorMigrationsOptions = {}
): Promise<EditorMigrationRunResult> => {
  if (options.check && options.write) {
    throw new Error('plate migrate run cannot combine --check and --write.');
  }
  if (files.length === 0) {
    throw new Error('plate migrate run requires at least one JSON document.');
  }

  const cwd = resolve(options.cwd ?? process.cwd());
  const entryPath = resolve(cwd, entry);
  const paths = files.map((path) => resolve(cwd, path));
  const outputDirectory = mkdtempSync(join(tmpdir(), 'plate-migrate-run-'));
  const bundlePath = join(outputDirectory, 'runner.mjs');
  const requestPath = join(outputDirectory, 'request.json');
  const resultPath = join(outputDirectory, 'result.json');
  try {
    const result = await build({
      bundle: true,
      conditions: ['production'],
      format: 'esm',
      jsx: 'automatic',
      logLevel: 'silent',
      platform: 'node',
      plugins: [
        {
          name: 'plate-empty-styles',
          setup(context) {
            context.onResolve({ filter: CSS_FILE_PATTERN }, ({ path }) => ({
              namespace: 'plate-empty-style',
              path,
            }));
            context.onLoad(
              { filter: ANY_FILE_PATTERN, namespace: 'plate-empty-style' },
              () => ({ contents: '', loader: 'js' })
            );
          },
        },
      ],
      stdin: {
        contents: `import * as editorModule from ${JSON.stringify(entryPath)};
import { readFileSync, writeFileSync } from 'node:fs';
import { createBaseEditor, migrateDocument } from '@platejs/core';
import { isNominalPluginDescriptor } from '@platejs/core/internal';
${JSON_EQUAL_SOURCE}

const plugins = editorModule.EditorKit;
const schema = editorModule.EditorSchema;
const migrations = editorModule.EditorMigrations;

if (!Array.isArray(plugins) || !plugins.every(isNominalPluginDescriptor)) {
  throw new Error('Plate migration entry must export EditorKit as a plugin tuple.');
}
if (
  !schema || typeof schema !== 'object' || Array.isArray(schema) ||
  !Object.keys(schema).every((key) => ['id', 'overrides', 'properties', 'version'].includes(key)) ||
  typeof schema.id !== 'string' || typeof schema.version !== 'number' ||
  (schema.overrides !== undefined && !Array.isArray(schema.overrides)) ||
  (schema.properties !== undefined &&
    (!schema.properties || typeof schema.properties !== 'object' || Array.isArray(schema.properties)))
) {
  throw new Error('Plate migration entry must export EditorSchema as a named application schema.');
}
if (
  !migrations || typeof migrations !== 'object' || Array.isArray(migrations) ||
  typeof migrations.id !== 'string' || typeof migrations.version !== 'number' ||
  !migrations.sourceFingerprints || typeof migrations.sourceFingerprints !== 'object' ||
  Array.isArray(migrations.sourceFingerprints) ||
  !Object.values(migrations.sourceFingerprints).every((fingerprint) => typeof fingerprint === 'string') ||
  !migrations.steps || typeof migrations.steps !== 'object' || Array.isArray(migrations.steps) ||
  !Object.values(migrations.steps).every((step) => typeof step === 'function')
) {
  throw new Error('Plate migration entry must export EditorMigrations as a document migration plan.');
}
const request = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const outputs = request.paths.map((path) => {
  const editor = createBaseEditor({ plugins, schema, migrations, skipInitialization: true });
  const sourceText = readFileSync(path, 'utf8');
  const source = JSON.parse(sourceText);
  const input = Array.isArray(source) ? { children: source } : source;
  const migration = migrateDocument(input, { editor, migrations });
  const current = editor.read.schema.identity();
  const hasSelection = !Array.isArray(source) && source && typeof source === 'object' &&
    'document' in source && Object.hasOwn(source, 'selection');

  editor.update.value.replace({
    document: migration.document,
    schema: current,
    ...(hasSelection ? { selection: migration.selection ?? null } : {}),
  });
  const output = {
    document: editor.read.value(),
    schema: current,
    ...(hasSelection ? { selection: editor.read.selection() } : {}),
  };
  const outputText = JSON.stringify(output, null, 2) + '\\n';

  return { applied: migration.applied, changed: !jsonEqual(source, output), outputText, path };
});

writeFileSync(process.argv[3], JSON.stringify(outputs), 'utf8');
`,
        loader: 'ts',
        resolveDir: dirname(entryPath),
        sourcefile: 'plate-migration-runner.ts',
      },
      write: false,
    });
    const output = result.outputFiles?.[0];

    if (!output) throw new Error(`Plate could not bundle "${entryPath}".`);

    writeFileSync(bundlePath, output.text, 'utf-8');
    writeFileSync(requestPath, JSON.stringify({ paths }), 'utf-8');
    await evaluate(bundlePath, requestPath, resultPath, cwd);
    const evaluated = JSON.parse(readFileSync(resultPath, 'utf-8')) as Array<{
      applied: number[];
      changed: boolean;
      outputText: string;
      path: string;
    }>;

    if (options.write) {
      replaceArtifacts(
        evaluated
          .filter(({ changed }) => changed)
          .map(({ outputText, path }) => ({ content: outputText, path }))
      );
    }

    return Object.freeze({
      changed: evaluated.filter(({ changed }) => changed).length,
      files: Object.freeze(
        evaluated.map(({ applied, changed, outputText, path }) =>
          Object.freeze({
            applied: Object.freeze(applied),
            changed,
            outputText,
            path,
          })
        )
      ),
    });
  } finally {
    rmSync(outputDirectory, { force: true, recursive: true });
  }
};

export const runEditorMigrationInput = async (
  entry: string,
  sourceText: string,
  options: Omit<RunEditorMigrationsOptions, 'write'> = {}
): Promise<EditorMigrationInputResult> => {
  const directory = mkdtempSync(join(tmpdir(), 'plate-migrate-input-'));
  const path = join(directory, 'document.json');

  try {
    writeFileSync(path, sourceText, 'utf-8');
    const result = await runEditorMigrations(entry, [path], options);
    const file = result.files[0];

    return Object.freeze({
      applied: file.applied,
      changed: file.changed,
      outputText: file.outputText,
    });
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
};
