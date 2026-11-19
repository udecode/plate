import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { build } from './esbuild';
import { replaceArtifacts } from './generate';

const CSS_FILE_PATTERN = /\.css$/;
const ANY_FILE_PATTERN = /.*/;
const MIGRATION_ENTRY_PATTERN = /^plate-migration:entry$/;

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
  from?: number | 'current';
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
  request: string,
  resultPath: string,
  cwd: string
) =>
  new Promise<void>((resolvePromise, reject) => {
    const child = execFile(
      process.execPath,
      [bundlePath, resultPath],
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

    // A runner that fails before it reads stdin closes the pipe; the exit
    // callback reports its stderr.
    child.stdin?.on('error', () => {});
    child.stdin?.end(request);
  });

const migrateDocuments = async (
  entry: string,
  documents: ReadonlyArray<
    Readonly<{ label: string; path: string } | { label: string; text: string }>
  >,
  options: RunEditorMigrationsOptions
) => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const entryPath = resolve(cwd, entry);
  const outputDirectory = mkdtempSync(join(tmpdir(), 'plate-migrate-run-'));
  const bundlePath = join(outputDirectory, 'runner.mjs');
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
        // esbuild keeps every export of a dynamically imported module, so the
        // runner imports a module that re-exports only EditorMigrations.
        {
          name: 'plate-migration-entry',
          setup(context) {
            context.onResolve({ filter: MIGRATION_ENTRY_PATTERN }, () => ({
              namespace: 'plate-migration-entry',
              path: entryPath,
            }));
            context.onLoad(
              { filter: ANY_FILE_PATTERN, namespace: 'plate-migration-entry' },
              () => ({
                contents: `export { EditorMigrations } from ${JSON.stringify(entryPath)};`,
                loader: 'js',
                resolveDir: dirname(entryPath),
              })
            );
          },
        },
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
        contents: `import { readFileSync, writeFileSync } from 'node:fs';
${JSON_EQUAL_SOURCE}

const readRequest = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};
const request = await readRequest();
const { EditorMigrations: migrations } = await import('plate-migration:entry');
const { migrateDocument } = await import('platejs/migrations');
const holds = (value, field) => Object.hasOwn(value, field) && value[field] !== undefined;
const isEnvelope = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) &&
  holds(value, 'document') && holds(value, 'schema') && !holds(value, 'children');
const outputs = request.documents.map(({ label, path, text }) => {
  let source;
  let migration;

  try {
    source = JSON.parse(path === undefined ? text : readFileSync(path, 'utf8'));
    if (request.source !== undefined && isEnvelope(source)) {
      throw new Error('A persisted document envelope carries its own schema version; run it without --from.');
    }
    migration = migrateDocument(source, {
      migrations,
      ...(request.source === undefined ? {} : { source: request.source }),
    });
  } catch (error) {
    throw new Error(label + ': ' + (error instanceof Error ? error.message : String(error)), { cause: error });
  }
  const output = migration.output;
  const outputText = JSON.stringify(output, null, 2) + '\\n';

  return { applied: migration.applied, changed: !jsonEqual(source, output), outputText, path: label };
});

writeFileSync(process.argv[2], JSON.stringify(outputs), 'utf8');
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
    await evaluate(
      bundlePath,
      JSON.stringify({ documents, source: options.from }),
      resultPath,
      cwd
    );

    return JSON.parse(readFileSync(resultPath, 'utf-8')) as Array<{
      applied: number[];
      changed: boolean;
      outputText: string;
      path: string;
    }>;
  } finally {
    rmSync(outputDirectory, { force: true, recursive: true });
  }
};

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
  const evaluated = await migrateDocuments(
    entry,
    files.map((file) => {
      const path = resolve(cwd, file);

      return { label: path, path };
    }),
    options
  );

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
};

export const runEditorMigrationInput = async (
  entry: string,
  sourceText: string,
  options: Omit<RunEditorMigrationsOptions, 'write'> = {}
): Promise<EditorMigrationInputResult> => {
  const [file] = await migrateDocuments(
    entry,
    [{ label: 'stdin', text: sourceText }],
    options
  );

  return Object.freeze({
    applied: Object.freeze(file.applied),
    changed: file.changed,
    outputText: file.outputText,
  });
};
