import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const runnerPath = fileURLToPath(import.meta.url);
const repo = resolve(dirname(runnerPath), '../../..');
const artifactPath = resolve(
  repo,
  process.env.PLATE_CODE_BLOCK_ARTIFACT ??
    'tmp/plate-code-block-text-flow-browser.json'
);
const referencePath = resolve(
  repo,
  'benchmarks/editor/test/fixtures/dense-code-shaped-prosemirror-wordgard.json'
);
const tempDir = resolve(tmpdir(), 'plate-code-block-text-flow-browser');
const lineCount = Number(process.env.PLATE_CODE_BLOCK_LINES ?? 10_000);
const charsPerLine = Number(process.env.PLATE_CODE_BLOCK_CHARS_PER_LINE ?? 48);
const iterations = Number(process.env.PLATE_CODE_BLOCK_ITERATIONS ?? 5);
const typeOps = Number(process.env.PLATE_CODE_BLOCK_TYPE_OPS ?? 4);
const insertedText = process.env.PLATE_CODE_BLOCK_INSERTED_TEXT ?? 'abcde';
const fixtureKind = process.env.PLATE_CODE_BLOCK_FIXTURE ?? 'synthetic';
const language = process.env.PLATE_CODE_BLOCK_LANGUAGE ?? 'javascript';
const reactEnvironment = process.env.PLATE_CODE_BLOCK_REACT_ENV ?? 'production';
const strict = process.env.PLATE_CODE_BLOCK_STRICT !== '0';
const captureCPUProfile = process.env.PLATE_CODE_BLOCK_CPU_PROFILE === '1';
const captureTrace = process.env.PLATE_CODE_BLOCK_TRACE === '1';

const modulePaths = {
  lowlight: realpathSync(
    resolve(repo, 'apps/www/node_modules/lowlight/index.js')
  ),
  plateReact: resolve(repo, 'packages/platejs/dist/react/index.js'),
  react: realpathSync(resolve(repo, 'node_modules/react/index.js')),
  reactDomClient: realpathSync(
    resolve(repo, 'node_modules/react-dom/client.js')
  ),
};

if (!existsSync(referencePath)) {
  throw new Error(`Missing ProseMirror/Wordgard reference: ${referencePath}`);
}

