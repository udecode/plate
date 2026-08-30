import { afterEach, describe, expect, it } from 'bun:test';
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { API, type Diagnostic, type Snapshot } from 'typescript/unstable/async';

import {
  discoverEditorSourceFiles,
  editorWatchOwnershipPaths,
  generateEditor,
  generateEditors,
  replaceArtifacts,
  resolveEditorEntryPaths,
} from '../src/generate';
import { createEditorMigration } from '../src/migrate';
import { artifactStateRoot, pathFingerprint } from '../src/state';
import { NativeTypeScriptSession } from '../src/typescript';
import { watchEditor, watchEditors } from '../src/watch';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '../..');
const temporaryDirectories: string[] = [];
const waitFor = async (condition: () => boolean, timeout = 5000) => {
  const started = Date.now();

  while (!condition()) {
    if (Date.now() - started >= timeout) {
      throw new Error(
        'Timed out waiting for the watched editor to regenerate.'
      );
    }
    await new Promise((resolveInner) => {
      setTimeout(resolveInner, 25);
    });
  }
};

const hasWatchOwnership = (entryPath: string) =>
  editorWatchOwnershipPaths(entryPath).every(existsSync);

const expectOnlyFixtureFiles = (
  directory: string,
  paths: readonly string[] = []
) => {
  const allowed = new Set([
    'editor.ts',
    'editor.tsx',
    'tsconfig.json',
    ...paths.map((path) => basename(path)),
  ]);

  expect(readdirSync(directory).every((name) => allowed.has(name))).toBe(true);
};

const diagnosticText = (diagnostic: Diagnostic): string =>
  [
    diagnostic.text,
    ...(diagnostic.messageChain?.map(diagnosticText) ?? []),
  ].join('\n');

const expectTypeScriptFilesCompile = async (
  configPath: string,
  files: readonly string[]
) => {
  const api = new API({ cwd: dirname(configPath) });
  let snapshot: Snapshot | undefined;

  try {
    snapshot = await api.updateSnapshot({
      openFiles: [...files],
      openProjects: [configPath],
    });
    const project = await snapshot.getDefaultProjectForFile(files[0]);

    expect(project).toBeDefined();
    const fileDiagnostics = await Promise.all(
      files.flatMap((file) => [
        project!.program.getSyntacticDiagnostics(file),
        project!.program.getSemanticDiagnostics(file),
      ])
    );
    const diagnostics = [
      ...(await project!.program.getConfigFileParsingDiagnostics()),
      ...fileDiagnostics.flat(),
    ];

    expect(diagnostics.map(diagnosticText)).toEqual([]);
  } finally {
    if (snapshot) await snapshot.dispose();
    await api.close();
  }
};

