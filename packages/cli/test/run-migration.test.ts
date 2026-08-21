import { afterEach, describe, expect, it } from 'bun:test';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createBaseEditor,
  defineBasePlugin,
  defineDocumentMigrations,
} from '../../core/src/index';
import { migratePlateV54 } from '../../plate/src/migrations/index';
import { schema } from '../../plite/src/index';
import {
  runEditorMigrationInput,
  runEditorMigrations,
} from '../src/run-migration';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDirectories: string[] = [];
const RuntimeParagraphPlugin = defineBasePlugin('paragraph', {
  schema: { element: schema.element.textBlock() },
});
const RuntimeSchema = { id: 'plate', version: 55 } as const;
const RuntimeMigrations = defineDocumentMigrations(RuntimeSchema, {
  sourceFingerprints: { 53: 'source-53' },
  steps: {
    54: migratePlateV54,
    55: ({ document }) => ({
      ...document,
      children: document.children.map((element) => ({
        ...element,
        children: element.children.map((child) =>
          'text' in child ? { ...child, text: `${child.text}55` } : child
        ),
      })),
    }),
  },
  unversioned: 53,
});

const createFixture = (
  options: { emptyKit?: boolean; persistedSelection?: boolean } = {}
) => {
  const directory = mkdtempSync(join(packageRoot, 'tmp-migration-run-'));
  const entryPath = join(directory, 'editor.ts');
  const documentPath = join(directory, 'document.json');

  temporaryDirectories.push(directory);
  writeFileSync(
    entryPath,
    `import { defineBasePlugin, defineDocumentMigrations } from '../../core/src/index';
import { schema } from '../../plite/src/index';
import { migratePlateV54 } from '../../plate/src/migrations/index';

const ParagraphPlugin = defineBasePlugin('paragraph', {
  schema: { element: schema.element.textBlock() },
});

export const EditorKit = ${options.emptyKit ? '[]' : '[ParagraphPlugin]'} as const;
export const OtherEmptyArray = [] as const;
export const EditorSchema = { id: 'plate', version: 55 } as const;
export const EditorMigrations = defineDocumentMigrations(EditorSchema, {
  sourceFingerprints: { 53: 'source-53' },
  unversioned: 53,
  steps: {
    54: migratePlateV54,
    55: ({ document }) => ({
      ...document,
      children: document.children.map((element) => ({
        ...element,
        children: element.children.map((child) =>
          'text' in child ? { ...child, text: child.text + '55' } : child
        ),
      })),
    }),
  },
});
`,
    'utf8'
  );
  const document = { children: [{ children: [{ text: 'v' }], type: 'p' }] };
  const source = options.persistedSelection
    ? {
        document,
        schema: {
          fingerprint: 'source-53',
          id: 'plate',
          kind: 'named',
          version: 53,
        },
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      }
    : document.children;

  writeFileSync(documentPath, `${JSON.stringify(source, null, 2)}\n`, 'utf8');

  return { directory, documentPath, entryPath };
};

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { force: true, recursive: true });
  });
});

describe('plate migrate run', () => {
  it('dry-runs then atomically writes the same v53-to-v55 chain', async () => {
    const fixture = createFixture();
    const before = readFileSync(fixture.documentPath, 'utf8');
    const dryRun = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { cwd: fixture.directory }
    );

    expect(dryRun.changed).toBe(1);
    expect(dryRun.files[0]?.applied).toEqual([54, 55]);
    expect(readFileSync(fixture.documentPath, 'utf8')).toBe(before);

    const written = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { cwd: fixture.directory, write: true }
    );
    const output = JSON.parse(readFileSync(fixture.documentPath, 'utf8'));

    expect(written.changed).toBe(1);
    expect(output.document.children).toEqual([
      { children: [{ text: 'v55' }], type: 'paragraph' },
    ]);
    expect(output.schema).toMatchObject({
      id: 'plate',
      kind: 'named',
      version: 55,
    });
    const runtimeEditor = createBaseEditor({
      initialValue: JSON.parse(before),
      migrations: RuntimeMigrations,
      plugins: [RuntimeParagraphPlugin],
      schema: RuntimeSchema,
    });

    expect(output).toEqual({
      document: runtimeEditor.read.value(),
      schema: runtimeEditor.read.schema.identity(),
    });

    const compact = JSON.stringify(output);

    writeFileSync(fixture.documentPath, compact, 'utf8');
    const beforeNoopWrite = statSync(fixture.documentPath, {
      bigint: true,
    }).mtimeNs;
    const noopWrite = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { cwd: fixture.directory, write: true }
    );

    expect(noopWrite.changed).toBe(0);
    expect(readFileSync(fixture.documentPath, 'utf8')).toBe(compact);
    expect(statSync(fixture.documentPath, { bigint: true }).mtimeNs).toBe(
      beforeNoopWrite
    );

    const current = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { check: true, cwd: fixture.directory }
    );

    expect(current.changed).toBe(0);
    expect(current.files[0]?.applied).toEqual([]);
  });

  it('migrates one standard-input document without a file write', async () => {
    const fixture = createFixture();
    const sourceText = readFileSync(fixture.documentPath, 'utf8');
    const result = await runEditorMigrationInput(
      fixture.entryPath,
      sourceText,
      { cwd: fixture.directory }
    );

    expect(result.applied).toEqual([54, 55]);
    expect(JSON.parse(result.outputText).document.children).toEqual([
      { children: [{ text: 'v55' }], type: 'paragraph' },
    ]);
    expect(readFileSync(fixture.documentPath, 'utf8')).toBe(sourceText);
  });

  it('accepts a single empty exported plugin tuple', async () => {
    const fixture = createFixture({ emptyKit: true });
    const result = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { cwd: fixture.directory }
    );

    expect(result.changed).toBe(1);
    expect(result.files[0]?.applied).toEqual([54, 55]);
  });

  it('preserves a persisted selection through migration and preparation', async () => {
    const fixture = createFixture({ persistedSelection: true });

    await runEditorMigrations(fixture.entryPath, [fixture.documentPath], {
      cwd: fixture.directory,
      write: true,
    });
    const output = JSON.parse(readFileSync(fixture.documentPath, 'utf8'));

    expect(output.selection).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
  });

  it('removes its temporary directory when entry bundling fails', async () => {
    const fixture = createFixture();
    const migrationDirectories = () =>
      new Set(
        readdirSync(tmpdir()).filter((name) =>
          name.startsWith('plate-migrate-run-')
        )
      );
    const before = migrationDirectories();

    writeFileSync(fixture.entryPath, 'export default this is invalid', 'utf8');
    await expect(
      runEditorMigrations(fixture.entryPath, [fixture.documentPath], {
        cwd: fixture.directory,
      })
    ).rejects.toThrow();

    expect(migrationDirectories()).toEqual(before);
  });
});
