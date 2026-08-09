import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'bun:test';
import ts from 'typescript';

import {
  discoverEditorSourceFiles,
  generateEditor,
  replaceArtifacts,
} from '../src/generate';
import { createEditorMigration } from '../src/migrate';
import { watchEditor } from '../src/watch';

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
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
};

const createFixture = (
  tsx = false,
  recursiveJson = false,
  recursiveElement = false
) => {
  const directory = mkdtempSync(join(packageRoot, '.plate-cli-test-'));
  const entryPath = join(directory, `editor-definition.${tsx ? 'tsx' : 'ts'}`);
  const entry = `import { defineBasePlugin, defineEditor } from '../../core/src/index';
import { property, schema, target } from '../../plite/src/index';

const CalloutPlugin = defineBasePlugin('calloutCapability', {
  schema: {
    element: {
      content: ${
        recursiveElement
          ? "schema.content.type('callout_node')"
          : "schema.content.text({ default: 'text', min: 1 })"
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
      reviewFlags: schema.textProperty(
        schema.key.prefix('reviewFlag_'),
        property.boolean()
      ),
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
EditorKit.schema.plugins.calloutCapability.type satisfies 'callout_node';
EditorKit.schema.plugins.align.key satisfies 'align';
EditorKit.schema.properties.reviewState.key satisfies 'reviewState';
EditorKit.schema.properties.reviewFlags.key.prefix satisfies 'reviewFlag_';
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

  it('terminates recursive JSON types at an unknown edge', async () => {
    const { entryPath } = createFixture(false, true);
    const result = await generateEditor(entryPath);

    expect(readFileSync(result.typesPath, 'utf8')).toContain(
      'readonly raw?: unknown'
    );
  }, 60_000);

  it('emits recursive element children through their named interface', async () => {
    const { entryPath } = createFixture(false, false, true);
    const result = await generateEditor(entryPath);

    expect(readFileSync(result.typesPath, 'utf8')).toContain(
      'readonly children: readonly (CalloutCapabilityElement)[]'
    );
  }, 60_000);

  it('materializes globals included by the editor tsconfig', async () => {
    const { directory, entryPath } = createFixture();
    const entry = readFileSync(entryPath, 'utf8').replace(
      "value is { id: string; tags: readonly ('a' | 'b')[] }",
      'value is FixturePayload'
    );

    writeFileSync(
      join(directory, 'globals.d.ts'),
      "type FixturePayload = { id: string; tags: readonly ('a' | 'b')[] };\n"
    );
    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);

    expect(readFileSync(result.typesPath, 'utf8')).toContain(
      'readonly payload?: { readonly id: string; readonly tags: readonly ("a" | "b")[]; }'
    );
  }, 60_000);

  it('preserves template, intersection, and rest tuple types', async () => {
    const { entryPath } = createFixture();
    const entry = `type UserId = \`user_\${string}\`;\n${readFileSync(
      entryPath,
      'utf8'
    ).replace(
      "value is { id: string; tags: readonly ('a' | 'b')[] }",
      "value is { id: UserId; restTuple: [string, ...number[]]; tags: readonly ('a' | 'b')[]; variant: ({ a: string } | { b: string }) & { c: string } }"
    )}`;

    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);
    const generated = readFileSync(result.typesPath, 'utf8');

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
    const entry = readFileSync(entryPath, 'utf8').replaceAll(
      'calloutCapability',
      'editor'
    );

    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);
    const generated = readFileSync(result.typesPath, 'utf8');

    expect(generated).toContain('export interface EditorElement2');
    expect(generated).toContain(
      'export type EditorElement = EditorElement2 | ParagraphElement;'
    );
  }, 60_000);

  it('publishes both schema identities owned by one element plugin', async () => {
    const { entryPath } = createFixture();
    const entry = readFileSync(entryPath, 'utf8').replace(
      'payload: property.json({',
      'calloutCapability: property.string(),\n        payload: property.json({'
    );

    writeFileSync(entryPath, entry);
    const result = await generateEditor(entryPath);
    const generated = readFileSync(result.typesPath, 'utf8');

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
    const config = JSON.parse(readFileSync(configPath, 'utf8')) as Record<
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
    const config = JSON.parse(readFileSync(configPath, 'utf8')) as Record<
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
    const previousTypes = readFileSync(result.typesPath, 'utf8');
    const previousSchema = readFileSync(result.schemaPath, 'utf8');

    writeFileSync(entryPath, 'export default this is not valid TypeScript');
    await expect(generateEditor(entryPath)).rejects.toThrow();
    expect(readFileSync(result.typesPath, 'utf8')).toBe(previousTypes);
    expect(readFileSync(result.schemaPath, 'utf8')).toBe(previousSchema);
  }, 60_000);

  it('watches a dependency discovered by a failed regeneration', async () => {
    const { directory, entryPath } = createFixture();
    const initial = await generateEditor(entryPath);
    const dependencyPath = join(directory, 'watch-dependency.ts');
    const originalEntry = readFileSync(entryPath, 'utf8');
    const previousStderrWrite = process.stderr.write;
    let sawFailure = false;
    const watcher = await watchEditor(entryPath);

    await new Promise<void>((resolve) => watcher.once('ready', resolve));
    process.stderr.write = ((chunk: string | Uint8Array) => {
      if (String(chunk).includes('watch-dependency.ts')) sawFailure = true;

      return true;
    }) as typeof process.stderr.write;
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

      writeFileSync(dependencyPath, 'export {};\n');
      await waitFor(() => statSync(initial.typesPath).mtimeMs > failedMtime);
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher.close();
    }
  }, 60_000);

  it('watches missing and loaded JavaScript evaluation dependencies', async () => {
    const { directory, entryPath } = createFixture();
    const dependencyPath = join(directory, 'runtime-schema.js');
    const declarationPath = join(directory, 'runtime-schema.d.ts');
    const schemaPath = join(directory, 'editor.schema.json');
    const originalEntry = readFileSync(entryPath, 'utf8');
    const previousStderrWrite = process.stderr.write;

    writeFileSync(declarationPath, 'export const calloutType: string;\n');
    writeFileSync(
      entryPath,
      `import { calloutType } from './runtime-schema.js';\n${originalEntry.replace("type: 'callout_node'", 'type: calloutType')}`
    );
    process.stderr.write = (() => true) as typeof process.stderr.write;
    let watcher: Awaited<ReturnType<typeof watchEditor>> | undefined;

    try {
      watcher = await watchEditor(entryPath);
      await new Promise<void>((resolve) => watcher!.once('ready', resolve));

      writeFileSync(
        dependencyPath,
        "export const calloutType = 'dynamic_one';\n"
      );
      await waitFor(
        () =>
          existsSync(schemaPath) &&
          readFileSync(schemaPath, 'utf8').includes('dynamic_one')
      );
      writeFileSync(
        dependencyPath,
        "export const calloutType = 'dynamic_two';\n"
      );
      await waitFor(() =>
        readFileSync(schemaPath, 'utf8').includes('dynamic_two')
      );
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher?.close();
    }
  }, 60_000);

  it('starts watching when the initial generation fails', async () => {
    const { directory, entryPath } = createFixture();
    const dependencyPath = join(directory, 'initial-watch-dependency.ts');
    const typesPath = join(directory, 'editor.generated.ts');
    const originalEntry = readFileSync(entryPath, 'utf8');
    const previousStderrWrite = process.stderr.write;
    let sawFailure = false;

    writeFileSync(dependencyPath, 'export const broken = ;\n');
    writeFileSync(
      entryPath,
      `import './initial-watch-dependency';\n${originalEntry}`
    );
    process.stderr.write = ((chunk: string | Uint8Array) => {
      if (String(chunk).includes('initial-watch-dependency.ts')) {
        sawFailure = true;
      }

      return true;
    }) as typeof process.stderr.write;

    let watcher: Awaited<ReturnType<typeof watchEditor>> | undefined;

    try {
      watcher = await watchEditor(entryPath);
      await new Promise<void>((resolve) => watcher!.once('ready', resolve));
      expect(sawFailure).toBe(true);
      expect(
        Object.values(watcher.getWatched()).some((files) =>
          files.includes('initial-watch-dependency.ts')
        )
      ).toBe(true);

      writeFileSync(dependencyPath, 'export {};\n');
      await waitFor(() => existsSync(typesPath));
    } finally {
      process.stderr.write = previousStderrWrite;
      await watcher?.close();
    }
  }, 60_000);

  it('recovers after an initially invalid editor tsconfig is fixed', async () => {
    const { directory, entryPath } = createFixture();
    const configPath = join(directory, 'tsconfig.json');
    const validConfig = readFileSync(configPath, 'utf8');
    const typesPath = join(directory, 'editor.generated.ts');
    const previousStderrWrite = process.stderr.write;

    writeFileSync(configPath, '{ invalid');
    process.stderr.write = (() => true) as typeof process.stderr.write;
    let watcher: Awaited<ReturnType<typeof watchEditor>> | undefined;

    try {
      watcher = await watchEditor(entryPath);
      await new Promise<void>((resolve) => watcher!.once('ready', resolve));
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
    const config = JSON.parse(readFileSync(configPath, 'utf8')) as Record<
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
      await new Promise<void>((resolve) => watcher.once('ready', resolve));
      expect(Object.values(watcher.getWatched()).flat()).not.toContain(
        'editor.generated.ts'
      );
      expect(Object.values(watcher.getWatched()).flat()).not.toContain(
        'editor.schema.json'
      );
      const previousMtime = statSync(initial.typesPath).mtimeMs;

      writeFileSync(
        baseConfigPath,
        JSON.stringify({
          extends: config.extends,
          compilerOptions: { noUnusedLocals: false },
        })
      );
      await waitFor(() => statSync(initial.typesPath).mtimeMs > previousMtime);
    } finally {
      await watcher.close();
    }
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
    expect(readFileSync(first, 'utf8')).toBe('first-old');
    expect(readFileSync(second, 'utf8')).toBe('second-old');
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
    replaceArtifacts([
      { content: 'first-final', path: first },
      { content: 'second-final', path: second },
    ]);

    expect(readFileSync(first, 'utf8')).toBe('first-final');
    expect(readFileSync(second, 'utf8')).toBe('second-final');
    expect(
      readdirSync(directory).filter((name) =>
        /plate-artifacts|\.backup$|\.tmp$/.test(name)
      )
    ).toEqual([]);
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

    expect(readFileSync(first, 'utf8')).toBe('first-new');
    expect(readFileSync(second, 'utf8')).toBe('second-new');
  });

  it('keeps committed artifacts consistent when backup cleanup fails', () => {
    const { directory } = createFixture();
    const first = join(directory, 'cleanup-first.txt');
    const second = join(directory, 'cleanup-second.txt');
    const previousStderrWrite = process.stderr.write;
    let warning = '';

    writeFileSync(first, 'first-old');
    writeFileSync(second, 'second-old');
    process.stderr.write = ((chunk: string | Uint8Array) => {
      warning += String(chunk);

      return true;
    }) as typeof process.stderr.write;
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

    expect(readFileSync(first, 'utf8')).toBe('first-new');
    expect(readFileSync(second, 'utf8')).toBe('second-new');
    expect(warning).toContain('simulated cleanup failure');
    replaceArtifacts([
      { content: 'first-final', path: first },
      { content: 'second-final', path: second },
    ]);
    expect(readFileSync(first, 'utf8')).toBe('first-final');
    expect(readFileSync(second, 'utf8')).toBe('second-final');
    expect(
      readdirSync(directory).filter((name) =>
        /plate-artifacts|\.backup$|\.tmp$/.test(name)
      )
    ).toEqual([]);
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
