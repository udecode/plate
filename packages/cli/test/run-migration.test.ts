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
  authored,
  readAuthoredFormatSnapshot,
} from '../../platejs/src/authored/index';
import { createEditor, definePlugin, schema } from '../../platejs/src/index';
import {
  defineDocumentMigrations,
  migrateDocument,
  migrateV54,
} from '../../platejs/src/migrations/index';
import {
  runEditorMigrationInput,
  runEditorMigrations,
} from '../src/run-migration';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDirectories: string[] = [];
const RuntimeParagraphPlugin = definePlugin('paragraph', {
  schema: { element: schema.element.textBlock() },
});
const RuntimeSchema = { id: 'plate', version: 54 } as const;
const RuntimeMigrations = defineDocumentMigrations({
  plugins: [RuntimeParagraphPlugin],
  schema: RuntimeSchema,
  sourceFingerprints: { 53: 'source-53' },
  steps: {
    54: migrateV54,
  },
});

const createFixture = (
  options: {
    applicationRoot?: boolean;
    emptyKit?: boolean;
    persistedSelection?: boolean;
    suggestions?: boolean;
  } = {}
) => {
  const directory = mkdtempSync(join(packageRoot, 'tmp-migration-run-'));
  const entryPath = join(directory, 'editor.ts');
  const documentPath = join(directory, 'document.json');

  temporaryDirectories.push(directory);
  writeFileSync(
    entryPath,
    `import { definePlugin, schema } from '../../platejs/src/index';
import { authored } from '../../platejs/src/authored/index';
import { defineDocumentMigrations, migrateV54 } from '../../platejs/src/migrations/index';

const ParagraphPlugin = definePlugin('paragraph', {
  schema: { element: schema.element.textBlock() },
});

export const EditorKit = [
  ${options.emptyKit ? '' : 'ParagraphPlugin,'}
  ${options.suggestions ? "authored({ authorId: 'migration' })," : ''}
] as const;
export const OtherEmptyArray = [] as const;
export const EditorSchema = {
  id: 'plate',
  ${options.applicationRoot ? 'root: schema.content.element(ParagraphPlugin, { min: 2 }),' : ''}
  version: 54,
} as const;
export const EditorMigrations = defineDocumentMigrations({
  plugins: EditorKit,
  schema: EditorSchema,
  sourceFingerprints: { 53: 'source-53' },
  steps: {
    54: migrateV54,
  },
});
`,
    'utf-8'
  );
  const document = {
    children: options.suggestions
      ? [
          {
            children: [
              {
                suggestion: true,
                suggestion_change: {
                  createdAt: 123,
                  id: 'change',
                  type: 'remove',
                  userId: 'alice',
                },
                text: 'old',
              },
              {
                suggestion: true,
                suggestion_change: {
                  createdAt: 123,
                  id: 'change',
                  type: 'insert',
                  userId: 'alice',
                },
                text: 'new',
              },
            ],
            type: 'p',
          },
        ]
      : [{ children: [{ text: 'v' }], type: 'p' }],
  };
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

  writeFileSync(documentPath, `${JSON.stringify(source, null, 2)}\n`, 'utf-8');

  return { directory, documentPath, entryPath };
};

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { force: true, recursive: true });
  });
});