const entrySource = String.raw`
import React from ${JSON.stringify(modulePaths.react)}
import { createRoot } from ${JSON.stringify(modulePaths.reactDomClient)}
import {
  CodeBlockPlugin,
  CodeHighlightPlugin,
  createEditor,
  Plate,
  PlateContent,
} from ${JSON.stringify(modulePaths.plateReact)}
import { all, createLowlight } from ${JSON.stringify(modulePaths.lowlight)}

const app = document.getElementById('app')
const rawLowlight = createLowlight(all)
const state = {
  editor: null,
  expectedOffset: 0,
  expectedText: '',
  highlightCalls: [],
  reactEvents: [],
  root: null,
}

const measureHighlight = (kind, value, run) => {
  const startedAt = performance.now()
  const result = run()
  state.highlightCalls.push({
    durationMs: performance.now() - startedAt,
    kind,
    textLength: value.length,
  })
  return result
}

const lowlight = {
  highlight: (language, value, options) =>
    measureHighlight('highlight', value, () =>
      rawLowlight.highlight(language, value, options)
    ),
  highlightAuto: (value, options) =>
    measureHighlight('highlightAuto', value, () =>
      rawLowlight.highlightAuto(value, options)
    ),
  listLanguages: () => rawLowlight.listLanguages(),
  register: (...args) => rawLowlight.register(...args),
  registerAlias: (...args) => rawLowlight.registerAlias(...args),
  registered: (...args) => rawLowlight.registered(...args),
}

const nextPaint = () =>
  new Promise((resolvePromise) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolvePromise(performance.now()))
    })
  })

const lineText = (index, chars) => {
  if (${JSON.stringify(fixtureKind)} === 'product') {
    return (
      'const result' +
      String(index + 1).padStart(5, '0') +
      ' = transform(source[' +
      index +
      ']);'
    )
  }

  return ('const value_' + String(index).padStart(6, '0') + " = 'payload';")
    .padEnd(chars, 'x')
    .slice(0, chars)
}

const fixtureText = (lines, chars) =>
  Array.from({ length: lines }, (_, index) => lineText(index, chars)).join('\n')

const CodeElement = ({ attributes, children }) =>
  React.createElement(
    'pre',
    { ...attributes, style: { margin: 0, whiteSpace: 'pre-wrap' } },
    React.createElement('code', null, children)
  )

const plugins = [
  CodeBlockPlugin.configure({ component: CodeElement }),
  CodeHighlightPlugin.configure({ initialState: { lowlight } }),
]

const clear = () => {
  state.root?.unmount()
  state.root = null
  state.editor = null
  state.reactEvents = []
  app.textContent = ''
}

const getHandle = () => {
  const root = app.querySelector('[data-plite-editor="true"]')
  const handle = root?.__pliteBrowserHandle

  if (!root || !handle) throw new Error('Missing Plate browser handle')

  return { handle, root }
}

const waitForMount = async () => {
  let paintedFrames = 0

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const root = app.querySelector('[data-plite-editor="true"]')
    const handle = root?.__pliteBrowserHandle

    if (root && handle && state.highlightCalls.length > 0 && paintedFrames >= 2) {
      return { handle, root }
    }
    await new Promise((resolvePromise) => requestAnimationFrame(resolvePromise))
    paintedFrames += 1
  }

  throw new Error(
    'Plate code block did not mount: ' +
      JSON.stringify({
        editorRoots: document.querySelectorAll('[contenteditable="true"]').length,
        highlightCalls: state.highlightCalls.length,
        html: app.innerHTML.slice(0, 500),
        pliteRoots: document.querySelectorAll('[data-plite-editor="true"]').length,
      })
  )
}

const install = async () => {
  clear()
  state.highlightCalls = []
  const text = fixtureText(${lineCount}, ${charsPerLine})
  const editor = createEditor({
    plugins,
    initialValue: [
      {
        children: [{ text }],
        language: ${JSON.stringify(language)},
        type: 'codeBlock',
      },
    ],
  })
  const shell = document.createElement('div')
  shell.style.cssText =
    'height:600px;overflow:auto;border:0;outline:0;font:14px/1.35 ui-monospace,monospace'
  app.appendChild(shell)
  const root = createRoot(shell)

  state.editor = editor
  state.expectedText = text
  state.reactEvents = []
  state.root = root
  root.render(
    React.createElement(
      React.Profiler,
      {
        id: 'plate-code-block-text-flow',
        onRender: (id, phase, actualDuration, baseDuration) =>
          state.reactEvents.push({ actualDuration, baseDuration, id, phase }),
      },
      React.createElement(
        Plate,
        { editor, suppressInstanceWarning: true },
        React.createElement(PlateContent, {
          disableDefaultStyles: true,
          spellCheck: false,
        })
      )
    )
  )

  const { handle } = await waitForMount()

  if (handle.getText() !== text) {
    throw new Error('Initial model text does not match the code fixture')
  }
}

const selectMiddle = async () => {
  const { handle, root } = getHandle()
  const offset = Math.floor(state.expectedText.length / 2)
  const selection = {
    anchor: { offset, path: [0, 0] },
    focus: { offset, path: [0, 0] },
  }

  handle.selectRange(selection)
  root.focus({ preventScroll: true })
  if (!handle.setNativeDOMSelection(selection)) {
    throw new Error('Plate DOM selection failed')
  }
  handle.importDOMSelection?.()
  state.expectedOffset = offset
  await nextPaint()
}

const prepareInput = (text) => {
  state.expectedText =
    state.expectedText.slice(0, state.expectedOffset) +
    text +
    state.expectedText.slice(state.expectedOffset)
  state.expectedOffset += text.length
}

const assertState = async () => {
  const { handle } = getHandle()

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const selection = handle.getSelection()
    const textMatches = handle.getText() === state.expectedText
    const selectionMatches =
      selection?.anchor?.offset === state.expectedOffset &&
      selection?.focus?.offset === state.expectedOffset &&
      selection?.anchor?.path?.join(',') === '0,0' &&
      selection?.focus?.path?.join(',') === '0,0'

    if (textMatches && selectionMatches) return
    await new Promise((resolvePromise) => requestAnimationFrame(resolvePromise))
  }

  throw new Error('Model text or selection did not reach the expected state')
}

const waitForHighlight = async (baseline) => {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    if (state.highlightCalls.length > baseline) return nextPaint()
    await new Promise((resolvePromise) => requestAnimationFrame(resolvePromise))
  }

  throw new Error('Lowlight did not settle after native input')
}

const snapshot = () => {
  const { handle, root } = getHandle()
  const modelText = handle.getText()
  const code = root.querySelector('pre code')
  const textHost =
    root.querySelector('[data-plite-text-flow-host="true"]') ??
    root.querySelector('[data-plite-node="text"]')
  const codeBlock = state.editor.read.children()[0]
  let domTextNodes = 0
  let domTotalNodes = 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL)

  while (walker.nextNode()) {
    domTotalNodes += 1
    if (walker.currentNode.nodeType === Node.TEXT_NODE) domTextNodes += 1
  }

  return {
    domCoverageRatio: modelText.length
      ? (code?.textContent?.length ?? 0) / modelText.length
      : 1,
    domElements: root.querySelectorAll('*').length,
    domTextLength: code?.textContent?.length ?? 0,
    domTextNodes,
    domTotalNodes,
    heapMB: performance.memory?.usedJSHeapSize
      ? performance.memory.usedJSHeapSize / 1024 / 1024
      : 0,
    highlightCalls: state.highlightCalls.length,
    highlightMs: state.highlightCalls.reduce(
      (sum, call) => sum + call.durationMs,
      0
    ),
    modelChildren: Array.isArray(codeBlock?.children)
      ? codeBlock.children.length
      : 0,
    modelSelection: handle.getSelection(),
    modelTextLength: modelText.length,
    reactActualDurationMs: state.reactEvents.reduce(
      (sum, event) => sum + event.actualDuration,
      0
    ),
    reactCommitCount: state.reactEvents.length,
    textHosts: root.querySelectorAll('[data-plite-node="text"]').length,
    textHostAttributes: textHost
      ? Object.fromEntries(
          textHost
            .getAttributeNames()
            .map((name) => [name, textHost.getAttribute(name)])
        )
      : null,
    textFlow: textHost
      ? {
          attributes: Object.fromEntries(
            textHost
              .getAttributeNames()
              .filter((name) => name.startsWith('data-plite-text-flow'))
              .map((name) => [name, textHost.getAttribute(name)])
          ),
          boundaryVisits: Number(
            textHost.dataset.pliteTextFlowBoundaryVisits ?? 0
          ),
          createdSegments: Number(
            textHost.dataset.pliteTextFlowCreatedSegments ?? 0
          ),
          deferredTextChangeCount: Number(
            textHost.dataset.pliteTextFlowDeferredTextChangeCount ?? 0
          ),
          incrementalTextChangeCount: Number(
            textHost.dataset.pliteTextFlowIncrementalTextChangeCount ?? 0
          ),
          reconcileCount: Number(
            textHost.dataset.pliteTextFlowReconcileCount ?? 0
          ),
          reconcileMs: Number(
            textHost.dataset.pliteTextFlowReconcileMs ?? 0
          ),
          rebuildCount: Number(
            textHost.dataset.pliteTextFlowRebuildCount ?? 0
          ),
          segments: Number(textHost.dataset.pliteTextFlowSegments ?? 0),
        }
      : null,
    tokenElements: root.querySelectorAll('[class*="hljs-"]').length,
  }
}

globalThis.__PLATE_CODE_BLOCK__ = {
  assertState,
  install,
  nextPaint,
  prepareInput,
  selectMiddle,
  snapshot,
  waitForHighlight,
}
globalThis.__PLATE_CODE_BLOCK_STATE__ = state
globalThis.__PLATE_CODE_BLOCK_READY__ = true
`;

