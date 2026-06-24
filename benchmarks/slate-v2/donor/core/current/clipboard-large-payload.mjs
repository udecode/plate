import { Buffer } from 'node:buffer';
import { performance } from 'node:perf_hooks';
import { getOperationCount } from '../../../../../packages/slate/src/core/public-state.ts';
import { createEditor } from '../../../../../packages/slate/src/index.ts';
import {
  Editor,
  getEditorTransformRegistry,
} from '../../../../../packages/slate/src/internal/index.ts';
import { dom } from '../../../../../packages/slate-dom/src/index.ts';
import { EDITOR_TO_WINDOW } from '../../../../../packages/slate-dom/src/internal/index.ts';
import {
  insertDOMFragmentData,
  insertDOMTextData,
  writeDOMSelectionData,
} from '../../../../../packages/slate-dom/src/plugin/dom-clipboard-runtime.ts';
import { round, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-slate-fragment';
const NEWLINE_SPLIT_RE = /\r\n|\r|\n/;

const iterations = Number(process.env.SLATE_CLIPBOARD_BENCH_ITERATIONS || 3);
const stressIterations = Number(
  process.env.SLATE_CLIPBOARD_BENCH_STRESS_ITERATIONS || 1
);
const stressLineCount = Number(
  process.env.SLATE_CLIPBOARD_BENCH_STRESS_LINES || 2000
);
const hugeCutIterations = Number(
  process.env.SLATE_CLIPBOARD_BENCH_HUGE_CUT_ITERATIONS || 1
);
const hugeCutBlocks = Number(
  process.env.SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS || 10_000
);
const issueTargetsEnabled =
  process.env.SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS === '1';
const issueTargetStressLines = Number(
  process.env.SLATE_CLIPBOARD_BENCH_ISSUE_STRESS_LINES || 10_000
);
const issueTargetIterations = Number(
  process.env.SLATE_CLIPBOARD_BENCH_ISSUE_ITERATIONS || 1
);

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
  `${index} this is a test demo. Slate clipboard benchmark line.`;

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

const textByteLength = (text) => Buffer.byteLength(text, 'utf8');

const encodeFragment = (fragment) =>
  benchmarkWindow.btoa(encodeURIComponent(JSON.stringify(fragment)));

const createBenchmarkEditor = (children, selection) => {
  const editor = createEditor({ extensions: [dom()] });

  Editor.replace(editor, { children, selection });
  EDITOR_TO_WINDOW.set(editor, benchmarkWindow);

  return editor;
};

const collapsedStartSelection = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 0 },
};

const fullSelection = (children) => {
  const lastIndex = children.length - 1;
  const lastText = children[lastIndex].children[0].text;

  return {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [lastIndex, 0], offset: lastText.length },
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
  };
};

const middleCollapsedSelection = (children) => {
  const index = Math.floor(children.length / 2);
  const text = children[index].children[0].text;
  const offset = Math.floor(text.length / 2);

  return {
    anchor: { path: [index, 0], offset },
    focus: { path: [index, 0], offset },
  };
};

const heapUsed = () => process.memoryUsage?.().heapUsed ?? 0;

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
  let metadata = {};

  for (let sample = 0; sample < sampleCount; sample += 1) {
    const heapBefore = heapUsed();
    const start = performance.now();
    const result = run();
    const duration = performance.now() - start;
    const heapAfter = heapUsed();

    durations.push(duration);
    heapDeltas.push(heapAfter - heapBefore);
    metadata = result ?? metadata;
  }

  return {
    ...summarizeDurations(durations),
    heapDeltaBytes: summarizeHeapDeltas(heapDeltas),
    metadata,
  };
};

const measurePreparedLane = (sampleCount, setup, run) => {
  const durations = [];
  const heapDeltas = [];
  let metadata = {};

  for (let sample = 0; sample < sampleCount; sample += 1) {
    const context = setup();
    const heapBefore = heapUsed();
    const start = performance.now();
    const result = run(context);
    const duration = performance.now() - start;
    const heapAfter = heapUsed();

    durations.push(duration);
    heapDeltas.push(heapAfter - heapBefore);
    metadata = result ?? metadata;
  }

  return {
    ...summarizeDurations(durations),
    heapDeltaBytes: summarizeHeapDeltas(heapDeltas),
    metadata,
  };
};

