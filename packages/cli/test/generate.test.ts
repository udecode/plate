import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'bun:test';
import ts from 'typescript';

import { generateEditor, replaceArtifacts } from '../src/generate';
import { createEditorMigration } from '../src/migrate';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '../..');
const temporaryDirectories: string[] = [];

const createFixture = (tsx = false) => {
  const directory = mkdtempSync(join(packageRoot, '.plate-cli-test-'));
  const entryPath = join(directory, `editor-definition.${tsx ? 'tsx' : 'ts'}`);
  const entry = `import { defineBasePlugin, defineEditor } from '../../core/src/index';
import { property, schema, target } from '../../plite/src/index';

const CalloutPlugin = defineBasePlugin('calloutCapability', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        payload: property.json({
          validate: (value: unknown): value is { id: string; tags: readonly ('a' | 'b')[] } =>
            typeof value === 'object' && value !== null && 'id' in value,
          validationVersion: 1,
        }),
        tone: property.enum(['info', 'warning'] as const, { required: true }),
      },
      type: 'callout_node',
    },
  },
});

const AlignPlugin = defineBasePlugin('align', {
  schema: {
    properties: {
      align: schema.elementProperty(
        property.enum(['left', 'right'] as const),
        { target: target.element(CalloutPlugin) }
      ),
      reviewById: schema.textProperty(
        schema.key.prefix('review_'),
        property.boolean()
      ),
    },
  },
});

export default defineEditor('fixture', {
  plugins: [CalloutPlugin, AlignPlugin],
  schema: {
    properties: {
      reviewState: schema.elementProperty(
        property.enum(['draft', 'approved'] as const),
        { target: target.element(CalloutPlugin) }
      ),
    },
  },
  schemaIdentity: { id: 'fixture-document', version: 2 },
});
${tsx ? 'export const FixtureComponent = () => <div />;\n' : ''}`;
  const tsconfig = {
    extends: resolve(repoRoot, 'tooling/config/tsconfig.base.json'),
    compilerOptions: {
      jsx: 'react-jsx',
      noEmit: true,
      paths: {
        '@platejs/core': [resolve(repoRoot, 'packages/core/src/index.ts')],
        '@platejs/core/internal': [
          resolve(repoRoot, 'packages/core/src/internal/index.ts'),
        ],
        '@platejs/core/react': [
          resolve(repoRoot, 'packages/core/src/react/index.ts'),
        ],
        '@platejs/plite': [resolve(repoRoot, 'packages/plite/src/index.ts')],
        '@platejs/plite/internal': [
          resolve(repoRoot, 'packages/plite/src/internal/index.ts'),
        ],
        platejs: [resolve(repoRoot, 'packages/plate/src/index.tsx')],
        'platejs/react': [
          resolve(repoRoot, 'packages/plate/src/react/index.tsx'),
        ],
      },
    },
    include: ['./**/*'],
  };

  temporaryDirectories.push(directory);
  writeFileSync(entryPath, entry);
  writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify(tsconfig));

  return { directory, entryPath };
};

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { force: true, recursive: true });
  });
});