const html = (
  bundle
) => `<!doctype html><html><head><meta charset="utf-8"><style>
html,body,#app{margin:0;padding:0}pre{margin:0;white-space:pre-wrap}
</style></head><body><div id="app"></div><script type="module">${bundle.replaceAll(
  '</script',
  '<\\/script'
)}</script></body></html>`;

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

const reference = JSON.parse(await readFile(referencePath, 'utf-8'));
const referenceRows = reference.results?.dense?.['10000'];
const bestReferenceTypeMs = Math.min(
  referenceRows?.prosemirror?.typeToPaintMs?.p95 ?? Number.POSITIVE_INFINITY,
  referenceRows?.wordgard?.typeToPaintMs?.p95 ?? Number.POSITIVE_INFINITY
);

if (!Number.isFinite(bestReferenceTypeMs)) {
  throw new Error('The matched ProseMirror/Wordgard reference is incomplete');
}

await run('pnpm', ['--filter', 'platejs', 'build'], repo);
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
  tempDir,
  { NODE_ENV: reactEnvironment }
);
const bundle = await readFile(bundlePath, 'utf-8');
const browser = await chromium.launch({
  args: ['--enable-precise-memory-info'],
  headless: process.env.PLATE_CODE_BLOCK_HEADLESS !== '0',
});
const mountSamples = [];
const inputSamples = [];
const settleSamples = [];
const sourceSamples = [];
const residualSamples = [];
const snapshots = [];
const browserLogs = [];
let cpuProfileTop = null;
let tracePath = null;

