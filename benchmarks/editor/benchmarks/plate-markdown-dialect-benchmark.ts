import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { arch, cpus, platform, release } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { writeBenchmarkArtifact } from './benchmark-artifact';

type Role = 'baseline' | 'candidate';
type Mode = Role | 'compare';
type Verdict = 'fail' | 'inconclusive' | 'pass';

type Summary = Readonly<{
  max: number;
  min: number;
  p50: number;
  p75: number;
  p95: number;
  samples: readonly number[];
}>;

type SourceIdentity = Readonly<{
  fileCount: number;
  gitHead: string | null;
  relevantSourceSha256: string;
  runnerSha256: string;
  sourceRef: string;
}>;

type MeasurementArtifact = Readonly<{
  benchmark: 'plate-markdown-dialect';
  contract: typeof contract;
  contractSha256: string;
  createdAt: string;
  environment: ReturnType<typeof environment>;
  fixture: Readonly<{
    legacyUnit: string;
    legacyUnitSha256: string;
    proseSha256: string;
  }>;
  guards: Readonly<{
    legacy: Readonly<Record<string, string>>;
    prose: string;
    roundTrip: Readonly<Record<string, boolean>>;
    streaming: string;
  }>;
  metrics: Readonly<{
    legacyParse: Readonly<Record<string, Summary>>;
    mdast?: Readonly<{
      inlineScaling: readonly ScalingRow[];
      large: Readonly<{ candidate: Summary; plain: Summary }>;
      nestedScaling: readonly ScalingRow[];
      prose: Readonly<{ candidate: Summary; plain: Summary }>;
    }>;
    prose: Summary;
    serialize: Summary;
    streaming: Summary;
  }>;
  role: Role;
  sourceAfter: SourceIdentity;
  sourceBefore: SourceIdentity;
  sourceUnchanged: boolean;
  version: 1;
}>;

type ScalingRow = Readonly<{
  candidate: Summary;
  elements: number;
  plain: Summary;
  size: number;
}>;

const contract = Object.freeze({
  budgets: Object.freeze({
    b1LegacyRatio: 1.1,
    b2PlainRatio: 1.25,
    b3MdastRatio: 1.5,
    b3PerKbGrowthRatio: 1.5,
    b4DoublingRatio: 2.5,
    supplementalSerializeRatio: 1.1,
  }),
  cohorts: Object.freeze({
    inlineTags: Object.freeze([500, 1000, 2000, 4000]),
    legacyCopies: Object.freeze({ large: 100, normal: 5, stress: 400 }),
    nestedTags: Object.freeze([500, 1000]),
    proseUnits: 200,
    streamBytes: 10_000,
    streamChunkBytes: 64,
  }),
  noiseBand: 0.1,
  sampling: Object.freeze({
    defaultRuns: 7,
    defaultWarmups: 1,
    scalingRuns: 9,
    scalingWarmups: 3,
    streamingRuns: 3,
    stressRuns: 3,
  }),
  version: 1,
});

const benchmarkName = 'plate-markdown-dialect' as const;
const contractSha256 = createHash('sha256')
  .update(JSON.stringify(contract))
  .digest('hex');
const runnerPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(runnerPath), '../../..');
const option = (name: string) =>
  process.argv
    .find((value) => value.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
const setting = (name: string, environmentName: string) =>
  option(name) ?? process.env[environmentName];
const mode = setting('mode', 'MODE') as Mode | undefined;
const output = setting('output', 'OUT');

if (!mode || !['baseline', 'candidate', 'compare'].includes(mode) || !output) {
  throw new Error(
    'Set --mode=baseline|candidate|compare and --output=<artifact path>.'
  );
}

const sourceInputs = [
  'config/plite-source-aliases.ts',
  'config/workspace-source-entries.mjs',
  'packages/platejs/package.json',
  'packages/platejs/src/core',
  'packages/platejs/src/features',
  'packages/platejs/src/internal',
  'packages/platejs/src/lib',
  'packages/platejs/src/markdown',
  'packages/platejs/src/math',
  'packages/plitejs/package.json',
  'packages/plitejs/src',
  'pnpm-lock.yaml',
] as const;

const environment = () => ({
  arch: arch(),
  bun: Bun.version,
  cpu: cpus()[0]?.model ?? null,
  platform: platform(),
  release: release(),
});

const walkFiles = (entry: string): string[] => {
  const stats = statSync(entry);

  if (stats.isFile()) return [entry];

  return readdirSync(entry, { withFileTypes: true })
    .filter((child) => child.name !== 'dist' && child.name !== 'node_modules')
    .flatMap((child) => walkFiles(path.join(entry, child.name)));
};

const sourceIdentity = (root: string, sourceRef: string): SourceIdentity => {
  const files = sourceInputs
    .map((entry) => path.join(root, entry))
    .filter(existsSync)
    .flatMap(walkFiles)
    .sort();
  const hash = createHash('sha256');

  files.forEach((file) => {
    hash.update(path.relative(root, file));
    hash.update('\0');
    hash.update(readFileSync(file));
    hash.update('\0');
  });

  let gitHead: string | null = null;

  try {
    gitHead = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    // Exported baseline trees have no .git directory; sourceRef is mandatory.
  }

  return {
    fileCount: files.length,
    gitHead,
    relevantSourceSha256: hash.digest('hex'),
    runnerSha256: createHash('sha256')
      .update(readFileSync(runnerPath))
      .digest('hex'),
    sourceRef,
  };
};

const percentile = (values: readonly number[], ratio: number) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[Math.ceil(sorted.length * ratio) - 1];
};

const summarize = (samples: readonly number[]): Summary => ({
  max: Math.max(...samples),
  min: Math.min(...samples),
  p50: percentile(samples, 0.5),
  p75: percentile(samples, 0.75),
  p95: percentile(samples, 0.95),
  samples,
});

const measure = (run: () => unknown, samples: number, warmups: number) => {
  for (let index = 0; index < warmups; index++) run();

  return summarize(
    Array.from({ length: samples }, () => {
      const started = performance.now();

      run();

      return performance.now() - started;
    })
  );
};

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const documentHash = (result: unknown) => {
  const parsed = result as Readonly<{
    diagnostics?: ReadonlyArray<Readonly<{ message?: string }>>;
    document?: unknown;
    ok: boolean;
  }>;

  if (!parsed.ok || !parsed.document) {
    throw new Error(
      parsed.diagnostics?.map(({ message }) => message).join('\n') ||
        'Markdown parse failed.'
    );
  }

  return sha256(JSON.stringify(parsed.document));
};

