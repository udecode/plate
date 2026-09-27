import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import {
  createEditor as createPlateEditor,
  definePlugin,
} from '../../../../../packages/platejs/src/index.tsx';
import {
  ContentSlice,
  createEditor,
  definePluginSlot,
} from '../../../../../packages/plitejs/src/index.ts';
import {
  dataTransferFormats,
  dom,
  writeDataTransferFragment,
} from '../../../../../packages/plitejs/src/dom/index.ts';
import { getPluginRegistry } from '../../../../../packages/plitejs/src/internal/index.ts';
import { EDITOR_TO_WINDOW } from '../../../../../packages/plitejs/src/dom/internal/index.ts';
import {
  insertDOMFragmentData,
  insertDOMTextData,
  readDOMFragmentData,
  writeDOMFragmentData,
  writeDOMSelectionData,
} from '../../../../../packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts';
import { round, writeBenchmarkArtifact } from '../../shared/stats.mjs';
import {
  CLIPBOARD_AUTHORITY_ARTIFACT_PATH,
  createClipboardIssueTargetThresholds,
  hasClipboardBenchmarkFailures,
  isClipboardAuthorityArtifactPath,
} from '../../../../editor/benchmarks/plite-clipboard-large-payload-gate.mjs';

const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-editor-fragment';

const iterations = Number(process.env.PLITE_CLIPBOARD_BENCH_ITERATIONS || 3);
const stressIterations = Number(
  process.env.PLITE_CLIPBOARD_BENCH_STRESS_ITERATIONS || 1
);
const stressLineCount = Number(
  process.env.PLITE_CLIPBOARD_BENCH_STRESS_LINES || 2000
);
const hugeCutIterations = Number(
  process.env.PLITE_CLIPBOARD_BENCH_HUGE_CUT_ITERATIONS || 3
);
const hugeCutBlocks = Number(
  process.env.PLITE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS || 10_000
);
const issueTargetsEnabled =
  process.env.PLITE_CLIPBOARD_BENCH_ISSUE_TARGETS === '1';
const issueTargetStressLines = Number(
  process.env.PLITE_CLIPBOARD_BENCH_ISSUE_STRESS_LINES || 10_000
);
const issueTargetIterations = Number(
  process.env.PLITE_CLIPBOARD_BENCH_ISSUE_ITERATIONS || 3
);
const outputArgument = process.argv.find((candidate) =>
  candidate.startsWith('--output=')
);
const outputPath =
  outputArgument?.slice('--output='.length) ||
  process.env.PLITE_CLIPBOARD_BENCH_OUTPUT ||
  CLIPBOARD_AUTHORITY_ARTIFACT_PATH;
const authorityArtifact = isClipboardAuthorityArtifactPath(outputPath);
const benchmarkPartition = process.env.PLITE_CLIPBOARD_BENCH_PARTITION;
const processIsolationEnabled =
  authorityArtifact || process.env.PLITE_CLIPBOARD_BENCH_ISOLATE === '1';
const correctnessFailures = [];
const gcAvailable = typeof globalThis.gc === 'function';

const assertAuthorityConfiguration = () => {
  if (!authorityArtifact) return;

  if (
    !issueTargetsEnabled ||
    hugeCutBlocks !== 50_000 ||
    hugeCutIterations !== 3 ||
    issueTargetStressLines !== 10_000 ||
    issueTargetIterations !== 3
  ) {
    throw new Error(
      'The canonical clipboard authority artifact requires 50,000 cut blocks, three cut samples, 10,000 issue-stress lines, and three issue-target samples. Use --output=<diagnostic-path> for reduced runs.'
    );
  }
};

assertAuthorityConfiguration();

const recordFailure = (message) => {
  correctnessFailures.push(message);
};

const verify = (condition, message) => {
  if (!condition) recordFailure(message);

  return condition;
};

const benchmarkWindow = {
  atob: (value) => Buffer.from(value, 'base64').toString('binary'),
  btoa: (value) => Buffer.from(value, 'binary').toString('base64'),
};

class FakeDataTransfer {
  store = new Map();

  get types() {
    return Array.from(this.store.keys());
  }

  getData(type) {
    return this.store.get(type) ?? '';
  }

  setData(type, value) {
    this.store.set(type, value);
  }
}

const createParagraph = (text) => ({
  type: 'paragraph',
  children: [{ text }],
});

const createTextLine = (index) =>
  `${index} this is a test demo. Plite clipboard benchmark line.`;

const createPlainTextPayload = (lineCount) =>
  Array.from({ length: lineCount }, (_, index) => createTextLine(index)).join(
    '\n'
  );

const createFragment = (lineCount) =>
  Array.from({ length: lineCount }, (_, index) =>
    createParagraph(createTextLine(index))
  );

const createDocument = (blockCount) =>
  Array.from({ length: blockCount }, (_, index) =>
    createParagraph(`existing-${index}`)
  );

const createPlateParagraph = (text) => ({
  type: 'paragraph',
  children: [{ text }],
});

const createPlateFragment = (lineCount) =>
  Array.from({ length: lineCount }, (_, index) =>
    createPlateParagraph(createTextLine(index))
  );

const textByteLength = (text) => Buffer.byteLength(text, 'utf8');
const roundRatio = (value) => Number(value.toFixed(6));

const benchmarkDataTransferMimeType = 'application/x-plite-benchmark-json';
const benchmarkPlateDataTransferMimeType =
  'application/x-plate-benchmark-json';
const benchmarkPlateReconfigurationMimeType =
  'application/x-plate-benchmark-reconfiguration';
const dataTransferFormatReconfigurationSlot = definePluginSlot(
  'benchmark-plate-data-transfer-reconfiguration'
);
const dataTransferDecodeDurations = [];
const dataTransferEncodeDurations = [];
const decodeSuccess = (slice) => ({ diagnostics: [], ok: true, slice });
const encodeSuccess = (data) => ({ data, diagnostics: [], ok: true });
const benchmarkDataTransferFormatPlugin = dataTransferFormats(
  'benchmark-data-transfer-format',
  [
    {
      mimeType: benchmarkDataTransferMimeType,
      key: 'benchmark:json',
      decode: ({ data }) => {
        const start = performance.now();

        try {
          const content = JSON.parse(data);

          return Array.isArray(content)
            ? decodeSuccess(ContentSlice.closed(content))
            : null;
        } finally {
          dataTransferDecodeDurations.push(performance.now() - start);
        }
      },
      encode: ({ slice }) => {
        const start = performance.now();

        try {
          return encodeSuccess(JSON.stringify(slice.content));
        } finally {
          dataTransferEncodeDurations.push(performance.now() - start);
        }
      },
    },
  ]
);

const createPlateDataTransferCounters = () => ({
  accept: 0,
  decode: 0,
  decodeMs: 0,
  encode: 0,
  encodeMs: 0,
});

