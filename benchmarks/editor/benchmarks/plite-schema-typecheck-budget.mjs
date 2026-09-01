import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const SCHEMA_TYPECHECK_COHORTS = Object.freeze([100, 1000]);

export const createSchemaTypecheckFixture = (plugins) => {
  if (!SCHEMA_TYPECHECK_COHORTS.includes(plugins)) {
    throw new Error(`Unsupported schema typecheck cohort: ${plugins}.`);
  }

  const declarations = Array.from(
    { length: plugins },
    (_value, index) => `
const Plugin${index} = defineBasePlugin('schemaTypeBudget${index}', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});`
  ).join('\n');
  const names = Array.from(
    { length: plugins },
    (_value, index) => `Plugin${index}`
  ).join(',\n  ');

  const pluginsDeclaration =
    plugins === 1000
      ? 'const plugins: readonly AnyBasePlugin[] = ['
      : 'const plugins = [';

  return `import {
  createEditor,
  defineBasePlugin,
  type AnyBasePlugin,
} from 'platejs';
import { schema } from 'platejs';
${declarations}

${pluginsDeclaration}
  ${names},
] as const;
const editor = createEditor({
  plugins,
  schema: { id: 'schema-typecheck-budget-${plugins}', version: 1 },
});
const resolved = editor.read.schema.element(Plugin${plugins - 1});
const resolvedType: string | undefined = resolved?.type;

void resolvedType;
`;
};

export const parseTypeScriptExtendedDiagnostics = (output) => {
  const read = (label, pattern) => {
    const match = output.match(pattern);

    if (!match) {
      throw new Error(`TypeScript extended diagnostics omitted ${label}.`);
    }

    return Number(match[1].replaceAll(',', ''));
  };

  return Object.freeze({
    checkMs: read('Check time', /^Check time:\s+([\d.]+)s$/mu) * 1000,
    instantiations: read('Instantiations', /^Instantiations:\s+([\d,]+)$/mu),
    memoryBytes: read('Memory used', /^Memory used:\s+([\d,]+)K$/mu) * 1024,
    totalMs: read('Total time', /^Total time:\s+([\d.]+)s$/mu) * 1000,
    types: read('Types', /^Types:\s+([\d,]+)$/mu),
  });
};

export const runSchemaTypecheckBudget = (root) => {
  const outputDirectory = resolve(root, 'tmp/plite-schema-typecheck-budget');

  mkdirSync(outputDirectory, { recursive: true });

  const rows = SCHEMA_TYPECHECK_COHORTS.map((plugins) => {
    const fixturePath = resolve(outputDirectory, `case-${plugins}.ts`);
    const configPath = resolve(outputDirectory, `tsconfig-${plugins}.json`);

    writeFileSync(fixturePath, createSchemaTypecheckFixture(plugins));
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          compilerOptions: {
            incremental: false,
            noEmit: true,
          },
          extends: '../../tooling/config/tsconfig.type-tests.json',
          include: [`case-${plugins}.ts`],
        },
        null,
        2
      )}\n`
    );

    const result = spawnSync(
      resolve(root, 'node_modules/.bin/tsc'),
      ['--extendedDiagnostics', '--pretty', 'false', '--project', configPath],
      {
        cwd: root,
        encoding: 'utf-8',
        maxBuffer: 16 * 1024 * 1024,
      }
    );
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(
        `Schema typecheck fixture ${plugins} failed (${result.status}).\n${output}`
      );
    }

    return Object.freeze({
      ...parseTypeScriptExtendedDiagnostics(output),
      plugins,
    });
  });

  return Object.freeze({
    checkTimeRatio: rows[1].checkMs / Math.max(rows[0].checkMs, 1),
    instantiationRatio:
      rows[1].instantiations / Math.max(rows[0].instantiations, 1),
    rows: Object.freeze(rows),
  });
};