try {
  const page = await browser.newPage({
    viewport: { height: 720, width: 1280 },
  });

  page.on('console', (message) =>
    browserLogs.push({ kind: 'console', text: message.text() })
  );
  page.on('pageerror', (error) =>
    browserLogs.push({ kind: 'pageerror', text: error.message })
  );

  await page.route('http://plate-benchmark.local/', (route) =>
    route.fulfill({ body: html(bundle), contentType: 'text/html' })
  );
  await page.goto('http://plate-benchmark.local/', { waitUntil: 'load' });
  await page.waitForFunction(() => globalThis.__PLATE_CODE_BLOCK_READY__);

  for (let iteration = 0; iteration <= iterations; iteration += 1) {
    const mountStart = await page.evaluate(() => performance.now());
    await page.evaluate(() => globalThis.__PLATE_CODE_BLOCK__.install());
    const mountEnd = await page.evaluate(() => performance.now());
    await page.evaluate(() => globalThis.__PLATE_CODE_BLOCK__.selectMiddle());

    for (let operation = 0; operation < typeOps; operation += 1) {
      const baseline = await page.evaluate(() => ({
        calls: globalThis.__PLATE_CODE_BLOCK_STATE__.highlightCalls.length,
        ms: globalThis.__PLATE_CODE_BLOCK_STATE__.highlightCalls.reduce(
          (sum, call) => sum + call.durationMs,
          0
        ),
      }));

      await page.evaluate(
        (text) => globalThis.__PLATE_CODE_BLOCK__.prepareInput(text),
        insertedText
      );
      const cpuSession =
        captureCPUProfile && iteration === iterations && operation === 0
          ? await page.context().newCDPSession(page)
          : null;
      const traceSession =
        captureTrace && iteration === iterations && operation === 0
          ? await page.context().newCDPSession(page)
          : null;

      if (traceSession) {
        await traceSession.send('Tracing.start', {
          categories: 'devtools.timeline,blink.user_timing,v8',
          transferMode: 'ReturnAsStream',
        });
      }
      if (cpuSession) {
        await cpuSession.send('Profiler.enable');
        await cpuSession.send('Profiler.start');
      }
      if (traceSession) {
        await page.evaluate(() => performance.mark('plate-native-input-start'));
      }
      const inputStart = await page.evaluate(() => performance.now());
      await page.keyboard.type(insertedText);
      await page.evaluate(() => globalThis.__PLATE_CODE_BLOCK__.assertState());
      const inputEnd = await page.evaluate(() =>
        globalThis.__PLATE_CODE_BLOCK__.nextPaint()
      );
      if (traceSession) {
        await page.evaluate(() => performance.mark('plate-native-input-end'));
      }
      if (cpuSession) {
        const { profile } = await cpuSession.send('Profiler.stop');

        cpuProfileTop = summarizeCPUProfile(profile);
        await cpuSession.detach();
      }
      const settleEnd = await page.evaluate(
        (calls) => globalThis.__PLATE_CODE_BLOCK__.waitForHighlight(calls),
        baseline.calls
      );
      if (traceSession) {
        await page.evaluate(() => performance.mark('plate-native-settle-end'));
        const completed = new Promise((resolveTrace) => {
          traceSession.once('Tracing.tracingComplete', resolveTrace);
        });
        await traceSession.send('Tracing.end');
        const { stream } = await completed;
        let trace = '';
        let eof = false;

        while (!eof) {
          const chunk = await traceSession.send('IO.read', { handle: stream });
          trace += chunk.base64Encoded
            ? Buffer.from(chunk.data, 'base64').toString('utf-8')
            : chunk.data;
          ({ eof } = chunk);
        }
        await traceSession.send('IO.close', { handle: stream });
        await traceSession.detach();
        tracePath = `${artifactPath}.trace.json`;
        await mkdir(dirname(tracePath), { recursive: true });
        await writeFile(tracePath, trace);
      }
      const sourceEnd = await page.evaluate(() =>
        globalThis.__PLATE_CODE_BLOCK_STATE__.highlightCalls.reduce(
          (sum, call) => sum + call.durationMs,
          0
        )
      );

      if (iteration > 0) {
        const inputMs = inputEnd - inputStart;
        const settleMs = settleEnd - inputStart;
        const sourceMs = sourceEnd - baseline.ms;

        inputSamples.push(inputMs);
        settleSamples.push(settleMs);
        sourceSamples.push(sourceMs);
        residualSamples.push(Math.max(0, settleMs - sourceMs));
      }
    }

    if (iteration > 0) {
      mountSamples.push(mountEnd - mountStart);
      snapshots.push(
        await page.evaluate(() => globalThis.__PLATE_CODE_BLOCK__.snapshot())
      );
    }
  }

  await page.close();
} catch (error) {
  process.stderr.write(`${JSON.stringify(browserLogs, null, 2)}\n`);
  throw error;
} finally {
  await browser.close();
}