const createPlateReconfigurationFormatPlugin = (label, counters) =>
  dataTransferFormats(`benchmark-plate-data-transfer:${label}`, [
    {
      mimeType: benchmarkPlateReconfigurationMimeType,
      key: `benchmark:plate-data-transfer:${label}`,
      decode: ({ data }) => {
        counters.decode += 1;

        const payload = JSON.parse(data);

        return decodeSuccess(ContentSlice.fromJSON(payload.slice));
      },
      accept: () => {
        counters.accept += 1;

        return true;
      },
      encode: ({ slice }) => {
        counters.encode += 1;

        return encodeSuccess(JSON.stringify({ label, slice }));
      },
    },
  ]);

const createPlateBenchmarkFormatPlugin = (counters, mimeType) =>
  definePlugin('benchmarkPlateDataTransferFormat', {
    dataTransferFormats: [
      {
        mimeType,
        scope: 'document',
        decode: ({ data }) => {
          const start = performance.now();

          counters.decode += 1;
          try {
            return decodeSuccess(ContentSlice.fromJSON(JSON.parse(data)));
          } finally {
            counters.decodeMs += performance.now() - start;
          }
        },
        encode: ({ slice }) => {
          const start = performance.now();

          counters.encode += 1;
          try {
            return encodeSuccess(JSON.stringify(slice));
          } finally {
            counters.encodeMs += performance.now() - start;
          }
        },
        accept: () => {
          counters.accept += 1;

          return true;
        },
      },
    ],
  });

const createBenchmarkEditor = (children, selection, plugins = []) => {
  const editor = createEditor({
    plugins: [dom(), ...plugins],
    initialSelection: selection,
    initialValue: children,
  });

  EDITOR_TO_WINDOW.set(editor, benchmarkWindow);

  return editor;
};

const createPlateBenchmarkEditor = (children, selection, counters) => {
  const editor = createPlateEditor({
    initialValue: children,
    nodeId: false,
    plugins: [
      createPlateBenchmarkFormatPlugin(
        counters,
        benchmarkPlateDataTransferMimeType
      ),
    ],
    selection,
  });

  EDITOR_TO_WINDOW.set(editor, benchmarkWindow);

  return editor;
};

const createPlateDataTransferReconfigurationEditor = (initialCounters) =>
  createBenchmarkEditor(
    [createParagraph('')],
    collapsedStartSelection,
    [
      dataTransferFormatReconfigurationSlot.of(
        createPlateReconfigurationFormatPlugin('initial', initialCounters)
      ),
    ]
  );

const collapsedStartSelection = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 0 },
  kind: 'text',
};

const fullSelection = (children) => {
  const lastIndex = children.length - 1;
  const lastText = children[lastIndex].children[0].text;

  return {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [lastIndex, 0], offset: lastText.length },
    kind: 'text',
  };
};

const twoBlockSelection = (children) => {
  const startIndex = Math.floor(children.length / 2);
  const endIndex = startIndex + 1;

  return {
    anchor: { path: [startIndex, 0], offset: 0 },
    focus: {
      path: [endIndex, 0],
      offset: children[endIndex].children[0].text.length,
    },
    kind: 'text',
  };
};

const middleCollapsedSelection = (children) => {
  const index = Math.floor(children.length / 2);
  const text = children[index].children[0].text;
  const offset = Math.floor(text.length / 2);

  return {
    anchor: { path: [index, 0], offset },
    focus: { path: [index, 0], offset },
    kind: 'text',
  };
};

const heapUsed = () => process.memoryUsage?.().heapUsed ?? 0;
const forceGc = () => {
  if (gcAvailable) globalThis.gc();
};

const percentile = (sorted, ratio) => {
  if (sorted.length === 0) {
    return 0;
  }

  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * ratio) - 1)
  );

  return sorted[index];
};

const summarizeDurations = (durations) => {
  if (durations.length === 0) {
    return {
      samples: [],
      mean: 0,
      p50: 0,
      p95: 0,
      min: 0,
      max: 0,
    };
  }

  const sorted = [...durations].sort((left, right) => left - right);
  const total = durations.reduce((sum, value) => sum + value, 0);

  return {
    samples: durations.map(round),
    mean: round(total / durations.length),
    p50: round(percentile(sorted, 0.5)),
    p95: round(percentile(sorted, 0.95)),
    min: round(sorted[0] ?? 0),
    max: round(sorted.at(-1) ?? 0),
  };
};

const summarizeHeapDeltas = (heapDeltas) => ({
  max: heapDeltas.length === 0 ? 0 : Math.max(...heapDeltas),
  mean:
    heapDeltas.length === 0
      ? 0
      : round(
          heapDeltas.reduce((sum, value) => sum + value, 0) / heapDeltas.length
        ),
  samples: heapDeltas,
});

const measureLane = (sampleCount, run) => {
  const durations = [];
  const heapDeltas = [];
  const metadataSamples = [];
  let metadata = {};

  for (let sample = 0; sample < sampleCount; sample += 1) {
    const heapBefore = heapUsed();
    const start = performance.now();
    const result = run();
    const duration = performance.now() - start;
    const heapAfterWork = heapUsed();

    durations.push(duration);
    heapDeltas.push(heapAfterWork - heapBefore);
    metadata = result ?? metadata;
    metadataSamples.push(result ?? {});
  }

  return {
    ...summarizeDurations(durations),
    heapDeltaBytes: summarizeHeapDeltas(heapDeltas),
    metadata,
    metadataSamples,
    retainedHeapDeltaBytes: null,
  };
};

const measurePreparedLane = (
  sampleCount,
  setup,
  run,
  {
    collectSetupGarbage = false,
    inspect,
    measureRetained = false,
    warmup = false,
  } = {}
) => {
  const durations = [];
  const heapDeltas = [];
  const inspectionDurations = [];
  const metadataSamples = [];
  const retainedHeapDeltas = [];
  const setupDurations = [];
  let metadata = {};

  if (warmup) {
    run(setup());
    if (collectSetupGarbage) forceGc();
  }

  for (let sample = 0; sample < sampleCount; sample += 1) {
    const setupStart = performance.now();
    const context = setup();
    const setupDuration = performance.now() - setupStart;

    if (collectSetupGarbage) forceGc();
    const heapBefore = heapUsed();
    const start = performance.now();
    const workResult = run(context);
    const duration = performance.now() - start;
    const heapAfterWork = heapUsed();
    const inspectionStart = performance.now();
    const result = inspect ? inspect(context, workResult) : workResult;
    const inspectionDuration = performance.now() - inspectionStart;

    durations.push(duration);
    heapDeltas.push(heapAfterWork - heapBefore);
    inspectionDurations.push(inspectionDuration);
    metadata = result ?? metadata;
    metadataSamples.push(result ?? {});
    setupDurations.push(setupDuration);
  }

  if (gcAvailable && measureRetained) {
    const context = setup();

    forceGc();
    const heapBefore = heapUsed();

    run(context);
    forceGc();
    retainedHeapDeltas.push(heapUsed() - heapBefore);
  }

  return {
    ...summarizeDurations(durations),
    heapDeltaBytes: summarizeHeapDeltas(heapDeltas),
    inspectionMs: summarizeDurations(inspectionDurations),
    metadata,
    metadataSamples,
    retainedHeapDeltaBytes: gcAvailable && measureRetained
      ? summarizeHeapDeltas(retainedHeapDeltas)
      : null,
    setupMs: summarizeDurations(setupDurations),
  };
};

