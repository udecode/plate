import { Buffer } from 'node:buffer';
import { performance } from 'node:perf_hooks';

import { createEditor } from '../../../../../packages/plitejs/src/index.ts';
import * as Editor from '../../../../../packages/plitejs/src/internal/index.ts';
import {
  History,
  history,
} from '../../../../../packages/plitejs/src/history/index.ts';
import {
  round,
  summarize,
  writeBenchmarkArtifact,
} from '../../shared/stats.mjs';

const iterations = Number.parseInt(
  process.env.PLITE_HISTORY_RETAINED_MEMORY_ITERATIONS ?? '3',
  10
);
const existingBlocks = Number.parseInt(
  process.env.PLITE_HISTORY_RETAINED_MEMORY_EXISTING_BLOCKS ?? '5000',
  10
);
const replacementBlocks = Number.parseInt(
  process.env.PLITE_HISTORY_RETAINED_MEMORY_REPLACEMENT_BLOCKS ?? '5000',
  10
);
const textBytes = Number.parseInt(
  process.env.PLITE_HISTORY_RETAINED_MEMORY_TEXT_BYTES ?? '96',
  10
);

const textFor = (prefix, index) =>
  `${prefix}-${String(index).padStart(5, '0')} ${'x'.repeat(
    Math.max(1, textBytes)
  )}`;

const paragraph = (prefix, index) => ({
  type: 'paragraph',
  children: [{ text: textFor(prefix, index) }],
});

const createDocument = (count, prefix) =>
  Array.from({ length: count }, (_, index) => paragraph(prefix, index));

const byteLength = (value) => Buffer.byteLength(JSON.stringify(value));

const heapUsed = () => process.memoryUsage?.().heapUsed ?? 0;

const forceGc = () => {
  if (typeof globalThis.gc === 'function') {
    globalThis.gc();
    return true;
  }

  return false;
};

const summarizeHeapDeltas = (samples) => ({
  samples,
  mean:
    samples.length === 0
      ? 0
      : round(samples.reduce((sum, value) => sum + value, 0) / samples.length),
  max: samples.length === 0 ? 0 : Math.max(...samples),
  min: samples.length === 0 ? 0 : Math.min(...samples),
});

const createHistoryEditor = (children, selection) => {
  const editor = createEditor({ extensions: [history()] });

  Editor.replace(editor, {
    children,
    selection,
  });

  return editor;
};

const fullDocumentSelection = (children) => {
  const lastIndex = children.length - 1;
  const lastText = children[lastIndex]?.children[0]?.text ?? '';

  return {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [lastIndex, 0], offset: lastText.length },
    kind: 'text',
  };
};