const measurePlainTextSplit = (lineCount, sampleCount) => {
  const text = createPlainTextPayload(lineCount);

  return measureLane(sampleCount, () => {
    const lines = text.split(NEWLINE_SPLIT_RE);

    if (lines.length !== lineCount) {
      throw new Error(
        `Expected ${lineCount} split lines, received ${lines.length}`
      );
    }

    return {
      lineCount,
      textPlainBytes: textByteLength(text),
    };
  });
};

const measurePlainTextInsert = (lineCount, sampleCount) => {
  const text = createPlainTextPayload(lineCount);

  return measureLane(sampleCount, () => {
    const editor = createBenchmarkEditor(
      [createParagraph('')],
      collapsedStartSelection
    );
    const data = new FakeDataTransfer();
    const operationsBefore = getOperationCount(editor);

    data.setData('text/plain', text);

    let inserted = false;

    editor.update(() => {
      inserted = insertDOMTextData(editor, data);
    });

    if (!inserted) {
      throw new Error('Plain-text insert benchmark did not insert data');
    }

    const children = Editor.getChildren(editor);

    if (children.length !== lineCount) {
      throw new Error(
        `Expected ${lineCount} inserted blocks, received ${children.length}`
      );
    }

    return {
      insertedBlocks: children.length,
      lineCount,
      operationCount: getOperationCount(editor) - operationsBefore,
      textPlainBytes: textByteLength(text),
    };
  });
};

const measureFragmentEncode = (lineCount, sampleCount) => {
  const fragment = createFragment(lineCount);

  return measureLane(sampleCount, () => {
    const encoded = encodeFragment(fragment);
    const text = fragment.map((node) => node.children[0].text).join('\n');
    const html = `<span data-slate-fragment="${encoded}">${text}</span>`;

    return {
      applicationBytes: textByteLength(encoded),
      fragmentNodes: fragment.length,
      textHtmlBytes: textByteLength(html),
      textPlainBytes: textByteLength(text),
    };
  });
};

const measureFragmentDecode = (lineCount, sampleCount) => {
  const fragment = createFragment(lineCount);
  const encoded = encodeFragment(fragment);

  return measureLane(sampleCount, () => {
    const decoded = decodeURIComponent(benchmarkWindow.atob(encoded));
    const parsed = JSON.parse(decoded);

    if (!Array.isArray(parsed) || parsed.length !== lineCount) {
      throw new Error('Decoded fragment did not match the expected shape');
    }

    return {
      applicationBytes: textByteLength(encoded),
      fragmentNodes: parsed.length,
    };
  });
};

const measureFragmentInsert = (lineCount, sampleCount) => {
  const fragment = createFragment(lineCount);

  return measureLane(sampleCount, () => {
    const editor = createBenchmarkEditor(
      [createParagraph('')],
      collapsedStartSelection
    );
    const operationsBefore = getOperationCount(editor);

    editor.update(() => {
      getEditorTransformRegistry(editor).insertFragment(fragment);
    });

    const children = Editor.getChildren(editor);

    if (children.length !== lineCount) {
      throw new Error(
        `Expected ${lineCount} fragment blocks, received ${children.length}`
      );
    }

    return {
      fragmentNodes: fragment.length,
      insertedBlocks: children.length,
      operationCount: getOperationCount(editor) - operationsBefore,
    };
  });
};