const getCommitMetadata = (editor, versionBefore, beforeChildren) => {
  const snapshot = editor.read.runtime.snapshot();
  const commit = editor.read.lastCommit();
  const commitCount = snapshot.version - versionBefore;
  let changedRangeCount = 0;
  let maximumChangedTokenSpan = 0;

  verify(commitCount === 1, `Expected one commit, received ${commitCount}`);
  verify(Boolean(commit), 'Expected a published commit');

  commit?.changes.iterChangedRanges(
    (_root, fromBefore, toBefore, fromAfter, toAfter) => {
      changedRangeCount += 1;
      maximumChangedTokenSpan = Math.max(
        maximumChangedTokenSpan,
        toBefore - fromBefore,
        toAfter - fromAfter
      );
    }
  );

  const topLevelRanges = commit?.changed.topLevelRanges() ?? [];
  const maximumChangedTopLevelSpan = topLevelRanges.reduce(
    (maximum, [from, to]) => Math.max(maximum, to - from),
    0
  );
  const currentBlocks = new Set(snapshot.children);
  const retainedExistingBlocks = beforeChildren.filter((node) =>
    currentBlocks.has(node)
  ).length;

  return {
    changedRangeCount,
    commitCount,
    maximumChangedTokenSpan,
    maximumChangedTopLevelSpan,
    retainedExistingBlockRatio:
      beforeChildren.length === 0
        ? 1
        : roundRatio(retainedExistingBlocks / beforeChildren.length),
    retainedExistingBlocks,
    topLevelRanges,
  };
};

const measurePlainTextInsert = (
  lineCount,
  sampleCount,
  { collectSetupGarbage = false, warmup = false } = {}
) => {
  const text = createPlainTextPayload(lineCount);

  return measurePreparedLane(
    sampleCount,
    () => {
      const editor = createBenchmarkEditor(
        [createParagraph('')],
        collapsedStartSelection
      );
      const data = new FakeDataTransfer();

      data.setData('text/plain', text);

      return {
        beforeChildren: editor.read.children(),
        data,
        editor,
        versionBefore: editor.read.runtime.snapshot().version,
      };
    },
    ({ data, editor }) => insertDOMTextData(editor, data),
    {
      collectSetupGarbage,
      inspect: (
        { beforeChildren, editor, versionBefore },
        inserted
      ) => {
        verify(inserted, 'Plain-text insert benchmark did not insert data');

        const children = editor.read.children();

        verify(
          children.length === lineCount,
          `Expected ${lineCount} inserted blocks, received ${children.length}`
        );

        return {
          ...getCommitMetadata(editor, versionBefore, beforeChildren),
          insertedBlocks: children.length,
          lineCount,
          textPlainBytes: textByteLength(text),
        };
      },
      measureRetained: true,
      warmup,
    }
  );
};

const measureFragmentEncode = (lineCount, sampleCount) => {
  const slice = ContentSlice.closed(createFragment(lineCount));

  return measureLane(sampleCount, () => {
    const data = new FakeDataTransfer();
    const encoded = writeDOMFragmentData(data, {
      clipboardFormatKey: DEFAULT_CLIPBOARD_FORMAT_KEY,
      html: ({ encoded, text }) =>
        `<span data-editor-fragment="${encoded}" data-editor-fragment-format="${DEFAULT_CLIPBOARD_FORMAT_KEY}">${text}</span>`,
      slice,
      window: benchmarkWindow,
    });

    return {
      applicationBytes: textByteLength(encoded),
      fragmentNodes: slice.content.length,
      textHtmlBytes: textByteLength(data.getData('text/html')),
      textPlainBytes: textByteLength(data.getData('text/plain')),
    };
  });
};

const measureFragmentDecode = (lineCount, sampleCount) => {
  const data = new FakeDataTransfer();
  const encoded = writeDOMFragmentData(data, {
    clipboardFormatKey: DEFAULT_CLIPBOARD_FORMAT_KEY,
    html: '',
    slice: ContentSlice.closed(createFragment(lineCount)),
    window: benchmarkWindow,
  });

  return measurePreparedLane(
    sampleCount,
    () => ({
      editor: createBenchmarkEditor(
        [createParagraph('')],
        collapsedStartSelection
      ),
    }),
    ({ editor }) => readDOMFragmentData(editor, data),
    {
      inspect: (_context, decoded) => {
        verify(
          decoded?.content.length === lineCount,
          'Decoded fragment did not match the expected shape'
        );

        return {
          applicationBytes: textByteLength(encoded),
          fragmentNodes: decoded?.content.length ?? 0,
        };
      },
    }
  );
};

const measureSliceFit = (lineCount, sampleCount) => {
  const slice = ContentSlice.closed(createFragment(lineCount));

  return measurePreparedLane(
    sampleCount,
    () => {
      const editor = createBenchmarkEditor(
        [createParagraph('')],
        collapsedStartSelection
      );

      return {
        editor,
        snapshotBefore: editor.read.runtime.snapshot(),
      };
    },
    ({ editor }) => editor.read.slice.fit(slice),
    {
      inspect: ({ editor, snapshotBefore }, fitted) => {
        const snapshotAfter = editor.read.runtime.snapshot();

        verify(Boolean(fitted), 'Slice fit benchmark rejected valid content');
        verify(
          snapshotAfter.version === snapshotBefore.version &&
            snapshotAfter.children === snapshotBefore.children,
          'Detached slice fit published editor state'
        );
        verify(
          editor.read.lastCommit() === null,
          'Detached slice fit published a commit'
        );

        return {
          fitted: Boolean(fitted),
          fragmentNodes: slice.content.length,
          publishedCommits: snapshotAfter.version - snapshotBefore.version,
        };
      },
    }
  );
};

const measureSliceCommit = (lineCount, sampleCount) => {
  const slice = ContentSlice.closed(createFragment(lineCount));

  return measurePreparedLane(
    sampleCount,
    () => {
      const editor = createBenchmarkEditor(
        [createParagraph('')],
        collapsedStartSelection
      );

      return {
        beforeChildren: editor.read.children(),
        editor,
        versionBefore: editor.read.runtime.snapshot().version,
      };
    },
    ({ editor }) => editor.update.slice.replace(slice),
    {
      inspect: ({ beforeChildren, editor, versionBefore }) => {
        const children = editor.read.children();

        verify(
          children.length === lineCount,
          `Expected ${lineCount} slice blocks, received ${children.length}`
        );

        return {
          ...getCommitMetadata(editor, versionBefore, beforeChildren),
          fragmentNodes: slice.content.length,
          insertedBlocks: children.length,
        };
      },
      measureRetained: true,
    }
  );
};

