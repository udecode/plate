#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outputDirectory = resolve(root, 'tmp/shared-plugin-identity-benchmark');
const artifactDirectory = resolve(
  root,
  'docs/plans/artifacts/shared-plugin-identity-feasibility'
);
const baselinePath = resolve(artifactDirectory, 'production-baseline.json');
const resultPath = resolve(artifactDirectory, 'production-result.json');
const mode = process.argv.includes('--write-baseline')
  ? 'baseline'
  : 'candidate';
const cohorts = Object.freeze([1, 32, 128, 512]);
const runtimeSamples = 40;
const runtimeWarmups = 8;

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf-8',
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed (${result.status}).\n${
        result.stdout ?? ''
      }\n${result.stderr ?? ''}`
    );
  }

  return result.stdout ?? '';
};

const rawFactory = 'definePlugin';
const rawOption = 'plugins';
const portalMethod = 'plugin';

const runtimeSource = `
import {
  createEditor as createRawEditor,
  ${rawFactory} as defineRawPlugin,
} from 'plitejs';
import {
  createEditor as createPlateEditor,
  definePlugin as defineProductPlugin,
} from 'platejs';

const cohorts = ${JSON.stringify(cohorts)};
const samples = ${runtimeSamples};
const warmups = ${runtimeWarmups};

const percentile = (values: number[], ratio: number) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
};

const summarize = (values: number[]) => ({
  max: Math.max(...values),
  p50: percentile(values, 0.5),
  p95: percentile(values, 0.95),
});

