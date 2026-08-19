import type { EditorExtensionReference } from '../../../packages/plite/src/index';
import {
  createEditor,
  defineExtension,
} from '../../../packages/plite/src/index';

import { writeBenchmarkArtifact } from './benchmark-artifact';

const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);
const strict = process.env.PLITE_READ_VIEW_LIFECYCLE_STRICT === '1';
const sampleCount = 30;
const readsPerSample = 5000;

const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)]!;

const summarize = (values: readonly number[]) => {
  const sorted = [...values].sort((left, right) => left - right);

  return {
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
};

const runCohort = (extensionCount: number) => {
  let factoryCalls = 0;
  const extensions: EditorExtensionReference[] = [];

  for (let index = 0; index < extensionCount; index++) {
    extensions.push(
      defineExtension(`read-view-${extensionCount}-${index}`, {
        read: ({ state }) => {
          factoryCalls++;

          return { childCount: () => state.children().length };
        },
      })
    );
  }

  const editor = createEditor({ extensions });
  const finalGroup = `read-view-${extensionCount}-${extensionCount - 1}`;
  const readFinalGroup = () =>
    editor.read((state) =>
      (
        (state as unknown as Record<string, unknown>)[finalGroup] as {
          childCount(): number;
        }
      ).childCount()
    );

  readFinalGroup();
  const initialFactoryCalls = factoryCalls;
  const samples: number[] = [];

  for (let sample = 0; sample < sampleCount; sample++) {
    const startedAt = performance.now();

    for (let read = 0; read < readsPerSample; read++) readFinalGroup();
    samples.push(performance.now() - startedAt);
  }

  const warmFactoryCalls = factoryCalls - initialFactoryCalls;

  for (let revision = 0; revision < 100; revision++) {
    editor.update((tx) => {
      const value = tx.value();

      tx.value.replace({
        ...value,
        meta: { ...value.meta, 'benchmark:read-view-revision': revision },
      });
    });
    readFinalGroup();
  }

  return {
    extensionCount,
    initialFactoryCalls,
    postCommitFactoryCalls: factoryCalls,
    readsPerSample,
    sampleCount,
    timingMs: summarize(samples),
    warmFactoryCalls,
  };
};

const rows = [runCohort(1), runCohort(100)];
const widthRatio = rows[1]!.timingMs.p95 / rows[0]!.timingMs.p95;
const structuralFailures = rows.filter(
  (row) =>
    row.initialFactoryCalls !== row.extensionCount ||
    row.postCommitFactoryCalls !== row.initialFactoryCalls ||
    row.warmFactoryCalls !== 0
);

if (strict && (widthRatio > 2 || structuralFailures.length > 0)) {
  throw new Error(
    `Read-view lifecycle failed: width ratio=${widthRatio}, structural failures=${structuralFailures.length}.`
  );
}

const result = {
  benchmark: 'plite-read-view-lifecycle',
  degradationContract:
    'Warm reads and document commits perform zero read-factory work; 100 installed read groups stay within 2x of one group.',
  generatedAt: new Date().toISOString(),
  repeatedUnit: 'one extension-owned callable read namespace',
  rows,
  structuralFailures: structuralFailures.length,
  version: 1,
  widthRatio,
};
const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_read_view_lifecycle_width_ratio=${widthRatio}\n`
);
process.stdout.write(
  `METRIC plite_read_view_lifecycle_warm_factory_calls=${rows.reduce(
    (total, row) => total + row.warmFactoryCalls,
    0
  )}\n`
);
if (outputArgument) {
  writeBenchmarkArtifact(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}