const measureDOMFragmentInsert = (lineCount, sampleCount) => {
  const fragment = createFragment(lineCount);
  const encoded = encodeFragment(fragment);

  return measureLane(sampleCount, () => {
    const editor = createBenchmarkEditor(
      [createParagraph('')],
      collapsedStartSelection
    );
    const data = new FakeDataTransfer();
    const operationsBefore = getOperationCount(editor);

    data.setData(`application/${DEFAULT_CLIPBOARD_FORMAT_KEY}`, encoded);

    let inserted = false;

    editor.update(() => {
      inserted = insertDOMFragmentData(editor, data);
    });

    if (!inserted) {
      throw new Error('DOM fragment insert benchmark did not insert data');
    }

    const children = Editor.getChildren(editor);

    if (children.length !== lineCount) {
      throw new Error(
        `Expected ${lineCount} DOM fragment blocks, received ${children.length}`
      );
    }

    return {
      applicationBytes: textByteLength(encoded),
      fragmentNodes: fragment.length,
      insertedBlocks: children.length,
      operationCount: getOperationCount(editor) - operationsBefore,
    };
  });
};

const measureFullSelectionCopy = (lineCount, sampleCount) => {
  const children = createFragment(lineCount);
  const selection = fullSelection(children);

  return measureLane(sampleCount, () => {
    const editor = createBenchmarkEditor(children, selection);
    const data = new FakeDataTransfer();

    writeDOMSelectionData(editor, data);

    const applicationPayload = data.getData(
      `application/${DEFAULT_CLIPBOARD_FORMAT_KEY}`
    );
    const textHtml = data.getData('text/html');
    const textPlain = data.getData('text/plain');

    if (!applicationPayload || !textPlain) {
      throw new Error('Model-backed full selection copy produced no payload');
    }

    return {
      applicationBytes: textByteLength(applicationPayload),
      fragmentNodes: children.length,
      textHtmlBytes: textByteLength(textHtml),
      textPlainBytes: textByteLength(textPlain),
    };
  });
};

const measurePopulatedMiddlePlainTextPaste = (
  existingBlockCount,
  lineCount,
  sampleCount
) => {
  const text = createPlainTextPayload(lineCount);

  return measureLane(sampleCount, () => {
    const children = createDocument(existingBlockCount);
    const selection = middleCollapsedSelection(children);
    const editor = createBenchmarkEditor(children, selection);
    const data = new FakeDataTransfer();
    const operationsBefore = getOperationCount(editor);

    data.setData('text/plain', text);

    let inserted = false;

    editor.update(() => {
      inserted = insertDOMTextData(editor, data);
    });

    if (!inserted) {
      throw new Error(
        'Populated plain-text paste benchmark did not insert data'
      );
    }

    const nextChildren = Editor.getChildren(editor);
    const expectedBlockCount = existingBlockCount + lineCount - 1;

    if (nextChildren.length !== expectedBlockCount) {
      throw new Error(
        `Expected ${expectedBlockCount} blocks after populated paste, received ${nextChildren.length}`
      );
    }

    return {
      existingBlockCount,
      insertedBlocks: lineCount,
      nextBlockCount: nextChildren.length,
      operationCount: getOperationCount(editor) - operationsBefore,
      textPlainBytes: textByteLength(text),
    };
  });
};

const measureCutTwoBlocks = (blockCount, sampleCount) =>
  measureLane(sampleCount, () => {
    const children = createDocument(blockCount);
    const selection = twoBlockSelection(children);
    const editor = createBenchmarkEditor(children, selection);
    const data = new FakeDataTransfer();
    const operationsBefore = getOperationCount(editor);

    writeDOMSelectionData(editor, data);
    editor.update(() => {
      getEditorTransformRegistry(editor).delete({ at: selection });
    });

    const nextChildren = Editor.getChildren(editor);

    if (nextChildren.length >= blockCount) {
      throw new Error('Cut benchmark did not remove document content');
    }

    return {
      blockCount,
      nextBlockCount: nextChildren.length,
      operationCount: getOperationCount(editor) - operationsBefore,
      textPlainBytes: textByteLength(data.getData('text/plain')),
    };
  });