const createFixture = (
  tsx = false,
  recursiveJson = false,
  recursiveElement = false,
  applicationProperties = true
) => {
  const directory = mkdtempSync(join(packageRoot, 'tmp-cli-test-'));
  const entryPath = join(directory, `editor.${tsx ? 'tsx' : 'ts'}`);
  const entry = `import { defineBasePlugin } from 'platejs';
import { property, schema as s, target } from 'platejs';

const CalloutPlugin = defineBasePlugin('calloutCapability', {
  schema: {
    element: {
      content: ${
        recursiveElement
          ? "s.content.type('callout_node')"
          : "s.content.text({ default: 'text', min: 1 })"
      },
      properties: {
        ${recursiveJson ? 'raw: property.json(),' : ''}
        payload: property.json({
          validate: (value: unknown): value is { id: string; tags: readonly ('a' | 'b')[] } =>
            typeof value === 'object' && value !== null && 'id' in value,
          validationVersion: 1,
        }),
        token: property.string({ generate: () => 'token' }),
        tone: property.enum(['info', 'warning'] as const, { required: true }),
      },
      type: 'callout_node',
    },
  },
});

const AlignPlugin = defineBasePlugin('align', {
  schema: {
    properties: {
      align: s.elementProperty(
        property.enum(['left', 'right'] as const),
        { target: target.element(CalloutPlugin) }
      ),
      reviewById: s.textProperty(
        s.key.prefix('review_'),
        property.boolean()
      ),
    },
  },
});

export const EditorKit = [CalloutPlugin, AlignPlugin] as const;
export const EditorSchema = {
  id: 'fixture-document',
  version: 2,
  ${
    applicationProperties
      ? `properties: {
      reviewFlags: s.textProperty(
        s.key.prefix('reviewFlag_'),
        property.boolean()
      ),
      reviewState: s.elementProperty(
        property.enum(['draft', 'approved'] as const),
        { target: target.element(CalloutPlugin) }
      ),
    },`
      : ''
  }
} as const;
export const labels = ['fixture'] as const;
export const cache = { properties: { retries: 3 } } as const;
export const empty = [] as const;
export const metadata = { id: 'fixture', title: 'Fixture' } as const;
export const settings = { theme: 'dark' } as const;
${tsx ? 'export const FixtureComponent = () => <div />;\n' : ''}`;
  const tsconfig = {
    extends: resolve(repoRoot, 'tooling/config/tsconfig.base.json'),
    compilerOptions: {
      jsx: 'react-jsx',
      noEmit: true,
      paths: {
        platejs: [resolve(repoRoot, 'packages/platejs/src/index.tsx')],
        'platejs/react': [
          resolve(repoRoot, 'packages/platejs/src/react/index.tsx'),
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
  it('rejects editor modules without a discoverable plugin tuple', async () => {
    const { entryPath } = createFixture();

    writeFileSync(entryPath, 'export default [] as const;');

    await expect(generateEditor(entryPath)).rejects.toThrow(
      'must export exactly one Plate plugin tuple; found 0'
    );
  });

  it('rejects ambiguous plugin tuples', async () => {
    const { entryPath } = createFixture();

    writeFileSync(
      entryPath,
      `${readFileSync(entryPath, 'utf-8')}\nexport const AlternateKit = EditorKit;\n`
    );

    await expect(generateEditor(entryPath)).rejects.toThrow(
      'must export exactly one Plate plugin tuple; found 2 candidates'
    );
  });

  it('discovers a default-exported plugin tuple by shape', async () => {
    const { entryPath } = createFixture();

    writeFileSync(
      entryPath,
      `${readFileSync(entryPath, 'utf-8').replace(
        'export const EditorKit =',
        'const EditorKit ='
      )}\nexport default EditorKit;\n`
    );

    const generated = await generateEditor(entryPath);

    expect(readFileSync(generated.typesPath, 'utf-8')).toContain(
      'type EditorPlugins = (typeof EditorModule)["default"] &'
    );
  });

  it('rejects ambiguous application schemas', async () => {
    const { entryPath } = createFixture();

    writeFileSync(
      entryPath,
      `${readFileSync(entryPath, 'utf-8')}\nexport const AlternateSchema = EditorSchema;\n`
    );

    await expect(generateEditor(entryPath)).rejects.toThrow(
      'must export at most one Plate application schema; found 2 candidates'
    );
  });

  it('discovers a default-exported application schema by shape', async () => {
    const { entryPath } = createFixture();

    writeFileSync(
      entryPath,
      `${readFileSync(entryPath, 'utf-8').replace(
        'export const EditorSchema =',
        'const EditorSchema ='
      )}\nexport default EditorSchema;\n`
    );

    const generated = await generateEditor(entryPath);

    expect(readFileSync(generated.typesPath, 'utf-8')).toContain(
      'readonly reviewState:'
    );
  });

  it('discovers a root-only application schema and generates its exact root value', async () => {
    const { entryPath } = createFixture();
    const source = readFileSync(entryPath, 'utf-8')
      .replace(
        "const AlignPlugin = defineBasePlugin('align', {",
        `const RootBlockPlugin = defineBasePlugin('rootBlock', {
  schema: { element: s.element.textBlock() },
});

const AlignPlugin = defineBasePlugin('align', {`
      )
      .replace(
        'export const EditorKit = [CalloutPlugin, AlignPlugin] as const;',
        'export const EditorKit = [CalloutPlugin, RootBlockPlugin, AlignPlugin] as const;'
      )
      .replace(
        /export const EditorSchema = \{[\s\S]*?\n\} as const;\n/,
        `export const EditorSchema = {
  root: s.content.element(RootBlockPlugin, { min: 1 }),
} as const;
`
      );

    writeFileSync(entryPath, source);
    const generated = await generateEditor(entryPath);
    const types = readFileSync(generated.typesPath, 'utf-8');

    expect(types).toContain(
      'export type Value = readonly (RootBlockElement)[];'
    );
  });

  it('rejects invalid exported application roots', async () => {
    for (const root of [
      's.content.element(CalloutPlugin, { min: 0 })',
      'null',
    ]) {
      const { entryPath } = createFixture();
      const source = readFileSync(entryPath, 'utf-8').replace(
        /export const EditorSchema = \{[\s\S]*?\n\} as const;\n/,
        `export const EditorSchema = {
  root: ${root},
} as const;
`
      );

      writeFileSync(entryPath, source);

      await expect(generateEditor(entryPath)).rejects.toThrow(
        'Editor application schema root min must be a positive integer.'
      );
    }
  });

  it('ignores unrelated exports when no application schema is exported', async () => {
    const { entryPath } = createFixture();

    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8').replace(
        /export const EditorSchema = \{[\s\S]*?\n\} as const;\n/,
        ''
      )
    );

    const generated = await generateEditor(entryPath);

    expect(existsSync(generated.schemaPath)).toBe(true);
    expect(existsSync(generated.typesPath)).toBe(true);
  });

  it('emits deterministic concrete types and checks committed artifacts', async () => {
    const { directory, entryPath } = createFixture();
    const session = new NativeTypeScriptSession(packageRoot);
    const first = await generateEditor(entryPath, {}, session);
    const firstTypes = readFileSync(first.typesPath, 'utf-8');
    const firstSchema = readFileSync(first.schemaPath, 'utf-8');
    const typesMtime = statSync(first.typesPath).mtimeMs;
    const schemaMtime = statSync(first.schemaPath).mtimeMs;
    const second = await generateEditor(entryPath, {}, session);

    expect(second.status).toBe('upToDate');
    expect(statSync(second.typesPath).mtimeMs).toBe(typesMtime);
    expect(statSync(second.schemaPath).mtimeMs).toBe(schemaMtime);
    expect(readFileSync(second.typesPath, 'utf-8')).toBe(firstTypes);
    expect(readFileSync(second.schemaPath, 'utf-8')).toBe(firstSchema);
    expect(firstTypes).toContain('export interface CalloutCapabilityElement');
    expect(firstTypes).toContain(
      'import type * as EditorModule from "./editor";'
    );
    expect(firstTypes).toContain(
      'type EditorPlugins = (typeof EditorModule)["EditorKit"] &'
    );
    expect(firstTypes).toContain('readonly type: "callout_node"');
    const calloutMutation = firstTypes.match(
      /readonly calloutCapability: Readonly<\{[\s\S]*?\n {2}\}>;/
    )?.[0];

    expect(calloutMutation).not.toContain('readonly toggle: true');
    expect(firstTypes).toContain('readonly align?: "left" | "right"');
    expect(firstTypes).not.toContain('readonly id?:');
    expect(firstTypes).toContain('readonly tone: "info" | "warning"');
    expect(firstTypes).toContain('readonly token: string');
    expect(firstTypes).toContain('readonly token?: string');
    expect(firstTypes).toContain(
      'readonly reviewState: SchemaPropertyHandle<"reviewState", "draft" | "approved", "element">'
    );
    expect(firstTypes).toContain(
      'readonly reviewFlags: SchemaPropertyHandle<Readonly<{ readonly kind: \'prefix\'; readonly prefix: "reviewFlag_" }>, boolean, "text">'
    );
    expect(firstTypes).toContain(
      'readonly align: Readonly<{ readonly key: "align"; }>'
    );
    expect(firstTypes).not.toContain('review_');
    expect(firstTypes).toContain('export const schema = Object.freeze');
    expect(firstTypes).toContain(
      'readonly payload?: { readonly id: string; readonly tags: readonly ("a" | "b")[]; }'
    );
    expect(firstTypes).not.toContain('InternalEditorDefinition');
    expect(firstTypes).not.toContain('any');
    await generateEditor(entryPath, { check: true }, session);

    writeFileSync(first.typesPath, `${firstTypes}\n// stale`);
    await expect(
      generateEditor(entryPath, { check: true }, session)
    ).rejects.toThrow('are stale');

    writeFileSync(
      join(directory, 'contract.ts'),
      `import { schema, type Value } from './editor.generated';

const valid: Value = [{
  children: [{ text: 'ok' }],
  payload: { id: 'x', tags: ['a'] },
  token: 'token',
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
schema.plugins.calloutCapability.type satisfies 'callout_node';
schema.plugins.align.key satisfies 'align';
schema.properties.reviewState.key satisfies 'reviewState';
schema.properties.reviewFlags.key.prefix satisfies 'reviewFlag_';
`
    );
    writeFileSync(first.typesPath, firstTypes);
    const configPath = join(directory, 'tsconfig.json');
    const contractPath = join(directory, 'contract.ts');

    await expectTypeScriptFilesCompile(configPath, [contractPath]);
    await session.close();
  }, 60_000);

  it('keeps virtual helpers in an explicitly listed editor project', async () => {
    const { directory, entryPath } = createFixture();
    const configPath = join(directory, 'tsconfig.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<
      string,
      unknown
    >;

    delete config.include;
    config.files = ['./editor.ts'];
    writeFileSync(configPath, JSON.stringify(config));

    const generated = await generateEditor(entryPath);

    expect(readFileSync(generated.typesPath, 'utf-8')).toContain(
      'readonly tone: "info" | "warning"'
    );
  }, 60_000);

  it('keeps standalone generated headers independent of machine paths', async () => {
    const sourceFixture = createFixture();
    const standaloneSource = readFileSync(sourceFixture.entryPath, 'utf-8');
    const config = JSON.parse(
      readFileSync(join(sourceFixture.directory, 'tsconfig.json'), 'utf-8')
    ) as { compilerOptions: Record<string, unknown> };

    config.compilerOptions.rootDir = '/';
    const directories = [
      mkdtempSync(join(tmpdir(), 'plate-cli-standalone-a-')),
      mkdtempSync(join(tmpdir(), 'plate-cli-standalone-b-')),
    ];

    temporaryDirectories.push(...directories);
    const generated = await Promise.all(
      directories.map(async (directory) => {
        const entryPath = join(directory, "src/editor's*/editor.ts");

        mkdirSync(dirname(entryPath), { recursive: true });
        writeFileSync(entryPath, standaloneSource);
        writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify(config));

        return generateEditor("src/editor's*/editor.ts", {
          cwd: directory,
        });
      })
    );
    const first = readFileSync(generated[0].typesPath, 'utf-8');
    const second = readFileSync(generated[1].typesPath, 'utf-8');

    expect(first).toBe(second);
    expect(first).toStartWith(
      "/* Generated by @platejs/cli from src/editor's*\\/editor.ts."
    );
    expect(first).toContain(
      'Regenerate with: pnpm exec plate generate -- "src/editor\'s*/editor.ts"'
    );
  }, 60_000);

  it('preserves entry-relative import.meta.url during evaluation', async () => {
    const { directory, entryPath } = createFixture();

    writeFileSync(
      join(directory, 'element-type.txt'),
      'entry_relative_callout'
    );
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { defineBasePlugin } from 'platejs';",
          "import { readFileSync } from 'node:fs';\nimport { dirname } from 'node:path';\nimport { fileURLToPath } from 'node:url';\nimport { defineBasePlugin } from 'platejs';"
        )
        .replace(
          "const CalloutPlugin = defineBasePlugin('calloutCapability', {",
          `const elementTypes = [
  readFileSync(new URL('./element-type.txt', import.meta.url), 'utf8'),
  readFileSync(\`\${import.meta.dirname}/element-type.txt\`, 'utf8'),
  readFileSync(\`\${dirname(import.meta.filename)}/element-type.txt\`, 'utf8'),
  readFileSync(fileURLToPath(import.meta.resolve('./element-type.txt')), 'utf8'),
];
if (import.meta.resolve('node:fs') !== 'node:fs') throw new Error('builtin resolution changed');
const elementType = [...new Set(elementTypes)].join(',');

const CalloutPlugin = defineBasePlugin('calloutCapability', {`
        )
        .replace("type: 'callout_node'", 'type: elementType')
    );

    const generated = await generateEditor(entryPath);

    expect(readFileSync(generated.typesPath, 'utf-8')).toContain(
      'readonly type: "entry_relative_callout"'
    );
  }, 60_000);

  it('evaluates each compilation in a disposable process', async () => {
    const { entryPath } = createFixture();

    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "const CalloutPlugin = defineBasePlugin('calloutCapability', {",
          `const evaluationGlobal = globalThis as typeof globalThis & { __plateEvaluationCount?: number };
evaluationGlobal.__plateEvaluationCount = (evaluationGlobal.__plateEvaluationCount ?? 0) + 1;
const evaluationCount = evaluationGlobal.__plateEvaluationCount;

const CalloutPlugin = defineBasePlugin('calloutCapability', {`
        )
        .replace(
          "type: 'callout_node'",
          `type: \`callout_\${evaluationCount}\``
        )
    );

    const first = await generateEditor(entryPath);
    const firstTypes = readFileSync(first.typesPath, 'utf-8');
    const second = await generateEditor(entryPath);

    expect(firstTypes).toContain('readonly type: "callout_1"');
    expect(readFileSync(second.typesPath, 'utf-8')).toBe(firstTypes);
  }, 60_000);

  it('preserves the generation cwd during evaluation', async () => {
    const { directory, entryPath } = createFixture();
    const nestedEntryPath = join(directory, 'src/editor/editor.ts');

    mkdirSync(dirname(nestedEntryPath), { recursive: true });
    writeFileSync(join(directory, 'element-type.txt'), 'cwd_relative_callout');
    writeFileSync(
      nestedEntryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { defineBasePlugin } from 'platejs';",
          "import { readFileSync } from 'node:fs';\nimport { defineBasePlugin } from 'platejs';"
        )
        .replace(
          "const CalloutPlugin = defineBasePlugin('calloutCapability', {",
          "const elementType = readFileSync('element-type.txt', 'utf8');\n\nconst CalloutPlugin = defineBasePlugin('calloutCapability', {"
        )
        .replace("type: 'callout_node'", 'type: elementType')
    );

    const generated = await generateEditor('src/editor/editor.ts', {
      cwd: directory,
    });

    expect(readFileSync(generated.typesPath, 'utf-8')).toContain(
      'readonly type: "cwd_relative_callout"'
    );
  }, 60_000);

  it('terminates evaluation with persistent handles', async () => {
    const { entryPath } = createFixture();

    writeFileSync(
      entryPath,
      `setInterval(() => {}, 60_000);\n${readFileSync(entryPath, 'utf-8')}`
    );

    const generated = await generateEditor(entryPath);

    expect(existsSync(generated.typesPath)).toBe(true);
  }, 60_000);

  it('compiles every entry before publishing a batch', async () => {
    const first = createFixture();
    const second = createFixture();
    const generated = await generateEditors([
      first.entryPath,
      second.entryPath,
    ]);
    const previous = generated.flatMap(({ schemaPath, typesPath }) => [
      [typesPath, readFileSync(typesPath, 'utf-8')] as const,
      [schemaPath, readFileSync(schemaPath, 'utf-8')] as const,
    ]);

    writeFileSync(
      first.entryPath,
      readFileSync(first.entryPath, 'utf-8').replace('version: 2', 'version: 3')
    );
    writeFileSync(second.entryPath, 'export default this is invalid');

    await expect(
      generateEditors([first.entryPath, second.entryPath])
    ).rejects.toThrow();
    previous.forEach(([path, source]) => {
      expect(readFileSync(path, 'utf-8')).toBe(source);
    });
  }, 60_000);

  it('does not rewrite current editors in a partially stale batch', async () => {
    const first = createFixture();
    const second = createFixture();
    const initial = await generateEditors([first.entryPath, second.entryPath]);
    const secondTypesMtime = statSync(initial[1].typesPath).mtimeMs;
    const secondSchemaMtime = statSync(initial[1].schemaPath).mtimeMs;

    writeFileSync(
      first.entryPath,
      readFileSync(first.entryPath, 'utf-8').replace('version: 2', 'version: 3')
    );
    const regenerated = await generateEditors([
      first.entryPath,
      second.entryPath,
    ]);

    expect(regenerated.map(({ status }) => status)).toEqual([
      'generated',
      'upToDate',
    ]);
    expect(statSync(initial[1].typesPath).mtimeMs).toBe(secondTypesMtime);
    expect(statSync(initial[1].schemaPath).mtimeMs).toBe(secondSchemaMtime);
  }, 60_000);

  it('reports every stale artifact in a batch', async () => {
    const first = createFixture();
    const second = createFixture();
    const generated = await generateEditors([
      first.entryPath,
      second.entryPath,
    ]);

    writeFileSync(
      generated[0].typesPath,
      `${readFileSync(generated[0].typesPath, 'utf-8')}\n// stale`
    );
    writeFileSync(
      generated[1].schemaPath,
      `${readFileSync(generated[1].schemaPath, 'utf-8')}\n`
    );
    let message = '';

    try {
      await generateEditors([first.entryPath, second.entryPath], {
        check: true,
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toContain(generated[0].typesPath);
    expect(message).toContain(generated[1].schemaPath);
  }, 60_000);

  it('rejects entries that own the same output paths', async () => {
    const { directory, entryPath } = createFixture();
    const collidingEntry = join(directory, 'editor.tsx');

    writeFileSync(collidingEntry, readFileSync(entryPath, 'utf-8'));

    await expect(generateEditors([entryPath, collidingEntry])).rejects.toThrow(
      'produce the same generated artifact'
    );
    await expect(watchEditors([entryPath, collidingEntry])).rejects.toThrow(
      'produce the same generated artifact'
    );
  });

  it('omits generic toggle from structural element mutations', async () => {
    const { directory, entryPath } = createFixture(false, false, false, false);
    const entry = readFileSync(entryPath, 'utf-8')
      .replace(
        "const AlignPlugin = defineBasePlugin('align', {",
        `const ImagePlugin = defineBasePlugin('image', { schema: { element: { void: 'block' } } });\n\nconst AlignPlugin = defineBasePlugin('align', {`
      )
      .replace(
        'export const EditorKit = [CalloutPlugin, AlignPlugin] as const;',
        'export const EditorKit = [CalloutPlugin, ImagePlugin, AlignPlugin] as const;'
      );

    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);
    const generated = readFileSync(result.typesPath, 'utf-8');
    const mutationMap = generated.match(
      /export type Mutations = Readonly<\{([\s\S]*?)\n\}>;/
    )?.[1];
    const imageMutation = mutationMap?.match(
      /readonly image: Readonly<\{[\s\S]*?\n {2}\}>;/
    )?.[0];

    expect(imageMutation).toBeDefined();
    expect(imageMutation).not.toContain('readonly toggle: true');
    expect(imageMutation).toContain(
      'readonly construction: Readonly<Record<PropertyKey, never>>'
    );
    expect(imageMutation).toContain(
      'readonly properties: Readonly<Record<PropertyKey, never>>'
    );
    expect(generated).not.toContain('SchemaPropertyHandle');
    const configPath = join(directory, 'tsconfig.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      compilerOptions: Record<string, unknown>;
    };

    config.compilerOptions.noUnusedLocals = true;
    writeFileSync(configPath, JSON.stringify(config));
    const contractPath = join(directory, 'contract.ts');

    writeFileSync(
      contractPath,
      `import type { Mutations, Schema } from './editor.generated';

const emptyConstruction: Mutations['image']['construction'] = {};
const emptyProperties: Schema['properties'] = {};
// @ts-expect-error generated empty construction rejects arbitrary fields
const invalidConstruction: Mutations['image']['construction'] = { extra: true };
// @ts-expect-error generated empty property maps reject primitives
const invalidProperties: Schema['properties'] = 'invalid';

void emptyConstruction;
void emptyProperties;
void invalidConstruction;
void invalidProperties;
`
    );
    await expectTypeScriptFilesCompile(configPath, [contractPath]);
  }, 60_000);

  it('emits generic toggle only for default-constructible text blocks without authored toggle semantics', async () => {
    const { entryPath } = createFixture();
    const entry = readFileSync(entryPath, 'utf-8')
      .replace(
        "const AlignPlugin = defineBasePlugin('align', {",
        `const HeadingPlugin = defineBasePlugin('heading', { schema: { element: s.element.textBlock() } });
const NestedPlugin = defineBasePlugin('nested', {
  schema: { element: { blockContent: false, content: s.content.text({ default: 'text', min: 1 }) } },
});
const QuotePlugin = defineBasePlugin('quote', {
  schema: { element: s.element.textBlock() },
  update: () => ({ toggle: () => undefined }),
});

const AlignPlugin = defineBasePlugin('align', {`
      )
      .replace(
        'export const EditorKit = [CalloutPlugin, AlignPlugin] as const;',
        'export const EditorKit = [CalloutPlugin, HeadingPlugin, NestedPlugin, QuotePlugin, AlignPlugin] as const;'
      );

    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);
    const generated = readFileSync(result.typesPath, 'utf-8');
    const mutationMap = generated.match(
      /export type Mutations = Readonly<\{([\s\S]*?)\n\}>;/
    )?.[1];
    const mutation = (name: string) =>
      mutationMap?.match(
        new RegExp(`readonly ${name}: Readonly<\\{[\\s\\S]*?\\n {2}\\}>;`)
      )?.[0];

    expect(mutation('heading')).toContain('readonly toggle: true');
    expect(mutation('calloutCapability')).not.toContain(
      'readonly toggle: true'
    );
    expect(mutation('nested')).not.toContain('readonly toggle: true');
    expect(mutation('quote')).not.toContain('readonly toggle: true');
  }, 60_000);

  it('terminates recursive JSON types at an unknown edge', async () => {
    const { entryPath } = createFixture(false, true);
    const entry = `type Left = { leftOnly: string; right: Right };
type Right = { left: Left; rightOnly: number };
${readFileSync(entryPath, 'utf-8').replace(
  "value is { id: string; tags: readonly ('a' | 'b')[] }",
  "value is { id: string; left: Left; right: Right; tags: readonly ('a' | 'b')[] }"
)}`;

    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);
    const generated = readFileSync(result.typesPath, 'utf-8');

    expect(generated).toContain('readonly raw?: unknown');
    expect(generated).toContain(
      'readonly left: { readonly leftOnly: string; readonly right: { readonly left: unknown; readonly rightOnly: number; }; };'
    );
    expect(generated).toContain(
      'readonly right: { readonly left: { readonly leftOnly: string; readonly right: unknown; }; readonly rightOnly: number; };'
    );
  }, 60_000);

  it('emits recursive element children through their named interface', async () => {
    const { entryPath } = createFixture(false, false, true);
    const result = await generateEditor(entryPath);

    expect(readFileSync(result.typesPath, 'utf-8')).toContain(
      'readonly children: readonly (CalloutCapabilityElement)[]'
    );
  }, 60_000);

  it('materializes and watches ambient declarations from the editor tsconfig', async () => {
    const { directory, entryPath } = createFixture();
    const globalsDirectory = join(directory, 'custom-types/fixture');
    const globalsPath = join(globalsDirectory, 'index.d.ts');
    const configPath = join(directory, 'tsconfig.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      compilerOptions: Record<string, unknown>;
      exclude?: string[];
    };
    const entry = readFileSync(entryPath, 'utf-8').replace(
      "value is { id: string; tags: readonly ('a' | 'b')[] }",
      'value is FixturePayload'
    );

    mkdirSync(globalsDirectory, { recursive: true });
    writeFileSync(
      globalsPath,
      "declare type FixturePayload = { id: string; tags: readonly ('a' | 'b')[] };\n"
    );
    config.compilerOptions.typeRoots = ['./custom-types'];
    config.compilerOptions.types = ['fixture'];
    config.exclude = ['./custom-types'];
    writeFileSync(configPath, JSON.stringify(config));
    writeFileSync(entryPath, entry);
    const initial = await generateEditor(entryPath);

    expect(readFileSync(initial.typesPath, 'utf-8')).toContain(
      'readonly payload?: { readonly id: string; readonly tags: readonly ("a" | "b")[]; }'
    );
    const watcher = await watchEditor(entryPath);

    try {
      expect(
        Object.entries(watcher.getWatched()).some(([innerDirectory, files]) =>
          files.some((file) => resolve(innerDirectory, file) === globalsPath)
        )
      ).toBe(true);
      const generated = new Promise<void>((resolveInner2) => {
        const unsubscribe = watcher.onGenerated(() => {
          unsubscribe();
          resolveInner2();
        });
      });

      writeFileSync(
        globalsPath,
        "declare type FixturePayload = { id: string; priority: number; tags: readonly ('a' | 'b')[] };\n"
      );
      await generated;
      expect(readFileSync(initial.typesPath, 'utf-8')).toContain(
        'readonly priority: number'
      );
    } finally {
      await watcher.close();
    }
  }, 60_000);

  it('watches ambient declarations with generated-looking filenames', async () => {
    const { directory, entryPath } = createFixture();
    const ambientPath = join(directory, 'schema.generated.d.ts');

    writeFileSync(
      ambientPath,
      'declare type GeneratedAmbientPayload = { readonly id: string };\n'
    );
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8').replace(
        "value is { id: string; tags: readonly ('a' | 'b')[] }",
        'value is GeneratedAmbientPayload'
      )
    );
    const initial = await generateEditor(entryPath);
    const watcher = await watchEditor(entryPath);

    try {
      expect(
        Object.entries(watcher.getWatched()).some(([innerDirectory2, files]) =>
          files.some((file) => resolve(innerDirectory2, file) === ambientPath)
        )
      ).toBe(true);
      const generated = new Promise<void>((resolveInner3) => {
        const unsubscribe = watcher.onGenerated(() => {
          unsubscribe();
          resolveInner3();
        });
      });

      writeFileSync(
        ambientPath,
        'declare type GeneratedAmbientPayload = { readonly id: string; readonly ambientRevision: true };\n'
      );
      await generated;
      expect(readFileSync(initial.typesPath, 'utf-8')).toContain(
        'readonly ambientRevision: true'
      );
    } finally {
      await watcher.close();
    }
  }, 60_000);

  it('preserves template, intersection, and rest tuple types', async () => {
    const { entryPath } = createFixture();
    const entry = `type UserId = \`user_\${string}\`;\n${readFileSync(
      entryPath,
      'utf-8'
    ).replace(
      "value is { id: string; tags: readonly ('a' | 'b')[] }",
      "value is { id: UserId; restTuple: [string, ...number[]]; tags: readonly ('a' | 'b')[]; variant: ({ a: string } | { b: string }) & { c: string } }"
    )}`;

    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);
    const generated = readFileSync(result.typesPath, 'utf-8');

    expect(generated).toContain(`readonly id: \`user_\${string}\`;`);
    expect(generated).not.toContain('UserId');
    expect(generated).toContain(
      'readonly restTuple: readonly [string, ...number[]];'
    );
    expect(generated).toContain(
      'readonly variant: { readonly a: string; } & { readonly c: string; } | { readonly b: string; } & { readonly c: string; };'
    );
  }, 60_000);

  it('reserves fixed generated type names', async () => {
    const { entryPath } = createFixture();
    const entry = readFileSync(entryPath, 'utf-8').replaceAll(
      'calloutCapability',
      'editor'
    );

    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);
    const generated = readFileSync(result.typesPath, 'utf-8');

    expect(generated).toContain('export interface EditorElement2');
    expect(generated).toContain(
      'export type EditorElement = EditorElement2 | ParagraphElement;'
    );
  }, 60_000);

  it('publishes both schema identities owned by one element plugin', async () => {
    const { entryPath } = createFixture();
    const entry = readFileSync(entryPath, 'utf-8').replace(
      'payload: property.json({',
      'calloutCapability: property.string(),\n        payload: property.json({'
    );

    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);
    const generated = readFileSync(result.typesPath, 'utf-8');

    expect(generated).toContain(
      'readonly calloutCapability: Readonly<{ readonly type: "callout_node"; readonly key: "calloutCapability"; }>;'
    );
    expect(generated).toContain(
      'calloutCapability: Object.freeze({ type: "callout_node", key: "calloutCapability" })'
    );
  }, 60_000);

  it('discovers the editor tsconfig, its extends chain, and project configs', () => {
    const { directory, entryPath } = createFixture();
    const configPath = join(directory, 'tsconfig.json');
    const baseConfigPath = join(directory, 'tsconfig.base.json');
    const referenceConfigPath = join(directory, 'tsconfig.reference.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<
      string,
      unknown
    >;

    writeFileSync(
      baseConfigPath,
      JSON.stringify({ extends: config.extends, compilerOptions: {} })
    );
    writeFileSync(
      referenceConfigPath,
      JSON.stringify({
        compilerOptions: { composite: true },
        files: ['./reference.ts'],
      })
    );
    writeFileSync(join(directory, 'reference.ts'), 'export {};\n');
    writeFileSync(
      configPath,
      JSON.stringify({
        ...config,
        extends: './tsconfig.base.json',
        references: [{ path: './tsconfig.reference.json' }],
      })
    );

    expect(discoverEditorSourceFiles(entryPath)).toEqual(
      expect.arrayContaining([configPath, baseConfigPath, referenceConfigPath])
    );
  });

  it('retains invalid project configs for watch recovery', () => {
    const { directory, entryPath } = createFixture();
    const configPath = join(directory, 'tsconfig.json');
    const referenceConfigPath = join(directory, 'tsconfig.reference.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<
      string,
      unknown
    >;

    writeFileSync(referenceConfigPath, '{ invalid json');
    writeFileSync(
      configPath,
      JSON.stringify({
        ...config,
        references: [{ path: './tsconfig.reference.json' }],
      })
    );

    expect(discoverEditorSourceFiles(entryPath)).toEqual(
      expect.arrayContaining([configPath, referenceConfigPath])
    );
  });

  it('preserves last-good output when entry evaluation fails', async () => {
    const { entryPath } = createFixture();
    const result = await generateEditor(entryPath);
    const previousTypes = readFileSync(result.typesPath, 'utf-8');
    const previousSchema = readFileSync(result.schemaPath, 'utf-8');

    writeFileSync(entryPath, 'export default this is not valid TypeScript');
    await expect(generateEditor(entryPath)).rejects.toThrow();
    expect(readFileSync(result.typesPath, 'utf-8')).toBe(previousTypes);
    expect(readFileSync(result.schemaPath, 'utf-8')).toBe(previousSchema);
  }, 60_000);

  it('watches a dependency discovered by a failed regeneration', async () => {
    const { directory, entryPath } = createFixture();
    const initial = await generateEditor(entryPath);
    const dependencyPath = join(directory, 'watch-dependency.ts');
    const originalEntry = readFileSync(entryPath, 'utf-8');
    const previousStderrWrite = process.stderr.write;
    let sawFailure = false;
    const watcher = await watchEditor(entryPath);

    process.stderr.write = (chunk: string | Uint8Array) => {
      if (String(chunk).includes('watch-dependency.ts')) sawFailure = true;

      return true;
    };
    try {
      writeFileSync(dependencyPath, 'export const broken = ;\n');
      writeFileSync(
        entryPath,
        `import './watch-dependency';\n${originalEntry}`
      );
      await waitFor(() => sawFailure);
      await waitFor(() =>
        Object.values(watcher.getWatched()).some((files) =>
          files.includes('watch-dependency.ts')
        )
      );
      const failedMtime = statSync(initial.typesPath).mtimeMs;
      let generated = false;
      const unsubscribeGenerated = watcher.onGenerated(() => {
        generated = true;
      });
      const regenerated = new Promise<void>((resolveInner4) => {
        const unsubscribe = watcher.onChecked(() => {
          unsubscribe();
          resolveInner4();
        });
      });

      writeFileSync(dependencyPath, 'export {};\n');
      await regenerated;
      unsubscribeGenerated();
      expect(generated).toBe(false);
      expect(statSync(initial.typesPath).mtimeMs).toBe(failedMtime);
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher.close();
    }
  }, 60_000);

  it('recovers when the editor module is recreated', async () => {
    const { entryPath } = createFixture();
    const originalEntry = readFileSync(entryPath, 'utf-8');
    const previousStderrWrite = process.stderr.write;
    const watcher = await watchEditor(entryPath);
    let sawFailure = false;

    process.stderr.write = (chunk: string | Uint8Array) => {
      if (String(chunk).includes('does not exist')) sawFailure = true;

      return true;
    };
    try {
      rmSync(entryPath);
      await waitFor(() => sawFailure);
      const checked = new Promise<void>((resolveChecked) => {
        const unsubscribe = watcher.onChecked(() => {
          unsubscribe();
          resolveChecked();
        });
      });

      writeFileSync(entryPath, originalEntry);
      await checked;
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher.close();
    }
  }, 60_000);

  it('ignores unrelated files while waiting for a missing deep dependency', async () => {
    const { directory, entryPath } = createFixture();
    const dependencyPath = join(directory, 'missing/deep/dependency.ts');
    const unrelatedPath = join(directory, 'unrelated.ts');
    const previousStderrWrite = process.stderr.write;

    writeFileSync(
      entryPath,
      `import './missing/deep/dependency';\n${readFileSync(entryPath, 'utf-8')}`
    );
    process.stderr.write = () => true;
    const watcher = await watchEditor(entryPath);
    let checked = 0;
    const unsubscribeChecked = watcher.onChecked(() => {
      checked += 1;
    });

    try {
      writeFileSync(unrelatedPath, 'export {};\n');
      await new Promise((resolveDelay) => {
        setTimeout(resolveDelay, 75);
      });
      expect(checked).toBe(0);

      mkdirSync(dirname(dependencyPath), { recursive: true });
      await waitFor(() =>
        Object.keys(watcher.getWatched()).some(
          (path) => resolve(path) === dirname(dependencyPath)
        )
      );
      const generated = new Promise<void>((resolveGenerated) => {
        const unsubscribe = watcher.onGenerated(() => {
          unsubscribe();
          resolveGenerated();
        });
      });

      writeFileSync(dependencyPath, 'export {};\n');
      await generated;
    } finally {
      unsubscribeChecked();
      process.stderr.write = previousStderrWrite;
      await watcher.close();
    }
  }, 60_000);

  it('recovers an initially invalid type-only dependency', async () => {
    const { directory, entryPath } = createFixture();
    const payloadPath = join(directory, 'invalid-type-payload.ts');
    const previousStderrWrite = process.stderr.write;

    writeFileSync(payloadPath, 'export type Payload = { readonly id: ; };\n');
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport type { Payload } from './invalid-type-payload';"
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );
    process.stderr.write = () => true;
    let watcher: Awaited<ReturnType<typeof watchEditor>> | undefined;

    try {
      watcher = await watchEditor(entryPath);
      const generated = new Promise<void>((resolveInner5) => {
        const unsubscribe = watcher!.onGenerated(() => {
          unsubscribe();
          resolveInner5();
        });
      });

      writeFileSync(
        payloadPath,
        'export type Payload = { readonly id: string; readonly recovered: true };\n'
      );
      await generated;
      expect(
        readFileSync(join(directory, 'editor.generated.ts'), 'utf-8')
      ).toContain('readonly recovered: true');
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher?.close();
    }
  }, 60_000);

  it('watches the TypeScript source substituted for a JavaScript import', async () => {
    const { directory, entryPath } = createFixture();
    const javascriptPath = join(directory, 'substituted-payload.js');
    const typescriptPath = join(directory, 'substituted-payload.ts');

    writeFileSync(javascriptPath, 'export const runtime = true;\n');
    writeFileSync(
      typescriptPath,
      'export type Payload = { readonly id: string };\n'
    );
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport type { Payload } from './substituted-payload.js';"
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );
    const initial = await generateEditor(entryPath);
    const watcher = await watchEditor(entryPath);

    try {
      expect(
        Object.entries(watcher.getWatched()).some(([innerDirectory3, files]) =>
          files.some(
            (file) => resolve(innerDirectory3, file) === typescriptPath
          )
        )
      ).toBe(true);
      const generated = new Promise<void>((resolveInner6) => {
        const unsubscribe = watcher.onGenerated(() => {
          unsubscribe();
          resolveInner6();
        });
      });

      writeFileSync(
        typescriptPath,
        'export type Payload = { readonly id: string; readonly substituted: true };\n'
      );
      await generated;
      expect(readFileSync(initial.typesPath, 'utf-8')).toContain(
        'readonly substituted: true'
      );
    } finally {
      await watcher.close();
    }
  }, 60_000);

  it('watches local type-only dependencies that shape generated properties', async () => {
    const { directory, entryPath } = createFixture();
    const payloadPath = join(directory, 'payload.ts');
    const typesPath = join(directory, 'types.ts');
    const configPath = join(directory, 'tsconfig.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      compilerOptions: { paths: Record<string, string[]> };
    };
    const initialPayload = `export type Payload = {
  readonly id: string;
  readonly tags: readonly ('a' | 'b')[];
};
`;

    writeFileSync(payloadPath, initialPayload);
    writeFileSync(typesPath, "export * from '@fixture/payload';\n");
    config.compilerOptions.paths['@fixture/*'] = ['./*'];
    writeFileSync(configPath, JSON.stringify(config));
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport type { Payload } from './types';"
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );
    const initial = await generateEditor(entryPath);
    const watcher = await watchEditor(entryPath);

    try {
      expect(
        Object.entries(watcher.getWatched()).some(([innerDirectory4, files]) =>
          files.some((file) => resolve(innerDirectory4, file) === payloadPath)
        )
      ).toBe(true);
      const generated = new Promise<void>((resolveInner7) => {
        const unsubscribe = watcher.onGenerated(() => {
          unsubscribe();
          resolveInner7();
        });
      });

      writeFileSync(
        payloadPath,
        initialPayload.replace(
          'readonly id: string;',
          'readonly id: string;\n  readonly priority: number;'
        )
      );
      await generated;
      expect(readFileSync(initial.typesPath, 'utf-8')).toContain(
        'readonly priority: number'
      );
    } finally {
      await watcher.close();
    }
  }, 60_000);

  it('watches the most specific TypeScript paths match', async () => {
    const { directory, entryPath } = createFixture();
    const catchAllPath = join(directory, 'catch-all/@app/payload.ts');
    const actualPath = join(directory, 'actual/payload.ts');
    const configPath = join(directory, 'tsconfig.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      compilerOptions: { paths: Record<string, string[]> };
    };

    mkdirSync(dirname(catchAllPath), { recursive: true });
    mkdirSync(dirname(actualPath), { recursive: true });
    writeFileSync(
      catchAllPath,
      'export type Payload = { readonly wrong: true };\n'
    );
    writeFileSync(
      actualPath,
      'export type Payload = { readonly id: string };\n'
    );
    config.compilerOptions.paths = {
      '*': ['./catch-all/*'],
      '@app/*': ['./actual/*'],
      ...config.compilerOptions.paths,
    };
    writeFileSync(configPath, JSON.stringify(config));
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport type { Payload } from '@app/payload';"
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );
    const initial = await generateEditor(entryPath);
    const watcher = await watchEditor(entryPath);

    try {
      expect(
        Object.entries(watcher.getWatched()).some(([innerDirectory5, files]) =>
          files.some((file) => resolve(innerDirectory5, file) === actualPath)
        )
      ).toBe(true);
      const generated = new Promise<void>((resolveInner8) => {
        const unsubscribe = watcher.onGenerated(() => {
          unsubscribe();
          resolveInner8();
        });
      });

      writeFileSync(
        actualPath,
        'export type Payload = { readonly id: string; readonly priority: number };\n'
      );
      await generated;
      expect(readFileSync(initial.typesPath, 'utf-8')).toContain(
        'readonly priority: number'
      );
    } finally {
      await watcher.close();
    }
  }, 60_000);

  it('uses the editor project paths for type-only imports outside its directory', async () => {
    const { directory, entryPath } = createFixture();
    const sharedDirectory = mkdtempSync(join(packageRoot, 'tmp-cli-shared-'));
    const modelPath = join(sharedDirectory, 'model.ts');
    const payloadPath = join(directory, 'external-payload.ts');
    const configPath = join(directory, 'tsconfig.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      compilerOptions: { paths: Record<string, string[]> };
    };
    const modelImport = relative(
      dirname(entryPath),
      modelPath.slice(0, -'.ts'.length)
    ).replaceAll('\\', '/');

    temporaryDirectories.push(sharedDirectory);
    config.compilerOptions.paths['@external/*'] = [join(directory, '*')];
    writeFileSync(configPath, JSON.stringify(config));
    writeFileSync(
      modelPath,
      "import type { ExternalPayload } from '@external/external-payload';\nexport type Payload = ExternalPayload;\n"
    );
    writeFileSync(
      payloadPath,
      'export type ExternalPayload = { readonly id: string };\n'
    );
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          `import { property, schema as s, target } from 'platejs';\nimport type { Payload } from '${modelImport.startsWith('.') ? modelImport : `./${modelImport}`}';`
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );
    const initial = await generateEditor(entryPath);
    const watcher = await watchEditor(entryPath);

    try {
      expect(
        Object.entries(watcher.getWatched()).some(([innerDirectory6, files]) =>
          files.some((file) => resolve(innerDirectory6, file) === payloadPath)
        )
      ).toBe(true);
      const generated = new Promise<void>((resolveInner9) => {
        const unsubscribe = watcher.onGenerated(() => {
          unsubscribe();
          resolveInner9();
        });
      });

      writeFileSync(
        payloadPath,
        'export type ExternalPayload = { readonly id: string; readonly externalRevision: true };\n'
      );
      await generated;
      expect(readFileSync(initial.typesPath, 'utf-8')).toContain(
        'readonly externalRevision: true'
      );
    } finally {
      await watcher.close();
    }
  }, 60_000);

  it('does not fall through a missing exact paths match', async () => {
    const { directory, entryPath } = createFixture();
    const exactPath = join(directory, 'exact/payload.ts');
    const wildcardPath = join(directory, 'wildcard/payload.ts');
    const typesPath = join(directory, 'editor.generated.ts');
    const configPath = join(directory, 'tsconfig.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      compilerOptions: { paths: Record<string, string[]> };
    };

    mkdirSync(dirname(wildcardPath), { recursive: true });
    writeFileSync(
      wildcardPath,
      'export type Payload = { readonly wrong: true };\n'
    );
    config.compilerOptions.paths = {
      '@app/payload': ['./exact/payload'],
      '@app/*': ['./wildcard/*'],
      ...config.compilerOptions.paths,
    };
    writeFileSync(configPath, JSON.stringify(config));
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport type { Payload } from '@app/payload';"
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );
    const previousStderrWrite = process.stderr.write;

    process.stderr.write = () => true;
    let watcher: Awaited<ReturnType<typeof watchEditor>> | undefined;

    try {
      watcher = await watchEditor(entryPath);
      const generated = new Promise<void>((resolveInner10) => {
        const unsubscribe = watcher!.onGenerated(() => {
          unsubscribe();
          resolveInner10();
        });
      });

      mkdirSync(dirname(exactPath), { recursive: true });
      writeFileSync(
        exactPath,
        'export type Payload = { readonly id: string };\n'
      );
      await generated;
      expect(readFileSync(typesPath, 'utf-8')).toContain(
        'readonly payload?: { readonly id: string; }'
      );
      expect(readFileSync(typesPath, 'utf-8')).not.toContain('readonly wrong');
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher?.close();
    }
  }, 60_000);

  it('resolves paths from the effective extended tsconfig', async () => {
    const { directory, entryPath } = createFixture();
    const configPath = join(directory, 'tsconfig.json');
    const baseConfigPath = join(directory, 'config/base.json');
    const payloadPath = join(directory, 'sources/actual/payload.ts');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      compilerOptions: { paths: Record<string, string[]> };
      extends: string;
    };
    const inheritedPaths = config.compilerOptions.paths;

    mkdirSync(dirname(baseConfigPath), { recursive: true });
    mkdirSync(dirname(payloadPath), { recursive: true });
    writeFileSync(
      baseConfigPath,
      JSON.stringify({
        compilerOptions: {
          paths: {
            ...inheritedPaths,
            '@app/*': ['../sources/actual/*'],
          },
        },
        extends: config.extends,
      })
    );
    config.extends = './config/base.json';
    delete (config.compilerOptions as { paths?: Record<string, string[]> })
      .paths;
    writeFileSync(configPath, JSON.stringify(config));
    writeFileSync(
      payloadPath,
      'export type Payload = { readonly id: string };\n'
    );
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport type { Payload } from '@app/payload';"
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );
    const initial = await generateEditor(entryPath);
    const watcher = await watchEditor(entryPath);

    try {
      expect(
        Object.entries(watcher.getWatched()).some(([innerDirectory7, files]) =>
          files.some((file) => resolve(innerDirectory7, file) === payloadPath)
        )
      ).toBe(true);
      const generated = new Promise<void>((resolveInner11) => {
        const unsubscribe = watcher.onGenerated(() => {
          unsubscribe();
          resolveInner11();
        });
      });

      writeFileSync(
        payloadPath,
        'export type Payload = { readonly id: string; readonly priority: number };\n'
      );
      await generated;
      expect(readFileSync(initial.typesPath, 'utf-8')).toContain(
        'readonly priority: number'
      );
    } finally {
      await watcher.close();
    }
  }, 60_000);

  it('materializes an unlink-add dependency replacement as one change', async () => {
    const { directory, entryPath } = createFixture();
    const payloadPath = join(directory, 'payload.ts');
    const session = new NativeTypeScriptSession(packageRoot);

    writeFileSync(
      payloadPath,
      'export type Payload = { readonly id: string };\n'
    );
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport type { Payload } from './payload';"
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );

    try {
      const initial = await generateEditor(entryPath, {}, session);

      expect(readFileSync(initial.typesPath, 'utf-8')).not.toContain(
        'readonly priority: number'
      );
      rmSync(payloadPath);
      session.recordFileChange('unlink', payloadPath);
      writeFileSync(
        payloadPath,
        'export type Payload = { readonly id: string; readonly priority: number };\n'
      );
      session.recordFileChange('add', payloadPath);

      await generateEditor(entryPath, {}, session);
      expect(readFileSync(initial.typesPath, 'utf-8')).toContain(
        'readonly priority: number'
      );
    } finally {
      await session.close();
    }
  }, 60_000);

  it('recovers when an initially missing aliased type-only dependency is created', async () => {
    const { directory, entryPath } = createFixture();
    const payloadPath = join(directory, 'payload.ts');
    const configPath = join(directory, 'tsconfig.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      compilerOptions: { paths: Record<string, string[]> };
    };
    const validPayload =
      'export type Payload = { readonly id: string; readonly tags: readonly string[] };\n';

    config.compilerOptions.paths['@fixture/*'] = ['./*'];
    writeFileSync(configPath, JSON.stringify(config));
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport type { Payload } from '@fixture/payload';"
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );
    const previousStderrWrite = process.stderr.write;

    const watcher = await watchEditor(entryPath);

    try {
      const generated = new Promise<void>((resolveInner12) => {
        const unsubscribe = watcher.onGenerated(() => {
          unsubscribe();
          resolveInner12();
        });
      });

      writeFileSync(payloadPath, validPayload);
      await generated;
      expect(existsSync(join(directory, 'editor.generated.ts'))).toBe(true);
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher.close();
    }
  }, 60_000);

  it('recovers an ordinary import erased as type-only', async () => {
    const { directory, entryPath } = createFixture();
    const payloadPath = join(directory, 'ordinary-payload.ts');
    const validPayload =
      'export type Payload = { readonly id: string; readonly tags: readonly string[] };\n';

    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport { Payload } from './ordinary-payload';"
        )
        .replace(
          "value is { id: string; tags: readonly ('a' | 'b')[] }",
          'value is Payload'
        )
    );
    const previousStderrWrite = process.stderr.write;

    process.stderr.write = () => true;
    let watcher: Awaited<ReturnType<typeof watchEditor>> | undefined;

    try {
      watcher = await watchEditor(entryPath);
      const generated = new Promise<void>((resolveInner13) => {
        const unsubscribe = watcher!.onGenerated(() => {
          unsubscribe();
          resolveInner13();
        });
      });

      writeFileSync(payloadPath, validPayload);
      await generated;
      expect(existsSync(join(directory, 'editor.generated.ts'))).toBe(true);
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher?.close();
    }
  }, 60_000);

  it('watches a type-only import-equals dependency', async () => {
    const { directory, entryPath } = createFixture();
    const payloadPath = join(directory, 'import-equals-payload.ts');
    const configPath = join(directory, 'tsconfig.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as {
      compilerOptions: Record<string, unknown>;
    };

    config.compilerOptions.module = 'CommonJS';
    config.compilerOptions.moduleResolution = 'Node';
    config.compilerOptions.verbatimModuleSyntax = false;
    writeFileSync(configPath, JSON.stringify(config));

    writeFileSync(
      payloadPath,
      "declare class Payload { readonly id: string; readonly tags: readonly ('a' | 'b')[] }\nexport = Payload;\n"
    );
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8')
        .replace(
          "import { property, schema as s, target } from 'platejs';",
          "import { property, schema as s, target } from 'platejs';\nimport type Payload = require('./import-equals-payload');"
        )
        .replace(
          /payload: property\.json\(\{[\s\S]*?validationVersion: 1,\n {8}\}\),/,
          'payload: property.json<Payload>(),'
        )
    );
    const initial = await generateEditor(entryPath);
    const initialMtime = statSync(initial.typesPath).mtimeMs;
    const watcher = await watchEditor(entryPath);

    try {
      expect(
        Object.entries(watcher.getWatched()).some(([innerDirectory8, files]) =>
          files.some((file) => resolve(innerDirectory8, file) === payloadPath)
        )
      ).toBe(true);
      const generated = new Promise<void>((resolveInner14) => {
        const unsubscribe = watcher.onChecked(() => {
          unsubscribe();
          resolveInner14();
        });
      });

      writeFileSync(
        payloadPath,
        "declare class Payload { readonly id: number; readonly tags: readonly ('a' | 'b')[] }\nexport = Payload;\n"
      );
      await generated;
      expect(statSync(initial.typesPath).mtimeMs).toBe(initialMtime);
    } finally {
      await watcher.close();
    }
  }, 60_000);

  it('watches missing and loaded JavaScript evaluation dependencies', async () => {
    const { directory, entryPath } = createFixture();
    const dependencyPath = join(directory, 'runtime-schema.js');
    const declarationPath = join(directory, 'runtime-schema.d.ts');
    const schemaPath = join(directory, 'editor.schema.json');
    const originalEntry = readFileSync(entryPath, 'utf-8');
    const previousStderrWrite = process.stderr.write;

    writeFileSync(declarationPath, 'export const calloutType: string;\n');
    writeFileSync(
      entryPath,
      `import { calloutType } from './runtime-schema.js';\n${originalEntry.replace("type: 'callout_node'", 'type: calloutType')}`
    );
    process.stderr.write = () => true;
    let watcher: Awaited<ReturnType<typeof watchEditor>> | undefined;

    try {
      watcher = await watchEditor(entryPath);

      writeFileSync(
        dependencyPath,
        "export const calloutType = 'dynamic_one';\n"
      );
      await waitFor(
        () =>
          existsSync(schemaPath) &&
          readFileSync(schemaPath, 'utf-8').includes('dynamic_one')
      );
      writeFileSync(
        dependencyPath,
        "export const calloutType = 'dynamic_two';\n"
      );
      await waitFor(() =>
        readFileSync(schemaPath, 'utf-8').includes('dynamic_two')
      );
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher?.close();
    }
  }, 60_000);

  it('starts watching when the initial generation fails', async () => {
    const { directory, entryPath } = createFixture();
    const dependencyPath = join(directory, 'initial-globals.ts');
    const typesPath = join(directory, 'editor.generated.ts');
    const previousStderrWrite = process.stderr.write;
    let sawFailure = false;

    writeFileSync(
      dependencyPath,
      'export {};\ndeclare global { type FixturePayload = { broken: never }; }\n'
    );
    writeFileSync(
      entryPath,
      readFileSync(entryPath, 'utf-8').replace(
        "value is { id: string; tags: readonly ('a' | 'b')[] }",
        'value is FixturePayload'
      )
    );
    process.stderr.write = (chunk: string | Uint8Array) => {
      if (String(chunk).length > 0) sawFailure = true;

      return true;
    };

    let watcher: Awaited<ReturnType<typeof watchEditor>> | undefined;

    try {
      watcher = await watchEditor(entryPath);
      expect(sawFailure).toBe(true);
      expect(
        Object.values(watcher.getWatched()).some((files) =>
          files.includes('initial-globals.ts')
        )
      ).toBe(true);

      writeFileSync(
        dependencyPath,
        'export {};\ndeclare global { type FixturePayload = { id: string; tags: readonly string[] }; }\n'
      );
      await waitFor(() => existsSync(typesPath));
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher?.close();
    }
  }, 60_000);

  it('recovers after an initially invalid editor tsconfig is fixed', async () => {
    const { directory, entryPath } = createFixture();
    const configPath = join(directory, 'tsconfig.json');
    const validConfig = readFileSync(configPath, 'utf-8');
    const typesPath = join(directory, 'editor.generated.ts');
    const previousStderrWrite = process.stderr.write;

    writeFileSync(configPath, '{ invalid');
    process.stderr.write = () => true;
    let watcher: Awaited<ReturnType<typeof watchEditor>> | undefined;

    try {
      watcher = await watchEditor(entryPath);
      expect(
        Object.values(watcher.getWatched()).some((files) =>
          files.includes('tsconfig.json')
        )
      ).toBe(true);

      writeFileSync(configPath, validConfig);
      await waitFor(() => existsSync(typesPath));
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher?.close();
    }
  }, 60_000);

  it('regenerates when an extended tsconfig changes', async () => {
    const { directory, entryPath } = createFixture();
    const configPath = join(directory, 'tsconfig.json');
    const baseConfigPath = join(directory, 'watch-base.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8')) as Record<
      string,
      unknown
    >;

    writeFileSync(
      baseConfigPath,
      JSON.stringify({ extends: config.extends, compilerOptions: {} })
    );
    writeFileSync(
      configPath,
      JSON.stringify({ ...config, extends: './watch-base.json' })
    );
    const initial = await generateEditor(entryPath);
    const watcher = await watchEditor(entryPath);

    try {
      expect(Object.values(watcher.getWatched()).flat()).not.toContain(
        'editor.generated.ts'
      );
      expect(Object.values(watcher.getWatched()).flat()).not.toContain(
        'editor.schema.json'
      );
      const previousMtime = statSync(initial.typesPath).mtimeMs;
      let generated = false;
      const unsubscribeGenerated = watcher.onGenerated(() => {
        generated = true;
      });
      const regenerated = new Promise<void>((resolveInner15) => {
        const unsubscribe = watcher.onChecked(() => {
          unsubscribe();
          resolveInner15();
        });
      });

      writeFileSync(
        baseConfigPath,
        JSON.stringify({
          extends: config.extends,
          compilerOptions: { noUnusedLocals: false },
        })
      );
      await regenerated;
      unsubscribeGenerated();
      expect(generated).toBe(false);
      expect(statSync(initial.typesPath).mtimeMs).toBe(previousMtime);
    } finally {
      await watcher.close();
    }
  }, 60_000);

  it('regenerates only the editors affected by a watched source', async () => {
    const first = createFixture();
    const second = createFixture();
    const watcher = await watchEditors([first.entryPath, second.entryPath]);
    const collidingEntry = join(first.directory, 'editor.tsx');

    try {
      await expect(
        watchEditors([second.entryPath, first.entryPath])
      ).rejects.toThrow('Another Plate watcher owns generated artifact');
      writeFileSync(collidingEntry, readFileSync(first.entryPath, 'utf-8'));
      await expect(watchEditor(collidingEntry)).rejects.toThrow(
        'Another Plate watcher owns generated artifact'
      );
      const generated = new Promise<readonly string[]>((resolveInner16) => {
        const unsubscribe = watcher.onGenerated((entryPaths) => {
          unsubscribe();
          resolveInner16(entryPaths);
        });
      });

      writeFileSync(
        first.entryPath,
        readFileSync(first.entryPath, 'utf-8').replace(
          'version: 2',
          'version: 3'
        )
      );

      expect(await generated).toEqual([first.entryPath]);
    } finally {
      await watcher.close();
    }
    expect(
      readdirSync(first.directory).some((name) => name.endsWith('.watch'))
    ).toBe(false);
  }, 60_000);

  it('does not miss an entry edit during initial watch compilation', async () => {
    const { directory, entryPath } = createFixture();
    const outputPath = join(directory, 'watch.stdout');
    const schemaPath = join(directory, 'editor.schema.json');
    const child = Bun.spawn(
      [
        process.execPath,
        resolve(packageRoot, 'src/bin.ts'),
        'generate',
        '--watch',
        entryPath,
      ],
      {
        cwd: packageRoot,
        stderr: 'pipe',
        stdout: Bun.file(outputPath),
      }
    );

    try {
      await waitFor(() => hasWatchOwnership(entryPath));
      writeFileSync(
        entryPath,
        readFileSync(entryPath, 'utf-8').replace('version: 2', 'version: 3')
      );
      await waitFor(
        () =>
          existsSync(outputPath) &&
          readFileSync(outputPath, 'utf-8').includes('Watching 1 editor'),
        15_000
      );
      await waitFor(
        () =>
          existsSync(schemaPath) &&
          (
            JSON.parse(readFileSync(schemaPath, 'utf-8')) as {
              identity: { version: number };
            }
          ).identity.version === 3
      );
    } finally {
      child.kill('SIGINT');
      await child.exited;
    }
  }, 30_000);

  it('allows unchanged generation while another process watches', async () => {
    const { directory, entryPath } = createFixture();
    const initial = await generateEditor(entryPath);
    const outputPath = join(directory, 'watch.stdout');
    const child = Bun.spawn(
      [
        process.execPath,
        resolve(packageRoot, 'src/bin.ts'),
        'generate',
        '--watch',
        entryPath,
      ],
      {
        cwd: packageRoot,
        stderr: 'pipe',
        stdout: Bun.file(outputPath),
      }
    );

    try {
      await waitFor(
        () =>
          existsSync(outputPath) &&
          readFileSync(outputPath, 'utf-8').includes('Watching 1 editor'),
        15_000
      );
      const typesMtime = statSync(initial.typesPath).mtimeMs;
      const schemaMtime = statSync(initial.schemaPath).mtimeMs;
      const unchanged = await generateEditor(entryPath);

      expect(unchanged.status).toBe('upToDate');
      expect(statSync(initial.typesPath).mtimeMs).toBe(typesMtime);
      expect(statSync(initial.schemaPath).mtimeMs).toBe(schemaMtime);
    } finally {
      child.kill('SIGINT');
      await child.exited;
    }
  }, 30_000);

  it('exits cleanly when watch is interrupted during initialization', async () => {
    const { directory, entryPath } = createFixture();
    const child = Bun.spawn(
      [
        process.execPath,
        resolve(packageRoot, 'src/bin.ts'),
        'generate',
        '--watch',
        entryPath,
      ],
      {
        cwd: packageRoot,
        stderr: 'pipe',
        stdout: 'pipe',
      }
    );

    await waitFor(() => hasWatchOwnership(entryPath));
    child.kill('SIGINT');

    expect(await child.exited).toBe(130);
    expect(await new Response(child.stderr).text()).toBe('');
    expect(hasWatchOwnership(entryPath)).toBe(false);
    expect(
      readdirSync(directory).every((name) =>
        [
          'editor.ts',
          'editor.generated.ts',
          'editor.schema.json',
          'tsconfig.json',
        ].includes(name)
      )
    ).toBe(true);
  }, 15_000);

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
        {
          afterInstall: (_path, index) => {
            if (index === 0) throw new Error('simulated interruption');
          },
        }
      )
    ).toThrow('simulated interruption');
    expect(readFileSync(first, 'utf-8')).toBe('first-old');
    expect(readFileSync(second, 'utf-8')).toBe('second-old');
    const firstMtime = statSync(first).mtimeMs;

    expect(
      replaceArtifacts([
        { content: 'first-old', path: first },
        { content: 'second-final', path: second },
      ])
    ).toBe(true);
    expect(statSync(first).mtimeMs).toBe(firstMtime);
    expect(readFileSync(first, 'utf-8')).toBe('first-old');
    expect(readFileSync(second, 'utf-8')).toBe('second-final');
  });

  it('uses the conventional package cache outside Git', () => {
    const directory = mkdtempSync(join(tmpdir(), 'plate-cli-no-git-'));
    const artifactPath = join(directory, 'src/editor.generated.ts');

    temporaryDirectories.push(directory);
    writeFileSync(join(directory, 'package.json'), '{}');
    expect(
      relative(realpathSync(directory), artifactStateRoot(artifactPath))
    ).toBe('node_modules/.cache/plate/state');
    replaceArtifacts([{ content: 'export {};\n', path: artifactPath }]);
    expect(readFileSync(artifactPath, 'utf-8')).toBe('export {};\n');
    expect(readdirSync(dirname(artifactPath))).toEqual(['editor.generated.ts']);
  });

  it('canonicalizes symlink aliases before deriving artifact identities', () => {
    const directory = mkdtempSync(join(tmpdir(), 'plate-cli-realpath-'));
    const alias = `${directory}-alias`;
    const entryPath = join(directory, 'editor.ts');
    const aliasEntryPath = join(alias, 'editor.ts');
    const artifactPath = join(directory, 'editor.generated.ts');
    const aliasArtifactPath = join(alias, 'editor.generated.ts');

    temporaryDirectories.push(directory, alias);
    writeFileSync(join(directory, 'package.json'), '{}');
    writeFileSync(entryPath, 'export {};\n');
    symlinkSync(directory, alias, 'dir');

    expect(pathFingerprint(aliasArtifactPath)).toBe(
      pathFingerprint(artifactPath)
    );
    expect(artifactStateRoot(aliasArtifactPath)).toBe(
      artifactStateRoot(artifactPath)
    );
    expect(resolveEditorEntryPaths([entryPath, aliasEntryPath])).toEqual([
      realpathSync(entryPath),
    ]);
  });

  it('fails instead of splitting cache roots when the package cache is not writable', () => {
    const directory = mkdtempSync(join(tmpdir(), 'plate-cli-cache-fallback-'));
    const nodeModulesPath = join(directory, 'node_modules');
    const artifactPath = join(directory, 'writable/editor.generated.ts');

    temporaryDirectories.push(directory);
    writeFileSync(join(directory, 'package.json'), '{}');
    mkdirSync(nodeModulesPath);
    chmodSync(nodeModulesPath, 0o500);
    try {
      expect(() => artifactStateRoot(artifactPath)).toThrow(
        'could not create private state'
      );
    } finally {
      chmodSync(nodeModulesPath, 0o700);
    }
  });

  it('recovers a process-interrupted artifact transaction on the next run', () => {
    const { directory } = createFixture();
    const first = join(directory, 'crash-first.txt');
    const second = join(directory, 'crash-second.txt');
    const artifacts = [
      { content: 'first-new', path: first },
      { content: 'second-new', path: second },
    ];

    writeFileSync(first, 'first-old');
    writeFileSync(second, 'second-old');

    expect(() =>
      replaceArtifacts(artifacts, { interruptAfterInstall: 0 })
    ).toThrow('simulated process interruption');
    expectOnlyFixtureFiles(directory, [first, second]);
    replaceArtifacts([
      { content: 'first-final', path: first },
      { content: 'second-final', path: second },
    ]);

    expect(readFileSync(first, 'utf-8')).toBe('first-final');
    expect(readFileSync(second, 'utf-8')).toBe('second-final');
    expectOnlyFixtureFiles(directory, [first, second]);
  });

  it('recovers interruption after every artifact install index', () => {
    const { directory } = createFixture();

    [0, 1].forEach((interruptAfterInstall) => {
      const first = join(directory, `index-${interruptAfterInstall}-first.txt`);
      const second = join(
        directory,
        `index-${interruptAfterInstall}-second.txt`
      );
      const artifacts = [
        { content: 'first-new', path: first },
        { content: 'second-new', path: second },
      ];

      writeFileSync(first, 'first-old');
      writeFileSync(second, 'second-old');
      expect(() =>
        replaceArtifacts(artifacts, { interruptAfterInstall })
      ).toThrow('simulated process interruption');
      replaceArtifacts([
        { content: 'first-final', path: first },
        { content: 'second-final', path: second },
      ]);
      expect(readFileSync(first, 'utf-8')).toBe('first-final');
      expect(readFileSync(second, 'utf-8')).toBe('second-final');
    });
    expectOnlyFixtureFiles(
      directory,
      [0, 1].flatMap((index) => [
        join(directory, `index-${index}-first.txt`),
        join(directory, `index-${index}-second.txt`),
      ])
    );
  });

  it('recovers an interrupted publication before check mode reads', async () => {
    const { entryPath } = createFixture();
    const generated = await generateEditor(entryPath);
    const typesSource = readFileSync(generated.typesPath, 'utf-8');
    const schemaSource = readFileSync(generated.schemaPath, 'utf-8');

    expect(() =>
      replaceArtifacts(
        [
          { content: 'invalid types', path: generated.typesPath },
          { content: 'invalid schema', path: generated.schemaPath },
        ],
        { interruptAfterInstall: 0 }
      )
    ).toThrow('simulated process interruption');

    await generateEditor(entryPath, { check: true });
    expect(readFileSync(generated.typesPath, 'utf-8')).toBe(typesSource);
    expect(readFileSync(generated.schemaPath, 'utf-8')).toBe(schemaSource);
  }, 60_000);

  it('recovers an interrupted batch before publishing an overlapping subset', () => {
    const { directory } = createFixture();
    const first = join(directory, 'overlap-first.txt');
    const second = join(directory, 'overlap-second.txt');

    writeFileSync(first, 'first-old');
    writeFileSync(second, 'second-old');

    expect(() =>
      replaceArtifacts(
        [
          { content: 'first-interrupted', path: first },
          { content: 'second-interrupted', path: second },
        ],
        { interruptAfterInstall: 0 }
      )
    ).toThrow('simulated process interruption');
    expectOnlyFixtureFiles(directory, [first, second]);

    replaceArtifacts([{ content: 'first-subset', path: first }]);

    expect(readFileSync(first, 'utf-8')).toBe('first-subset');
    expect(readFileSync(second, 'utf-8')).toBe('second-old');

    replaceArtifacts([
      { content: 'first-final', path: first },
      { content: 'second-final', path: second },
    ]);

    expect(readFileSync(first, 'utf-8')).toBe('first-final');
    expect(readFileSync(second, 'utf-8')).toBe('second-final');
    expectOnlyFixtureFiles(directory, [first, second]);
  });

  it('keeps subset publication safe if journal linkage is interrupted', () => {
    const { directory } = createFixture();
    const first = join(directory, 'link-first.txt');
    const second = join(directory, 'link-second.txt');

    writeFileSync(first, 'first-old');
    writeFileSync(second, 'second-old');

    expect(() =>
      replaceArtifacts(
        [
          { content: 'first-interrupted', path: first },
          { content: 'second-interrupted', path: second },
        ],
        { interruptAfterReference: 0 }
      )
    ).toThrow('simulated process interruption');
    expectOnlyFixtureFiles(directory, [first, second]);

    expect(readFileSync(first, 'utf-8')).toBe('first-old');
    expect(readFileSync(second, 'utf-8')).toBe('second-old');

    replaceArtifacts([{ content: 'second-subset', path: second }]);
    replaceArtifacts([
      { content: 'first-final', path: first },
      { content: 'second-final', path: second },
    ]);

    expect(readFileSync(first, 'utf-8')).toBe('first-final');
    expect(readFileSync(second, 'utf-8')).toBe('second-final');
    expectOnlyFixtureFiles(directory, [first, second]);
  });

  it('rejects a concurrent artifact transaction for the same outputs', () => {
    const { directory } = createFixture();
    const first = join(directory, 'concurrent-first.txt');
    const second = join(directory, 'concurrent-second.txt');
    const artifacts = [
      { content: 'first-new', path: first },
      { content: 'second-new', path: second },
    ];

    writeFileSync(first, 'first-old');
    writeFileSync(second, 'second-old');
    replaceArtifacts(artifacts, {
      afterInstall: (_path, index) => {
        if (index === 0) {
          expect(() => replaceArtifacts(artifacts)).toThrow(
            'already replacing these generated artifacts'
          );
        }
      },
    });

    expect(readFileSync(first, 'utf-8')).toBe('first-new');
    expect(readFileSync(second, 'utf-8')).toBe('second-new');
  });

  it('keeps committed artifacts consistent when backup cleanup fails', () => {
    const { directory } = createFixture();
    const first = join(directory, 'cleanup-first.txt');
    const second = join(directory, 'cleanup-second.txt');
    const previousStderrWrite = process.stderr.write;
    let warning = '';

    writeFileSync(first, 'first-old');
    writeFileSync(second, 'second-old');
    process.stderr.write = (chunk: string | Uint8Array) => {
      warning += String(chunk);

      return true;
    };
    try {
      replaceArtifacts(
        [
          { content: 'first-new', path: first },
          { content: 'second-new', path: second },
        ],
        {
          removeBackup: (path, index) => {
            if (index === 1) throw new Error('simulated cleanup failure');
            rmSync(path, { force: true });
          },
        }
      );
    } finally {
      process.stderr.write = previousStderrWrite;
    }

    expect(readFileSync(first, 'utf-8')).toBe('first-new');
    expect(readFileSync(second, 'utf-8')).toBe('second-new');
    expect(warning).toContain('simulated cleanup failure');
    replaceArtifacts([
      { content: 'first-final', path: first },
      { content: 'second-final', path: second },
    ]);
    expect(readFileSync(first, 'utf-8')).toBe('first-final');
    expect(readFileSync(second, 'utf-8')).toBe('second-final');
    expectOnlyFixtureFiles(directory, [first, second]);
  });

  it('scaffolds a typed migration from the last-good artifacts', async () => {
    const { entryPath } = createFixture();

    await generateEditor(entryPath);
    const previousEntry = readFileSync(entryPath, 'utf-8');

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
      readCommittedFile: (path) => readFileSync(path, 'utf-8'),
    });
    const manifest = JSON.parse(readFileSync(result.manifestPath, 'utf-8')) as {
      diff: { requiresMigration: boolean };
      from: { fingerprint: string; version: number };
      to: { version: number };
    };
    const migration = readFileSync(result.migrationPath, 'utf-8');
    const fromTypesPath = join(result.directory, 'from.ts');
    const toTypesPath = join(result.directory, 'to.ts');

    expect(manifest.diff.requiresMigration).toBe(true);
    expect(manifest.from.version).toBe(2);
    expect(manifest.to.version).toBe(3);
    expect(migration).toContain('FromValue');
    expect(migration).toContain('ToValue');
    expect(migration).toContain('DocumentMigration<');
    expect(migration).toContain('FromDocument');
    expect(migration).toContain('ToDocument');
    expect(migration).toContain('({ document })');
    expect(readFileSync(result.paths[2], 'utf-8')).toContain(
      `export const fingerprint = "${manifest.from.fingerprint}"`
    );
    expect(existsSync(join(result.directory, 'from.schema.json'))).toBe(true);
    expect(existsSync(join(result.directory, 'to.schema.json'))).toBe(true);
    expect(result.paths).toHaveLength(6);
    expect(result.paths).toEqual(
      expect.arrayContaining([
        result.manifestPath,
        result.migrationPath,
        fromTypesPath,
        toTypesPath,
      ])
    );
    expect(readFileSync(fromTypesPath, 'utf-8')).toContain(
      'EditorSchemaContract'
    );

    const configPath = join(dirname(entryPath), 'tsconfig.json');
    await expectTypeScriptFilesCompile(configPath, [
      fromTypesPath,
      toTypesPath,
      result.migrationPath,
    ]);
  }, 60_000);
});
