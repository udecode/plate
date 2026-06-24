import { Buffer } from 'node:buffer';
import { performance } from 'node:perf_hooks';

import { createEditor } from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import { history } from '../../../../../packages/slate-history/src/index.ts';
import {
  round,
  summarize,
  writeBenchmarkArtifact,
} from '../../shared/stats.mjs';

const iterations = Number.parseInt(
  process.env.SLATE_HISTORY_RETAINED_MEMORY_ITERATIONS ?? '3',
  10
);
const existingBlocks = Number.parseInt(
  process.env.SLATE_HISTORY_RETAINED_MEMORY_EXISTING_BLOCKS ?? '5000',
  10
);
const replacementBlocks = Number.parseInt(
  process.env.SLATE_HISTORY_RETAINED_MEMORY_REPLACEMENT_BLOCKS ?? '5000',
  10
);
const textBytes = Number.parseInt(
  process.env.SLATE_HISTORY_RETAINED_MEMORY_TEXT_BYTES ?? '96',
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
    marks: null,
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
  };
};

const getHistoryShape = (editor, operationsBefore) => {
  const operations = Editor.getOperations(editor).slice(operationsBefore);
  const historyState = editor.read((state) => state.history.get());
  const undoBatch = historyState.undos.at(-1);
  const historyBytes = byteLength(historyState);
  const undoBytes = byteLength(historyState.undos);
  const redoBytes = byteLength(historyState.redos);
  const operationBytes = byteLength(undoBatch?.operations ?? []);
  const selectionBeforeBytes = byteLength(undoBatch?.selectionBefore ?? null);

  return {
    historyEntryCount: historyState.undos.length,
    redoEntryCount: historyState.redos.length,
    operationCount: operations.length,
    retainedBatchOperationCount: undoBatch?.operations.length ?? 0,
    retainedOperationTypes: undoBatch?.operations.map((op) => op.type) ?? [],
    retainedPayloadTags: [
      'history.undos',
      'operations',
      'selectionBefore',
      'process.heapUsed',
    ],
    retainedBytes: {
      historyJsonBytes: historyBytes,
      undoJsonBytes: undoBytes,
      redoJsonBytes: redoBytes,
      operationJsonBytes: operationBytes,
      selectionBeforeJsonBytes: selectionBeforeBytes,
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
      const operationsBefore = Editor.getOperations(editor).length;

      return { editor, operationsBefore, replacement };
    },
    ({ editor, operationsBefore, replacement }) => {
      editor.update((tx) => {
        tx.fragment.insert(replacement);
      });

      const shape = getHistoryShape(editor, operationsBefore);

      if (shape.historyEntryCount !== 1 || shape.operationCount !== 1) {
        throw new Error(
          `Expected one retained history entry with one operation, got ${JSON.stringify(
            shape
          )}`
        );
      }

      return {
        ...shape,
        existingBlocks,
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
      });
      const operationsBefore = Editor.getOperations(editor).length;

      return { editor, operationsBefore };
    },
    ({ editor, operationsBefore }) => {
      editor.update((tx) => {
        tx.text.delete();
      });

      const shape = getHistoryShape(editor, operationsBefore);

      if (shape.historyEntryCount !== 1 || shape.operationCount !== 1) {
        throw new Error(
          `Expected one retained history entry with one operation, got ${JSON.stringify(
            shape
          )}`
        );
      }

      return {
        ...shape,
        deletedBlockPressure: existingBlocks - 1,
        nextBlocks: Editor.getChildren(editor).length,
      };
    }
  );

const editorSafeChildren = (children) => structuredClone(children);

const result = {
  benchmark: 'slate-history-retained-memory',
  issuePressure: {
    '#3752': 'retained history payload and memory pressure',
  },
  artifactVersion: 1,
  thresholdPolicy: {
    mode: 'calibration-only',
    releaseGate: false,
    repeatRunsRequiredBeforeEnforcement: 3,
  },
  config: {
    existingBlocks,
    replacementBlocks,
    textBytes,
    iterations,
  },
  lanes: {
    fullDocumentReplaceChildren: measureFullDocumentReplace(),
    rangeDeleteReplaceChildren: measureRangeDelete(),
  },
};

await writeBenchmarkArtifact('tmp/slate-history-retained-memory.json', result);

console.log(JSON.stringify(result, null, 2));