const measurePreparedCutTwoBlocks = (
  blockCount,
  sampleCount,
  { includeCopy = false, warmSnapshot = false } = {}
) =>
  measurePreparedLane(
    sampleCount,
    () => {
      const children = createDocument(blockCount);
      const selection = twoBlockSelection(children);
      const editor = createBenchmarkEditor(children, selection);
      const data = new FakeDataTransfer();
      const operationsBefore = getOperationCount(editor);

      if (warmSnapshot) {
        Editor.getSnapshot(editor);
      }

      return { data, editor, operationsBefore, selection };
    },
    ({ data, editor, operationsBefore, selection }) => {
      if (includeCopy) {
        writeDOMSelectionData(editor, data);
      }

      editor.update(() => {
        getEditorTransformRegistry(editor).delete({ at: selection });
      });

      const nextChildren = Editor.getChildren(editor);

      if (nextChildren.length >= blockCount) {
        throw new Error('Cut benchmark did not remove document content');
      }

      return {
        blockCount,
        includeCopy,
        nextBlockCount: nextChildren.length,
        operationCount: getOperationCount(editor) - operationsBefore,
        snapshot: warmSnapshot ? 'warm' : 'cold',
        textPlainBytes: textByteLength(data.getData('text/plain')),
      };
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

const cohortResults = Object.fromEntries(
  cohorts.map(({ lineCount, name }) => {
    const sampleCount = sampleCountFor(lineCount);

    return [
      name,
      {
        lineCount,
        sampleCount,
        fragmentDecodeMs: measureFragmentDecode(lineCount, sampleCount),
        fragmentEncodeMs: measureFragmentEncode(lineCount, sampleCount),
        fragmentInsertMs: measureFragmentInsert(lineCount, sampleCount),
        domFragmentInsertMs: measureDOMFragmentInsert(lineCount, sampleCount),
        fullSelectionCopyMs: measureFullSelectionCopy(lineCount, sampleCount),
        plainTextInsertMs: measurePlainTextInsert(lineCount, sampleCount),
        plainTextSplitMs: measurePlainTextSplit(lineCount, sampleCount),
      },
    ];
  })
);

const pathological = {
  cutTwoBlocksColdEditMs: measurePreparedCutTwoBlocks(
    hugeCutBlocks,
    hugeCutIterations
  ),
  cutTwoBlocksColdSetupMs: measureCutTwoBlocks(
    hugeCutBlocks,
    hugeCutIterations
  ),
  cutTwoBlocksEditMs: measurePreparedCutTwoBlocks(
    hugeCutBlocks,
    hugeCutIterations,
    { warmSnapshot: true }
  ),
  cutTwoBlocksMs: measurePreparedCutTwoBlocks(
    hugeCutBlocks,
    hugeCutIterations,
    { includeCopy: true, warmSnapshot: true }
  ),
};

const issueTargetThresholds = issueTargetsEnabled
  ? {
      cutTwoBlocksEditMsP50: {
        actualMs: pathological.cutTwoBlocksEditMs.p50,
        limitMs: 150,
        passed: pathological.cutTwoBlocksEditMs.p50 < 150,
      },
      cutTwoBlocksMsP50: {
        actualMs: pathological.cutTwoBlocksMs.p50,
        limitMs: 250,
        passed: pathological.cutTwoBlocksMs.p50 < 250,
      },
      operationCount: {
        actual: pathological.cutTwoBlocksEditMs.metadata.operationCount,
        limit: 1,
        passed: pathological.cutTwoBlocksEditMs.metadata.operationCount === 1,
      },
    }
  : undefined;

const summary = {
  benchmark: 'slate-clipboard-large-payload',
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
  cohorts: cohortResults,
  issueTargets: issueTargetsEnabled
    ? {
        largePlainTextPaste10000: measurePlainTextInsert(
          issueTargetStressLines,
          issueTargetIterations
        ),
        populatedFullSelectionCopy10000: measureFullSelectionCopy(
          issueTargetStressLines,
          issueTargetIterations
        ),
        populatedMiddlePlainTextPaste10000Into10000:
          measurePopulatedMiddlePlainTextPaste(
            issueTargetStressLines,
            issueTargetStressLines,
            issueTargetIterations
          ),
      }
    : undefined,
  issueTargetThresholds,
  issuePressure: {
    4056: 'large text paste/copy into populated editor',
    5945: '10,000-line plaintext paste',
    5992: '50,000-block two-node cut',
  },
  pathological,
};

await writeBenchmarkArtifact(
  'tmp/slate-clipboard-large-payload-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
