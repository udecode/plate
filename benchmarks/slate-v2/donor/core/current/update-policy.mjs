import { performance } from 'node:perf_hooks';

import {
  createEditor,
  defineExtension,
} from '../../../../../packages/plitejs/src/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const samples = Number.parseInt(
  process.env.PLITE_UPDATE_POLICY_SAMPLES ?? '240',
  10
);
const updatesPerSample = Number.parseInt(
  process.env.PLITE_UPDATE_POLICY_UPDATES_PER_SAMPLE ?? '25',
  10
);
const retainedPolicies = Number.parseInt(
  process.env.PLITE_UPDATE_POLICY_RETAINED_POLICIES ?? '5000',
  10
);

// Isolate policy dispatch from history recording while providing its required namespace.
const historyCapability = defineExtension('history', {
  update: () => ({
    noop() {},
  }),
});

const createBenchmarkEditor = () =>
  createEditor({
    extensions: [historyCapability],
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
  });

const insertAtStart = (facade) =>
  facade.text.insert('x', { at: { path: [0, 0], offset: 0 } });

const createLegacyTextUpdateFacade = (editor) => ({
  text: new Proxy(
    {},
    {
      get(_target, methodName) {
        if (typeof methodName !== 'string') return;

        return (...args) => {
          let result;

          editor.update((tx) => {
            result = tx.text[methodName](...args);
          });

          return result;
        };
      },
    }
  ),
});

const measureLanes = (lanes) => {
  const durations = Object.fromEntries(lanes.map(({ name }) => [name, []]));

  for (let sample = 0; sample < samples; sample += 1) {
    const offset = sample % lanes.length;

    for (let index = 0; index < lanes.length; index += 1) {
      const lane = lanes[(offset + index) % lanes.length];
      const start = performance.now();

      for (let update = 0; update < updatesPerSample; update += 1) {
        lane.run();
      }

      durations[lane.name].push(performance.now() - start);
    }
  }

  return Object.fromEntries(
    Object.entries(durations).map(([name, raw]) => [
      name,
      { raw, summary: summarize(raw) },
    ])
  );
};

const defaultEditor = createBenchmarkEditor();
const legacyEditor = createBenchmarkEditor();
const historyEditor = createBenchmarkEditor();
const taggedEditor = createBenchmarkEditor();
const callbackEditor = createBenchmarkEditor();
const taggedPolicy = { tags: ['paste'] };
const legacyFacade = createLegacyTextUpdateFacade(legacyEditor);
const taggedFacade = taggedEditor.update(taggedPolicy);

for (let warmup = 0; warmup < 100; warmup += 1) {
  insertAtStart(defaultEditor.update);
  insertAtStart(legacyFacade);
  insertAtStart(historyEditor.update({ history: 'skip' }));
  insertAtStart(taggedFacade);
  callbackEditor.update(taggedPolicy, (tx) =>
    tx.text.insert('x', { at: { path: [0, 0], offset: 0 } })
  );
}

const {
  default: defaultLane,
  legacy: legacyLane,
  history: historyLane,
  tagged: taggedLane,
  callback: callbackLane,
} = measureLanes([
  { name: 'default', run: () => insertAtStart(defaultEditor.update) },
  { name: 'legacy', run: () => insertAtStart(legacyFacade) },
  {
    name: 'history',
    run: () => insertAtStart(historyEditor.update({ history: 'skip' })),
  },
  { name: 'tagged', run: () => insertAtStart(taggedFacade) },
  {
    name: 'callback',
    run: () =>
      callbackEditor.update(taggedPolicy, (tx) =>
        tx.text.insert('x', { at: { path: [0, 0], offset: 0 } })
      ),
  },
]);

const historyFacades = [
  historyEditor.update({ history: 'merge' }),
  historyEditor.update({ history: 'new-batch' }),
  historyEditor.update({ history: 'skip' }),
];
const historyFacadesAreStable = historyFacades.every(
  (facade, index) =>
    facade ===
    historyEditor.update({
      history: ['merge', 'new-batch', 'skip'][index],
    })
);
const distinctHistoryFacadeCount = new Set(historyFacades).size;

const heapBeforeRetainedPolicies = process.memoryUsage().heapUsed;
const retained = [];

for (let index = 0; index < retainedPolicies; index += 1) {
  const policy = { tags: [`retained-${index}`] };

  retained.push({ facade: taggedEditor.update(policy), policy });
}

const heapAfterRetainedPolicies = process.memoryUsage().heapUsed;
const heapMeasurementAvailable =
  heapBeforeRetainedPolicies > 0 && heapAfterRetainedPolicies > 0;
const retainedPolicyHeapDeltaBytes = heapMeasurementAvailable
  ? heapAfterRetainedPolicies - heapBeforeRetainedPolicies
  : null;
const p95 = (values) =>
  [...values].sort((left, right) => left - right)[
    Math.ceil(values.length * 0.95) - 1
  ] ?? 0;
const defaultP95 = p95(defaultLane.raw);
const ratios = {
  defaultToLegacyP95: defaultP95 / p95(legacyLane.raw),
  historyToDefaultP95: p95(historyLane.raw) / defaultP95,
  taggedToDefaultP95: p95(taggedLane.raw) / defaultP95,
  callbackToDefaultP95: p95(callbackLane.raw) / defaultP95,
};
const thresholdPolicy = {
  aggregation: 'median-of-three-runs',
  defaultToLegacyP95Max: 1.05,
  cachedPolicyP95RatioMax: 1.15,
  historyFacadeCount: 3,
};

if (!historyFacadesAreStable || distinctHistoryFacadeCount !== 3) {
  throw new Error('Expected exactly three stable semantic history facades');
}

const result = {
  benchmark: 'plite-update-policy',
  artifactVersion: 2,
  measurementOrder: 'round-robin-rotated',
  samples,
  updatesPerSample,
  thresholdPolicy,
  ratios,
  singleRunThresholdEvaluation: {
    callback:
      ratios.callbackToDefaultP95 <=
      thresholdPolicy.cachedPolicyP95RatioMax,
    default:
      ratios.defaultToLegacyP95 <= thresholdPolicy.defaultToLegacyP95Max,
    history:
      ratios.historyToDefaultP95 <=
      thresholdPolicy.cachedPolicyP95RatioMax,
    tagged:
      ratios.taggedToDefaultP95 <=
      thresholdPolicy.cachedPolicyP95RatioMax,
  },
  facadeCache: {
    distinctHistoryFacadeCount,
    historyFacadesAreStable,
    taggedFacadeIsStable: taggedFacade === taggedEditor.update(taggedPolicy),
  },
  lanes: {
    defaultUpdateMs: defaultLane.summary,
    legacyProxyBaselineMs: legacyLane.summary,
    historyPolicyMs: historyLane.summary,
    taggedPolicyMs: taggedLane.summary,
    policyCallbackMs: callbackLane.summary,
  },
  retainedPolicyCohort: {
    count: retained.length,
    heapDeltaBytes: retainedPolicyHeapDeltaBytes,
    heapMeasurement: heapMeasurementAvailable
      ? 'process.memoryUsage.heapUsed without forced GC'
      : 'unavailable: runtime reported zero heap usage',
    retainedPayloadTags: ['policy-object', 'weak-facade-cache', 'facade'],
  },
};

await writeBenchmarkArtifact('tmp/bench-plite-update-policy.json', result);

console.log(JSON.stringify(result, null, 2));