const measureDOMFragmentInsert = (lineCount, sampleCount) => {
  const fragment = createFragment(lineCount);
  const data = new FakeDataTransfer();
  const encoded = writeDOMFragmentData(data, {
    clipboardFormatKey: DEFAULT_CLIPBOARD_FORMAT_KEY,
    html: '',
    slice: ContentSlice.closed(fragment),
    window: benchmarkWindow,
  });

  return measurePreparedLane(
    sampleCount,
    () => {
      const editor = createBenchmarkEditor(
        [createParagraph('')],
        collapsedStartSelection
      );

      return {
        beforeChildren: editor.read.children(),
        editor,
        versionBefore: editor.read.runtime.snapshot().version,
      };
    },
    ({ editor }) => insertDOMFragmentData(editor, data),
    {
      inspect: (
        { beforeChildren, editor, versionBefore },
        inserted
      ) => {
        verify(inserted, 'DOM fragment insert benchmark did not insert data');

        const children = editor.read.children();

        verify(
          children.length === lineCount,
          `Expected ${lineCount} DOM fragment blocks, received ${children.length}`
        );

        return {
          ...getCommitMetadata(editor, versionBefore, beforeChildren),
          applicationBytes: textByteLength(encoded),
          fragmentNodes: fragment.length,
          insertedBlocks: children.length,
        };
      },
    }
  );
};

const measureDataTransferFormatInsert = (lineCount, sampleCount) => {
  const fragment = createFragment(lineCount);
  const payload = JSON.stringify(fragment);

  return measurePreparedLane(
    sampleCount,
    () => {
      const editor = createBenchmarkEditor(
        [createParagraph('')],
        collapsedStartSelection,
        [benchmarkDataTransferFormatPlugin]
      );
      const data = new FakeDataTransfer();

      data.setData(benchmarkDataTransferMimeType, payload);

      return {
        beforeChildren: editor.read.children(),
        data,
        editor,
        decodeSample: dataTransferDecodeDurations.length,
        versionBefore: editor.read.runtime.snapshot().version,
      };
    },
    ({ data, editor }) => editor.api.dom.clipboard.insertData(data),
    {
      inspect: (
        { beforeChildren, editor, decodeSample, versionBefore },
        inserted
      ) => {
        verify(
          inserted,
          'DataTransfer format insert benchmark did not insert data'
        );

        const children = editor.read.children();

        verify(
          children.length === lineCount,
          `Expected ${lineCount} DataTransfer format blocks, received ${children.length}`
        );

        return {
          ...getCommitMetadata(editor, versionBefore, beforeChildren),
          fragmentNodes: fragment.length,
          transferDecodeMs: round(
            dataTransferDecodeDurations
              .slice(decodeSample)
              .reduce((total, duration) => total + duration, 0)
          ),
          transferPayloadBytes: textByteLength(payload),
          insertedBlocks: children.length,
        };
      },
    }
  );
};

const measureDataTransferFormatEncode = (lineCount, sampleCount) => {
  const fragment = createFragment(lineCount);

  return measurePreparedLane(
    sampleCount,
    () => ({
      data: new FakeDataTransfer(),
      editor: createBenchmarkEditor(fragment, null, [
        benchmarkDataTransferFormatPlugin,
      ]),
      encodeSample: dataTransferEncodeDurations.length,
    }),
    ({ data, editor }) =>
      writeDataTransferFragment(editor, data, ContentSlice.closed(fragment)),
    {
      inspect: ({ data, encodeSample }) => {
        const payload = data.getData(benchmarkDataTransferMimeType);

        verify(
          payload.length > 0,
          'DataTransfer format encode benchmark produced no payload'
        );

        return {
          fragmentNodes: fragment.length,
          transferEncodeMs: round(
            dataTransferEncodeDurations
              .slice(encodeSample)
              .reduce((total, duration) => total + duration, 0)
          ),
          transferPayloadBytes: textByteLength(payload),
        };
      },
    }
  );
};

const verifyPlateDataTransferCallbacks = (
  counters,
  { accept, decode, encode }
) => {
  verify(
    counters.accept === accept,
    `Expected ${accept} Plate DataTransfer format accept callback, received ${counters.accept}`
  );
  verify(
    counters.decode === decode,
    `Expected ${decode} Plate DataTransfer format decode callback, received ${counters.decode}`
  );
  verify(
    counters.encode === encode,
    `Expected ${encode} Plate DataTransfer format encode callback, received ${counters.encode}`
  );
};

const plateDataTransferMetadata = (counters) => ({
  acceptCallbacks: counters.accept,
  decodeCallbacks: counters.decode,
  decodeMs: round(counters.decodeMs),
  encodeCallbacks: counters.encode,
  encodeMs: round(counters.encodeMs),
});

const measurePlateDataTransferRegistration = (sampleCount) =>
  measureLane(sampleCount, () => {
    const counters = createPlateDataTransferCounters();

    createPlateBenchmarkEditor(
      [createPlateParagraph('')],
      collapsedStartSelection,
      counters
    );
    verifyPlateDataTransferCallbacks(counters, {
      accept: 0,
      decode: 0,
      encode: 0,
    });

    return plateDataTransferMetadata(counters);
  });