const getHistoryShape = (editor) => {
  const historyState = editor.read((state) => state.history());
  const undoBatch = historyState.undos.at(-1);
  const serializeStart = performance.now();
  const serialized = History.toJSON(editor);
  const serializationMs = performance.now() - serializeStart;
  const restored = createEditor({
    extensions: [history()],
    initialValue: editor.read.value(),
  });
  const reloadStart = performance.now();

  const decoded = History.fromJSON(
    restored,
    JSON.parse(JSON.stringify(serialized))
  );
  restored.update((tx) => tx.history.restore(decoded));
  const reloadMs = performance.now() - reloadStart;
  const restoredHistory = restored.read.history();
  const historyBytes = byteLength(serialized);
  const undoBytes = byteLength(serialized.undos);
  const redoBytes = byteLength(serialized.redos);
  const changeBytes = byteLength(undoBatch?.change.toJSON() ?? null);
  const serializedUndoBatch = serialized.undos.at(-1);
  const effectBytes = byteLength(serializedUndoBatch?.effects ?? []);
  const selectionBeforeBytes = byteLength(undoBatch?.selectionBefore ?? null);
  const selectionAfterBytes = byteLength(undoBatch?.selectionAfter ?? null);

  return {
    historyEntryCount: historyState.undos.length,
    historyReloadMs: round(reloadMs),
    historySerializationMs: round(serializationMs),
    redoEntryCount: historyState.redos.length,
    restoredHistoryEntryCount: restoredHistory.undos.length,
    retainedBatchChangeCount: undoBatch ? 1 : 0,
    retainedBatchEffectCount: undoBatch?.effects.length ?? 0,
    retainedChangeRoots: undoBatch
      ? [...undoBatch.change.changes.keys()].sort()
      : [],
    retainedEffectKeys: undoBatch?.effects.map((effect) => effect.type.key) ?? [],
    retainedPayloadTags: [
      'history.undos',
      'change',
      'effects',
      'selectionAfter',
      'selectionBefore',
      'versionedHistoryJson',
      'process.heapUsed',
    ],
    serializedEffectCount: serialized.undos.reduce(
      (count, batch) => count + batch.effects.length,
      0
    ),
    serializedVersion: serialized.version,
    retainedBytes: {
      changeJsonBytes: changeBytes,
      effectJsonBytes: effectBytes,
      historyJsonBytes: historyBytes,
      redoJsonBytes: redoBytes,
      selectionAfterJsonBytes: selectionAfterBytes,
      selectionBeforeJsonBytes: selectionBeforeBytes,
      undoJsonBytes: undoBytes,
    },
  };
};

const measureRetainedLane = (name, setup, run) => {
  const durationSamples = [];
  const gcBeforeSamples = [];
  const gcAfterSamples = [];
  const heapDeltaSamples = [];
  let metadata = null;

  for (let sample = 0; sample < iterations; sample += 1) {
    const context = setup();
    const gcBefore = forceGc();
    const heapBefore = heapUsed();
    const start = performance.now();
    const result = run(context);
    const duration = performance.now() - start;
    const gcAfter = forceGc();
    const heapAfter = heapUsed();

    durationSamples.push(duration);
    gcBeforeSamples.push(gcBefore);
    gcAfterSamples.push(gcAfter);
    heapDeltaSamples.push(heapAfter - heapBefore);
    metadata = {
      ...result,
      gcAvailable: gcBefore && gcAfter,
      heapMeasurement: gcAfter
        ? 'process.memoryUsage.heapUsed after post-run GC'
        : 'process.memoryUsage.heapUsed without post-run GC',
      lane: name,
      postRunGcAvailable: gcAfter,
      preRunGcAvailable: gcBefore,
    };
  }

  const gcAvailable =
    gcBeforeSamples.every(Boolean) && gcAfterSamples.every(Boolean);
  const heapDeltaMetric = gcAvailable
    ? 'retainedHeapDeltaBytes'
    : 'heapGrowthDeltaBytes';

  return {
    durationMs: summarize(durationSamples),
    [heapDeltaMetric]: summarizeHeapDeltas(heapDeltaSamples),
    metadata: {
      ...metadata,
      gcAvailable,
      heapDeltaMetric,
      heapMeasurement: gcAvailable
        ? 'process.memoryUsage.heapUsed after post-run GC'
        : 'process.memoryUsage.heapUsed without complete GC',
      postRunGcAvailable: gcAfterSamples.every(Boolean),
      preRunGcAvailable: gcBeforeSamples.every(Boolean),
    },
  };
};