describe('plate generate', () => {
  it('emits deterministic concrete types and checks committed artifacts', async () => {
    const { directory, entryPath } = createFixture();
    const first = await generateEditor(entryPath);
    const firstTypes = readFileSync(first.typesPath, 'utf8');
    const firstSchema = readFileSync(first.schemaPath, 'utf8');
    const second = await generateEditor(entryPath);

    expect(readFileSync(second.typesPath, 'utf8')).toBe(firstTypes);
    expect(readFileSync(second.schemaPath, 'utf8')).toBe(firstSchema);
    expect(firstTypes).toContain('export interface CalloutCapabilityElement');
    expect(firstTypes).toContain('readonly type: "callout_node"');
    expect(firstTypes).toContain('readonly align?: "left" | "right"');
    expect(firstTypes).toContain('readonly id?: number | string');
    expect(firstTypes).toContain('readonly tone: "info" | "warning"');
    expect(firstTypes).toContain(
      'readonly reviewState: SchemaPropertyHandle<"reviewState", "draft" | "approved", "element">'
    );
    expect(firstTypes).toContain(
      `SchemaPropertyHandle<Readonly<{ readonly kind: 'prefix'; readonly prefix: "review_" }>, boolean, "text">`
    );
    expect(firstTypes).toContain(
      `key: Object.freeze({ kind: 'prefix' as const, prefix: "review_" })`
    );
    expect(firstTypes).toContain(
      'readonly element: SchemaElementHandle<typeof definition, "callout_node">'
    );
    expect(firstTypes).toContain('bindings: schemaBindings');
    expect(firstTypes).toContain(
      'readonly payload?: { readonly id: string; readonly tags: readonly ("a" | "b")[]; }'
    );
    expect(firstTypes).not.toContain('InternalEditorDefinition');
    expect(firstTypes).not.toContain('any');
    await generateEditor(entryPath, { check: true });

    writeFileSync(first.typesPath, `${firstTypes}\n// stale`);
    await expect(generateEditor(entryPath, { check: true })).rejects.toThrow(
      'is stale'
    );

    writeFileSync(
      join(directory, 'contract.ts'),
      `import { EditorKit, type Value } from './editor.generated';

const valid: Value = [{
  children: [{ text: 'ok' }],
  payload: { id: 'x', tags: ['a'] },
  tone: 'info',
  type: 'callout_node',
}];

// @ts-expect-error generated enum stays exact
const invalid: Value = [{
  children: [{ text: 'bad' }],
  tone: 'error',
  type: 'callout_node',
}];

void valid;
void invalid;
EditorKit.schema.plugins.calloutCapability.element.type satisfies 'callout_node';
EditorKit.schema.plugins.align.properties.align.key satisfies 'align';
EditorKit.schema.properties.reviewState.key satisfies 'reviewState';
`
    );
    writeFileSync(first.typesPath, firstTypes);
    const configPath = join(directory, 'tsconfig.json');
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      directory,
      { noEmit: true },
      configPath
    );
    const contractPath = join(directory, 'contract.ts');
    const program = ts.createProgram([contractPath], parsed.options);
    const contract = program.getSourceFile(contractPath)!;
    const diagnostics = [
      ...program.getSyntacticDiagnostics(contract),
      ...program.getSemanticDiagnostics(contract),
    ];

    expect(
      diagnostics.map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      )
    ).toEqual([]);
  }, 60_000);

  it('preserves last-good output when entry evaluation fails', async () => {
    const { entryPath } = createFixture();
    const result = await generateEditor(entryPath);
    const previousTypes = readFileSync(result.typesPath, 'utf8');
    const previousSchema = readFileSync(result.schemaPath, 'utf8');

    writeFileSync(entryPath, 'export default this is not valid TypeScript');
    await expect(generateEditor(entryPath)).rejects.toThrow();
    expect(readFileSync(result.typesPath, 'utf8')).toBe(previousTypes);
    expect(readFileSync(result.schemaPath, 'utf8')).toBe(previousSchema);
  }, 60_000);

  it('loads TSX entries', async () => {
    const { entryPath } = createFixture(true);
    const result = await generateEditor(entryPath);

    expect(result.schema.identity).toMatchObject({
      id: 'fixture-document',
      kind: 'named',
      version: 2,
    });
  }, 45_000);

  it('rolls both artifacts back when the commit is interrupted', () => {
    const { directory } = createFixture();
    const first = join(directory, 'first.txt');
    const second = join(directory, 'second.txt');

    writeFileSync(first, 'first-old');
    writeFileSync(second, 'second-old');

    expect(() =>
      replaceArtifacts(
        [
          { content: 'first-new', path: first },
          { content: 'second-new', path: second },
        ],
        (_path, index) => {
          if (index === 0) throw new Error('simulated interruption');
        }
      )
    ).toThrow('simulated interruption');
    expect(readFileSync(first, 'utf8')).toBe('first-old');
    expect(readFileSync(second, 'utf8')).toBe('second-old');
  });

  it('scaffolds a typed migration from the last-good artifacts', async () => {
    const { entryPath } = createFixture();

    await generateEditor(entryPath);
    const previousEntry = readFileSync(entryPath, 'utf8');

    writeFileSync(
      entryPath,
      previousEntry
        .replace(
          "tone: property.enum(['info', 'warning'] as const, { required: true }),",
          "slug: property.string({ required: true }),\n        tone: property.enum(['info', 'warning'] as const, { required: true }),"
        )
        .replace('version: 2', 'version: 3')
    );
    const result = await createEditorMigration(entryPath, 'require-slug', {
      readCommittedFile: (path) => readFileSync(path, 'utf8'),
    });
    const manifest = JSON.parse(readFileSync(result.manifestPath, 'utf8')) as {
      diff: { requiresMigration: boolean };
      from: { version: number };
      to: { version: number };
    };
    const migration = readFileSync(result.migrationPath, 'utf8');
    const fromTypesPath = join(result.directory, 'from.ts');
    const toTypesPath = join(result.directory, 'to.ts');

    expect(manifest.diff.requiresMigration).toBe(true);
    expect(manifest.from.version).toBe(2);
    expect(manifest.to.version).toBe(3);
    expect(migration).toContain('FromValue');
    expect(migration).toContain('ToValue');
    expect(migration).toContain('Plate never runs this automatically');
    expect(existsSync(join(result.directory, 'from.schema.json'))).toBe(true);
    expect(existsSync(join(result.directory, 'to.schema.json'))).toBe(true);
    expect(readFileSync(fromTypesPath, 'utf8')).toContain(
      'EditorSchemaContract'
    );

    const configPath = join(dirname(entryPath), 'tsconfig.json');
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      dirname(entryPath),
      { noEmit: true },
      configPath
    );
    const program = ts.createProgram(
      [fromTypesPath, toTypesPath, result.migrationPath],
      parsed.options
    );
    const diagnostics = [
      ...program.getSyntacticDiagnostics(),
      ...program.getSemanticDiagnostics(),
    ];

    expect(
      diagnostics.map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      )
    ).toEqual([]);
  }, 60_000);
});