const measurements = {
  highlightSettleMs: summarize(settleSamples),
  inputToPaintMs: summarize(inputSamples),
  mountToPaintMs: summarize(mountSamples),
  renderResidualMs: summarize(residualSamples),
  sourceMs: summarize(sourceSamples),
};
const budgets = {
  highlightSettleMs: 600,
  inputToPaintMs: 200,
  mountToPaintMs: 204,
  renderResidualMs: round(bestReferenceTypeMs * 1.5),
};
const budgetRatios = {
  highlightSettle:
    measurements.highlightSettleMs.p95 / budgets.highlightSettleMs,
  inputToPaint: measurements.inputToPaintMs.p95 / budgets.inputToPaintMs,
  mountToPaint: measurements.mountToPaintMs.p95 / budgets.mountToPaintMs,
  renderResidual: measurements.renderResidualMs.p95 / budgets.renderResidualMs,
};
const failures = [];

for (const [name, ratio] of Object.entries(budgetRatios)) {
  if (ratio > 1) failures.push(`${name} budget ratio ${round(ratio)}`);
}
for (const [index, snapshot] of snapshots.entries()) {
  if (Math.abs(snapshot.domCoverageRatio - 1) > 0.000001) {
    failures.push(`snapshot ${index}: DOM coverage`);
  }
  if (snapshot.modelChildren !== 1) {
    failures.push(`snapshot ${index}: expected one Text child`);
  }
  if (snapshot.tokenElements === 0) {
    failures.push(`snapshot ${index}: missing syntax tokens`);
  }
}

const maxBudgetRatio = Math.max(...Object.values(budgetRatios));
const receipt = {
  artifactVersion: 1,
  budgets,
  config: {
    captureCPUProfile,
    captureTrace,
    charsPerLine,
    discardedWarmups: 1,
    fixtureKind,
    headless: process.env.PLATE_CODE_BLOCK_HEADLESS !== '0',
    insertedText,
    iterations,
    language,
    lineCount,
    reactEnvironment,
    strict,
    typeOps,
  },
  cpuProfileTop,
  evaluation: {
    budgetRatios: Object.fromEntries(
      Object.entries(budgetRatios).map(([name, ratio]) => [name, round(ratio)])
    ),
    failures,
    maxBudgetRatio: round(maxBudgetRatio),
    pass: failures.length === 0,
  },
  measurements,
  reference: {
    bestTypeToPaintP95Ms: bestReferenceTypeMs,
    path: referencePath,
    sha256: await hashFiles([referencePath]),
  },
  snapshots,
  tracePath,
  sourceIdentities: {
    buildSha256: await hashFiles([
      modulePaths.plateReact,
      resolve(
        repo,
        'packages/platejs/dist/features/code-block/lib/BaseCodeBlockPlugin.js'
      ),
    ]),
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repo,
      encoding: 'utf-8',
    }).trim(),
    lowlight: '3.3.0',
    runner: {
      path: runnerPath,
      sha256: await hashFiles([runnerPath]),
    },
  },
};

await mkdir(dirname(artifactPath), { recursive: true });
await writeFile(artifactPath, `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(
  `METRIC plate_code_block_text_flow_max_budget_ratio=${round(
    maxBudgetRatio
  )}\n`
);
process.stdout.write(`ARTIFACT ${artifactPath}\n`);

if (strict && !receipt.evaluation.pass) {
  process.stderr.write(
    `Plate code-block text-flow benchmark failed: ${failures.join(', ')}\n`
  );
  process.exitCode = 1;
}