const createRawPlugins = (count: number, prefix: string) => {
  const plugins: any[] = [];
  for (let index = 0; index < count; index++) {
    const dependency = plugins[index - 1];
    plugins.push(
      defineRawPlugin(\`\${prefix}Raw\${index}\`, {
        api: () => ({ value: () => index }),
        ...(dependency ? { dependencies: [dependency] } : {}),
      })
    );
  }
  return plugins;
};

const createPlatePlugins = (count: number, prefix: string) => {
  const plugins: any[] = [];
  for (let index = 0; index < count; index++) {
    const dependency = plugins[index - 1];
    const base = defineProductPlugin(\`\${prefix}Plate\${index}\`, {
      api: () => ({ value: () => index }),
      ...(dependency ? { dependencies: [dependency] } : {}),
    });
    plugins.push(
      base
        .extend(({ api }: any) => ({
          api: () => ({ first: () => api.value() + 1 }),
        }))
        .extend(({ api }: any) => ({
          api: () => ({ second: () => api.first() + 1 }),
        }))
    );
  }
  return plugins;
};

const measure = (
  createPlugins: (count: number, prefix: string) => any[],
  create: (plugins: any[]) => any,
  read: (editor: any, plugin: any) => unknown,
  cohort: number,
  lane: string
) => {
  for (let index = 0; index < warmups; index++) {
    const plugins = createPlugins(cohort, \`warm\${lane}\${cohort}x\${index}\`);
    const editor = create(plugins);
    read(editor, plugins.at(-1));
  }
  const values: number[] = [];
  for (let index = 0; index < samples; index++) {
    const plugins = createPlugins(cohort, \`sample\${lane}\${cohort}x\${index}\`);
    const startedAt = performance.now();
    const editor = create(plugins);
    read(editor, plugins.at(-1));
    values.push(performance.now() - startedAt);
  }
  return summarize(values);
};

const rows = cohorts.map((cohort) => ({
  cohort,
  plate: measure(
    createPlatePlugins,
    (plugins) => createPlateEditor({ plugins }),
    (editor, plugin) => editor.${portalMethod}(plugin).api.second(),
    cohort,
    'plate'
  ),
  raw: measure(
    createRawPlugins,
    (plugins) => createRawEditor({ ${rawOption}: plugins }),
    (editor, plugin) => editor.${portalMethod}(plugin).api.value(),
    cohort,
    'raw'
  ),
}));

process.stdout.write(JSON.stringify({ rows }));
`;

const rawDeclarations = Array.from(
  { length: 64 },
  (_value, index) =>
    `const Raw${index} = defineRawPlugin('typeRaw${index}', {
  api: () => ({ value${index}: () => ${index} as const }),
});`
).join('\n');
const plateDeclarations = Array.from(
  { length: 64 },
  (_value, index) =>
    `const Plate${index} = defineProductPlugin('typePlate${index}', {
  api: () => ({ value${index}: () => ${index} as const }),
}).extend(({ api }) => ({
  api: () => ({ next${index}: () => api.value${index}() + 1 }),
})).extend(({ api }) => ({
  api: () => ({ final${index}: () => api.next${index}() + 1 }),
}));`
).join('\n');
const rawNames = Array.from(
  { length: 64 },
  (_value, index) => `Raw${index}`
).join(',\n  ');
const plateNames = Array.from(
  { length: 64 },
  (_value, index) => `Plate${index}`
).join(',\n  ');
const typeSource = `
import {
  createEditor as createRawEditor,
  ${rawFactory} as defineRawPlugin,
} from 'plitejs';
import {
  createEditor as createPlateEditor,
  definePlugin as defineProductPlugin,
} from 'platejs';

${rawDeclarations}
${plateDeclarations}

const rawEditor = createRawEditor({ ${rawOption}: [
  ${rawNames}
] as const });
const plateEditor = createPlateEditor({ plugins: [
  ${plateNames}
] as const });
const rawValue: 63 = rawEditor.${portalMethod}(Raw63).api.value63();
const plateValue: number = plateEditor.${portalMethod}(Plate63).api.final63();
void rawValue;
void plateValue;
`;

const parseDiagnostics = (output) => {
  const read = (label, pattern, multiplier = 1) => {
    const match = output.match(pattern);
    if (!match) {
      throw new Error(`TypeScript diagnostics omitted ${label}.\n${output}`);
    }
    return Number(match[1].replaceAll(',', '')) * multiplier;
  };
  return {
    checkMs: read('check time', /^Check time:\s+([\d.]+)s$/mu, 1000),
    instantiations: read('instantiations', /^Instantiations:\s+([\d,]+)$/mu),
    memoryBytes: read('memory', /^Memory used:\s+([\d,]+)K$/mu, 1024),
    totalMs: read('total time', /^Total time:\s+([\d.]+)s$/mu, 1000),
    types: read('types', /^Types:\s+([\d,]+)$/mu),
  };
};

const median = (values) => [...values].sort((a, b) => a - b)[1];

rmSync(outputDirectory, { force: true, recursive: true });
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(resolve(outputDirectory, 'runtime.ts'), runtimeSource);
writeFileSync(resolve(outputDirectory, 'types.ts'), typeSource);
writeFileSync(
  resolve(outputDirectory, 'tsconfig.json'),
  `${JSON.stringify(
    {
      compilerOptions: { incremental: false, noEmit: true },
      extends: '../../tooling/config/tsconfig.type-tests.json',
      include: ['./types.ts'],
    },
    null,
    2
  )}\n`
);

const runtime = JSON.parse(
  run(resolve(root, 'node_modules/.bin/bun'), [
    '--preload',
    './config/plite-source-aliases.ts',
    resolve(outputDirectory, 'runtime.ts'),
  ])
);
const typeRuns = Array.from({ length: 3 }, () =>
  parseDiagnostics(
    run(resolve(root, 'node_modules/.bin/tsc'), [
      '--extendedDiagnostics',
      '--pretty',
      'false',
      '--project',
      resolve(outputDirectory, 'tsconfig.json'),
    ])
  )
);
const types = Object.fromEntries(
  Object.keys(typeRuns[0]).map((key) => [
    key,
    median(typeRuns.map((row) => row[key])),
  ])
);
const result = {
  benchmark: 'shared-plugin-identity',
  generatedAt: new Date().toISOString(),
  mode,
  runtime: {
    cohorts,
    rows: runtime.rows,
    samples: runtimeSamples,
    warmups: runtimeWarmups,
  },
  types: {
    descriptors: { plate: 64, raw: 64 },
    metrics: types,
    runs: typeRuns,
  },
  version: 1,
  vocabulary: { portalMethod, rawFactory, rawOption },
};

if (mode === 'candidate') {
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));
  const runtimeRatios = result.runtime.rows.map((row, index) => ({
    cohort: row.cohort,
    plate: row.plate.p50 / baseline.runtime.rows[index].plate.p50,
    raw: row.raw.p50 / baseline.runtime.rows[index].raw.p50,
  }));
  const typeRatios = {
    checkMs: result.types.metrics.checkMs / baseline.types.metrics.checkMs,
    instantiations:
      result.types.metrics.instantiations /
      baseline.types.metrics.instantiations,
    memoryBytes:
      result.types.metrics.memoryBytes / baseline.types.metrics.memoryBytes,
  };
  const failures = [
    ...runtimeRatios.flatMap((row) =>
      ['plate', 'raw'].flatMap((lane) =>
        row[lane] > 1.25
          ? [
              `${lane} ${row.cohort} p50 ratio ${row[lane].toFixed(
                3
              )} exceeds 1.25`,
            ]
          : []
      )
    ),
    ...(typeRatios.instantiations > 1.25
      ? [
          `type instantiation ratio ${typeRatios.instantiations.toFixed(
            3
          )} exceeds 1.25`,
        ]
      : []),
    ...(typeRatios.memoryBytes > 1.25
      ? [`type memory ratio ${typeRatios.memoryBytes.toFixed(3)} exceeds 1.25`]
      : []),
    ...(typeRatios.checkMs > 1.5
      ? [`type check ratio ${typeRatios.checkMs.toFixed(3)} exceeds 1.5`]
      : []),
  ];

  Object.assign(result, {
    budgets: {
      runtimeP50RatioInclusive: 1.25,
      typeCheckRatioInclusive: 1.5,
      typeInstantiationRatioInclusive: 1.25,
      typeMemoryRatioInclusive: 1.25,
    },
    failures,
    passed: failures.length === 0,
    ratios: { runtime: runtimeRatios, types: typeRatios },
  });
}

mkdirSync(artifactDirectory, { recursive: true });
const artifactPath = mode === 'baseline' ? baselinePath : resultPath;
writeFileSync(artifactPath, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(
  `${mode}: ${artifactPath}\n${
    mode === 'candidate'
      ? `passed=${result.passed} failures=${result.failures.length}`
      : 'baseline frozen'
  }\n`
);

if (mode === 'candidate' && !result.passed) process.exitCode = 1;