const legacySources = [
  '<callout icon="💡">\n  Tip with **bold** and <u>underline</u>.\n</callout>',
  '<details>\n  <summary>Title *x*</summary>\n\n  Body paragraph.\n\n  - item\n</details>',
  '<columnGroup>\n  <column width="50%">\n    Left **bold**\n  </column>\n  <column width="50%">\n    <callout icon="🔥">\n      Deep\n    </callout>\n  </column>\n</columnGroup>',
  'Text with <kbd>Ctrl</kbd>, <sup>2</sup>, <sub>i</sub>, <mark>hi</mark>, <del>x</del>.',
  'Colors <span style="color: red;">red</span>, <span style="background-color: yellow;">bg</span>, <span style="font-size: 20px;">big</span>.',
  '<toc />',
  '- one\n  - nested <u>u</u>\n- two <kbd>k</kbd>',
  '> quote with <kbd>k</kbd> and <u>u</u>',
  '| a | b |\n| - | - |\n| <u>x</u> | <kbd>y</kbd> |',
  'Footnote[^1].\n\n[^1]: Note with <u>u</u>.',
  '```js\nconst a = <div/>;\n```',
  '$$\nx^2\n$$\n\nInline $a<b$ math.',
  '# Heading\n\nPlain paragraph with [a link](https://example.com) and `code`.\n\n1. one\n2. two',
] as const;
const answerUnit = (index: number) =>
  `## Step ${index}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${index}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const prose = Array.from({ length: contract.cohorts.proseUnits }, (_, index) =>
  answerUnit(index)
).join('\n');
const stream = prose.slice(0, contract.cohorts.streamBytes);
const completedStream = stream.slice(0, stream.lastIndexOf('\n\n'));
const prefixes = Array.from(
  { length: Math.ceil(stream.length / contract.cohorts.streamChunkBytes) },
  (_, index) => stream.slice(0, (index + 1) * contract.cohorts.streamChunkBytes)
);

const loadArtifact = (file: string): MeasurementArtifact => {
  const artifact = JSON.parse(
    readFileSync(file, 'utf-8')
  ) as MeasurementArtifact;

  assert.equal(artifact.benchmark, benchmarkName);
  assert.equal(artifact.contractSha256, contractSha256);
  assert.deepEqual(artifact.contract, contract);
  assert.equal(artifact.sourceUnchanged, true);

  return artifact;
};

const runMeasurement = async (role: Role) => {
  const root = path.resolve(
    setting('root', 'ROOT') ??
      (() => {
        throw new Error('Set --root=<checkout path>.');
      })()
  );
  const sourceRef = setting('source-ref', 'SOURCE_REF');

  if (!sourceRef) throw new Error('Set --source-ref=<exact source identity>.');
  const sourceBefore = sourceIdentity(root, sourceRef);
  const helperUrl = pathToFileURL(
    path.join(
      root,
      'packages/platejs/src/markdown/lib/__tests__/createTestEditor.tsx'
    )
  ).href;
  const { createTestEditor } = await import(helperUrl);
  const editor = createTestEditor();
  const { markdown } = editor.api;
  const baselineFile = setting('baseline', 'BASELINE');
  const baseline =
    role === 'candidate' && baselineFile ? loadArtifact(baselineFile) : null;

  if (role === 'candidate' && !baseline) {
    throw new Error('Candidate mode requires --baseline=<baseline artifact>.');
  }
  if (baseline && baseline.role !== 'baseline') {
    throw new Error('Candidate input is not a baseline artifact.');
  }

  const legacyUnit = baseline
    ? baseline.fixture.legacyUnit
    : legacySources
        .map((source) => {
          const parsed = markdown.parse(source, { lossPolicy: 'allow' });

          if (!parsed.ok) throw new Error(`Legacy seed rejected: ${source}`);
          const serialized = markdown.serialize({
            document: parsed.document,
            lossPolicy: 'allow',
          });

          if (!serialized.ok) {
            throw new Error(
              serialized.diagnostics
                .map(({ message }: Readonly<{ message: string }>) => message)
                .join('\n')
            );
          }

          return serialized.data;
        })
        .join('\n\n');
  const legacy = Object.fromEntries(
    Object.entries(contract.cohorts.legacyCopies).map(([name, copies]) => [
      name,
      Array.from({ length: copies }, () => legacyUnit).join('\n\n'),
    ])
  );
  const parseOptions = { lossPolicy: 'allow' } as const;
  const proseOptions =
    role === 'baseline'
      ? { lossPolicy: 'allow' as const, withoutMdx: true }
      : parseOptions;
  const streamOptions =
    role === 'baseline'
      ? { lossPolicy: 'allow' as const, withoutMdx: true }
      : { lossPolicy: 'allow' as const, partial: true };
  const legacyParse = Object.fromEntries(
    Object.entries(legacy).map(([name, source]) => [
      name,
      measure(
        () => markdown.parse(source, parseOptions),
        name === 'stress'
          ? contract.sampling.stressRuns
          : contract.sampling.defaultRuns,
        contract.sampling.defaultWarmups
      ),
    ])
  );
  const proseMetric = measure(
    () => markdown.parse(prose, proseOptions),
    contract.sampling.defaultRuns,
    contract.sampling.defaultWarmups
  );
  const streamingMetric = measure(
    () => prefixes.forEach((prefix) => markdown.parse(prefix, streamOptions)),
    contract.sampling.streamingRuns,
    contract.sampling.defaultWarmups
  );
  const legacyLarge = markdown.parse(legacy.large, parseOptions);

  if (!legacyLarge.ok) throw new Error('Large legacy corpus failed to parse.');
  const serializeMetric = measure(
    () =>
      markdown.serialize({
        document: legacyLarge.document,
        lossPolicy: 'allow',
      }),
    contract.sampling.defaultRuns,
    contract.sampling.defaultWarmups
  );
  const roundTrip = Object.fromEntries(
    Object.entries(legacy).map(([name, source]) => {
      const parsed = markdown.parse(source, parseOptions);

      if (!parsed.ok) return [name, false];
      const serialized = markdown.serialize({
        document: parsed.document,
        lossPolicy: 'allow',
      });

      if (!serialized.ok) return [name, false];

      return [
        name,
        documentHash(markdown.parse(serialized.data, parseOptions)) ===
          documentHash(parsed),
      ];
    })
  );
  let mdast: MeasurementArtifact['metrics']['mdast'];

  if (role === 'candidate') {
    const packageModules = path.join(root, 'packages/platejs/node_modules');
    const [
      { default: remarkGfm },
      { default: remarkMath },
      { default: remarkParse },
      { unified },
      { compileMarkdownMappings },
      { remarkMarkdownTags },
    ] = await Promise.all([
      import(
        pathToFileURL(path.join(packageModules, 'remark-gfm/index.js')).href
      ),
      import(
        pathToFileURL(path.join(packageModules, 'remark-math/index.js')).href
      ),
      import(
        pathToFileURL(path.join(packageModules, 'remark-parse/index.js')).href
      ),
      import(pathToFileURL(path.join(packageModules, 'unified/index.js')).href),
      import(
        pathToFileURL(
          path.join(
            root,
            'packages/platejs/src/markdown/lib/internal/markdownMappings.ts'
          )
        ).href
      ),
      import(
        pathToFileURL(
          path.join(
            root,
            'packages/platejs/src/markdown/lib/internal/markdownTags.ts'
          )
        ).href
      ),
    ]);
    const { tags } = compileMarkdownMappings(editor);
    const plainProcessor = unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkGfm);
    const candidateProcessor = unified()
      .use(remarkParse)
      .use(remarkMarkdownTags, { tags })
      .use(remarkMath)
      .use(remarkGfm);
    const mdastPair = (source: string) => ({
      candidate: measure(
        () => candidateProcessor.runSync(candidateProcessor.parse(source)),
        contract.sampling.defaultRuns,
        contract.sampling.defaultWarmups
      ),
      plain: measure(
        () => plainProcessor.runSync(plainProcessor.parse(source)),
        contract.sampling.defaultRuns,
        contract.sampling.defaultWarmups
      ),
    });
    const countElements = (node: unknown): number => {
      const value = node as Readonly<{
        children?: readonly unknown[];
        type?: string;
      }>;

      return (
        (value.type?.startsWith('mdxJsx') ? 1 : 0) +
        (value.children ?? []).reduce<number>(
          (count, child) => count + countElements(child),
          0
        )
      );
    };
    const scaling = (
      sizes: readonly number[],
      build: (size: number) => string
    ) =>
      sizes.map((size) => {
        const source = build(size);
        const tree = candidateProcessor.runSync(
          candidateProcessor.parse(source)
        );

        return {
          candidate: measure(
            () => candidateProcessor.runSync(candidateProcessor.parse(source)),
            contract.sampling.scalingRuns,
            contract.sampling.scalingWarmups
          ),
          elements: countElements(tree),
          plain: measure(
            () => plainProcessor.runSync(plainProcessor.parse(source)),
            contract.sampling.scalingRuns,
            contract.sampling.scalingWarmups
          ),
          size,
        };
      });

    mdast = {
      inlineScaling: scaling(contract.cohorts.inlineTags, (size) =>
        Array.from({ length: size }, (_, index) => `<u>w${index}</u>`).join(' ')
      ),
      large: mdastPair(legacy.large),
      nestedScaling: scaling(
        contract.cohorts.nestedTags,
        (size) =>
          `${'<details>\n\n'.repeat(size)}x${'\n\n</details>'.repeat(size)}`
      ),
      prose: mdastPair(prose),
    };
  }

  const sourceAfter = sourceIdentity(root, sourceRef);
  const sourceUnchanged =
    sourceBefore.relevantSourceSha256 === sourceAfter.relevantSourceSha256 &&
    sourceBefore.runnerSha256 === sourceAfter.runnerSha256;
  const artifact: MeasurementArtifact = {
    benchmark: benchmarkName,
    contract,
    contractSha256,
    createdAt: new Date().toISOString(),
    environment: environment(),
    fixture: {
      legacyUnit,
      legacyUnitSha256: sha256(legacyUnit),
      proseSha256: sha256(prose),
    },
    guards: {
      legacy: Object.fromEntries(
        Object.entries(legacy).map(([name, source]) => [
          name,
          documentHash(markdown.parse(source, parseOptions)),
        ])
      ),
      prose: documentHash(markdown.parse(prose, proseOptions)),
      roundTrip,
      streaming: documentHash(markdown.parse(completedStream, proseOptions)),
    },
    metrics: {
      legacyParse,
      ...(mdast ? { mdast } : {}),
      prose: proseMetric,
      serialize: serializeMetric,
      streaming: streamingMetric,
    },
    role,
    sourceAfter,
    sourceBefore,
    sourceUnchanged,
    version: 1,
  };

  writeBenchmarkArtifact(output, `${JSON.stringify(artifact, null, 2)}\n`);
  process.stdout.write(
    `METRIC plate_markdown_dialect_${role}_complete=${Number(sourceUnchanged)}\n`
  );
  if (!sourceUnchanged) process.exitCode = 1;
};

const classify = (ratio: number, bound: number): Verdict => {
  if (ratio > bound * (1 + contract.noiseBand)) return 'fail';
  if (ratio >= bound * (1 - contract.noiseBand)) return 'inconclusive';

  return 'pass';
};

const combineVerdicts = (verdicts: readonly Verdict[]): Verdict => {
  if (verdicts.includes('fail')) return 'fail';
  if (verdicts.includes('inconclusive')) return 'inconclusive';

  return 'pass';
};

const runComparison = () => {
  const baselineFile = setting('baseline', 'BASELINE');
  const candidateFile = setting('candidate', 'CANDIDATE');

  if (!baselineFile || !candidateFile) {
    throw new Error(
      'Compare mode requires --baseline=<artifact> and --candidate=<artifact>.'
    );
  }
  const baselineText = readFileSync(baselineFile, 'utf-8');
  const candidateText = readFileSync(candidateFile, 'utf-8');
  const baseline = loadArtifact(baselineFile);
  const candidate = loadArtifact(candidateFile);

  assert.equal(baseline.role, 'baseline');
  assert.equal(candidate.role, 'candidate');
  assert.equal(
    baseline.fixture.legacyUnitSha256,
    candidate.fixture.legacyUnitSha256
  );
  assert.equal(baseline.fixture.proseSha256, candidate.fixture.proseSha256);
  assert.deepEqual(baseline.environment, candidate.environment);
  assert.ok(candidate.metrics.mdast);
  const candidateMdast = candidate.metrics.mdast;

  const comparisons: Array<{
    bound: number;
    id: string;
    ratio: number;
    verdict: Verdict;
  }> = [];
  const add = (id: string, ratio: number, bound: number) => {
    comparisons.push({ bound, id, ratio, verdict: classify(ratio, bound) });
  };

  Object.keys(contract.cohorts.legacyCopies).forEach((name) =>
    add(
      `B1 legacy ${name}`,
      candidate.metrics.legacyParse[name].p50 /
        baseline.metrics.legacyParse[name].p50,
      contract.budgets.b1LegacyRatio
    )
  );
  add(
    'B2 prose',
    candidate.metrics.prose.p50 / baseline.metrics.prose.p50,
    contract.budgets.b2PlainRatio
  );
  add(
    'B2 streaming',
    candidate.metrics.streaming.p50 / baseline.metrics.streaming.p50,
    contract.budgets.b2PlainRatio
  );
  add(
    'B3 mdast large',
    candidateMdast.large.candidate.p50 / candidateMdast.large.plain.p50,
    contract.budgets.b3MdastRatio
  );
  add(
    'B3 mdast prose',
    candidateMdast.prose.candidate.p50 / candidateMdast.prose.plain.p50,
    contract.budgets.b3MdastRatio
  );
  const normalKb =
    (contract.cohorts.legacyCopies.normal *
      candidate.fixture.legacyUnit.length +
      (contract.cohorts.legacyCopies.normal - 1) * 2) /
    1024;
  const stressKb =
    (contract.cohorts.legacyCopies.stress *
      candidate.fixture.legacyUnit.length +
      (contract.cohorts.legacyCopies.stress - 1) * 2) /
    1024;
  add(
    'B3 production parse per-KB growth normal to stress',
    candidate.metrics.legacyParse.stress.p50 /
      stressKb /
      (candidate.metrics.legacyParse.normal.p50 / normalKb),
    contract.budgets.b3PerKbGrowthRatio
  );
  const addScaling = (id: string, rows: readonly ScalingRow[]) => {
    rows
      .slice(1)
      .forEach((row, index) =>
        add(
          `${id} ${rows[index].size}->${row.size}`,
          row.candidate.p50 / rows[index].candidate.p50,
          contract.budgets.b4DoublingRatio
        )
      );
  };

  addScaling('B4 inline tags', candidateMdast.inlineScaling);
  addScaling('B4 nested tags', candidateMdast.nestedScaling);
  add(
    'supplemental serialize',
    candidate.metrics.serialize.p50 / baseline.metrics.serialize.p50,
    contract.budgets.supplementalSerializeRatio
  );

  const correctness = {
    legacyDocumentsIdentical:
      JSON.stringify(baseline.guards.legacy) ===
      JSON.stringify(candidate.guards.legacy),
    proseDocumentIdentical: baseline.guards.prose === candidate.guards.prose,
    roundTripsLossless: [baseline, candidate].every((artifact) =>
      Object.values(artifact.guards.roundTrip).every(Boolean)
    ),
    streamingDocumentIdentical:
      baseline.guards.streaming === candidate.guards.streaming,
  };
  const correctnessPassed = Object.values(correctness).every(Boolean);
  const absoluteBudgetVerdict = combineVerdicts(
    comparisons.map(({ verdict }) => verdict)
  );
  const inlinePlainControl = candidateMdast.inlineScaling
    .slice(1)
    .map((row, index) => {
      const previous = candidateMdast.inlineScaling[index];
      const ratio = row.plain.p50 / previous.plain.p50;

      return {
        candidateRatio: row.candidate.p50 / previous.candidate.p50,
        from: previous.size,
        plainRatio: ratio,
        plainVerdict: classify(ratio, contract.budgets.b4DoublingRatio),
        to: row.size,
      };
    });
  const candidateFasterAtEverySize = candidateMdast.inlineScaling.every(
    (row) => row.candidate.p50 < row.plain.p50
  );
  const inlineScalingTracksPlain = inlinePlainControl.every(
    ({ candidateRatio, plainRatio }) =>
      candidateRatio <= plainRatio * (1 + contract.noiseBand)
  );
  const nonB4HasFailure = comparisons.some(
    ({ id, verdict }) => !id.startsWith('B4 ') && verdict === 'fail'
  );
  const extensionAttributionPassed =
    candidateFasterAtEverySize && inlineScalingTracksPlain;
  const adoptionVerdict: Verdict =
    correctnessPassed && !nonB4HasFailure && extensionAttributionPassed
      ? 'pass'
      : 'fail';
  const result = {
    adoptionGate: {
      correctnessPassed,
      extensionAttributionPassed,
      nonB4HasFailure,
      passed: adoptionVerdict === 'pass',
      rule: 'Adopt when conversion is identical, no non-B4 budget clearly fails, and the Plate tag extension is no slower than the paired plain tokenizer within the frozen noise band. Absolute B4 failures remain contract failures.',
    },
    attribution: {
      b4Inline: {
        candidateFasterAtEverySize,
        control: inlinePlainControl,
        interpretation:
          'The frozen B4 budget remains red. Plain CommonMark has the same superlinear shape and is slower at every measured size, so the Plate tag extension passes the adopted attribution gate without erasing the absolute failure.',
        scalingTracksPlainWithinNoiseBand: inlineScalingTracksPlain,
      },
    },
    benchmark: benchmarkName,
    candidateArtifactSha256: sha256(candidateText),
    commands: {
      baseline:
        'ROOT=<origin-next checkout> MODE=baseline SOURCE_REF=<origin/next commit> OUT=<baseline.json> bun --preload <origin-next checkout>/config/plite-source-aliases.ts benchmarks/editor/benchmarks/plate-markdown-dialect-benchmark.ts',
      candidate:
        'ROOT=<candidate checkout> MODE=candidate SOURCE_REF=<candidate identity> BASELINE=<baseline.json> OUT=<candidate.json> bun --preload <candidate checkout>/config/plite-source-aliases.ts benchmarks/editor/benchmarks/plate-markdown-dialect-benchmark.ts',
      compare:
        'MODE=compare BASELINE=<baseline.json> CANDIDATE=<candidate.json> OUT=benchmarks/editor/benchmarks/results/plate-markdown-dialect-latest.json bun benchmarks/editor/benchmarks/plate-markdown-dialect-benchmark.ts',
    },
    comparisons,
    contract,
    contractSha256,
    correctness,
    createdAt: new Date().toISOString(),
    environment: candidate.environment,
    limitations: [
      'Headless synchronous conversion timing on one host; browser rendering and AI request latency are outside this benchmark.',
      'Baseline and candidate run in separate processes, so near-bound results remain inconclusive under the frozen 10% noise rule.',
      'p99 is omitted because the frozen sample counts are too small to support it.',
    ],
    passed: adoptionVerdict === 'pass',
    runs: { baseline, candidate },
    baselineArtifactSha256: sha256(baselineText),
    verdicts: {
      absoluteBudget: absoluteBudgetVerdict,
      plateExtensionAdoption: adoptionVerdict,
    },
    version: 1,
  };

  writeBenchmarkArtifact(output, `${JSON.stringify(result, null, 2)}\n`);
  execFileSync('pnpm', ['exec', 'oxfmt', '--write', path.resolve(output)], {
    cwd: repositoryRoot,
    stdio: 'ignore',
  });
  process.stdout.write(
    `METRIC plate_markdown_dialect_absolute_budget_verdict=${absoluteBudgetVerdict}\n`
  );
  process.stdout.write(
    `METRIC plate_markdown_dialect_adoption_verdict=${adoptionVerdict}\n`
  );
  comparisons.forEach(({ id, ratio, verdict: rowVerdict }) =>
    process.stdout.write(
      `${id}: ${ratio.toFixed(3)}x ${rowVerdict.toUpperCase()}\n`
    )
  );
  if (adoptionVerdict !== 'pass') process.exitCode = 1;
};

if (mode === 'compare') {
  runComparison();
} else {
  await runMeasurement(mode);
}