const measurePlateDataTransferReconfiguration = (sampleCount) =>
  measurePreparedLane(
    sampleCount,
    () => {
      const initialCounters = createPlateDataTransferCounters();
      const replacementCounters = createPlateDataTransferCounters();
      const editor = createPlateDataTransferReconfigurationEditor(initialCounters);

      return {
        configurationRevisionBefore:
          getPluginRegistry(editor).configurationRevision,
        initialCounters,
        replacementCounters,
        editor,
        versionBefore: editor.read.runtime.snapshot().version,
      };
    },
    ({ editor, replacementCounters }) => {
      editor.update.plugins.reconfigure(
        dataTransferFormatReconfigurationSlot,
        createPlateReconfigurationFormatPlugin(
          'replacement',
          replacementCounters
        )
      );
    },
    {
      inspect: ({
        configurationRevisionBefore,
        editor,
        initialCounters,
        replacementCounters,
        versionBefore,
      }) => {
        const configurationCommit = editor.read.lastCommit();
        const configurationRevisionAfter =
          getPluginRegistry(editor).configurationRevision;
        const configurationCommitCount =
          editor.read.runtime.snapshot().version - versionBefore;

        verify(
          configurationCommitCount === 1,
          `Expected one Plate DataTransfer format reconfiguration commit, received ${configurationCommitCount}`
        );
        verify(
          configurationCommit?.dirtyStateKeys.includes('$configuration') ??
            false,
          'Plate DataTransfer format reconfiguration did not dirty configuration state'
        );
        verify(
          configurationRevisionAfter === configurationRevisionBefore + 1,
          `Expected one Plate DataTransfer format configuration revision, received ${
            configurationRevisionAfter - configurationRevisionBefore
          }`
        );
        verifyPlateDataTransferCallbacks(initialCounters, {
          accept: 0,
          decode: 0,
          encode: 0,
        });
        verifyPlateDataTransferCallbacks(replacementCounters, {
          accept: 0,
          decode: 0,
          encode: 0,
        });

        const slice = ContentSlice.closed([
          createParagraph('reconfigured-data-transfer-format'),
        ]);
        const input = new FakeDataTransfer();

        input.setData(
          benchmarkPlateReconfigurationMimeType,
          JSON.stringify({ slice })
        );
        verify(
          editor.api.dom.clipboard.insertData(input),
          'Reconfigured Plate DataTransfer format did not insert data'
        );

        const output = new FakeDataTransfer();
        const mimeTypes = writeDataTransferFragment(editor, output, slice);
        const payload = JSON.parse(
          output.getData(benchmarkPlateReconfigurationMimeType)
        );

        verify(
          mimeTypes.includes(benchmarkPlateReconfigurationMimeType),
          'Reconfigured Plate DataTransfer format did not encode its MIME type'
        );
        verify(
          payload.label === 'replacement',
          'Reconfigured Plate DataTransfer format did not replace the initial registration'
        );
        verifyPlateDataTransferCallbacks(initialCounters, {
          accept: 0,
          decode: 0,
          encode: 0,
        });
        verifyPlateDataTransferCallbacks(replacementCounters, {
          accept: 1,
          decode: 1,
          encode: 1,
        });

        return {
          configurationCommitCount,
          configurationDirtyCommits: configurationCommit?.dirtyStateKeys.includes(
            '$configuration'
          )
            ? 1
            : 0,
          configurationRevisionDelta:
            configurationRevisionAfter - configurationRevisionBefore,
          initialAcceptCallbacks: initialCounters.accept,
          initialDecodeCallbacks: initialCounters.decode,
          initialEncodeCallbacks: initialCounters.encode,
          replacementAcceptCallbacks: replacementCounters.accept,
          replacementDecodeCallbacks: replacementCounters.decode,
          replacementEncodeCallbacks: replacementCounters.encode,
        };
      },
    }
  );

const measurePlateDataTransferDecodeInsert = (lineCount, sampleCount) => {
  const slice = ContentSlice.closed(createPlateFragment(lineCount));
  const payload = JSON.stringify(slice);

  return measurePreparedLane(
    sampleCount,
    () => {
      const counters = createPlateDataTransferCounters();
      const editor = createPlateBenchmarkEditor(
        [createPlateParagraph('')],
        collapsedStartSelection,
        counters
      );
      const data = new FakeDataTransfer();

      data.setData(benchmarkPlateDataTransferMimeType, payload);

      return {
        beforeChildren: editor.read.children(),
        counters,
        data,
        editor,
        versionBefore: editor.read.runtime.snapshot().version,
      };
    },
    ({ data, editor }) => editor.api.dom.clipboard.insertData(data),
    {
      inspect: (
        { beforeChildren, counters, editor, versionBefore },
        inserted
      ) => {
        verify(inserted, 'Plate DataTransfer format insert benchmark did not insert data');
        verifyPlateDataTransferCallbacks(counters, {
          accept: 1,
          decode: 1,
          encode: 0,
        });

        const children = editor.read.children();

        verify(
          children.length === lineCount,
          `Expected ${lineCount} Plate DataTransfer format blocks, received ${children.length}`
        );

        return {
          ...getCommitMetadata(editor, versionBefore, beforeChildren),
          ...plateDataTransferMetadata(counters),
          insertedBlocks: children.length,
          lineCount,
          payloadBytes: textByteLength(payload),
        };
      },
      measureRetained: true,
    }
  );
};

const measurePlateDataTransferEncode = (lineCount, sampleCount) => {
  const slice = ContentSlice.closed(createPlateFragment(lineCount));

  return measurePreparedLane(
    sampleCount,
    () => {
      const counters = createPlateDataTransferCounters();
      const data = new FakeDataTransfer();
      const editor = createPlateBenchmarkEditor(
        [createPlateParagraph('')],
        null,
        counters
      );

      return { counters, data, editor };
    },
    ({ data, editor }) => writeDataTransferFragment(editor, data, slice),
    {
      inspect: ({ counters, data }, mimeTypes) => {
        const payload = data.getData(benchmarkPlateDataTransferMimeType);

        verify(
          mimeTypes.includes(benchmarkPlateDataTransferMimeType),
          'Plate DataTransfer format encode benchmark did not report its MIME type'
        );
        verify(
          payload.length > 0,
          'Plate DataTransfer format encode benchmark produced no payload'
        );
        verifyPlateDataTransferCallbacks(counters, {
          accept: 0,
          decode: 0,
          encode: 1,
        });

        return {
          ...plateDataTransferMetadata(counters),
          fragmentNodes: slice.content.length,
          lineCount,
          payloadBytes: textByteLength(payload),
        };
      },
    }
  );
};

const measureFullSelectionCopy = (
  lineCount,
  sampleCount,
  { collectSetupGarbage = false, warmup = false } = {}
) => {
  const children = createFragment(lineCount);
  const selection = fullSelection(children);

  const result = measurePreparedLane(
    sampleCount,
    () => ({
      data: new FakeDataTransfer(),
      editor: createBenchmarkEditor(children, selection),
    }),
    ({ data, editor }) => writeDOMSelectionData(editor, data),
    {
      collectSetupGarbage,
      inspect: ({ data }) => {
        const applicationPayload = data.getData(
          `application/${DEFAULT_CLIPBOARD_FORMAT_KEY}`
        );
        const textHtml = data.getData('text/html');
        const textPlain = data.getData('text/plain');

        verify(
          Boolean(applicationPayload && textPlain),
          'Model-backed full selection copy produced no payload'
        );

        return {
          applicationBytes: textByteLength(applicationPayload),
          fragmentNodes: children.length,
          textHtmlBytes: textByteLength(textHtml),
          textPlainBytes: textByteLength(textPlain),
        };
      },
      warmup,
    }
  );
  const editor = createBenchmarkEditor(children, selection);
  const previousProfiler = globalThis.__EDITOR_REACT_RENDER_PROFILER__;
  const copiedNodes = new WeakSet(editor.read.children().flatMap((node) => [node, ...node.children]));
  const originalEntries = Object.entries;
  let copyPropertyVisitCount = 0;
  let runtimeIndexBuildCount = 0;
  Object.entries = (value) => {
    if (copiedNodes.has(value)) copyPropertyVisitCount += 1;
    return originalEntries(value);
  };
  globalThis.__EDITOR_REACT_RENDER_PROFILER__ = {
    record(event) {
      if (event.kind === 'core-time' && event.id === 'runtime-index-full-build') {
        runtimeIndexBuildCount += 1;
      }
    },
  };
  try {
    const data = new FakeDataTransfer();
    writeDOMSelectionData(editor, data);
    verify(data.getData('text/plain').length > 0, 'Copy locality probe must write the selected text');
  } finally {
    globalThis.__EDITOR_REACT_RENDER_PROFILER__ = previousProfiler;
    Object.entries = originalEntries;
  }
  verify(runtimeIndexBuildCount === 0, 'Model-backed copy must not build identities for missing DOM');
  verify(copyPropertyVisitCount === 0, 'Preserve-only copy must not inspect node properties');
  return { ...result, copyPropertyVisitCount, runtimeIndexBuildCount };
};

