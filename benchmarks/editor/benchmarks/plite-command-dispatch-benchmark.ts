import { performance } from 'node:perf_hooks';

import {
  createEditor,
  defineCommand,
  defineExtension,
  type Value,
} from '../../../packages/plite/src/index';
import { dispatchCommand } from '../../../packages/plite/src/internal/index';
import { writeBenchmarkArtifact } from './benchmark-artifact';

const HANDLER_DEPTHS = [0, 1, 8, 32] as const;
const DOCUMENT_BLOCKS = [100, 20_000] as const;
const LANE_KINDS = ['simple', 'prefix'] as const;
const CONTINUATION_PROOF_DISPATCHES = 3;
const DEFAULT_OUTPUT = 'tmp/plite-command-dispatch-benchmark.json';

type LaneKind = (typeof LANE_KINDS)[number];

type InvocationTracker = {
  continuationIdentities: Set<unknown>;
  defaultVisits: number;
  handlerVisits: number;
  simpleNextLeaks: number;
  trace: string[] | null;
};

const positiveIntegerOption = (name: string, fallback: number) => {
  const argument = process.argv.find((candidate) =>
    candidate.startsWith(`--${name}=`)
  );
  const value = argument ? Number(argument.slice(name.length + 3)) : fallback;

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`--${name} must be a positive integer.`);
  }

  return value;
};

const outputPath =
  process.argv
    .find((candidate) => candidate.startsWith('--output='))
    ?.slice('--output='.length) ?? DEFAULT_OUTPUT;
const samples = positiveIntegerOption('samples', 21);
const simpleBatch = positiveIntegerOption('simple-batch', 1000);
const prefixSmallBatch = positiveIntegerOption('prefix-small-batch', 10);
const prefixLargeBatch = positiveIntegerOption('prefix-large-batch', 1);
const referenceBatch = positiveIntegerOption('reference-batch', 5000);
const strict = process.env.PLITE_COMMAND_DISPATCH_STRICT === '1';

const round = (value: number) => Number(value.toFixed(3));

const percentile = (sorted: readonly number[], ratio: number) =>
  sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)]!;

const summarize = (values: readonly number[]) => {
  const sorted = [...values].sort((left, right) => left - right);

  return {
    max: round(sorted.at(-1) ?? 0),
    min: round(sorted[0] ?? 0),
    p50: round(percentile(sorted, 0.5)),
    p95: round(percentile(sorted, 0.95)),
    samplesUs: values.map(round),
  };
};

const createDocument = (blocks: number): Value =>
  Array.from({ length: blocks }, (_value, index) => ({
    children: [{ text: `block-${index}` }],
    type: 'paragraph',
  }));

const createTracker = (trace = false): InvocationTracker => ({
  continuationIdentities: new Set(),
  defaultVisits: 0,
  handlerVisits: 0,
  simpleNextLeaks: 0,
  trace: trace ? [] : null,
});

const createActualLane = (kind: LaneKind, blocks: number, depth: number) => {
  let tracker: InvocationTracker | null = null;
  const command = defineCommand(
    `benchmark.command-dispatch.${kind}.${blocks}.${depth}`,
    {
      build: ({ state }) => {
        if (tracker) {
          tracker.defaultVisits += 1;
          tracker.trace?.push('default');
        }

        return kind === 'simple' ? false : state.transaction(() => {});
      },
    }
  );
  const extension = defineExtension(
    `benchmark.command-dispatch.${kind}.${blocks}.${depth}.extension`,
    {
      commands: ({ around, handle }) =>
        Array.from({ length: depth }, (_value, index) =>
          kind === 'simple'
            ? handle(command, (context) => {
                if (tracker) {
                  tracker.handlerVisits += 1;
                  tracker.trace?.push(`handle:${index}`);
                  if ('next' in context) tracker.simpleNextLeaks += 1;
                }

                return false;
              })
            : around(command, ({ next, state }) => {
                if (tracker) {
                  tracker.handlerVisits += 1;
                  tracker.trace?.push(`prefix:${index}`);
                  tracker.continuationIdentities.add(next);
                }

                return next.after(
                  state.transaction((tx) => {
                    tx.tags.add(`benchmark-prefix-${index}`);
                  })
                );
              })
        ),
    }
  );
  const editor = createEditor({
    extensions: depth === 0 ? [] : [extension],
    initialValue: createDocument(blocks),
  });
  let commits = 0;
  const unsubscribe = editor.subscribeCommit(() => {
    commits += 1;
  });

  return {
    commits: () => commits,
    dispose: unsubscribe,
    run: () => dispatchCommand(editor, command),
    track: (nextTracker: InvocationTracker | null) => {
      tracker = nextTracker;
    },
  };
};