describe('plate migrate run', () => {
  it('dry-runs then atomically writes the same v53-to-v54 migration', async () => {
    const fixture = createFixture();
    const before = readFileSync(fixture.documentPath, 'utf-8');
    const dryRun = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { cwd: fixture.directory, from: 53 }
    );

    expect(dryRun.changed).toBe(1);
    expect(dryRun.files[0]?.applied).toEqual([54]);
    expect(readFileSync(fixture.documentPath, 'utf-8')).toBe(before);

    const written = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { cwd: fixture.directory, from: 53, write: true }
    );
    const output = JSON.parse(readFileSync(fixture.documentPath, 'utf-8'));

    expect(written.changed).toBe(1);
    expect(output.document.children).toEqual([
      { children: [{ text: 'v' }], type: 'paragraph' },
    ]);
    expect(output.schema).toMatchObject({
      id: 'plate',
      kind: 'named',
      version: 54,
    });
    const runtime = migrateDocument(JSON.parse(before), {
      migrations: RuntimeMigrations,
      source: 53,
    });

    expect(output).toEqual(runtime.output);

    const compact = JSON.stringify(output);

    writeFileSync(fixture.documentPath, compact, 'utf-8');
    const beforeNoopWrite = statSync(fixture.documentPath, {
      bigint: true,
    }).mtimeNs;
    const noopWrite = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { cwd: fixture.directory, from: 53, write: true }
    );

    expect(noopWrite.changed).toBe(0);
    expect(readFileSync(fixture.documentPath, 'utf-8')).toBe(compact);
    expect(statSync(fixture.documentPath, { bigint: true }).mtimeNs).toBe(
      beforeNoopWrite
    );

    const current = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { check: true, cwd: fixture.directory, from: 53 }
    );

    expect(current.changed).toBe(0);
    expect(current.files[0]?.applied).toEqual([]);
  });

  it('migrates one standard-input document without a file write', async () => {
    const fixture = createFixture();
    const sourceText = readFileSync(fixture.documentPath, 'utf-8');
    const result = await runEditorMigrationInput(
      fixture.entryPath,
      sourceText,
      { cwd: fixture.directory, from: 53 }
    );

    expect(result.applied).toEqual([54]);
    expect(JSON.parse(result.outputText).document.children).toEqual([
      { children: [{ text: 'v' }], type: 'paragraph' },
    ]);
    expect(readFileSync(fixture.documentPath, 'utf-8')).toBe(sourceText);
  });

  it('applies --from only to raw documents in a mixed batch', async () => {
    const fixture = createFixture();
    const persistedPath = join(fixture.directory, 'persisted.json');

    writeFileSync(
      persistedPath,
      JSON.stringify({
        document: {
          children: [{ children: [{ text: 'persisted' }], type: 'p' }],
        },
        schema: {
          fingerprint: 'source-53',
          id: 'plate',
          kind: 'named',
          version: 53,
        },
      }),
      'utf-8'
    );
    const result = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath, persistedPath],
      { cwd: fixture.directory, from: 53 }
    );

    expect(result.files.map(({ applied }) => applied)).toEqual([[54], [54]]);
    expect(JSON.parse(result.files[0].outputText).document.children).toEqual([
      { children: [{ text: 'v' }], type: 'paragraph' },
    ]);
    expect(JSON.parse(result.files[1].outputText).document.children).toEqual([
      { children: [{ text: 'persisted' }], type: 'paragraph' },
    ]);
  });

  it('requires --from for raw documents', async () => {
    const fixture = createFixture();

    await expect(
      runEditorMigrations(fixture.entryPath, [fixture.documentPath], {
        cwd: fixture.directory,
      })
    ).rejects.toThrow(/requires explicit source intent/);
  });

  it('matches runtime semantics for legacy suggestion migration', async () => {
    const fixture = createFixture({ suggestions: true });
    const sourceText = readFileSync(fixture.documentPath, 'utf-8');
    const result = await runEditorMigrationInput(
      fixture.entryPath,
      sourceText,
      { cwd: fixture.directory, from: 53 }
    );
    const output = JSON.parse(result.outputText);
    const cliEditor = createEditor({
      initialValue: output,
      plugins: [RuntimeParagraphPlugin, authored({ authorId: 'reader' })],
      schema: RuntimeSchema,
    });
    const runtimeOutput = migrateDocument(JSON.parse(sourceText), {
      migrations: defineDocumentMigrations({
        plugins: [RuntimeParagraphPlugin, authored({ authorId: 'reader' })],
        schema: RuntimeSchema,
        sourceFingerprints: { 53: 'source-53' },
        steps: { 54: migrateV54 },
      }),
      source: 53,
    }).output;
    const runtimeEditor = createEditor({
      initialValue: runtimeOutput,
      plugins: [RuntimeParagraphPlugin, authored({ authorId: 'reader' })],
      schema: RuntimeSchema,
    });
    const cli = readAuthoredFormatSnapshot(cliEditor);
    const runtime = readAuthoredFormatSnapshot(runtimeEditor);

    expect(cli.accepted).toEqual(runtime.accepted);
    expect(cli.proposed).toEqual(runtime.proposed);
    expect(
      cli.changes.map(({ authorId, createdAt, id }) => ({
        authorId,
        createdAt,
        id,
      }))
    ).toEqual([{ authorId: 'alice', createdAt: 123, id: 'change' }]);
    expect(
      runtime.changes.map(({ authorId, createdAt, id }) => ({
        authorId,
        createdAt,
        id,
      }))
    ).toEqual(
      cli.changes.map(({ authorId, createdAt, id }) => ({
        authorId,
        createdAt,
        id,
      }))
    );
  });

  it('uses an explicit application root in migration validation and identity', async () => {
    const defaultFixture = createFixture();
    const rootFixture = createFixture({ applicationRoot: true });
    const [defaultResult, rootResult] = await Promise.all([
      runEditorMigrationInput(
        defaultFixture.entryPath,
        readFileSync(defaultFixture.documentPath, 'utf-8'),
        { cwd: defaultFixture.directory, from: 53 }
      ),
      runEditorMigrationInput(
        rootFixture.entryPath,
        readFileSync(rootFixture.documentPath, 'utf-8'),
        { cwd: rootFixture.directory, from: 53 }
      ),
    ]);
    const defaultOutput = JSON.parse(defaultResult.outputText);
    const rootOutput = JSON.parse(rootResult.outputText);

    expect(rootResult.applied).toEqual([54]);
    expect(defaultOutput.document.children).toHaveLength(1);
    expect(rootOutput.document.children).toEqual([
      { children: [{ text: 'v' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
    expect(rootOutput.schema.fingerprint).not.toBe(
      defaultOutput.schema.fingerprint
    );
  });

  it('accepts a single empty exported plugin tuple', async () => {
    const fixture = createFixture({ emptyKit: true });
    const result = await runEditorMigrations(
      fixture.entryPath,
      [fixture.documentPath],
      { cwd: fixture.directory, from: 53 }
    );

    expect(result.changed).toBe(1);
    expect(result.files[0]?.applied).toEqual([54]);
  });

  it('preserves a persisted selection through migration and preparation', async () => {
    const fixture = createFixture({ persistedSelection: true });

    await runEditorMigrations(fixture.entryPath, [fixture.documentPath], {
      cwd: fixture.directory,
      from: 53,
      write: true,
    });
    const output = JSON.parse(readFileSync(fixture.documentPath, 'utf-8'));

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

    writeFileSync(fixture.entryPath, 'export default this is invalid', 'utf-8');
    await expect(
      runEditorMigrations(fixture.entryPath, [fixture.documentPath], {
        cwd: fixture.directory,
        from: 53,
      })
    ).rejects.toThrow();

    expect(migrationDirectories()).toEqual(before);
  });
});