const measurePopulatedMiddlePlainTextPaste = (
  existingBlockCount,
  lineCount,
  sampleCount,
  { collectSetupGarbage = false, warmup = false } = {}
) => {
  const text = createPlainTextPayload(lineCount);

  return measurePreparedLane(
    sampleCount,
    () => {
      const children = createDocument(existingBlockCount);
      const selection = middleCollapsedSelection(children);
      const editor = createBenchmarkEditor(children, selection);
      const data = new FakeDataTransfer();

      data.setData('text/plain', text);

      return {
        beforeChildren: editor.read.children(),
        data,
        editor,
        versionBefore: editor.read.runtime.snapshot().version,
      };
    },
    ({ data, editor }) => insertDOMTextData(editor, data),
    {
      collectSetupGarbage,
      inspect: (
        { beforeChildren, editor, versionBefore },
        inserted
      ) => {
        verify(
          inserted,
          'Populated plain-text paste benchmark did not insert data'
        );

        const nextChildren = editor.read.children();
        const expectedBlockCount = existingBlockCount + lineCount - 1;

        verify(
          nextChildren.length === expectedBlockCount,
          `Expected ${expectedBlockCount} blocks after populated paste, received ${nextChildren.length}`
        );

        return {
          ...getCommitMetadata(editor, versionBefore, beforeChildren),
          existingBlockCount,
          insertedBlocks: lineCount,
          nextBlockCount: nextChildren.length,
          textPlainBytes: textByteLength(text),
        };
      },
      measureRetained: true,
      warmup,
    }
  );
};

const measureCutTwoBlocks = (blockCount, sampleCount) =>
  measureLane(sampleCount, () => {
    const children = createDocument(blockCount);
    const selection = twoBlockSelection(children);
    const editor = createBenchmarkEditor(children, selection);
    const data = new FakeDataTransfer();
    const beforeChildren = editor.read.children();
    const versionBefore = editor.read.runtime.snapshot().version;

    writeDOMSelectionData(editor, data);
    editor.update.fragment.delete({ at: selection });

    const nextChildren = editor.read.children();

    verify(
      nextChildren.length < blockCount,
      'Cut benchmark did not remove document content'
    );

    return {
      ...getCommitMetadata(editor, versionBefore, beforeChildren),
      blockCount,
      nextBlockCount: nextChildren.length,
      textPlainBytes: textByteLength(data.getData('text/plain')),
    };
  });

const measurePreparedCutTwoBlocks = (
  blockCount,
  sampleCount,
  { includeCopy = false, measureRetained = false, warmSnapshot = false } = {}
) =>
  measurePreparedLane(
    sampleCount,
    () => {
      const children = createDocument(blockCount);
      const selection = twoBlockSelection(children);
      const editor = createBenchmarkEditor(children, selection);
      const data = new FakeDataTransfer();
      const beforeChildren = editor.read.children();
      const versionBefore = editor.read.runtime.snapshot().version;

      if (warmSnapshot) {
        editor.read.runtime.snapshot().index.entries();
      }

      return { beforeChildren, data, editor, versionBefore, selection };
    },
    ({ data, editor, selection }) => {
      if (includeCopy) {
        writeDOMSelectionData(editor, data);
      }

      editor.update.fragment.delete({ at: selection });
    },
    {
      collectSetupGarbage: true,
      inspect: ({ beforeChildren, data, editor, versionBefore }) => {
        const nextChildren = editor.read.children();

        verify(
          nextChildren.length < blockCount,
          'Cut benchmark did not remove document content'
        );

        return {
          ...getCommitMetadata(editor, versionBefore, beforeChildren),
          blockCount,
          includeCopy,
          nextBlockCount: nextChildren.length,
          snapshot: warmSnapshot ? 'warm' : 'cold',
          textPlainBytes: textByteLength(data.getData('text/plain')),
        };
      },
      measureRetained,
      warmup: true,
    }
  );

const sampleCountFor = (lineCount) =>
  lineCount >= 10_000 ? stressIterations : iterations;

const cohorts = [
  { lineCount: 10, name: 'small' },
  { lineCount: 100, name: 'normal' },
  { lineCount: 1000, name: 'large' },
  { lineCount: stressLineCount, name: 'stress' },
];

const measureCohorts = () =>
  Object.fromEntries(
    cohorts.map(({ lineCount, name }) => {
      const sampleCount = sampleCountFor(lineCount);

      return [
        name,
        {
          lineCount,
          sampleCount,
          fragmentDecodeMs: measureFragmentDecode(lineCount, sampleCount),
          fragmentEncodeMs: measureFragmentEncode(lineCount, sampleCount),
          domFragmentInsertMs: measureDOMFragmentInsert(
            lineCount,
            sampleCount
          ),
          fullSelectionCopyMs: measureFullSelectionCopy(lineCount, sampleCount),
          dataTransferFormatInsertMs: measureDataTransferFormatInsert(lineCount, sampleCount),
          dataTransferFormatEncodeMs: measureDataTransferFormatEncode(
            lineCount,
            sampleCount
          ),
          plainTextInsertMs: measurePlainTextInsert(lineCount, sampleCount),
          sliceCommitMs: measureSliceCommit(lineCount, sampleCount),
          sliceFitMs: measureSliceFit(lineCount, sampleCount),
        },
      ];
    })
  );

const measuredPathological = () => {
  const cutTwoBlocksEditMs = measurePreparedCutTwoBlocks(
    hugeCutBlocks,
    hugeCutIterations,
    { measureRetained: true, warmSnapshot: true }
  );
  const cutTwoBlocksMs = measurePreparedCutTwoBlocks(
    hugeCutBlocks,
    hugeCutIterations,
    { includeCopy: true, warmSnapshot: true }
  );

  return {
    cutTwoBlocksColdEditMs: measurePreparedCutTwoBlocks(
      hugeCutBlocks,
      hugeCutIterations
    ),
    cutTwoBlocksColdSetupMs: measureCutTwoBlocks(
      hugeCutBlocks,
      hugeCutIterations
    ),
    cutTwoBlocksEditMs,
    cutTwoBlocksMs,
  };
};