const runReference = (
  kind: LaneKind,
  depth: number,
  tracker: InvocationTracker | null = null
): boolean => {
  const runDefault = () => {
    if (tracker) {
      tracker.defaultVisits += 1;
      tracker.trace?.push('default');
    }

    return kind === 'prefix';
  };

  if (kind === 'simple') {
    for (let index = 0; index < depth; index += 1) {
      if (tracker) {
        tracker.handlerVisits += 1;
        tracker.trace?.push(`handle:${index}`);
      }
    }

    return runDefault();
  }

  const dispatch = (index: number): boolean => {
    if (index === depth) return runDefault();

    if (tracker) {
      tracker.handlerVisits += 1;
      tracker.trace?.push(`prefix:${index}`);
    }

    const next = () => dispatch(index + 1);

    tracker?.continuationIdentities.add(next);

    return next();
  };

  return dispatch(0);
};

let benchmarkSink = 0;

const measureBatch = (run: () => boolean, operations: number) => {
  let handled = 0;
  const startedAt = performance.now();

  for (let index = 0; index < operations; index += 1) {
    if (run()) handled += 1;
  }

  const elapsedUs = (performance.now() - startedAt) * 1000;

  benchmarkSink = (benchmarkSink + handled) % 1_000_000_007;

  return elapsedUs / operations;
};

const latencyBudgetUs = (kind: LaneKind, blocks: number, depth: number) => {
  if (kind === 'simple') {
    return {
      p50: 10 + 5 * depth,
      p95: 25 + 8 * depth,
    };
  }

  if (blocks === 100) {
    return {
      p50: 200 + 60 * depth,
      p95: 1500 + 300 * depth,
    };
  }

  return {
    p50: 8000 + 5500 * depth,
    p95: 15_000 + 7000 * depth,
  };
};

const compareTrace = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length &&
  left.every((entry, index) => entry === right[index]);