const measureFullDocumentReplace = () =>
  measureRetainedLane(
    'full-document-replace-children',
    () => {
      const children = createDocument(existingBlocks, 'existing');
      const replacement = createDocument(replacementBlocks, 'replacement');
      const editor = createHistoryEditor(
        children,
        fullDocumentSelection(children)
      );

      return {
        editor,
        inputPayloadBytes: byteLength({ children, replacement }),
        replacement,
      };
    },
    ({ editor, inputPayloadBytes, replacement }) => {
      editor.update((tx) => {
        tx.fragment.replace(replacement);
      });

      const shape = getHistoryShape(editor);

      if (
        shape.historyEntryCount !== 1 ||
        shape.restoredHistoryEntryCount !== 1 ||
        shape.serializedVersion !== 2
      ) {
        throw new Error(
          `Expected one retained and reloaded versioned history entry, got ${JSON.stringify(
            shape
          )}`
        );
      }

      return {
        ...shape,
        existingBlocks,
        historyJsonToInputRatio:
          shape.retainedBytes.historyJsonBytes / inputPayloadBytes,
        inputPayloadBytes,
        nextBlocks: Editor.getChildren(editor).length,
        replacementBlocks,
      };
    }
  );

const measureRangeDelete = () =>
  measureRetainedLane(
    'range-delete-replace-children',
    () => {
      const children = createDocument(existingBlocks, 'delete');
      const editor = createHistoryEditor(editorSafeChildren(children), {
        anchor: { path: [0, 0], offset: 0 },
        focus: {
          path: [existingBlocks - 2, 0],
          offset: children[existingBlocks - 2].children[0].text.length,
        },
        kind: 'text',
      });

      return { editor };
    },
    ({ editor }) => {
      const inputPayloadBytes = byteLength({
        children: editor.read.children(),
      });
      editor.update((tx) => {
        tx.text.delete();
      });

      const shape = getHistoryShape(editor);

      if (
        shape.historyEntryCount !== 1 ||
        shape.restoredHistoryEntryCount !== 1 ||
        shape.serializedVersion !== 2
      ) {
        throw new Error(
          `Expected one retained and reloaded versioned history entry, got ${JSON.stringify(
            shape
          )}`
        );
      }

      return {
        ...shape,
        deletedBlockPressure: existingBlocks - 1,
        historyJsonToInputRatio:
          shape.retainedBytes.historyJsonBytes / inputPayloadBytes,
        inputPayloadBytes,
        nextBlocks: Editor.getChildren(editor).length,
      };
    }
  );

const editorSafeChildren = (children) => structuredClone(children);

const lanes = {
  fullDocumentReplaceChildren: measureFullDocumentReplace(),
  rangeDeleteReplaceChildren: measureRangeDelete(),
};
const maximumHistoryJsonToInputRatio = Math.max(
  ...Object.values(lanes).map(
    (lane) => lane.metadata.historyJsonToInputRatio
  )
);
const gcAvailable = Object.values(lanes).every(
  (lane) => lane.metadata.gcAvailable
);
const thresholdPolicy = {
  gcRequired: true,
  maximumHistoryJsonToInputRatio: 2.25,
  restoredEntryRequired: true,
};
const result = {
  benchmark: 'plite-history-retained-memory',
  issuePressure: {
    '#3752': 'retained history payload and memory pressure',
  },
  artifactVersion: 3,
  gcAvailable,
  maximumHistoryJsonToInputRatio,
  thresholdPolicy,
  config: {
    existingBlocks,
    replacementBlocks,
    textBytes,
    iterations,
  },
  lanes,
};

await writeBenchmarkArtifact(
  'tmp/slate-history-retained-memory-benchmark.json',
  result
);

console.log(JSON.stringify(result, null, 2));
console.log(
  `METRIC plite_history_retained_memory_json_ratio=${maximumHistoryJsonToInputRatio}`
);
console.log(
  `METRIC plite_history_retained_memory_gc_available=${gcAvailable ? 1 : 0}`
);

if (
  process.env.PLITE_HISTORY_RETAINED_MEMORY_STRICT === '1' &&
  (!gcAvailable ||
    maximumHistoryJsonToInputRatio >
      thresholdPolicy.maximumHistoryJsonToInputRatio)
) {
  throw new Error(
    `Retained History missed its gate: gc=${gcAvailable} serialized/input=${maximumHistoryJsonToInputRatio.toFixed(2)}x.`
  );
}