const measureIssueTargets = () =>
  issueTargetsEnabled
    ? {
        largePlainTextPaste10000: measurePlainTextInsert(
          issueTargetStressLines,
          issueTargetIterations,
          { warmup: true }
        ),
        populatedFullSelectionCopy10000: measureFullSelectionCopy(
          issueTargetStressLines,
          issueTargetIterations,
          { collectSetupGarbage: true }
        ),
        populatedMiddlePlainTextPaste10000Into10000:
          measurePopulatedMiddlePlainTextPaste(
            issueTargetStressLines,
            issueTargetStressLines,
            issueTargetIterations
          ),
      }
    : undefined;

const measurePlateDataTransferFormats = () => ({
  registrationMs: measurePlateDataTransferRegistration(issueTargetIterations),
  decodeInsert10000Ms: measurePlateDataTransferDecodeInsert(
    issueTargetStressLines,
    issueTargetIterations
  ),
  reconfigurationMs: measurePlateDataTransferReconfiguration(issueTargetIterations),
  encode10000Ms: measurePlateDataTransferEncode(
    issueTargetStressLines,
    issueTargetIterations
  ),
});

const workerLanes = ['issue', 'cut', 'support'];
const workerArtifacts = workerLanes.map(
  (lane) => `tmp/plite-clipboard-${lane}-${process.pid}.json`
);
let workerPids;
let cohortResults;
let pathological;
let issueTargets;
let plateDataTransferFormats;

if (benchmarkPartition) {
  const laneResult =
    benchmarkPartition === 'support'
      ? { cohorts: measureCohorts() }
      : benchmarkPartition === 'cut'
        ? { pathological: measuredPathological() }
        : benchmarkPartition === 'issue'
          ? {
              issueTargets: measureIssueTargets(),
              plateDataTransferFormats: measurePlateDataTransferFormats(),
            }
          : null;

  if (!laneResult) {
    throw new Error(`Unknown clipboard benchmark lane: ${benchmarkPartition}`);
  }

  await writeBenchmarkArtifact(outputPath, {
    artifactVersion: 3,
    benchmark: 'plite-clipboard-large-payload-worker',
    config: {
      hugeCutBlocks,
      hugeCutIterations,
      iterations,
      issueTargetIterations,
      issueTargetStressLines,
      issueTargetsEnabled,
      stressLineCount,
      stressIterations,
    },
    correctnessFailures,
    lane: benchmarkPartition,
    pid: process.pid,
    ...laneResult,
  });
  process.exit(0);
} else if (processIsolationEnabled) {
  const benchmarkPath = fileURLToPath(import.meta.url);
  const baseArguments = [
    '--expose-gc',
    '--preload',
    './config/plite-source-aliases.ts',
    benchmarkPath,
  ];
  const workers = workerLanes.map((lane, index) => {
    const result = spawnSync(process.execPath, baseArguments, {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        PLITE_CLIPBOARD_BENCH_OUTPUT: workerArtifacts[index],
        PLITE_CLIPBOARD_BENCH_PARTITION: lane,
        PLITE_CLIPBOARD_BENCH_ISSUE_TARGETS: lane === 'issue' ? '1' : '0',
      },
      maxBuffer: 10 * 1024 * 1024,
    });

    if (result.status !== 0) {
      process.stderr.write(result.stderr);
      process.stdout.write(result.stdout);
      workerArtifacts.forEach((artifact) => rmSync(artifact, { force: true }));
      process.exit(result.status ?? 1);
    }

    return JSON.parse(readFileSync(workerArtifacts[index], 'utf8'));
  });

  workerArtifacts.forEach((artifact) => rmSync(artifact, { force: true }));
  workers.forEach((worker, index) => {
    if (
      worker.lane !== workerLanes[index] ||
      !Number.isInteger(worker.pid)
    ) {
      throw new Error('Clipboard benchmark worker identity mismatch.');
    }
  });
  if (new Set(workers.map(({ pid }) => pid)).size !== workers.length) {
    throw new Error('Clipboard benchmark workers must use distinct processes.');
  }
  const workersByLane = Object.fromEntries(
    workers.map((worker) => [worker.lane, worker])
  );
  if (
    workersByLane.support.config.iterations !== iterations ||
    workersByLane.support.config.stressLineCount !== stressLineCount ||
    workersByLane.support.config.stressIterations !== stressIterations ||
    workersByLane.cut.config.hugeCutBlocks !== hugeCutBlocks ||
    workersByLane.cut.config.hugeCutIterations !== hugeCutIterations ||
    workersByLane.issue.config.issueTargetIterations !==
      issueTargetIterations ||
    workersByLane.issue.config.issueTargetStressLines !==
      issueTargetStressLines ||
    workersByLane.issue.config.issueTargetsEnabled !== true
  ) {
    throw new Error('Clipboard benchmark worker configuration mismatch.');
  }
  workers.forEach((worker) => {
    correctnessFailures.push(...worker.correctnessFailures);
  });
  cohortResults = workersByLane.support.cohorts;
  pathological = workersByLane.cut.pathological;
  issueTargets = workersByLane.issue.issueTargets;
  plateDataTransferFormats = workersByLane.issue.plateDataTransferFormats;
  workerPids = Object.freeze({
    cut: workersByLane.cut.pid,
    issue: workersByLane.issue.pid,
    support: workersByLane.support.pid,
  });
} else {
  cohortResults = measureCohorts();
  pathological = measuredPathological();
  issueTargets = measureIssueTargets();
  plateDataTransferFormats = measurePlateDataTransferFormats();
}

const issueTargetThresholds = issueTargetsEnabled
  ? createClipboardIssueTargetThresholds({
      hugeCutBlocks,
      issueTargetStressLines,
      issueTargets,
      pathological,
      releaseGate: authorityArtifact,
    })
  : undefined;

const issueBudgetFailures = issueTargetThresholds
  ? Object.entries(issueTargetThresholds)
      .filter(([, threshold]) => !threshold.passed)
      .map(([name]) => name)
  : [];
const stress = cohortResults.stress;
const primaryLanes = issueTargets
  ? [
      ...Object.values(issueTargets),
      pathological.cutTwoBlocksEditMs,
      pathological.cutTwoBlocksMs,
    ]
  : [
      stress.domFragmentInsertMs,
      stress.fullSelectionCopyMs,
      stress.dataTransferFormatInsertMs,
      stress.plainTextInsertMs,
      pathological.cutTwoBlocksEditMs,
      pathological.cutTwoBlocksMs,
    ];
const allLanes = [
  ...Object.values(cohortResults).flatMap((cohort) =>
    Object.values(cohort).filter((value) => Array.isArray(value?.samples))
  ),
  ...Object.values(pathological),
  ...Object.values(issueTargets ?? {}),
  ...Object.values(plateDataTransferFormats),
];
const metadataP95 = (lane, key) =>
  summarizeDurations(
    lane.metadataSamples
      .map((metadata) => metadata[key])
      .filter((value) => typeof value === 'number')
  ).p95;