const measureLane = (kind: LaneKind, blocks: number, depth: number) => {
  globalThis.gc?.();
  globalThis.gc?.();

  const actual = createActualLane(kind, blocks, depth);
  const correctnessFailures: string[] = [];
  const actualTracker = createTracker(true);
  const referenceTracker = createTracker(true);

  actual.track(actualTracker);
  const actualHandled = actual.run();
  actual.track(null);
  const referenceHandled = runReference(kind, depth, referenceTracker);

  if (actualHandled !== referenceHandled) {
    correctnessFailures.push(
      `handled mismatch: actual=${actualHandled} reference=${referenceHandled}`
    );
  }
  if (actualTracker.handlerVisits !== referenceTracker.handlerVisits) {
    correctnessFailures.push(
      `handler visits mismatch: actual=${actualTracker.handlerVisits} reference=${referenceTracker.handlerVisits}`
    );
  }
  if (actualTracker.defaultVisits !== referenceTracker.defaultVisits) {
    correctnessFailures.push(
      `default visits mismatch: actual=${actualTracker.defaultVisits} reference=${referenceTracker.defaultVisits}`
    );
  }
  if (!compareTrace(actualTracker.trace ?? [], referenceTracker.trace ?? [])) {
    correctnessFailures.push(
      `trace mismatch: actual=${JSON.stringify(actualTracker.trace)} reference=${JSON.stringify(referenceTracker.trace)}`
    );
  }

  const continuationTracker = createTracker();

  actual.track(continuationTracker);
  for (let index = 0; index < CONTINUATION_PROOF_DISPATCHES; index += 1) {
    actual.run();
  }
  actual.track(null);

  const expectedContinuationIdentities =
    kind === 'prefix' ? depth * CONTINUATION_PROOF_DISPATCHES : 0;
  const observedContinuationIdentities =
    continuationTracker.continuationIdentities.size;
  const allocationFailures: string[] = [];

  if (observedContinuationIdentities !== expectedContinuationIdentities) {
    allocationFailures.push(
      `continuation identity mismatch: observed=${observedContinuationIdentities} expected=${expectedContinuationIdentities}`
    );
  }
  if (continuationTracker.simpleNextLeaks !== 0) {
    allocationFailures.push(
      `simple handlers observed ${continuationTracker.simpleNextLeaks} continuation fields`
    );
  }

  const actualOperations =
    kind === 'simple'
      ? simpleBatch
      : blocks === 100
        ? prefixSmallBatch
        : prefixLargeBatch;
  const warmupOperations = kind === 'simple' ? 1000 : blocks === 100 ? 5 : 1;

  measureBatch(actual.run, warmupOperations);
  measureBatch(() => runReference(kind, depth), 1000);

  const actualSamplesUs: number[] = [];
  const referenceSamplesUs: number[] = [];
  const measureActualSample = () => {
    if (kind === 'prefix' && blocks === 20_000) {
      globalThis.gc?.();
      globalThis.gc?.();
    }

    actualSamplesUs.push(measureBatch(actual.run, actualOperations));
  };
  const measureReferenceSample = () => {
    referenceSamplesUs.push(
      measureBatch(() => runReference(kind, depth), referenceBatch)
    );
  };

  for (let sample = 0; sample < samples; sample += 1) {
    if (sample % 2 === 0) {
      measureActualSample();
      measureReferenceSample();
    } else {
      measureReferenceSample();
      measureActualSample();
    }
  }

  const actualLatencyUs = summarize(actualSamplesUs);
  const referenceLatencyUs = summarize(referenceSamplesUs);
  const budgetUs = latencyBudgetUs(kind, blocks, depth);
  const p50BudgetRatio = actualLatencyUs.p50 / budgetUs.p50;
  const p95BudgetRatio = actualLatencyUs.p95 / budgetUs.p95;

  if (actual.commits() !== 0) {
    correctnessFailures.push(
      `no-op benchmark dispatch published ${actual.commits()} commits`
    );
  }

  actual.dispose();
  continuationTracker.continuationIdentities.clear();

  return {
    allocationEvidence: {
      dispatches: CONTINUATION_PROOF_DISPATCHES,
      expectedContinuationIdentities,
      method:
        'Count unique callable next identities delivered to live around handlers; handle contexts are checked for absence of next. No heap-byte estimate is inferred.',
      observedContinuationIdentities,
      simpleNextLeaks: continuationTracker.simpleNextLeaks,
    },
    actualLatencyUs,
    actualOperationsPerSample: actualOperations,
    actualToReferenceP50Ratio: round(
      actualLatencyUs.p50 / Math.max(referenceLatencyUs.p50, 0.000_001)
    ),
    allocationFailures,
    blocks,
    budgetRatios: {
      p50: round(p50BudgetRatio),
      p95: round(p95BudgetRatio),
      worst: round(Math.max(p50BudgetRatio, p95BudgetRatio)),
    },
    budgetUs,
    correctness: {
      actualDefaultVisits: actualTracker.defaultVisits,
      actualHandled,
      actualHandlerVisits: actualTracker.handlerVisits,
      referenceDefaultVisits: referenceTracker.defaultVisits,
      referenceHandled,
      referenceHandlerVisits: referenceTracker.handlerVisits,
      trace: actualTracker.trace,
    },
    correctnessFailures,
    depth,
    id: `${kind}-blocks-${blocks}-handlers-${depth}`,
    kind,
    referenceLatencyUs,
    referenceOperationsPerSample: referenceBatch,
  };
};

const lanes = LANE_KINDS.flatMap((kind) =>
  DOCUMENT_BLOCKS.flatMap((blocks) =>
    HANDLER_DEPTHS.map((depth) => measureLane(kind, blocks, depth))
  )
);
const laneById = new Map(lanes.map((lane) => [lane.id, lane]));
const simpleDocumentSizeRatios = HANDLER_DEPTHS.map((depth) => {
  const small = laneById.get(`simple-blocks-100-handlers-${depth}`)!;
  const large = laneById.get(`simple-blocks-20000-handlers-${depth}`)!;

  return {
    depth,
    p50: round(
      large.actualLatencyUs.p50 / Math.max(small.actualLatencyUs.p50, 0.000_001)
    ),
  };
});
const prefixDocumentSizeRatios = HANDLER_DEPTHS.map((depth) => {
  const small = laneById.get(`prefix-blocks-100-handlers-${depth}`)!;
  const large = laneById.get(`prefix-blocks-20000-handlers-${depth}`)!;

  return {
    depth,
    p50: round(
      large.actualLatencyUs.p50 / Math.max(small.actualLatencyUs.p50, 0.000_001)
    ),
  };
});
const worstBudgetRatio = Math.max(
  ...lanes.map(({ budgetRatios }) => budgetRatios.worst)
);
const worstSimpleDocumentSizeP50Ratio = Math.max(
  ...simpleDocumentSizeRatios.map(({ p50 }) => p50)
);
const correctnessFailures = lanes.flatMap((lane) =>
  lane.correctnessFailures.map((failure) => `${lane.id}: ${failure}`)
);
const allocationFailures = lanes.flatMap((lane) =>
  lane.allocationFailures.map((failure) => `${lane.id}: ${failure}`)
);
const budgetFailures = lanes.flatMap((lane) =>
  lane.budgetRatios.worst > 1
    ? [
        `${lane.id}: budget ratio ${lane.budgetRatios.worst} exceeds 1 (p50=${lane.actualLatencyUs.p50}/${lane.budgetUs.p50}us p95=${lane.actualLatencyUs.p95}/${lane.budgetUs.p95}us)`,
      ]
    : []
);
const documentSizeFailures =
  worstSimpleDocumentSizeP50Ratio > 2
    ? [
        `simple 20k/100-block p50 ratio ${worstSimpleDocumentSizeP50Ratio} exceeds 2`,
      ]
    : [];

