import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium, firefox, webkit } from '@playwright/test';

const runnerPath = fileURLToPath(import.meta.url);
const repo = resolve(dirname(runnerPath), '../../..');
const artifactPath = resolve(
  repo,
  process.env.PLITE_TEXT_FLOW_ARTIFACT ??
    'tmp/plite-react-text-flow-browser-matrix.json'
);
const tempDir = resolve(repo, 'tmp/plite-react-text-flow-browser-matrix');
const fixtures = (
  process.env.PLITE_TEXT_FLOW_FIXTURES ??
  'plain,oneMark,semanticRuns,sparse,dense,overlap,longLine,customFallback,code'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const cohorts = (process.env.PLITE_TEXT_FLOW_COHORTS ?? '200,2000,10000')
  .split(',')
  .map(Number)
  .filter((value) => Number.isInteger(value) && value > 0);
const surfaces = (
  process.env.PLITE_TEXT_FLOW_SURFACES ?? 'production,legacyFallback'
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const iterations = Number(process.env.PLITE_TEXT_FLOW_ITERATIONS ?? 15);
const warmups = Number(process.env.PLITE_TEXT_FLOW_WARMUPS ?? 3);
const typeOps = Number(process.env.PLITE_TEXT_FLOW_TYPE_OPS ?? 4);
const charsPerLine = Number(process.env.PLITE_TEXT_FLOW_CHARS_PER_LINE ?? 48);
const cellTimeoutMs = Number(
  process.env.PLITE_TEXT_FLOW_CELL_TIMEOUT_MS ?? 20_000
);
const browserName = process.env.PLITE_TEXT_FLOW_BROWSER ?? 'chromium';
const headless = process.env.PLITE_TEXT_FLOW_HEADLESS !== '0';
const strict = process.env.PLITE_TEXT_FLOW_STRICT !== '0';
const captureCPUProfile = process.env.PLITE_TEXT_FLOW_CPU_PROFILE === '1';

const browserTypes = { chromium, firefox, webkit };
const browserType = browserTypes[browserName];

if (!browserType) {
  throw new Error(`Unknown browser ${browserName}`);
}

const modulePaths = {
  plite: resolve(repo, 'packages/plitejs/dist/index.js'),
  pliteReact: resolve(repo, 'packages/plitejs/dist/react/index.js'),
};

const entrySource = String.raw`
import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  createEditor,
  Editable,
  Plite,
  setDOMTextSyncRendererCapability,
} from ${JSON.stringify(modulePaths.pliteReact)}

const app = document.getElementById('app')
const state = {
  editor: null,
  commitChanges: [],
  clearMs: 0,
  editorCreateMs: 0,
  expectedOffset: 0,
  expectedPath: [0, 0],
  expectedText: '',
  fixture: '',
  insertions: [],
  lineCount: 0,
  pliteEvents: [],
  reactEvents: [],
  refresh: null,
  revision: 0,
  root: null,
  settleReadBaseline: 0,
  sourceReadMs: 0,
  sourceReads: 0,
  surface: '',
}
globalThis.__PLITE_REACT_RENDER_PROFILER__ = {
  record: (event) => state.pliteEvents.push(event),
}

const nextPaint = () => new Promise((resolvePromise) => {
  requestAnimationFrame(() => requestAnimationFrame(() => resolvePromise(performance.now())))
})

const lineText = (index, chars) =>
  ('const value_' + String(index).padStart(6, '0') + " = 'payload';")
    .padEnd(chars, 'x')
    .slice(0, chars)

const fixtureText = (lineCount, chars, fixture) => {
  const separator = fixture === 'longLine' ? '' : '\n'
  return Array.from({ length: lineCount }, (_, index) => lineText(index, chars)).join(separator)
}

const decorationFixture = (fixture) =>
  fixture === 'code' ? 'dense' : fixture

const rangesFor = (lineCount, chars, fixture, revision = 0) => {
  const rangeFixture = decorationFixture(fixture)
  const ranges = []
  if (!['sparse', 'dense', 'overlap'].includes(rangeFixture)) return ranges
  const stride = chars + 1
  const step = rangeFixture === 'sparse' ? 10 : 1
  for (let line = 0; line < lineCount; line += step) {
    const base = line * stride
    if (rangeFixture === 'sparse') {
      ranges.push({ className: 'token-' + revision, end: base + 6, key: 's:' + line, start: base })
    } else if (rangeFixture === 'dense') {
      for (let token = 0; token < 4; token += 1) {
        const start = base + token * 10
        ranges.push({ className: 'token-' + revision + '-' + token, end: start + 7, key: 'd:' + line + ':' + token, start })
      }
    } else {
      ranges.push({ className: 'token-' + revision + '-a', end: base + 28, key: 'o:' + line + ':a', start: base })
      ranges.push({ className: 'token-' + revision + '-b', end: base + 38, key: 'o:' + line + ':b', start: base + 8 })
      ranges.push({ className: 'token-' + revision + '-c', end: base + 46, key: 'o:' + line + ':c', start: base + 16 })
    }
  }
  const textLength = fixtureText(lineCount, chars, fixture).length
  return ranges
    .map((range) => ({ ...range, end: Math.min(textLength, range.end), start: Math.min(textLength, range.start) }))
    .filter((range) => range.end > range.start)
}

const currentRanges = (
  lineCount,
  chars,
  fixture,
  revision = 0,
  committedTextLength = fixtureText(lineCount, chars, fixture).length
) => {
  const originalTextLength = fixtureText(lineCount, chars, fixture).length
  const insertedLength = Math.max(0, committedTextLength - originalTextLength)
  const committedInsertions = insertedLength
    ? [{ length: insertedLength, offset: Math.floor(originalTextLength / 2) }]
    : []

  return rangesFor(lineCount, chars, fixture, revision).map((range) => {
    let { end, start } = range

    for (const insertion of committedInsertions) {
      if (insertion.offset <= start) {
        start += insertion.length
        end += insertion.length
      } else if (insertion.offset < end) {
        end += insertion.length
      }
    }

    return { ...range, end, start }
  })
}

const createChildren = (lineCount, chars, fixture) => {
  const text = fixtureText(lineCount, chars, fixture)
  if (fixture === 'oneMark') return [{ bold: true, text }]
  if (fixture !== 'semanticRuns') return [{ text }]
  return Array.from({ length: lineCount }, (_, index) => ({
    ...(index % 2 === 0 ? { bold: true } : {}),
    text: lineText(index, chars) + (index === lineCount - 1 ? '' : '\n'),
  }))
}

const renderElement = ({ attributes, children }) =>
  React.createElement(
    'pre',
    { ...attributes, style: { margin: 0, whiteSpace: 'pre-wrap' } },
    React.createElement('code', null, children)
  )

const SemanticLeaf = ({ attributes, children, leaf }) =>
  React.createElement(
    leaf.bold ? 'strong' : 'span',
    { ...attributes, 'data-text-flow-control': 'semantic' },
    children
  )

const RetainedAwareSemanticLeaf = setDOMTextSyncRendererCapability(
  SemanticLeaf,
  () => true
)
Object.defineProperty(
  RetainedAwareSemanticLeaf,
  Symbol.for('plitejs/react/retained-text-flow-renderer-capability'),
  {
    configurable: false,
    enumerable: false,
    value: ({ marks }) => Object.keys(marks).length === 0,
    writable: false,
  }
)

const CustomLeaf = ({ attributes, children }) =>
  React.createElement(
    'mark',
    { ...attributes, 'data-text-flow-custom-fallback': 'true' },
    children
  )

const clear = () => {
  state.root?.unmount()
  state.root = null
  state.editor = null
  state.refresh = null
  state.reactEvents = []
  app.textContent = ''
}

const getHandle = () => {
  const root = app.querySelector('[data-plite-editor="true"]')
  const handle = root?.__pliteBrowserHandle
  if (!root || !handle) throw new Error('Missing Plite browser handle')
  return { handle, root }
}

const waitForHandle = async () => {
  let paintedFrames = 0

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const root = app.querySelector('[data-plite-editor="true"]')
    const handle = root?.__pliteBrowserHandle

    if (root && handle && paintedFrames >= 2) return { handle, root }
    await new Promise((resolvePromise) => requestAnimationFrame(resolvePromise))
    paintedFrames += 1
  }
  throw new Error('Plite browser handle did not mount')
}

const install = async (surface, lineCount, chars, fixture) => {
  const clearStartedAt = performance.now()
  clear()
  state.clearMs = performance.now() - clearStartedAt
  const shell = document.createElement('div')
  shell.dataset.surface = surface
  shell.style.cssText = 'height:600px;overflow:auto;border:0;outline:0;font:14px/1.35 ui-monospace,monospace'
  app.appendChild(shell)
  const editorCreateStartedAt = performance.now()
  const editor = createEditor({
    initialValue: [{ type: 'code_block', children: createChildren(lineCount, chars, fixture) }],
  })
  state.editorCreateMs = performance.now() - editorCreateStartedAt
  editor.subscribeCommit((commit) => {
    state.commitChanges.push({
      dirtyStateKeys: commit.dirtyStateKeys,
      marks: commit.changed.hasAny('marks'),
      properties: commit.changed.hasAny('properties'),
      replace: commit.changed.hasAny('replace'),
      rootOrder: commit.changed.hasAny('root-order'),
      selection: commit.selectionChanged,
      state: commit.changed.hasAny('state'),
      structure: commit.changed.hasAny('structure'),
      text: commit.changed.hasAny('text'),
      textNodeKeys: commit.changed.nodeKeysAll('text'),
    })
  })
  const root = createRoot(shell)
  const source = {
    id: 'text-flow-benchmark',
    observe: ({ refresh }) => {
      state.refresh = refresh
      return () => { state.refresh = null }
    },
    read: ({ entry: [node, path] }) => {
      const readStartedAt = performance.now()
      state.sourceReads += 1
      if (typeof node?.text !== 'string' || path.length !== 2) return []
      const ranges = currentRanges(
        lineCount,
        chars,
        fixture,
        state.revision,
        node.text.length
      ).map((range) => ({
        attributes: { className: range.className, 'data-token': range.key },
        key: range.key,
        range: {
          anchor: { path, offset: range.start },
          focus: { path, offset: range.end },
        },
      }))
      state.sourceReadMs += performance.now() - readStartedAt

      return ranges
    },
  }
  const markedFixture = fixture === 'oneMark' || fixture === 'semanticRuns'
  const renderLeaf = fixture === 'customFallback'
    ? CustomLeaf
    : markedFixture
      ? surface === 'legacyFallback'
        ? SemanticLeaf
        : RetainedAwareSemanticLeaf
      : surface === 'legacyFallback'
        ? SemanticLeaf
        : undefined

  state.editor = editor
  state.commitChanges = []
  state.fixture = fixture
  state.insertions = []
  state.lineCount = lineCount
  state.pliteEvents = []
  state.reactEvents = []
  state.revision = 0
  state.root = root
  state.sourceReads = 0
  state.sourceReadMs = 0
  state.surface = surface

  root.render(
    React.createElement(
      React.Profiler,
      {
        id: 'plite-text-flow',
        onRender: (id, phase, actualDuration, baseDuration) =>
          state.reactEvents.push({ actualDuration, baseDuration, id, phase }),
      },
      React.createElement(
        Plite,
        { decorations: rangesFor(lineCount, chars, fixture).length ? [source] : [], editor },
        React.createElement(Editable, {
          domStrategy: 'auto',
          renderElement,
          renderLeaf,
          spellCheck: false,
        })
      )
    )
  )
  const { handle } = await waitForHandle()
  state.expectedText = fixtureText(lineCount, chars, fixture)
  if (handle.getText() !== state.expectedText) {
    throw new Error('Initial model text does not match the fixture')
  }
}

const selectMiddle = async (lineCount, chars, fixture) => {
  const { handle, root } = getHandle()
  const text = handle.getText()
  const semantic = fixture === 'semanticRuns'
  const lineIndex = Math.floor(lineCount / 2)
  const target = semantic
    ? Math.min(chars, 12)
    : Math.floor(text.length / 2)
  const path = semantic ? [0, lineIndex] : [0, 0]
  const selection = { anchor: { path, offset: target }, focus: { path, offset: target } }
  handle.selectRange(selection)
  root.focus({ preventScroll: true })
  if (!handle.setNativeDOMSelection(selection)) throw new Error('Plite DOM selection failed')
  handle.importDOMSelection?.()
  state.expectedOffset = target
  state.expectedPath = path
  await nextPaint()
}

const prepareInput = (text) => {
  const absoluteOffset = state.fixture === 'semanticRuns'
    ? Array.from({ length: state.expectedPath[1] }, (_, index) =>
        lineText(index, ${charsPerLine}).length + 1
      ).reduce((sum, value) => sum + value, 0) + state.expectedOffset
    : state.expectedOffset
  state.insertions.push({ length: text.length, offset: absoluteOffset })
  state.expectedText =
    state.expectedText.slice(0, absoluteOffset) + text + state.expectedText.slice(absoluteOffset)
  state.expectedOffset += text.length
  state.settleReadBaseline = state.sourceReads
}

const waitForDecorationSettle = async () => {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    if (state.sourceReads > state.settleReadBaseline) return nextPaint()
    await new Promise((resolvePromise) => requestAnimationFrame(resolvePromise))
  }
  throw new Error('Decoration source did not settle after native input')
}

const assertState = async () => {
  const { handle } = getHandle()
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const selection = handle.getSelection()
    const textMatches = handle.getText() === state.expectedText
    const selectionMatches =
      selection?.anchor?.offset === state.expectedOffset &&
      selection?.focus?.offset === state.expectedOffset &&
      selection?.anchor?.path?.join(',') === state.expectedPath.join(',') &&
      selection?.focus?.path?.join(',') === state.expectedPath.join(',')
    if (textMatches && selectionMatches) return performance.now()
    await new Promise((resolvePromise) => requestAnimationFrame(resolvePromise))
  }
  throw new Error('Model text or selection did not reach the expected state')
}

const refreshDecorations = async () => {
  state.revision += 1
  state.reactEvents = []
  state.sourceReads = 0
  const start = performance.now()
  state.refresh?.({ nodeKeys: 'all' })
  await nextPaint()
  return performance.now() - start
}

const snapshot = () => {
  const { handle, root } = getHandle()
  const modelText = handle.getText()
  const content = root
  const domText = content.textContent ?? ''
  const flow = content.querySelector('[data-plite-text-flow="true"]')
  const semanticElements = Array.from(
    content.querySelectorAll('a,b,code,em,i,mark,s,strong,sub,sup,u')
  )
  const semanticHash = (value) => {
    let hash = 2166136261

    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index)
      hash = Math.imul(hash, 16777619)
    }

    return (hash >>> 0).toString(16)
  }
  const semanticSignature = semanticElements
    .map((element) => {
      const text = element.textContent ?? ''

      return [element.tagName, element.className, text.length, semanticHash(text)].join(':')
    })
    .join('|')
  const strongElements = Array.from(content.querySelectorAll('strong'))
  let domTextNodes = 0
  let domTotalNodes = 0
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_ALL)
  while (walker.nextNode()) {
    domTotalNodes += 1
    if (walker.currentNode.nodeType === Node.TEXT_NODE) domTextNodes += 1
  }
  const pliteEventCounts = {}
  for (const event of state.pliteEvents) {
    const key = event.id ? event.kind + ':' + event.id : event.kind
    pliteEventCounts[key] = (pliteEventCounts[key] ?? 0) + 1
  }
  return {
    clearMs: state.clearMs,
    customFallbackElements: content.querySelectorAll('[data-text-flow-custom-fallback]').length,
    commitChanges: state.commitChanges,
    domCoverageRatio: modelText.length ? domText.length / modelText.length : 1,
    domElements: content.querySelectorAll('*').length,
    domTextLength: domText.length,
    domTextNodes,
    domTotalNodes,
    heapMB: performance.memory?.usedJSHeapSize
      ? performance.memory.usedJSHeapSize / 1024 / 1024
      : 0,
    editorCreateMs: state.editorCreateMs,
    modelSelection: handle.getSelection(),
    modelTextLength: modelText.length,
    pliteEventCounts,
    flowBoundaryVisits: Number(flow?.getAttribute('data-plite-text-flow-boundary-visits') ?? 0),
    flowCreatedSegments: Number(flow?.getAttribute('data-plite-text-flow-created-segments') ?? 0),
    flowDeferredTextChangeCount: Number(flow?.getAttribute('data-plite-text-flow-deferred-text-change-count') ?? 0),
    flowDeferredTextChanges: Number(flow?.getAttribute('data-plite-text-flow-deferred-text-changes') ?? 0),
    flowIncrementalTextChanges: Number(flow?.getAttribute('data-plite-text-flow-incremental-text-changes') ?? 0),
    flowIncrementalTextChangeCount: Number(flow?.getAttribute('data-plite-text-flow-incremental-text-change-count') ?? 0),
    flowRecords: Number(flow?.getAttribute('data-plite-text-flow-records') ?? 0),
    flowReconcileCount: Number(flow?.getAttribute('data-plite-text-flow-reconcile-count') ?? 0),
    flowReconcileMs: Number(flow?.getAttribute('data-plite-text-flow-reconcile-ms') ?? 0),
    flowRemovedSegments: Number(flow?.getAttribute('data-plite-text-flow-removed-segments') ?? 0),
    flowRebuildCount: Number(flow?.getAttribute('data-plite-text-flow-rebuild-count') ?? 0),
    flowReusedSegments: Number(flow?.getAttribute('data-plite-text-flow-reused-segments') ?? 0),
    flowSegments: Number(flow?.getAttribute('data-plite-text-flow-segments') ?? 0),
    reactActualDurationMs: state.reactEvents.reduce((sum, event) => sum + event.actualDuration, 0),
    reactCommitCount: state.reactEvents.length,
    sourceReads: state.sourceReads,
    sourceReadMs: state.sourceReadMs,
    semanticSignature,
    strongElements: strongElements.length,
    strongTextLength: strongElements.reduce(
      (length, element) => length + (element.textContent?.length ?? 0),
      0
    ),
    textHosts: content.querySelectorAll('[data-plite-node="text"]').length,
    tokenElements: content.querySelectorAll('[data-token]').length,
  }
}

globalThis.__PLITE_TEXT_FLOW__ = {
  assertState,
  install,
  nextPaint,
  prepareInput,
  refreshDecorations,
  selectMiddle,
  snapshot,
  waitForDecorationSettle,
}
globalThis.__PLITE_TEXT_FLOW_READY__ = true
`;

const html = (
  bundle
) => `<!doctype html><html><head><meta charset="utf-8"><style>
html,body,#app{margin:0;padding:0}pre{margin:0;white-space:pre-wrap}
</style></head><body><div id="app"></div><script type="module">${bundle.replaceAll('</script', '<\\/script')}</script></body></html>`;

const run = async (command, args, cwd, env = {}) => {
  const child = Bun.spawn([command, ...args], {
    cwd,
    env: { ...process.env, ...env },
    stderr: 'pipe',
    stdout: 'pipe',
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed\n${stdout}\n${stderr}`
    );
  }
};

const percentile = (values, ratio) => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[
    Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)
  ];
};
const round = (value) => Math.round(value * 100) / 100;
const summarize = (values) => ({
  max: round(Math.max(...values)),
  p50: round(percentile(values, 0.5)),
  p75: round(percentile(values, 0.75)),
  p95: round(percentile(values, 0.95)),
  samples: values.map(round),
});
const summarizeCPUProfile = (profile) => {
  const nodesById = new Map(profile.nodes.map((node) => [node.id, node]));
  const parentById = new Map();
  const selfTimeByFrame = new Map();
  const totalTimeByFrame = new Map();

  for (const node of profile.nodes) {
    for (const childId of node.children ?? []) parentById.set(childId, node.id);
  }

  const frameKey = (frame) =>
    [frame.functionName || '(anonymous)', frame.url, frame.lineNumber].join(
      '|'
    );

  for (let index = 0; index < profile.samples.length; index += 1) {
    const sampledNodeId = profile.samples[index];
    const frame = nodesById.get(sampledNodeId)?.callFrame;

    if (!frame) continue;
    const sampleMs = (profile.timeDeltas[index] ?? 0) / 1000;
    const key = frameKey(frame);

    selfTimeByFrame.set(key, (selfTimeByFrame.get(key) ?? 0) + sampleMs);
    const visitedFrames = new Set();
    let currentNodeId = sampledNodeId;

    while (currentNodeId !== undefined) {
      const currentFrame = nodesById.get(currentNodeId)?.callFrame;

      if (currentFrame) {
        const currentKey = frameKey(currentFrame);

        if (!visitedFrames.has(currentKey)) {
          visitedFrames.add(currentKey);
          totalTimeByFrame.set(
            currentKey,
            (totalTimeByFrame.get(currentKey) ?? 0) + sampleMs
          );
        }
      }
      currentNodeId = parentById.get(currentNodeId);
    }
  }

  return Array.from(totalTimeByFrame, ([key, totalMs]) => {
    const [functionName, url, lineNumber] = key.split('|');

    return {
      functionName,
      lineNumber: Number(lineNumber),
      selfMs: round(selfTimeByFrame.get(key) ?? 0),
      totalMs: round(totalMs),
      url,
    };
  })
    .sort((left, right) => right.totalMs - left.totalMs)
    .slice(0, 100);
};
const hashFiles = async (paths) => {
  const hash = createHash('sha256');

  for (const path of [...paths].sort((left, right) =>
    left.localeCompare(right)
  )) {
    hash
      .update(path)
      .update('\0')
      .update(await readFile(path))
      .update('\0');
  }

  return hash.digest('hex');
};

const stressBudgets = {
  code: { mount: 204, refresh: 80, settle: 600, type: 475 },
  dense: { mount: 200, refresh: 67.5, type: 137.7 },
  longLine: { mount: 51, type: 35.4 },
  oneMark: { mount: 64.35, type: 49.5 },
  overlap: { mount: 200, refresh: 98.1, type: 131.55 },
  plain: { mount: 63.15, type: 49.5 },
  semanticRuns: { mount: 74.7, type: 42 },
  sparse: { mount: 61.5, refresh: 22.2, type: 36.9 },
};
const normalBaselines = {
  dense: { mount: 57.9, refresh: 35.6, select: 31.6, type: 99.3 },
  longLine: { mount: 33.1, select: 32.7, type: 16.3 },
  oneMark: { mount: 33.6, select: 32.8, type: 16.3 },
  plain: { mount: 33.1, select: 32.4, type: 16.1 },
  semanticRuns: { mount: 49.7, select: 32.6, type: 16.2 },
  sparse: { mount: 33, refresh: 16.3, select: 33.1, type: 24.3 },
};
const normalLimit = (baseline) => baseline + Math.max(10, baseline * 0.25);
const matchedControlLimit = (baseline) =>
  baseline + Math.max(1, baseline * 0.1);
const outputMatchedControlFixtures = new Set(['oneMark', 'semanticRuns']);

await run('pnpm', ['--filter', 'plitejs', 'build'], repo);
for (const [name, path] of Object.entries(modulePaths)) {
  if (!existsSync(path)) throw new Error(`Missing ${name} build: ${path}`);
}
await rm(tempDir, { force: true, recursive: true });
await mkdir(tempDir, { recursive: true });
const entryPath = resolve(tempDir, 'entry.mjs');
const bundlePath = resolve(tempDir, 'bundle.js');
await writeFile(entryPath, entrySource);
await run(
  'bun',
  [
    'build',
    entryPath,
    '--target=browser',
    '--format=esm',
    '--outfile',
    bundlePath,
  ],
  resolve(repo, 'apps/www'),
  { NODE_ENV: 'production' }
);
const bundle = await readFile(bundlePath, 'utf-8');
const browser = await browserType.launch({
  args: browserName === 'chromium' ? ['--enable-precise-memory-info'] : [],
  headless,
});
const results = {};

const createCellAccumulator = () => ({
  cpuProfileTop: null,
  mountCPUProfileTop: null,
  mountSamples: [],
  refreshCPUProfileTop: null,
  refreshSamples: [],
  selectSamples: [],
  settleSamples: [],
  snapshots: [],
  typeSamples: [],
});

const summarizeCell = (accumulator) => ({
  cpuProfileTop: accumulator.cpuProfileTop,
  mountCPUProfileTop: accumulator.mountCPUProfileTop,
  mountToPaintMs: summarize(accumulator.mountSamples),
  refreshCPUProfileTop: accumulator.refreshCPUProfileTop,
  refreshToPaintMs:
    accumulator.refreshSamples.length > 0
      ? summarize(accumulator.refreshSamples)
      : null,
  selectToPaintMs: summarize(accumulator.selectSamples),
  settleToPaintMs:
    accumulator.settleSamples.length > 0
      ? summarize(accumulator.settleSamples)
      : null,
  snapshots: accumulator.snapshots,
  status: 'complete',
  typeToPaintMs: summarize(accumulator.typeSamples),
});

const measureCells = async ({ fixture, lineCount }) => {
  const page = await browser.newPage({
    viewport: { height: 720, width: 1280 },
  });
  let timedOut = false;
  let timeout;

  const measurement = async () => {
    await page.setContent(html(bundle), { waitUntil: 'load' });
    await page.waitForFunction(() => globalThis.__PLITE_TEXT_FLOW_READY__);
    const accumulators = Object.fromEntries(
      surfaces.map((surface) => [surface, createCellAccumulator()])
    );
    const sampleCount = warmups + iterations;

    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
      const orderedSurfaces =
        sampleIndex % 2 === 0 ? surfaces : [...surfaces].reverse();

      for (const surface of orderedSurfaces) {
        const accumulator = accumulators[surface];
        const profileSample = sampleIndex === sampleCount - 1;
        const mountCPUSession =
          captureCPUProfile && browserName === 'chromium' && profileSample
            ? await page.context().newCDPSession(page)
            : null;

        if (mountCPUSession) {
          await mountCPUSession.send('Profiler.enable');
          await mountCPUSession.send('Profiler.start');
        }
        const mountStart = await page.evaluate(() => performance.now());

        await page.evaluate(
          ({
            chars,
            fixture: selectedFixture,
            lineCount: lines,
            surface: selectedSurface,
          }) =>
            globalThis.__PLITE_TEXT_FLOW__.install(
              selectedSurface,
              lines,
              chars,
              selectedFixture
            ),
          { chars: charsPerLine, fixture, lineCount, surface }
        );
        const mountEnd = await page.evaluate(() => performance.now());

        if (mountCPUSession) {
          const { profile } = await mountCPUSession.send('Profiler.stop');

          accumulator.mountCPUProfileTop = summarizeCPUProfile(profile);
          await mountCPUSession.detach();
        }
        const mounted = await page.evaluate(() =>
          globalThis.__PLITE_TEXT_FLOW__.snapshot()
        );
        const hasDecorations = ['sparse', 'dense', 'overlap', 'code'].includes(
          fixture
        );
        const refreshCPUSession =
          captureCPUProfile &&
          hasDecorations &&
          browserName === 'chromium' &&
          profileSample
            ? await page.context().newCDPSession(page)
            : null;

        if (refreshCPUSession) {
          await refreshCPUSession.send('Profiler.enable');
          await refreshCPUSession.send('Profiler.start');
        }
        const refreshMs = hasDecorations
          ? await page.evaluate(() =>
              globalThis.__PLITE_TEXT_FLOW__.refreshDecorations()
            )
          : 0;

        if (refreshCPUSession) {
          const { profile } = await refreshCPUSession.send('Profiler.stop');

          accumulator.refreshCPUProfileTop = summarizeCPUProfile(profile);
          await refreshCPUSession.detach();
        }
        const selectStart = await page.evaluate(() => performance.now());

        await page.evaluate(
          ({ chars, fixture: selectedFixture, lineCount: lines }) =>
            globalThis.__PLITE_TEXT_FLOW__.selectMiddle(
              lines,
              chars,
              selectedFixture
            ),
          { chars: charsPerLine, fixture, lineCount }
        );
        const selectEnd = await page.evaluate(() => performance.now());
        const inserted = fixture === 'code' ? 'abcde' : 'X';
        const cpuSession =
          captureCPUProfile && browserName === 'chromium' && profileSample
            ? await page.context().newCDPSession(page)
            : null;

        if (cpuSession) {
          await cpuSession.send('Profiler.enable');
          await cpuSession.send('Profiler.start');
        }

        for (let operation = 0; operation < typeOps; operation += 1) {
          await page.evaluate(
            (text) => globalThis.__PLITE_TEXT_FLOW__.prepareInput(text),
            inserted
          );
          const typeStart = await page.evaluate(() => performance.now());

          await page.keyboard.type(inserted);
          await page.evaluate(() =>
            globalThis.__PLITE_TEXT_FLOW__.assertState()
          );
          const typeEnd = await page.evaluate(() =>
            globalThis.__PLITE_TEXT_FLOW__.nextPaint()
          );
          const settleEnd = hasDecorations
            ? await page.evaluate(() =>
                globalThis.__PLITE_TEXT_FLOW__.waitForDecorationSettle()
              )
            : typeEnd;

          if (sampleIndex >= warmups) {
            accumulator.typeSamples.push(typeEnd - typeStart);
            if (hasDecorations) {
              accumulator.settleSamples.push(settleEnd - typeStart);
            }
          }
        }
        if (cpuSession) {
          const { profile } = await cpuSession.send('Profiler.stop');

          accumulator.cpuProfileTop = summarizeCPUProfile(profile);
          await cpuSession.detach();
        }

        if (sampleIndex >= warmups) {
          accumulator.mountSamples.push(mountEnd - mountStart);
          if (refreshMs > 0) accumulator.refreshSamples.push(refreshMs);
          accumulator.selectSamples.push(selectEnd - selectStart);
          accumulator.snapshots.push({
            mounted,
            typed: await page.evaluate(() =>
              globalThis.__PLITE_TEXT_FLOW__.snapshot()
            ),
          });
        }
      }
    }

    return Object.fromEntries(
      surfaces.map((surface) => [surface, summarizeCell(accumulators[surface])])
    );
  };

  try {
    const groupTimeoutMs = cellTimeoutMs * surfaces.length;
    const timeoutPromise = new Promise((_resolve, reject) => {
      timeout = setTimeout(() => {
        timedOut = true;
        void page.close().catch(() => {});
        reject(new Error(`cell group exceeded ${groupTimeoutMs}ms`));
      }, groupTimeoutMs);
    });

    return await Promise.race([measurement(), timeoutPromise]);
  } catch (error) {
    return Object.fromEntries(
      surfaces.map((surface) => [
        surface,
        {
          error: error instanceof Error ? error.message : String(error),
          status: timedOut ? 'timeout' : 'error',
        },
      ])
    );
  } finally {
    clearTimeout(timeout);
    await page.close().catch(() => {});
  }
};

try {
  for (const fixture of fixtures) {
    results[fixture] = {};

    for (const lineCount of cohorts) {
      process.stdout.write(
        `Measuring ${fixture} ${lineCount} ${surfaces.join(' / ')}\n`
      );
      results[fixture][lineCount] = await measureCells({ fixture, lineCount });
      await mkdir(dirname(artifactPath), { recursive: true });
      await writeFile(
        artifactPath,
        `${JSON.stringify({ partial: true, results }, null, 2)}\n`
      );
    }
  }
} finally {
  await browser.close();
}

const failures = [];
const budgetRatios = [];
const matchedControlComparisons = [];

for (const fixture of fixtures) {
  for (const lineCount of cohorts) {
    const row = results[fixture]?.[lineCount]?.production;

    if (!row) continue;
    if (row.status !== 'complete') {
      failures.push(`${fixture}/${lineCount}: ${row.status}`);
      budgetRatios.push(999);
      continue;
    }

    for (const snapshot of row.snapshots) {
      for (const phase of ['mounted', 'typed']) {
        if (Math.abs(snapshot[phase].domCoverageRatio - 1) > 0.000001) {
          failures.push(`${fixture}/${lineCount}: ${phase} DOM coverage`);
        }
        if (
          fixture === 'oneMark' &&
          (snapshot[phase].strongElements !== 1 ||
            snapshot[phase].strongTextLength !==
              snapshot[phase].modelTextLength)
        ) {
          failures.push(`${fixture}/${lineCount}: ${phase} mark semantics`);
        }
        if (
          fixture === 'semanticRuns' &&
          snapshot[phase].strongElements !== Math.ceil(lineCount / 2)
        ) {
          failures.push(
            `${fixture}/${lineCount}: ${phase} mixed-mark semantics`
          );
        }
      }
    }
    if (
      fixture === 'customFallback' &&
      row.snapshots.some(
        ({ mounted, typed }) =>
          mounted.customFallbackElements === 0 ||
          typed.customFallbackElements === 0
      )
    ) {
      failures.push(`${fixture}/${lineCount}: custom fallback missing`);
    }
    const control = results[fixture]?.[lineCount]?.legacyFallback;

    if (control?.status === 'complete') {
      for (let index = 0; index < row.snapshots.length; index += 1) {
        const productionSnapshot = row.snapshots[index];
        const controlSnapshot = control.snapshots[index];

        for (const phase of ['mounted', 'typed']) {
          if (
            productionSnapshot[phase].semanticSignature !==
              controlSnapshot?.[phase]?.semanticSignature ||
            productionSnapshot[phase].modelTextLength !==
              controlSnapshot?.[phase]?.modelTextLength
          ) {
            failures.push(
              `${fixture}/${lineCount}: ${phase} rendered parity sample ${index}`
            );
          }
        }
      }
      for (const metric of [
        'mountToPaintMs',
        'selectToPaintMs',
        'typeToPaintMs',
      ]) {
        matchedControlComparisons.push({
          cohort: lineCount,
          controlP95: control[metric].p95,
          fixture,
          metric,
          productionP95: row[metric].p95,
          ratioToTolerance:
            row[metric].p95 / matchedControlLimit(control[metric].p95),
        });
      }
      if (row.refreshToPaintMs && control.refreshToPaintMs) {
        matchedControlComparisons.push({
          cohort: lineCount,
          controlP95: control.refreshToPaintMs.p95,
          fixture,
          metric: 'refreshToPaintMs',
          productionP95: row.refreshToPaintMs.p95,
          ratioToTolerance:
            row.refreshToPaintMs.p95 /
            matchedControlLimit(control.refreshToPaintMs.p95),
        });
      }
    } else if (outputMatchedControlFixtures.has(fixture)) {
      failures.push(`${fixture}/${lineCount}: missing output-matched control`);
    }

    const absoluteBudget = fixture === 'code' ? 475 : 200;
    const absoluteMountBudget = fixture === 'code' ? 204 : 200;

    budgetRatios.push(row.typeToPaintMs.p95 / absoluteBudget);
    if (!outputMatchedControlFixtures.has(fixture)) {
      budgetRatios.push(row.mountToPaintMs.p95 / absoluteMountBudget);
    }
    if (row.refreshToPaintMs) {
      budgetRatios.push(row.refreshToPaintMs.p95 / 200);
    }

    if (
      lineCount === 200 &&
      normalBaselines[fixture] &&
      !outputMatchedControlFixtures.has(fixture)
    ) {
      const baseline = normalBaselines[fixture];
      budgetRatios.push(
        row.mountToPaintMs.p95 / normalLimit(baseline.mount),
        row.selectToPaintMs.p95 / normalLimit(baseline.select),
        row.typeToPaintMs.p95 / normalLimit(baseline.type)
      );
      if (baseline.refresh && row.refreshToPaintMs) {
        budgetRatios.push(
          row.refreshToPaintMs.p95 / normalLimit(baseline.refresh)
        );
      }
    }

    if (
      lineCount === 10_000 &&
      stressBudgets[fixture] &&
      !outputMatchedControlFixtures.has(fixture)
    ) {
      const budget = stressBudgets[fixture];
      budgetRatios.push(
        row.mountToPaintMs.p95 / budget.mount,
        row.typeToPaintMs.p95 / budget.type
      );
      if (budget.refresh && row.refreshToPaintMs) {
        budgetRatios.push(row.refreshToPaintMs.p95 / budget.refresh);
      }
      if (budget.settle && row.settleToPaintMs) {
        budgetRatios.push(row.settleToPaintMs.p95 / budget.settle);
      }
    }
  }
}

const maxBudgetRatio = budgetRatios.length ? Math.max(...budgetRatios) : 999;
const receipt = {
  artifactVersion: 2,
  budgets: {
    matchedControlTolerance: 'max(1ms, 10%)',
    normalBaselines,
    outputMatchedControlFixtures: [...outputMatchedControlFixtures],
    stressBudgets,
  },
  config: {
    browser: browserName,
    captureCPUProfile,
    cellTimeoutMs,
    charsPerLine,
    cohorts,
    discardedWarmups: warmups,
    fixtures,
    headless,
    iterations,
    strict,
    surfaces,
    typeOps,
    warmups,
  },
  evaluation: {
    failures,
    matchedControlComparisons,
    maxMatchedControlRatio: round(
      matchedControlComparisons.length
        ? Math.max(
            ...matchedControlComparisons.map(
              ({ ratioToTolerance }) => ratioToTolerance
            )
          )
        : 0
    ),
    maxBudgetRatio: round(maxBudgetRatio),
    pass: failures.length === 0 && maxBudgetRatio <= 1,
  },
  results,
  sourceIdentities: {
    buildSha256: await hashFiles([modulePaths.plite, modulePaths.pliteReact]),
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repo,
      encoding: 'utf-8',
    }).trim(),
    runner: {
      path: runnerPath,
      sha256: await hashFiles([runnerPath]),
    },
  },
};

await writeFile(artifactPath, `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(
  `METRIC plite_react_text_flow_max_budget_ratio=${round(maxBudgetRatio)}\n`
);
process.stdout.write(`ARTIFACT ${artifactPath}\n`);

if (strict && !receipt.evaluation.pass) {
  process.stderr.write(
    `Text-flow matrix failed: ${failures.join(', ') || `budget ratio ${round(maxBudgetRatio)}`}\n`
  );
  process.exitCode = 1;
}