const maximumMetadata = (key) =>
  Math.max(
    0,
    ...allLanes.flatMap((lane) =>
      lane.metadataSamples
        .map((metadata) => metadata[key])
        .filter((value) => typeof value === 'number')
    )
  );
const metrics = {
  plite_clipboard_full_copy_identity_builds:
    issueTargets?.populatedFullSelectionCopy10000.runtimeIndexBuildCount ?? 0,
  plite_clipboard_full_copy_property_visits:
    issueTargets?.populatedFullSelectionCopy10000.copyPropertyVisitCount ?? 0,
  plite_clipboard_correctness_failures: correctnessFailures.length,
  plite_clipboard_cut_edit_inspection_p95_ms:
    pathological.cutTwoBlocksEditMs.inspectionMs.p95,
  plite_clipboard_cut_edit_setup_p95_ms:
    pathological.cutTwoBlocksEditMs.setupMs.p95,
  plite_clipboard_cut_changed_token_span_max:
    pathological.cutTwoBlocksEditMs.metadata.maximumChangedTokenSpan,
  plite_clipboard_cut_changed_top_level_span_max:
    pathological.cutTwoBlocksEditMs.metadata.maximumChangedTopLevelSpan,
  plite_clipboard_cut_retained_existing_block_ratio:
    pathological.cutTwoBlocksEditMs.metadata.retainedExistingBlockRatio,
  plite_clipboard_decode_p95_ms: stress.fragmentDecodeMs.p95,
  plite_clipboard_encode_p95_ms: stress.fragmentEncodeMs.p95,
  plite_clipboard_fit_p95_ms: stress.sliceFitMs.p95,
  plite_clipboard_gc_available: gcAvailable ? 1 : 0,
  plite_clipboard_transfer_decode_p95_ms: metadataP95(
    stress.dataTransferFormatInsertMs,
    'transferDecodeMs'
  ),
  plite_clipboard_transfer_encode_p95_ms: metadataP95(
    stress.dataTransferFormatEncodeMs,
    'transferEncodeMs'
  ),
  plite_clipboard_issue_budget_failures: issueBudgetFailures.length,
  plite_clipboard_plain_text_paste_10000_p50_ms:
    issueTargets?.largePlainTextPaste10000.p50 ?? 0,
  plite_clipboard_plate_transfer_registration_p95_ms: plateDataTransferFormats.registrationMs.p95,
  plite_clipboard_plate_transfer_decode_10000_p95_ms: metadataP95(
    plateDataTransferFormats.decodeInsert10000Ms,
    'decodeMs'
  ),
  plite_clipboard_plate_transfer_decode_insert_10000_p95_ms:
    plateDataTransferFormats.decodeInsert10000Ms.p95,
  plite_clipboard_plate_transfer_reconfigure_p95_ms:
    plateDataTransferFormats.reconfigurationMs.p95,
  plite_clipboard_plate_transfer_encode_10000_p95_ms:
    plateDataTransferFormats.encode10000Ms.p95,
  plite_clipboard_populated_full_selection_copy_10000_p50_ms:
    issueTargets?.populatedFullSelectionCopy10000.p50 ?? 0,
  plite_clipboard_populated_plain_text_paste_10000_p50_ms:
    issueTargets?.populatedMiddlePlainTextPaste10000Into10000.p50 ?? 0,
  plite_clipboard_max_changed_token_span: maximumMetadata(
    'maximumChangedTokenSpan'
  ),
  plite_clipboard_max_changed_top_level_span: maximumMetadata(
    'maximumChangedTopLevelSpan'
  ),
  plite_clipboard_peak_heap_delta_bytes: Math.max(
    0,
    ...allLanes.flatMap((lane) => lane.heapDeltaBytes.samples)
  ),
  plite_clipboard_peak_retained_heap_delta_bytes: gcAvailable
    ? Math.max(
        0,
        ...allLanes.flatMap(
          (lane) => lane.retainedHeapDeltaBytes?.samples ?? []
        )
      )
    : 0,
  plite_clipboard_populated_paste_inspection_p95_ms:
    issueTargets?.populatedMiddlePlainTextPaste10000Into10000.inspectionMs
      .p95 ?? 0,
  plite_clipboard_populated_paste_setup_p95_ms:
    issueTargets?.populatedMiddlePlainTextPaste10000Into10000.setupMs.p95 ?? 0,
  plite_clipboard_slice_commit_p95_ms: stress.sliceCommitMs.p95,
  plite_clipboard_worst_issue_p95_ms: Math.max(
    ...primaryLanes.map((lane) => lane.p95)
  ),
};

const summary = {
  artifactVersion: 3,
  benchmark: 'plite-clipboard-large-payload',
  config: {
    authorityArtifact,
    hugeCutBlocks,
    hugeCutIterations,
    iterations,
    issueTargetIterations,
    issueTargetStressLines,
    issueTargetsEnabled,
    processIsolation: processIsolationEnabled ? 'support-cut-issue' : 'none',
    stressLineCount,
    stressIterations,
    ...(workerPids ? { workerPids } : {}),
  },
  cohorts: cohortResults,
  correctnessFailures,
  invariants: {
    currentContentSliceBoundary: true,
    currentDOMClipboardBoundary: true,
    currentDataTransferFormatBoundary: true,
    currentPlateDataTransferFormatBoundary: true,
    oneCommitPerMutation: correctnessFailures.every(
      (failure) => !failure.startsWith('Expected one commit')
    ),
  },
  issueBudgetFailures,
  issueTargets,
  issueTargetThresholds,
  issuePressure: {
    4056: 'large text paste/copy into populated editor',
    5945: '10,000-line plaintext paste',
    5992: '50,000-block two-node cut',
  },
  memoryMethodology: {
    allocationProxy:
      'heapUsed immediately after timed work minus the pre-work baseline',
    gcAvailable,
    retained:
      'selected prepared lanes run one separate untimed sample; heapUsed after exposed GC minus its post-setup, post-GC baseline; null on other lanes',
    setupIsolation:
      'the authority run measures support, 50,000-block cut, and 10,000-line issue lanes in distinct bounded child processes; prepared lanes run one unreported warmup and exposed GC after each untimed setup before measured work',
  },
  metrics,
  pathological,
  plateDataTransferFormats,
  thresholdPolicy: {
    releaseGate: authorityArtifact && issueTargetsEnabled,
    source: 'Slate issues #4056, #5945, and #5992',
  },
};

await writeBenchmarkArtifact(outputPath, summary);

for (const [name, value] of Object.entries(metrics)) {
  console.log(`METRIC ${name}=${value}`);
}

console.log(JSON.stringify(summary, null, 2));

if (hasClipboardBenchmarkFailures({ correctnessFailures, issueBudgetFailures }))
  process.exitCode = 1;
