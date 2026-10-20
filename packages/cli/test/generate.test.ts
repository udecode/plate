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
  generateEditor,
  generateEditors,
  replaceArtifacts,
  resolveEditorEntryPaths,
} from '../src/generate';
import { createEditorMigration } from '../src/migrate';
import { artifactStateRoot, pathFingerprint } from '../src/state';
import { NativeTypeScriptSession } from '../src/typescript';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '../..');
const temporaryDirectories: string[] = [];
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
  const entry = `import { definePlugin } from 'platejs';
import { property, schema as s, target } from 'platejs';

const CalloutPlugin = definePlugin('calloutCapability', {
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

const AlignPlugin = definePlugin('align', {
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
        'platejs/compiler': [
          resolve(repoRoot, 'packages/platejs/src/compiler/index.tsx'),
        ],
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
  it('compiles once without activating plugins or invoking property generators', async () => {
    const { entryPath } = createFixture();
    const source = readFileSync(entryPath, 'utf-8')
      .replace(
        "generate: () => 'token'",
        "generate: () => { throw new Error('document generator ran'); }"
      )
      .replace(
        'const CalloutPlugin = definePlugin',
        'let configured = 0;\nconst CalloutPlugin = definePlugin'
      )
      .replace(
        "const AlignPlugin = definePlugin('align', {",
        "const InlinePlugin = definePlugin('inline', { schema: { element: { void: 'inline' } } });\n\nconst AlignPlugin = definePlugin('align', {"
      )
      .replace(
        "definePlugin('calloutCapability', {",
        "definePlugin('calloutCapability', {\n  activate() { throw new Error('plugin activation ran'); },"
      )
      .replace(
        'export const EditorKit = [CalloutPlugin, AlignPlugin]',
        "export const EditorKit = [CalloutPlugin.extend(() => { if (++configured !== 1) throw new Error('configured twice'); return {}; }), InlinePlugin, AlignPlugin]"
      );

    writeFileSync(entryPath, source);
    const generated = await generateEditor(entryPath);
    const types = readFileSync(generated.typesPath, 'utf-8');

    expect(types).toContain(
      "import type { GeneratedEditorTypeProvider } from 'platejs/compiler';"
    );
    expect(types).toContain('readonly block: true;');
    expect(types).toContain('readonly block: false;');
    expect(types).toContain('readonly token: string');
    expect(types).toContain('readonly payload?: { readonly id: string;');
  });

  it('materializes dependency-only authored properties through constrained compiler projections', async () => {
    const { directory, entryPath } = createFixture();
    writeFileSync(
      entryPath,
      `import { definePlugin, property, schema, target } from 'platejs';
export const Box = definePlugin('box', {
  schema: { element: { type: 'box_node', content: schema.content.text(), properties: {
    payload: property.json({ validate: (value: unknown): value is { id: string } => typeof value === 'object' && value !== null, validationVersion: 1 }),
  } } },
});
export const Extra = definePlugin('extra', {
  schema: { properties: {
    extra: schema.elementProperty(property.json({ validate: (value: unknown): value is { score: number } => typeof value === 'object' && value !== null, validationVersion: 1 }), { target: target.element(Box) }),
    textData: schema.textProperty(property.json({ validate: (value: unknown): value is { label: 'x' | 'y' } => typeof value === 'object' && value !== null, validationVersion: 1 })),
  } },
});
const Parent = definePlugin('parent', { dependencies: [Box, Extra] });
export const EditorKit = [Parent] as const;
`
    );
    const contractPath = join(directory, 'contract.ts');
    writeFileSync(
      contractPath,
      `import type { EditorPropertyTypes } from 'platejs/compiler';
import { Box, Extra, EditorKit } from './editor';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type Owner<P extends readonly unknown[], N extends keyof EditorPropertyTypes<P>['owners'] & string> = EditorPropertyTypes<P>['owners'][N];
type DependencyOwner = Assert<Equal<NonNullable<Owner<typeof EditorKit, 'extra'>['extra']>, { score: number }>>;
type DependencyText = Assert<Equal<NonNullable<EditorPropertyTypes<typeof EditorKit>['text']['textData']>, { label: 'x' | 'y' }>>;
type ExplicitOwner = Assert<Equal<NonNullable<Owner<readonly [typeof Box, typeof Extra], 'box'>['payload']>, { id: string }>>;
// @ts-expect-error owner names come from the installed dependency closure.
type MissingOwner = Owner<typeof EditorKit, 'missingOwner'>;
`
    );
    await expectTypeScriptFilesCompile(join(directory, 'tsconfig.json'), [
      entryPath,
      contractPath,
    ]);
    const generated = await generateEditor(entryPath);
    const types = readFileSync(generated.typesPath, 'utf-8');
    expect(types).toContain('readonly extra?: { readonly score: number; }');
    expect(types).toContain(
      'readonly textData?: { readonly label: "x" | "y"; }'
    );
  });

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
        "const AlignPlugin = definePlugin('align', {",
        `const RootBlockPlugin = definePlugin('rootBlock', {
  schema: { element: s.element.textBlock() },
});