const result = {
  allocationFailures,
  artifactVersion: 1,
  authority: {
    preEditBaseline: {
      comparisonPermitted: false,
      reason:
        'The command hard cut began before Slice 0 captured an executable same-checkout baseline. No before/after or <=10% regression claim is valid.',
      status: 'unavailable',
    },
    sameRunReference: {
      comparableFor:
        'Handled result, visit order/count, continuation count, and run-local timing noise.',
      notComparableFor:
        'The removed implementation, TransactionSpec construction, publication, or a historical regression ratio.',
      predecessor: false,
      status: 'synthetic-control',
    },
  },
  benchmark: 'plite-command-dispatch',
  benchmarkSink,
  budgetFailures,
  config: {
    blocks: DOCUMENT_BLOCKS,
    continuationProofDispatches: CONTINUATION_PROOF_DISPATCHES,
    handlerDepths: HANDLER_DEPTHS,
    laneKinds: LANE_KINDS,
    prefixLargeBatch,
    prefixSmallBatch,
    referenceBatch,
    samples,
    simpleBatch,
  },
  correctnessFailures,
  derived: {
    prefixDocumentSize: {
      policy: 'record-only',
      ratios: prefixDocumentSizeRatios,
      reason:
        'Prefix lanes intentionally include generic TransactionSpec construction for every around handler. They have absolute budgets, but do not claim command-only document-size independence.',
    },
    simpleDocumentSize: {
      p50RatioMax: 2,
      ratios: simpleDocumentSizeRatios,
      worstP50Ratio: worstSimpleDocumentSizeP50Ratio,
    },
    worstBudgetRatio: round(worstBudgetRatio),
  },
  documentSizeFailures,
  fairness: {
    allocation:
      'Callable continuation identities are observed directly by handlers in an untimed pass. Heap bytes are intentionally not estimated.',
    order:
      'Actual and same-run reference samples alternate first position within every lane.',
    reference:
      'The reference is a synthetic handler-chain interpreter in this process, not the deleted implementation and not a substitute for a missing pre-edit baseline.',
    setup:
      'Editor and 100/20,000-block document construction, extension compilation, warmup, correctness checks, allocation proof, and forced GC before each large-prefix sample are outside timed samples.',
  },
  lanes,
  thresholdPolicy: {
    allocation:
      'Every simple handler context has no next and observes zero callable continuations; every prefix around visit observes one fresh callable continuation identity.',
    latency:
      'Every lane p50 and p95 must stay within its fixed absolute microsecond budget.',
    prefixDocumentSize:
      'Record only. Generic immutable-spec construction is included and owned outside the command evaluator.',
    simpleDocumentSize:
      'For each handler depth, the 20,000-block p50 must stay at or below 2x the 100-block p50.',
    source:
      'Rounded fixed ceilings from three 2026-07-21 same-machine post-cut WIP calibrations, including isolated-GC large-prefix samples. They are current absolute guards, not predecessor measurements.',
  },
};

writeBenchmarkArtifact(outputPath, `${JSON.stringify(result, null, 2)}\n`);

console.log(JSON.stringify(result, null, 2));
console.log(
  `METRIC plite_command_dispatch_worst_budget_ratio=${round(worstBudgetRatio)}`
);
console.log(
  `METRIC plite_command_dispatch_simple_large_document_p50_ratio=${worstSimpleDocumentSizeP50Ratio}`
);
console.log(
  `METRIC plite_command_dispatch_continuation_failures=${allocationFailures.length}`
);
console.log(
  `METRIC plite_command_dispatch_reference_parity=${correctnessFailures.length === 0 ? 1 : 0}`
);

if (
  correctnessFailures.length > 0 ||
  allocationFailures.length > 0 ||
  (strict && (budgetFailures.length > 0 || documentSizeFailures.length > 0))
) {
  throw new Error(
    `Command dispatch benchmark failed: ${JSON.stringify({ allocationFailures, budgetFailures, correctnessFailures, documentSizeFailures })}`
  );
}