const AlignPlugin = definePlugin('align', {`
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

  it('keeps generated types stable when only compiled schema behavior changes', async () => {
    const { entryPath } = createFixture();
    const session = new NativeTypeScriptSession(packageRoot);

    try {
      const first = await generateEditor(entryPath, {}, session);
      const firstTypes = readFileSync(first.typesPath, 'utf-8');
      const firstFingerprint = JSON.parse(
        readFileSync(first.schemaPath, 'utf-8')
      ).fingerprint;

      writeFileSync(
        entryPath,
        readFileSync(entryPath, 'utf-8').replace(
          "type: 'callout_node',",
          "object: true,\n      type: 'callout_node',"
        )
      );

      const second = await generateEditor(entryPath, {}, session);

      expect(readFileSync(second.typesPath, 'utf-8')).toBe(firstTypes);
      expect(
        JSON.parse(readFileSync(second.schemaPath, 'utf-8')).fingerprint
      ).not.toBe(firstFingerprint);
      await generateEditor(entryPath, { check: true }, session);
    } finally {
      await session.close();
    }
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
          "import { definePlugin } from 'platejs';",
          "import { readFileSync } from 'node:fs';\nimport { dirname } from 'node:path';\nimport { fileURLToPath } from 'node:url';\nimport { definePlugin } from 'platejs';"
        )
        .replace(
          "const CalloutPlugin = definePlugin('calloutCapability', {",
          `const elementTypes = [
  readFileSync(new URL('./element-type.txt', import.meta.url), 'utf8'),
  readFileSync(\`\${import.meta.dirname}/element-type.txt\`, 'utf8'),
  readFileSync(\`\${dirname(import.meta.filename)}/element-type.txt\`, 'utf8'),
  readFileSync(fileURLToPath(import.meta.resolve('./element-type.txt')), 'utf8'),
];
if (import.meta.resolve('node:fs') !== 'node:fs') throw new Error('builtin resolution changed');
const elementType = [...new Set(elementTypes)].join(',');

const CalloutPlugin = definePlugin('calloutCapability', {`
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
          "const CalloutPlugin = definePlugin('calloutCapability', {",
          `const evaluationGlobal = globalThis as typeof globalThis & { __plateEvaluationCount?: number };
evaluationGlobal.__plateEvaluationCount = (evaluationGlobal.__plateEvaluationCount ?? 0) + 1;
const evaluationCount = evaluationGlobal.__plateEvaluationCount;

const CalloutPlugin = definePlugin('calloutCapability', {`
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
          "import { definePlugin } from 'platejs';",
          "import { readFileSync } from 'node:fs';\nimport { definePlugin } from 'platejs';"
        )
        .replace(
          "const CalloutPlugin = definePlugin('calloutCapability', {",
          "const elementType = readFileSync('element-type.txt', 'utf8');\n\nconst CalloutPlugin = definePlugin('calloutCapability', {"
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
  });

  it('omits generic toggle from structural element mutations', async () => {
    const { directory, entryPath } = createFixture(false, false, false, false);
    const entry = readFileSync(entryPath, 'utf-8')
      .replace(
        "const AlignPlugin = definePlugin('align', {",
        `const ImagePlugin = definePlugin('image', { schema: { element: { void: 'block' } } });\n\nconst AlignPlugin = definePlugin('align', {`
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
        "const AlignPlugin = definePlugin('align', {",
        `const HeadingPlugin = definePlugin('heading', { schema: { element: s.element.textBlock() } });
const NestedPlugin = definePlugin('nested', {
  schema: { element: { blockContent: false, content: s.content.text({ default: 'text', min: 1 }) } },
});
const QuotePlugin = definePlugin('quote', {
  schema: { element: s.element.textBlock() },
  update: () => ({ toggle: () => undefined }),
});

const AlignPlugin = definePlugin('align', {`
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
    expect(migration).toContain("from 'platejs/migrations'");
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
