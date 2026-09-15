import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  benchmarkRepo,
  buildRepo,
  parsePackageManager,
} from '../../shared/repo-compare.mjs'
import { round, writeBenchmarkArtifact } from '../../shared/stats.mjs'

const currentRepo = process.cwd()
const defaultLegacyRepo =
  [
    resolve(currentRepo, '../slate'),
    resolve(currentRepo, '../../../slate'),
  ].find((candidate) => existsSync(resolve(candidate, 'package.json'))) ??
  resolve(currentRepo, '../slate')
const legacyRepo = resolve(
  currentRepo,
  process.env.REACT_HUGE_COMPARE_LEGACY_REPO || defaultLegacyRepo
)

const iterations = Number(process.env.REACT_HUGE_COMPARE_ITERATIONS || 3)
const blocks = Number(process.env.REACT_HUGE_COMPARE_BLOCKS || 5000)
const chunkSize = Number(process.env.REACT_HUGE_COMPARE_CHUNK_SIZE || 1000)
const segmentSize = Number(process.env.REACT_HUGE_COMPARE_ISLAND_SIZE || 32)
const overscan = Number(process.env.REACT_HUGE_COMPARE_ACTIVE_RADIUS || 0)
const rootGroupSize = 16
const typeOps = Number(process.env.REACT_HUGE_COMPARE_TYPE_OPS || 20)
const profile = process.env.REACT_HUGE_COMPARE_PROFILE === '1'
const compareMode = process.env.REACT_HUGE_COMPARE_MODE || 'compare'
const readyOnly = process.env.REACT_HUGE_COMPARE_READY_ONLY === '1'
const measureNativeSurfaceCompletion =
  process.env.REACT_HUGE_COMPARE_NATIVE_SURFACE_COMPLETE === '1'
const includeSyntheticBeforeInput =
  process.env.REACT_HUGE_COMPARE_SYNTHETIC_BEFOREINPUT === '1'
const skipBuild = process.env.REACT_HUGE_COMPARE_SKIP_BUILD === '1'
const isolateCurrentSurfaces =
  process.env.REACT_HUGE_COMPARE_ISOLATE_SURFACES === '1'
const splitSelectionLanes =
  process.env.REACT_HUGE_COMPARE_SPLIT_SELECTION === '1'
const disposeDelayMs = Number(
  process.env.REACT_HUGE_COMPARE_DISPOSE_DELAY_MS || 500
)
const printJSON = process.env.REACT_HUGE_COMPARE_PRINT_JSON === '1'
const progressEnabled = process.env.REACT_HUGE_COMPARE_PROGRESS !== '0'
const pasteText = 'replacement marker'
const createPasteFragment = () => [
  {
    type: 'paragraph',
    children: [{ text: pasteText }],
  },
]
const currentJsdomRequireFrom = resolve(
  currentRepo,
  'packages/slate-react/package.json'
)
const latestArtifactPath =
  'tmp/slate-react-huge-document-legacy-compare-benchmark.json'

const sanitizeArtifactText = (value) =>
  String(value)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'default'

const sanitizeArtifactSegment = (value, limit = 180) =>
  sanitizeArtifactText(value).slice(0, limit).replace(/-+$/g, '') || 'default'

const getBoundedArtifactSegment = (value, limit) => {
  const sanitized = sanitizeArtifactText(value)

  if (sanitized.length <= limit) {
    return sanitized
  }

  const hash = createHash('sha1').update(sanitized).digest('hex').slice(0, 8)
  const prefix =
    sanitized
      .slice(0, Math.max(1, limit - hash.length - 1))
      .replace(/-+$/g, '') || 'default'

  return `${prefix}-${hash}`
}

const getSelectedSurfaceLabel = () =>
  getBoundedArtifactSegment(
    process.env.REACT_HUGE_COMPARE_SURFACES || 'all',
    32
  )

const getRunArtifactPath = ({ mode }) =>
  `${[
    'tmp/slate-react-huge-document-legacy-compare-benchmark',
    sanitizeArtifactSegment(mode),
    getSelectedSurfaceLabel(),
    `blocks-${blocks}`,
    `iters-${iterations}`,
    `ops-${typeOps}`,
    `chunk-${chunkSize}`,
    `segment-${segmentSize}`,
    `radius-${overscan}`,
    `dispose-${disposeDelayMs}`,
    readyOnly ? 'ready-only' : 'full-run',
    includeSyntheticBeforeInput
      ? 'synthetic-beforeinput'
      : 'native-beforeinput',
    isolateCurrentSurfaces ? 'isolated-surfaces' : 'combined-surfaces',
    splitSelectionLanes ? 'split-selection' : 'combined-selection',
    profile ? 'profile' : 'no-profile',
  ].join('-')}.json`

const writeHugeDocumentArtifact = async ({ path, summary }) => {
  summary.artifactPaths = {
    latest: latestArtifactPath,
    run: path,
  }

  await writeBenchmarkArtifact(latestArtifactPath, summary)
  await writeBenchmarkArtifact(path, summary)
}

const printHugeDocumentSummary = (summary) => {
  if (printJSON) {
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  console.log(`Wrote ${summary.artifactPaths.run}`)
}

const resourceSummaryLaneNames = [
  'readyMs',
  'middleBlockPromoteMs',
  'middleBlockPromoteThenTypeMs',
  'middleBlockSelectMs',
  'middleBlockTypeAfterSelectMs',
  'middleBlockSelectThenTypeMs',
  'middleBlockTypeMs',
]
const resourceSummaryTraceKeys = [
  'dom-node-count',
  'editable-descendant-count',
  'partial-dom-count',
  'root-group-mounted-count',
  'root-group-pending-count',
  'slate-element-count',
  'slate-text-count',
  'dom-strategy-dom-node-count',
  'dom-strategy-editable-descendant-count',
  'dom-strategy-mounted-group-count',
  'dom-strategy-mounted-top-level-count',
  'dom-strategy-pending-group-count',
  'dom-strategy-pending-top-level-count',
  'dom-strategy-segment-size',
]

const pickResourceMetricSummary = (metric) =>
  metric
    ? {
        mean: metric.mean,
        median: metric.median,
        p95: metric.p95,
      }
    : null

const createLaneResourceSummary = (lane) => {
  if (!lane?.traceTags) {
    return null
  }

  const summary = Object.fromEntries(
    resourceSummaryTraceKeys
      .map((key) => [key, pickResourceMetricSummary(lane.traceTags[key])])
      .filter(([, value]) => value)
  )

  return Object.keys(summary).length > 0 ? summary : null
}

const createResourceSummaryBySurface = (surfaces) =>
  Object.fromEntries(
    Object.entries(surfaces)
      .map(([surfaceName, surface]) => [
        surfaceName,
        Object.fromEntries(
          resourceSummaryLaneNames
            .map((laneName) => [
              laneName,
              createLaneResourceSummary(surface?.[laneName]),
            ])
            .filter(([, value]) => value)
        ),
      ])
      .filter(([, summary]) => Object.keys(summary).length > 0)
  )

const logProgress = (message) => {
  if (progressEnabled) {
    console.error(`[huge-document-compare] ${message}`)
  }
}

const sharedSource = `
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import React from 'react'
import { createRoot } from 'react-dom/client'
import TestUtils from 'react-dom/test-utils'
import * as SlateCore from 'slate'
import { withReact } from 'slate-react'

const { createEditor, Editor } = SlateCore
const legacyTransforms = SlateCore.Transforms

const { JSDOM } = createRequire(${JSON.stringify(
  currentJsdomRequireFrom
)})('jsdom')

const iterations = Number(process.env.REACT_HUGE_COMPARE_ITERATIONS || 3)
const blocks = Number(process.env.REACT_HUGE_COMPARE_BLOCKS || 5000)
const typeOps = Number(process.env.REACT_HUGE_COMPARE_TYPE_OPS || 20)
const readyOnly = process.env.REACT_HUGE_COMPARE_READY_ONLY === '1'
const measureNativeSurfaceCompletion =
  process.env.REACT_HUGE_COMPARE_NATIVE_SURFACE_COMPLETE === '1'
const includeSyntheticBeforeInput =
  process.env.REACT_HUGE_COMPARE_SYNTHETIC_BEFOREINPUT === '1'
const splitSelectionLanes =
  process.env.REACT_HUGE_COMPARE_SPLIT_SELECTION === '1'
const disposeDelayMs = Number(process.env.REACT_HUGE_COMPARE_DISPOSE_DELAY_MS || 500)
const progressEnabled = process.env.REACT_HUGE_COMPARE_PROGRESS !== '0'
const pasteText = ${JSON.stringify(pasteText)}
const modelOwnedBeforeInputText = '@'
const createPasteFragment = ${createPasteFragment.toString()}

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const originalConsoleError = console.error.bind(console)

console.error = (...args) => {
  const message = String(args[0] ?? '')

  if (
    message.includes('not wrapped in act') ||
    message.includes('not configured to support act')
  ) {
    return
  }

  originalConsoleError(...args)
}

const act = React.act ?? TestUtils.act

const now = () => performance.now()
const round = (value) => Number(value.toFixed(2))
const settleBenchmark = () => new Promise((resolve) => setTimeout(resolve, 0))

const forceBenchmarkGC = () => {
  const gc = globalThis.Bun?.gc

  if (typeof gc === 'function') {
    gc(true)
  }
}

const logProgress = (message) => {
  if (progressEnabled) {
    console.error('[huge-document-compare] ' + message)
  }
}

const formatProgressMs = (value) =>
  typeof value === 'number' ? value + 'ms' : 'n/a'

const recordBenchmarkProfileDuration = (id, duration) => {
  globalThis.__SLATE_REACT_RENDER_PROFILER__?.record?.({
    duration,
    id,
    kind: 'benchmark-time',
  })
}

const profileBenchmarkDuration = (id, callback) => {
  if (!globalThis.__SLATE_REACT_RENDER_PROFILER__) {
    return callback()
  }

  const start = now()

  try {
    return callback()
  } finally {
    recordBenchmarkProfileDuration(id, now() - start)
  }
}

const profileBenchmarkDurationAsync = async (id, callback) => {
  if (!globalThis.__SLATE_REACT_RENDER_PROFILER__) {
    return callback()
  }

  const start = now()

  try {
    return await callback()
  } finally {
    recordBenchmarkProfileDuration(id, now() - start)
  }
}

const getSelection = (editor) =>
  typeof editor.read === 'function'
    ? editor.read((state) => state.selection.get())
    : typeof editor.getSelection === 'function'
      ? editor.getSelection()
      : editor.selection

const select = (editor, target) => {
  if (typeof editor.update === 'function') {
    profileBenchmarkDuration('editor-update-selection-set', () => {
      editor.update((tx) => {
        tx.selection.set(target)
      })
    })
    return
  }

  legacyTransforms.select(editor, target)
}

const insertText = (editor, text, options) => {
  if (typeof editor.update === 'function') {
    profileBenchmarkDuration('editor-update-text-insert', () => {
      editor.update((tx) => {
        tx.text.insert(text, options)
      })
    })
    return
  }

  legacyTransforms.insertText(editor, text, options)
}

const insertFragment = (editor, fragment) => {
  if (typeof editor.update === 'function') {
    profileBenchmarkDuration('editor-update-fragment-insert', () => {
      editor.update((tx) => {
        tx.fragment.insert(fragment)
      })
    })
    return
  }

  legacyTransforms.insertFragment(editor, fragment)
}

const getEditableRoot = (container) => {
  const root = container.querySelector('[data-slate-editor="true"]')

  if (!root) {
    throw new Error('Missing editable root')
  }

  return root
}

const createTextInputEvent = (dom, type, text) => {
  const EventConstructor =
    typeof dom.window.InputEvent === 'function'
      ? dom.window.InputEvent
      : dom.window.Event
  let event

  try {
    event = new EventConstructor(type, {
      bubbles: true,
      cancelable: true,
      data: text,
      inputType: 'insertText',
    })
  } catch {
    event = new dom.window.Event(type, {
      bubbles: true,
      cancelable: true,
    })
  }

  Object.defineProperty(event, 'data', {
    configurable: true,
    value: text,
  })
  Object.defineProperty(event, 'dataTransfer', {
    configurable: true,
    value: null,
  })
  Object.defineProperty(event, 'inputType', {
    configurable: true,
    value: 'insertText',
  })
  Object.defineProperty(event, 'getTargetRanges', {
    configurable: true,
    value: () => [],
  })

  return event
}

// Use a character outside the currently native-eligible input set so this lane
// measures Slate's model-owned beforeinput path instead of pretending jsdom can
// perform a real browser-native DOM insertion.
const dispatchModelOwnedBeforeInputText = ({ dom, target, text }) => {
  const beforeInput = createTextInputEvent(dom, 'beforeinput', text)
  target.dispatchEvent(beforeInput)
}

const getCurrentSelectionTextEventTarget = ({ blockIndex, dom, root }) => {
  const handle = root.__slateBrowserHandle
  const selection = handle?.getSelection?.()

  if (
    !handle ||
    !selection ||
    selection.anchor.path.length !== selection.focus.path.length ||
    selection.anchor.path.some((part, index) => part !== selection.focus.path[index])
  ) {
    return null
  }

  const runtimeId = handle.getRuntimeId(selection.anchor.path)
  const escapedRuntimeId =
    runtimeId && dom.window.CSS?.escape
      ? dom.window.CSS.escape(runtimeId)
      : runtimeId?.replace(/"/g, '\\"')
  let textHost = handle.getElementByPath?.(selection.anchor.path) ?? null

  textHost ??= escapedRuntimeId
    ? root.querySelector(
        '[data-slate-runtime-id="' + escapedRuntimeId + '"]'
      )
    : null

  textHost ??= Array.from(root.querySelectorAll('[data-slate-node="text"]')).find(
    (element) => element.textContent?.includes('block-' + blockIndex + ' ')
  )

  if (!textHost) {
    return null
  }

  const walker = dom.window.document.createTreeWalker(
    textHost,
    dom.window.NodeFilter.SHOW_TEXT
  )

  return walker.nextNode() ?? textHost
}

const summarize = (samples) => {
  if (samples.length === 0) {
    return {
      samples: [],
      mean: 0,
      median: 0,
      p75: 0,
      p95: 0,
      p99: 0,
      min: 0,
      max: 0,
    }
  }

  const sorted = [...samples].sort((left, right) => left - right)
  const mean = samples.reduce((total, sample) => total + sample, 0) / samples.length
  const middle = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle]
  const percentile = (ratio) => {
    if (sorted.length === 0) {
      return 0
    }

    const index = Math.min(
      sorted.length - 1,
      Math.max(0, Math.ceil(sorted.length * ratio) - 1)
    )

    return sorted[index]
  }

  return {
    samples: samples.map(round),
    mean: round(mean),
    median: round(median),
    p75: round(percentile(0.75)),
    p95: round(percentile(0.95)),
    p99: round(percentile(0.99)),
    min: round(sorted[0] ?? 0),
    max: round(sorted.at(-1) ?? 0),
  }
}

const summarizeNumericRecords = (records) => {
  const keys = new Set()

  for (const record of records) {
    for (const [key, value] of Object.entries(record ?? {})) {
      if (typeof value === 'number') {
        keys.add(key)
      }
    }
  }

  return Object.fromEntries(
    [...keys].sort().map((key) => [
      key,
      summarize(records.map((record) => record?.[key] ?? 0)),
    ])
  )
}

const createChildren = () =>
  Array.from({ length: blocks }, (_, index) => ({
    type: index % 100 === 0 ? 'heading-one' : 'paragraph',
    children: [{ text: 'block-' + index + ' alpha beta gamma delta' }],
  }))

const installDomGlobals = (dom) => {
  const previous = {
    Document: globalThis.Document,
    Element: globalThis.Element,
    HTMLElement: globalThis.HTMLElement,
    HTMLDivElement: globalThis.HTMLDivElement,
    Node: globalThis.Node,
    Range: globalThis.Range,
    Selection: globalThis.Selection,
    ShadowRoot: globalThis.ShadowRoot,
    Text: globalThis.Text,
    cancelAnimationFrame: globalThis.cancelAnimationFrame,
    document: globalThis.document,
    navigator: globalThis.navigator,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    window: globalThis.window,
  }

  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.Document = dom.window.Document
  globalThis.Element = dom.window.Element
  globalThis.HTMLElement = dom.window.HTMLElement
  globalThis.HTMLDivElement = dom.window.HTMLDivElement
  globalThis.Node = dom.window.Node
  globalThis.Range = dom.window.Range
  globalThis.Selection = dom.window.Selection
  globalThis.ShadowRoot = dom.window.ShadowRoot
  globalThis.Text = dom.window.Text

  if (!dom.window.requestAnimationFrame) {
    dom.window.requestAnimationFrame = (callback) =>
      dom.window.setTimeout(() => callback(dom.window.performance.now()), 0)
  }

  if (!dom.window.cancelAnimationFrame) {
    dom.window.cancelAnimationFrame = (handle) => {
      dom.window.clearTimeout(handle)
    }
  }

  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: dom.window.navigator,
  })

  return () => {
    globalThis.window = previous.window
    globalThis.document = previous.document
    globalThis.Document = previous.Document
    globalThis.Element = previous.Element
    globalThis.HTMLElement = previous.HTMLElement
    globalThis.HTMLDivElement = previous.HTMLDivElement
    globalThis.Node = previous.Node
    globalThis.Range = previous.Range
    globalThis.Selection = previous.Selection
    globalThis.ShadowRoot = previous.ShadowRoot
    globalThis.Text = previous.Text
    globalThis.requestAnimationFrame =
      previous.requestAnimationFrame ?? (() => 0)
    globalThis.cancelAnimationFrame =
      previous.cancelAnimationFrame ?? (() => {})

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: previous.navigator,
    })
  }
}

const getEventListenerCaptureKey = (options) => {
  if (typeof options === 'boolean') {
    return options ? 'capture' : 'bubble'
  }

  return options?.capture ? 'capture' : 'bubble'
}

const installEventListenerCounter = (dom) => {
  const targetListeners = new WeakMap()
  const activeByType = new Map()
  const originalAddEventListener =
    dom.window.EventTarget.prototype.addEventListener
  const originalRemoveEventListener =
    dom.window.EventTarget.prototype.removeEventListener
  let activeCount = 0
  let totalAdded = 0

  const getBucket = (target, type, options) => {
    let targetMap = targetListeners.get(target)

    if (!targetMap) {
      targetMap = new Map()
      targetListeners.set(target, targetMap)
    }

    const key = String(type) + ':' + getEventListenerCaptureKey(options)
    let bucket = targetMap.get(key)

    if (!bucket) {
      bucket = new Set()
      targetMap.set(key, bucket)
    }

    return bucket
  }

  const incrementType = (type) => {
    activeByType.set(type, (activeByType.get(type) ?? 0) + 1)
  }

  const decrementType = (type) => {
    const nextCount = (activeByType.get(type) ?? 0) - 1

    if (nextCount > 0) {
      activeByType.set(type, nextCount)
    } else {
      activeByType.delete(type)
    }
  }

  dom.window.EventTarget.prototype.addEventListener = function (
    type,
    listener,
    options
  ) {
    if (listener) {
      const eventType = String(type)
      const bucket = getBucket(this, eventType, options)

      if (!bucket.has(listener)) {
        bucket.add(listener)
        activeCount += 1
        totalAdded += 1
        incrementType(eventType)
      }
    }

    return originalAddEventListener.call(this, type, listener, options)
  }

  dom.window.EventTarget.prototype.removeEventListener = function (
    type,
    listener,
    options
  ) {
    if (listener) {
      const eventType = String(type)
      const bucket = getBucket(this, eventType, options)

      if (bucket.delete(listener)) {
        activeCount -= 1
        decrementType(eventType)
      }
    }

    return originalRemoveEventListener.call(this, type, listener, options)
  }

  return {
    restore() {
      dom.window.EventTarget.prototype.addEventListener = originalAddEventListener
      dom.window.EventTarget.prototype.removeEventListener =
        originalRemoveEventListener
    },
    snapshot() {
      return {
        activeCount,
        byType: Object.fromEntries([...activeByType.entries()].sort()),
        totalAdded,
      }
    },
  }
}

const createDom = () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>')
  const container = dom.window.document.getElementById('root')

  if (!container) {
    throw new Error('Missing benchmark root')
  }

  if (
    !Object.getOwnPropertyDescriptor(
      dom.window.HTMLElement.prototype,
      'isContentEditable'
    )
  ) {
    Object.defineProperty(dom.window.HTMLElement.prototype, 'isContentEditable', {
      configurable: true,
      get() {
        return Boolean(this.closest('[contenteditable="true"]'))
      },
    })
  }

  const eventListenerCounter = installEventListenerCounter(dom)
  const restoreGlobals = installDomGlobals(dom)
  container.__slateBenchmarkEventListenerStats = eventListenerCounter.snapshot

  return {
    container,
    dom,
    restoreGlobals() {
      eventListenerCounter.restore()
      restoreGlobals()
    },
  }
}

const renderElement = ({ attributes, children, element }) =>
  React.createElement(
    element.type === 'heading-one' ? 'h1' : 'p',
    attributes,
    children
  )

const renderChunk = ({ attributes, children }) =>
  React.createElement('div', attributes, children)
`

const currentSharedSource = sharedSource
  .replace(
    "import * as SlateCore from 'slate'",
    "import * as SlateCore from 'slate'\nimport { Editor as InternalEditor } from 'slate/internal'"
  )
  .replace(
    'const { createEditor, Editor } = SlateCore',
    "const { createEditor } = SlateCore\nconst Editor = { ...InternalEditor, end: (editor, at) => InternalEditor.point(editor, at, { edge: 'end' }), start: (editor, at) => InternalEditor.point(editor, at, { edge: 'start' }), string: InternalEditor.string }"
  )
  .replace(
    "import { withReact } from 'slate-react'",
    "import { createReactEditor } from '../../packages/slate-react/dist/index.js'"
  )
  .replaceAll('withReact(createEditor())', 'createReactEditor()')

const legacyBenchmarkSource = `
${sharedSource}
import { Editable, Slate } from 'slate-react'

const chunkSize = Number(process.env.REACT_HUGE_COMPARE_CHUNK_SIZE || 1000)

const createBenchEditor = ({ chunking }) => {
  const editor = withReact(createEditor())
  editor.getChunkSize = (node) => (chunking && node === editor ? chunkSize : null)
  return editor
}

const countElements = (root, selector) => root.querySelectorAll(selector).length

const measureLegacyReadySurfaceWeights = (container) => {
  const root = getEditableRoot(container)
  const domNodeCount = root.querySelectorAll('*').length + 1
  const slateElementCount = countElements(root, '[data-slate-node="element"]')
  const slateTextCount = countElements(root, '[data-slate-node="text"]')
  const slateLeafCount = countElements(root, '[data-slate-leaf]')
  const rootGroupCount = countElements(root, '[data-slate-root-group="true"]')
  const mountedRootGroupCount = countElements(
    root,
    '[data-slate-root-group-state="mounted"], [data-slate-root-group-state="fresh-mounted"]'
  )
  const pendingRootGroupCount = countElements(
    root,
    '[data-slate-root-group-state="pending-mount"]'
  )
  const partialDOMCount = countElements(
    root,
    '[data-slate-dom-strategy-placeholder="true"]'
  )
  const mountedEditableDescendantCount = slateElementCount + slateTextCount

  return {
    'dom-node-count': domNodeCount,
    'dom-nodes-per-block': domNodeCount / blocks,
    'editable-descendant-count': mountedEditableDescendantCount,
    'editable-descendants-per-block': mountedEditableDescendantCount / blocks,
    'partial-dom-count': partialDOMCount,
    'root-group-count': rootGroupCount,
    'root-group-mounted-count': mountedRootGroupCount,
    'root-group-pending-count': pendingRootGroupCount,
    'slate-element-count': slateElementCount,
    'slate-leaf-count': slateLeafCount,
    'slate-text-count': slateTextCount,
  }
}

const mount = async ({ chunking }) => {
  const editor = createBenchEditor({ chunking })
  const initialValue = createChildren()
  const { container, dom, restoreGlobals } = createDom()
  const root = createRoot(container)

  await act(async () => {
    root.render(
      React.createElement(
        Slate,
        { editor, initialValue },
        React.createElement(Editable, { renderChunk, renderElement })
      )
    )
  })

  return { container, dom, editor, restoreGlobals, root }
}

const dispose = async ({ dom, restoreGlobals, root }) => {
  await settleBenchmark()
  await act(async () => {
    root.unmount()
  })
  await settleBenchmark()
  if (disposeDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, disposeDelayMs))
  }
  restoreGlobals()
  dom.window.close()
}

const measureLane = async (setup, run) => {
  const samples = []
  const traceTags = []

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const context = await setup()
    await settleBenchmark()
    const start = now()
    const metrics = await run(context)
    const duration = now() - start
    await dispose(context)
    await settleBenchmark()

    if (iteration > 0) {
      samples.push(duration)
      if (metrics && typeof metrics === 'object') {
        traceTags.push(metrics)
      }
    }
  }

  const summary = summarize(samples)

  return {
    ...summary,
    ...(traceTags.length > 0
      ? { traceTags: summarizeNumericRecords(traceTags) }
      : {}),
  }
}

const measurePreparedLane = async (setup, prepare, run) => {
  const samples = []

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const context = await setup()
    await prepare(context)
    await settleBenchmark()
    const start = now()
    await run(context)
    const duration = now() - start
    await dispose(context)
    await settleBenchmark()

    if (iteration > 0) {
      samples.push(duration)
    }
  }

  return summarize(samples)
}

const measureReady = async ({ chunking }) =>
  measureLane(
    async () => {
      const editor = createBenchEditor({ chunking })
      const initialValue = createChildren()
      const { container, dom, restoreGlobals } = createDom()
      const root = createRoot(container)

      return { container, dom, editor, initialValue, restoreGlobals, root }
    },
    async ({ container, editor, initialValue, root }) => {
      await act(async () => {
        root.render(
          React.createElement(
            Slate,
            { editor, initialValue },
            React.createElement(Editable, { renderChunk, renderElement })
          )
        )
      })
      await Promise.resolve()
      return measureLegacyReadySurfaceWeights(container)
    }
  )

const measureType = async ({ blockIndex, chunking, selectBefore = false }) =>
  measureLane(
    () => mount({ chunking }),
    async ({ editor }) => {
      if (selectBefore) {
        await act(async () => {
          select(editor, {
            anchor: { path: [blockIndex, 0], offset: 0 },
            focus: { path: [blockIndex, 0], offset: 0 },
          })
        })
      }

      for (let index = 0; index < typeOps; index += 1) {
        await act(async () => {
          insertText(editor, 'X', {
            at: { path: [blockIndex, 0], offset: index },
          })
        })
      }
      const typedText = Editor.string(editor, [blockIndex])
      assert.equal(
        (typedText.match(/X/g) ?? []).length,
        typeOps,
        'legacy measureType block=' +
          blockIndex +
          ' selectBefore=' +
          selectBefore +
          ' text=' +
          JSON.stringify(typedText.slice(0, 80))
      )
    }
  )

const selectBlock = async ({ blockIndex, editor }) => {
  await act(async () => {
    select(editor, {
      anchor: { path: [blockIndex, 0], offset: 0 },
      focus: { path: [blockIndex, 0], offset: 0 },
    })
  })
}

const measureSelectBlock = async ({ blockIndex, chunking }) =>
  measureLane(
    () => mount({ chunking }),
    async ({ editor }) => {
      await selectBlock({ blockIndex, editor })
      assert.deepEqual(getSelection(editor)?.anchor, {
        path: [blockIndex, 0],
        offset: 0,
      })
    }
  )

const measureTypeAfterSelect = async ({ blockIndex, chunking }) =>
  measurePreparedLane(
    () => mount({ chunking }),
    async ({ editor }) => {
      await selectBlock({ blockIndex, editor })
    },
    async ({ editor }) => {
      for (let index = 0; index < typeOps; index += 1) {
        await act(async () => {
          insertText(editor, 'X', {
            at: { path: [blockIndex, 0], offset: index },
          })
        })
      }
      const typedText = Editor.string(editor, [blockIndex])
      assert.equal(
        (typedText.match(/X/g) ?? []).length,
        typeOps,
        'legacy measureTypeAfterSelect block=' +
          blockIndex +
          ' text=' +
          JSON.stringify(typedText.slice(0, 80))
      )
    }
  )

const measureSelectAll = async ({ chunking }) =>
  measureLane(
    () => mount({ chunking }),
    async ({ editor }) => {
      await act(async () => {
        select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        })
      })
      assert.deepEqual(getSelection(editor)?.anchor, Editor.start(editor, []))
    }
  )

const measureReplaceFullDocumentWithText = async ({ chunking }) =>
  measureLane(
    () => mount({ chunking }),
    async ({ editor }) => {
      await act(async () => {
        select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        })
        insertText(editor, pasteText)
      })
      assert.equal(Editor.string(editor, []), pasteText)
    }
  )

const measureInsertFragmentFullDocument = async ({ chunking }) =>
  measureLane(
    () => mount({ chunking }),
    async ({ editor }) => {
      await act(async () => {
        select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        })
        insertFragment(editor, createPasteFragment())
      })
      assert.equal(Editor.string(editor, []), pasteText)
    }
  )

const runSurface = async ({ chunking }) => {
  const readyMs = await measureReady({ chunking })

  if (readyOnly) {
    return { readyMs }
  }

  return {
    readyMs,
    selectAllMs: await measureSelectAll({ chunking }),
    startBlockTypeMs: await measureType({ blockIndex: 0, chunking }),
    ...(splitSelectionLanes
      ? {
          startBlockSelectMs: await measureSelectBlock({
            blockIndex: 0,
            chunking,
          }),
          startBlockTypeAfterSelectMs: await measureTypeAfterSelect({
            blockIndex: 0,
            chunking,
          }),
        }
      : {}),
    startBlockSelectThenTypeMs: await measureType({
      blockIndex: 0,
      chunking,
      selectBefore: true,
    }),
    middleBlockTypeMs: await measureType({
      blockIndex: Math.floor(blocks / 2),
      chunking,
    }),
    ...(splitSelectionLanes
      ? {
          middleBlockSelectMs: await measureSelectBlock({
            blockIndex: Math.floor(blocks / 2),
            chunking,
          }),
          middleBlockTypeAfterSelectMs: await measureTypeAfterSelect({
            blockIndex: Math.floor(blocks / 2),
            chunking,
          }),
        }
      : {}),
    middleBlockSelectThenTypeMs: await measureType({
      blockIndex: Math.floor(blocks / 2),
      chunking,
      selectBefore: true,
    }),
    middleBlockPromoteThenTypeMs: await measureType({
      blockIndex: Math.floor(blocks / 2),
      chunking,
      selectBefore: true,
    }),
    replaceFullDocumentWithTextMs: await measureReplaceFullDocumentWithText({
      chunking,
    }),
    insertFragmentFullDocumentMs: await measureInsertFragmentFullDocument({
      chunking,
    }),
  }
}

logProgress('surface legacyChunkOn start')
const legacyChunkOnSurface = await runSurface({ chunking: true })
logProgress(
  'surface legacyChunkOn done readyP95=' +
    formatProgressMs(legacyChunkOnSurface.readyMs?.p95)
)

console.log(JSON.stringify({
  config: {
    blocks,
    chunkSize,
    disposeDelayMs,
    includeSyntheticBeforeInput,
    iterations,
    splitSelectionLanes,
    typeOps,
  },
  surfaces: {
    legacyChunkOn: legacyChunkOnSurface,
  },
}))
`

const currentBenchmarkSource = `
${currentSharedSource}
import { Editable, Slate } from '../../packages/slate-react/dist/index.js'

const segmentSize = Number(process.env.REACT_HUGE_COMPARE_ISLAND_SIZE || 32)
const overscan = Number(process.env.REACT_HUGE_COMPARE_ACTIVE_RADIUS || 0)
const rootGroupSize = 16
const rootGroupThreshold = 1000
const profileEnabled = process.env.REACT_HUGE_COMPARE_PROFILE === '1'
const selectedSurfaceNames = new Set(
  (process.env.REACT_HUGE_COMPARE_SURFACES || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
)

const createProfilerCounter = () => {
  const events = []

  const snapshot = () => {
    const byKey = {}
    const byKind = {}

    for (const event of events) {
      const kind = event.kind
      const id = event.id ?? event.runtimeId
      const key = id ? kind + ':' + id : kind

      byKind[kind] = (byKind[kind] ?? 0) + 1
      byKey[key] = (byKey[key] ?? 0) + 1
    }

    const durationByKey = {}
    const durationByKind = {}

    for (const event of events) {
      if (typeof event.duration !== 'number') {
        continue
      }

      const kind = event.kind
      const id = event.id ?? event.runtimeId
      const key = id ? kind + ':' + id : kind

      durationByKind[kind] = (durationByKind[kind] ?? 0) + event.duration
      durationByKey[key] = (durationByKey[key] ?? 0) + event.duration
    }

    return {
      byKey,
      byKind,
      durationByKey,
      durationByKind,
      total: events.length,
    }
  }

  return {
    profiler: {
      record(event) {
        events.push({ ...event })
      },
    },
    reset() {
      events.length = 0
    },
    snapshot,
  }
}

const summarizeProfiles = (profiles) => {
  const byKindKeys = new Set()
  const byKeyKeys = new Set()
  const durationByKindKeys = new Set()
  const durationByKeyKeys = new Set()

  for (const profile of profiles) {
    Object.keys(profile.byKind).forEach((key) => byKindKeys.add(key))
    Object.keys(profile.byKey)
      .filter(
        (key) =>
          key.startsWith('selector:') ||
          key.startsWith('dom-text-sync:') ||
          key.startsWith('root-plan:') ||
          key.startsWith('group:') ||
          key.startsWith('surface-weight:') ||
          key.startsWith('benchmark-time:') ||
          key.startsWith('core-time:') ||
          key.startsWith('runtime-time:')
      )
      .forEach((key) => byKeyKeys.add(key))
    Object.keys(profile.durationByKind ?? {}).forEach((key) =>
      durationByKindKeys.add(key)
    )
    Object.keys(profile.durationByKey ?? {})
      .filter(
        (key) =>
          key.startsWith('surface-weight:') ||
          key.startsWith('benchmark-time:') ||
          key.startsWith('core-time:') ||
          key.startsWith('runtime-time:')
      )
      .forEach((key) => durationByKeyKeys.add(key))
  }

  return {
    byKey: Object.fromEntries(
      [...byKeyKeys].sort().map((key) => [
        key,
        summarize(profiles.map((profile) => profile.byKey[key] ?? 0)),
      ])
    ),
    byKind: Object.fromEntries(
      [...byKindKeys].sort().map((key) => [
        key,
        summarize(profiles.map((profile) => profile.byKind[key] ?? 0)),
      ])
    ),
    durationByKey: Object.fromEntries(
      [...durationByKeyKeys].sort().map((key) => [
        key,
        summarize(profiles.map((profile) => profile.durationByKey?.[key] ?? 0)),
      ])
    ),
    durationByKind: Object.fromEntries(
      [...durationByKindKeys].sort().map((key) => [
        key,
        summarize(
          profiles.map((profile) => profile.durationByKind?.[key] ?? 0)
        ),
      ])
    ),
    total: summarize(profiles.map((profile) => profile.total)),
  }
}

const toTraceKey = (key) =>
  'dom-strategy-' + key.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase())

const collectDOMStrategyTraceTags = (metrics) => {
  if (!metrics || typeof metrics !== 'object') {
    return {}
  }

  const tags = {}

  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value === 'number') {
      tags[toTraceKey(key)] = value
    } else if (typeof value === 'boolean') {
      tags[toTraceKey(key)] = value ? 1 : 0
    }
  }

  return tags
}

const getRootGroupCount = () => Math.ceil(blocks / rootGroupSize)
const getShellSegmentCount = () => Math.ceil(blocks / segmentSize)

const getDOMStrategyOptions = ({ domStrategyType, shellRadius = null }) => {
  switch (domStrategyType) {
    case 'auto':
    case 'staged':
    case 'full':
      return domStrategyType
    case 'partial-dom':
    case 'virtualized':
      return {
        overscan: shellRadius ?? overscan,
        segmentSize,
        type: domStrategyType,
        threshold: 1,
      }
    default:
      return undefined
  }
}

const createSurfaceTrace = ({ domStrategyType, shellRadius = null }) => {
  const partialDOMPlaceholderEnabled = domStrategyType === 'partial-dom'
  const shellEnabled = partialDOMPlaceholderEnabled
  const virtualizationEnabled = domStrategyType === 'virtualized'
  const segmentGroupingEnabled = shellEnabled || virtualizationEnabled
  const domPresentGroupingEnabled =
    (domStrategyType === 'auto' || domStrategyType === 'staged') &&
    blocks >= rootGroupThreshold
  const groupingEnabled = segmentGroupingEnabled || domPresentGroupingEnabled
  const segmentMountedGroups = segmentGroupingEnabled
    ? Math.min(getShellSegmentCount(), (shellRadius ?? overscan) + 1)
    : null
  const mountedDomPresentGroups = domPresentGroupingEnabled
    ? Math.min(getRootGroupCount(), 1)
    : null
  const pendingDomPresentGroups = domPresentGroupingEnabled
    ? Math.max(0, getRootGroupCount() - mountedDomPresentGroups)
    : 0

  return {
    backgroundMountChunks: pendingDomPresentGroups,
    corridor: segmentGroupingEnabled
      ? { overscan: shellRadius ?? overscan }
      : domPresentGroupingEnabled
        ? 'active-group-staged'
        : null,
    groupingEnabled,
    groupSize: segmentGroupingEnabled
      ? segmentSize
      : domPresentGroupingEnabled
        ? rootGroupSize
        : null,
    interactiveReadyAt: null,
    domStrategyType,
    maxBackgroundChunkMs: 0,
    mountedGroupCountAtReady: segmentGroupingEnabled
      ? segmentMountedGroups
      : domPresentGroupingEnabled
        ? mountedDomPresentGroups
        : null,
    nativeSurfaceCompleteAt: null,
    pendingGroupCountAtReady: pendingDomPresentGroups,
    shellEnabled,
    stagedMountingEnabled: domPresentGroupingEnabled,
    staleGroupCount: 0,
    virtualizationEnabled,
  }
}

const createSurfaceDefinition = ({
  domStrategyType,
  name,
  omitDOMStrategy = false,
  renderElementEnabled = true,
  shellRadius,
}) => ({
  domStrategy: omitDOMStrategy
    ? undefined
    : getDOMStrategyOptions({ domStrategyType, shellRadius }),
  name,
  renderElement: renderElementEnabled ? renderElement : undefined,
  trace: createSurfaceTrace({ domStrategyType, shellRadius }),
})

const resolveReadyTrace = ({ nativeSurfaceCompleteMs, readyMs, trace }) => ({
  ...trace,
  interactiveReadyAt: readyMs.mean,
  nativeSurfaceCompleteAt:
    trace.shellEnabled || trace.virtualizationEnabled
      ? null
      : trace.stagedMountingEnabled
        ? nativeSurfaceCompleteMs?.mean ?? null
        : readyMs.mean,
  readySurfaceWeights: readyMs.traceTags ?? {},
})

const recordSurfaceWeight = (id, value) => {
  globalThis.__SLATE_REACT_RENDER_PROFILER__?.record?.({
    duration: value,
    id,
    kind: 'surface-weight',
  })
}

const countElements = (root, selector) => root.querySelectorAll(selector).length

const getProcessHeapUsedBytes = () =>
  typeof process === 'object' && typeof process.memoryUsage === 'function'
    ? process.memoryUsage().heapUsed
    : 0

const measureReadySurfaceWeights = (container) => {
  const root = getEditableRoot(container)
  const listenerStats = container.__slateBenchmarkEventListenerStats?.() ?? {
    activeCount: 0,
    byType: {},
    totalAdded: 0,
  }
  const processHeapUsedBytes = getProcessHeapUsedBytes()
  const domNodeCount = root.querySelectorAll('*').length + 1
  const slateElementCount = countElements(root, '[data-slate-node="element"]')
  const slateTextCount = countElements(root, '[data-slate-node="text"]')
  const slateLeafCount = countElements(root, '[data-slate-leaf]')
  const rootGroupCount = countElements(root, '[data-slate-root-group="true"]')
  const explicitMountedRootGroupCount = countElements(
    root,
    '[data-slate-root-group-state="mounted"]'
  )
  const freshMountedRootGroupCount = countElements(
    root,
    '[data-slate-root-group-state="fresh-mounted"]'
  )
  const pendingRootGroupCount = countElements(
    root,
    '[data-slate-root-group-state="pending-mount"]'
  )
  const unstatedRootGroupCount = Math.max(
    0,
    rootGroupCount -
      explicitMountedRootGroupCount -
      freshMountedRootGroupCount -
      pendingRootGroupCount
  )
  const mountedRootGroupCount =
    explicitMountedRootGroupCount +
    freshMountedRootGroupCount +
    unstatedRootGroupCount
  const domCoverageBoundaryCount = countElements(
    root,
    '[data-slate-dom-coverage-boundary]'
  )
  const partialDOMCount = countElements(
    root,
    '[data-slate-dom-strategy-placeholder="true"]'
  )
  const mountedEditableDescendantCount = slateElementCount + slateTextCount

  return {
    'dom-coverage-boundary-count': domCoverageBoundaryCount,
    'dom-node-count': domNodeCount,
    'dom-nodes-per-block': domNodeCount / blocks,
    'editable-descendant-count': mountedEditableDescendantCount,
    'editable-descendants-per-block': mountedEditableDescendantCount / blocks,
    'event-listener-active-beforeinput': listenerStats.byType.beforeinput ?? 0,
    'event-listener-active-count': listenerStats.activeCount,
    'event-listener-active-dragend': listenerStats.byType.dragend ?? 0,
    'event-listener-active-drop': listenerStats.byType.drop ?? 0,
    'event-listener-active-focusin': listenerStats.byType.focusin ?? 0,
    'event-listener-active-focusout': listenerStats.byType.focusout ?? 0,
    'event-listener-active-input': listenerStats.byType.input ?? 0,
    'event-listener-active-selectionchange':
      listenerStats.byType.selectionchange ?? 0,
    'event-listener-total-added-count': listenerStats.totalAdded,
    'process-heap-used-bytes': processHeapUsedBytes,
    'process-heap-used-mb': processHeapUsedBytes / 1024 / 1024,
    'root-group-count': rootGroupCount,
    'root-group-explicit-mounted-count': explicitMountedRootGroupCount,
    'root-group-fresh-mounted-count': freshMountedRootGroupCount,
    'root-group-mounted-count': mountedRootGroupCount,
    'root-group-pending-count': pendingRootGroupCount,
    'root-group-unstated-count': unstatedRootGroupCount,
    'partial-dom-count': partialDOMCount,
    'slate-element-count': slateElementCount,
    'slate-leaf-count': slateLeafCount,
    'slate-text-count': slateTextCount,
    ...Object.fromEntries(
      Object.entries(listenerStats.byType).map(([type, count]) => [
        'event-listener-active-' + type,
        count,
      ])
    ),
  }
}

const recordReadySurfaceWeight = (container) => {
  const surfaceWeights = measureReadySurfaceWeights(container)

  if (globalThis.__SLATE_REACT_RENDER_PROFILER__) {
    for (const [id, value] of Object.entries(surfaceWeights)) {
      recordSurfaceWeight(id, value)
    }
  }

  return surfaceWeights
}

const surfaceDefinitions = [
  createSurfaceDefinition({
    domStrategyType: 'full',
    name: 'v2Off',
  }),
  createSurfaceDefinition({
    domStrategyType: 'full',
    name: 'v2DefaultRenderOff',
    renderElementEnabled: false,
  }),
  createSurfaceDefinition({
    domStrategyType: 'auto',
    name: 'v2DefaultOmitted',
    omitDOMStrategy: true,
  }),
  createSurfaceDefinition({
    domStrategyType: 'auto',
    name: 'v2DefaultRenderAuto',
    renderElementEnabled: false,
  }),
  createSurfaceDefinition({
    domStrategyType: 'auto',
    name: 'v2AutoExplicit',
  }),
  createSurfaceDefinition({
    domStrategyType: 'staged',
    name: 'v2DomPresent',
  }),
  createSurfaceDefinition({
    domStrategyType: 'partial-dom',
    name: 'v2ShellExplicitRadius0',
    shellRadius: 0,
  }),
  createSurfaceDefinition({
    domStrategyType: 'partial-dom',
    name: 'v2ShellExplicitRadius1',
    shellRadius: 1,
  }),
  createSurfaceDefinition({
    domStrategyType: 'virtualized',
    name: 'v2VirtualizedExperimental',
    shellRadius: 0,
  }),
]

const selectedSurfaceDefinitions =
  selectedSurfaceNames.size > 0
    ? surfaceDefinitions.filter((surface) =>
        selectedSurfaceNames.has(surface.name)
      )
    : surfaceDefinitions

const createEditableProps = ({
  domStrategy,
  onDOMStrategyMetrics,
  renderElement,
}) => ({
  id: 'v2-huge-compare',
  domStrategy,
  onDOMStrategyMetrics,
  renderElement,
})

const mount = async ({ domStrategy, renderElement }) => {
  const editor = createReactEditor()
  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  })
  const { container, dom, restoreGlobals } = createDom()
  const root = createRoot(container)
  let latestDOMStrategyMetrics = null

  await act(async () => {
    root.render(
      React.createElement(
        Slate,
        { editor },
        React.createElement(
          Editable,
          createEditableProps({
            domStrategy,
            onDOMStrategyMetrics: (metrics) => {
              latestDOMStrategyMetrics = metrics
            },
            renderElement,
          })
        )
      )
    )
  })

  return {
    container,
    dom,
    editor,
    getDOMStrategyMetrics: () => latestDOMStrategyMetrics,
    restoreGlobals,
    root,
  }
}

const createModelOnlyContext = () => {
  const editor = createReactEditor()
  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  })

  return { editor }
}

const dispose = async ({ dom, restoreGlobals, root }) => {
  await settleBenchmark()
  await act(async () => {
    root.unmount()
  })
  await settleBenchmark()
  if (disposeDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, disposeDelayMs))
  }
  restoreGlobals()
  dom.window.close()
}

const measureLane = async (setup, run) => {
  const samples = []
  const profiles = []
  const traceTags = []

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const counter = profileEnabled ? createProfilerCounter() : null
    const previousProfiler = globalThis.__SLATE_REACT_RENDER_PROFILER__

    if (counter) {
      globalThis.__SLATE_REACT_RENDER_PROFILER__ = counter.profiler
    }

    try {
      const context = await setup()
      await settleBenchmark()
      forceBenchmarkGC()
      counter?.reset()
      const start = now()
      const metrics = await run(context)
      const duration = now() - start
      const profile = counter?.snapshot()
      const domStrategyTraceTags =
        typeof context.getDOMStrategyMetrics === 'function'
          ? collectDOMStrategyTraceTags(context.getDOMStrategyMetrics())
          : {}
      await dispose(context)
      await settleBenchmark()
      forceBenchmarkGC()

      if (iteration > 0) {
        samples.push(duration)
        const laneTraceTags =
          metrics && typeof metrics === 'object'
            ? { ...domStrategyTraceTags, ...metrics }
            : domStrategyTraceTags
        if (Object.keys(laneTraceTags).length > 0) {
          traceTags.push(laneTraceTags)
        }
        if (profile) {
          profiles.push(profile)
        }
      }
    } finally {
      globalThis.__SLATE_REACT_RENDER_PROFILER__ = previousProfiler
    }
  }

  const summary = summarize(samples)

  return {
    ...summary,
    ...(traceTags.length > 0
      ? { traceTags: summarizeNumericRecords(traceTags) }
      : {}),
    ...(profileEnabled ? { profile: summarizeProfiles(profiles) } : {}),
  }
}

const measurePreparedLane = async (setup, prepare, run) => {
  const samples = []
  const profiles = []
  const traceTags = []

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const counter = profileEnabled ? createProfilerCounter() : null
    const previousProfiler = globalThis.__SLATE_REACT_RENDER_PROFILER__

    if (counter) {
      globalThis.__SLATE_REACT_RENDER_PROFILER__ = counter.profiler
    }

    try {
      const context = await setup()
      await prepare(context)
      await settleBenchmark()
      forceBenchmarkGC()
      counter?.reset()
      const start = now()
      await run(context)
      const duration = now() - start
      const profile = counter?.snapshot()
      const domStrategyTraceTags =
        typeof context.getDOMStrategyMetrics === 'function'
          ? collectDOMStrategyTraceTags(context.getDOMStrategyMetrics())
          : {}
      await dispose(context)
      await settleBenchmark()
      forceBenchmarkGC()

      if (iteration > 0) {
        samples.push(duration)
        if (Object.keys(domStrategyTraceTags).length > 0) {
          traceTags.push(domStrategyTraceTags)
        }
        if (profile) {
          profiles.push(profile)
        }
      }
    } finally {
      globalThis.__SLATE_REACT_RENDER_PROFILER__ = previousProfiler
    }
  }

  const summary = summarize(samples)

  return profileEnabled
    ? {
        ...summary,
        ...(traceTags.length > 0
          ? { traceTags: summarizeNumericRecords(traceTags) }
          : {}),
        profile: summarizeProfiles(profiles),
      }
    : {
        ...summary,
        ...(traceTags.length > 0
          ? { traceTags: summarizeNumericRecords(traceTags) }
          : {}),
      }
}

const measureModelOnlyLane = async (setup, run) => {
  const samples = []
  const profiles = []

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const counter = profileEnabled ? createProfilerCounter() : null
    const previousProfiler = globalThis.__SLATE_REACT_RENDER_PROFILER__

    if (counter) {
      globalThis.__SLATE_REACT_RENDER_PROFILER__ = counter.profiler
    }

    try {
      const context = setup()
      forceBenchmarkGC()
      counter?.reset()
      const start = now()
      await run(context)
      const duration = now() - start
      const profile = counter?.snapshot()
      forceBenchmarkGC()

      if (iteration > 0) {
        samples.push(duration)
        if (profile) {
          profiles.push(profile)
        }
      }
    } finally {
      globalThis.__SLATE_REACT_RENDER_PROFILER__ = previousProfiler
    }
  }

  const summary = summarize(samples)

  return profileEnabled
    ? {
        ...summary,
        profile: summarizeProfiles(profiles),
      }
    : summary
}

const measureReady = async ({ domStrategy, renderElement }) =>
  measureLane(
    async () => {
      const editor = createReactEditor()
      Editor.replace(editor, {
        children: createChildren(),
        selection: null,
      })
      const { container, dom, restoreGlobals } = createDom()
      const root = createRoot(container)
      let latestDOMStrategyMetrics = null

      return {
        container,
        dom,
        editor,
        getDOMStrategyMetrics: () => latestDOMStrategyMetrics,
        onDOMStrategyMetrics: (metrics) => {
          latestDOMStrategyMetrics = metrics
        },
        restoreGlobals,
        root,
      }
    },
    async ({ container, editor, onDOMStrategyMetrics, root }) => {
      await act(async () => {
        root.render(
          React.createElement(
            Slate,
            { editor },
            React.createElement(
              Editable,
              createEditableProps({
                domStrategy,
                onDOMStrategyMetrics,
                renderElement,
              })
            )
          )
        )
      })
      await Promise.resolve()
      return recordReadySurfaceWeight(container)
    }
  )

const measureNativeSurfaceComplete = async ({ domStrategy, renderElement }) =>
  measureLane(
    async () => {
      const editor = createReactEditor()
      Editor.replace(editor, {
        children: createChildren(),
        selection: null,
      })
      const { container, dom, restoreGlobals } = createDom()
      const root = createRoot(container)

      return { container, dom, editor, restoreGlobals, root }
    },
    async ({ container, editor, root }) => {
      await act(async () => {
        root.render(
          React.createElement(
            Slate,
            { editor },
            React.createElement(
              Editable,
              createEditableProps({ domStrategy, renderElement })
            )
          )
        )
      })

      if (getPendingRootGroupCount(container) > 0) {
        await waitForNativeSurfaceComplete(container)
      }
    }
  )

const measureType = async ({
  blockIndex,
  domStrategy,
  renderElement,
  selectBefore = false,
}) =>
  measureLane(
    () => mount({ domStrategy, renderElement }),
    async ({ editor }) => {
      if (selectBefore) {
        await act(async () => {
          select(editor, {
            anchor: { path: [blockIndex, 0], offset: 0 },
            focus: { path: [blockIndex, 0], offset: 0 },
          })
        })
      }

      for (let index = 0; index < typeOps; index += 1) {
        await profileBenchmarkDurationAsync('direct-type-act', () =>
          act(async () => {
            insertText(editor, 'X', {
              at: { path: [blockIndex, 0], offset: index },
            })
          })
        )
      }
      const typedText = Editor.string(editor, [blockIndex])
      assert.equal(
        (typedText.match(/X/g) ?? []).length,
        typeOps,
        'current measureType block=' +
          blockIndex +
          ' selectBefore=' +
          selectBefore +
          ' text=' +
          JSON.stringify(typedText.slice(0, 80))
      )
    }
  )

const selectBlock = async ({ blockIndex, editor }) => {
  await act(async () => {
    select(editor, {
      anchor: { path: [blockIndex, 0], offset: 0 },
      focus: { path: [blockIndex, 0], offset: 0 },
    })
  })
}

const measureSelectBlock = async ({ blockIndex, domStrategy, renderElement }) =>
  measureLane(
    () => mount({ domStrategy, renderElement }),
    async ({ editor }) => {
      await selectBlock({ blockIndex, editor })
      assert.deepEqual(getSelection(editor)?.anchor, {
        path: [blockIndex, 0],
        offset: 0,
      })
    }
  )

const measureTypeAfterSelect = async ({
  blockIndex,
  domStrategy,
  renderElement,
}) =>
  measurePreparedLane(
    () => mount({ domStrategy, renderElement }),
    async ({ editor }) => {
      await selectBlock({ blockIndex, editor })
    },
    async ({ editor }) => {
      for (let index = 0; index < typeOps; index += 1) {
        await profileBenchmarkDurationAsync('type-after-select-act', () =>
          act(async () => {
            insertText(editor, 'X', {
              at: { path: [blockIndex, 0], offset: index },
            })
          })
        )
      }
      const typedText = Editor.string(editor, [blockIndex])
      assert.equal(
        (typedText.match(/X/g) ?? []).length,
        typeOps,
        'current measureTypeAfterSelect block=' +
          blockIndex +
          ' text=' +
          JSON.stringify(typedText.slice(0, 80))
      )
    }
  )

const getPartialDOMPlaceholderForBlock = ({ blockIndex, container }) => {
  const placeholders = [
    ...container.querySelectorAll(
      '[data-slate-dom-strategy-placeholder="true"]'
    ),
  ]
  const inferredSegmentSize = Math.max(
    1,
    Math.ceil(blocks / (placeholders.length + 1))
  )
  const segmentIndex = Math.floor(blockIndex / inferredSegmentSize)
  const placeholder = placeholders.find(
    (element) =>
      element.getAttribute('data-slate-dom-strategy-segment') ===
      String(segmentIndex)
  )

  return {
    inferredSegmentSize,
    placeholder,
    segmentIndex,
  }
}

const promoteBlock = async ({ blockIndex, container, dom }) => {
  const { inferredSegmentSize, placeholder, segmentIndex } =
    getPartialDOMPlaceholderForBlock({ blockIndex, container })

  if (!placeholder) {
    return {
      inferredSegmentSize,
      promoted: false,
      segmentIndex,
    }
  }

  await profileBenchmarkDurationAsync('promote-placeholder-mousedown-act', () =>
    act(async () => {
      placeholder.dispatchEvent(
        new dom.window.MouseEvent('mousedown', {
          bubbles: true,
        })
      )
    })
  )
  await profileBenchmarkDurationAsync('promote-placeholder-settle', () =>
    settleBenchmark()
  )

  return {
    inferredSegmentSize,
    promoted: true,
    segmentIndex,
  }
}

const measurePromoteBlock = async ({
  blockIndex,
  domStrategy,
  renderElement,
}) =>
  measureLane(
    () => mount({ domStrategy, renderElement }),
    async ({ container, dom }) => {
      const promotion = await promoteBlock({ blockIndex, container, dom })
      const root = getEditableRoot(container)

      return {
        inferredSegmentSize: promotion.inferredSegmentSize,
        promoted: promotion.promoted ? 1 : 0,
        segmentIndex: promotion.segmentIndex,
        textHostCount: root.querySelectorAll('[data-slate-node="text"]').length,
      }
    }
  )

const measurePromoteThenType = async ({
  blockIndex,
  domStrategy,
  renderElement,
}) =>
  measureLane(
    () => mount({ domStrategy, renderElement }),
    async ({ container, dom, editor }) => {
      await promoteBlock({ blockIndex, container, dom })

      await selectBlock({ blockIndex, editor })

      for (let index = 0; index < typeOps; index += 1) {
        await profileBenchmarkDurationAsync('promote-type-act', () =>
          act(async () => {
            insertText(editor, 'X', {
              at: { path: [blockIndex, 0], offset: index },
            })
          })
        )
      }
      const typedText = Editor.string(editor, [blockIndex])
      assert.equal(
        (typedText.match(/X/g) ?? []).length,
        typeOps,
        'current measurePromoteThenType block=' +
          blockIndex +
          ' text=' +
          JSON.stringify(typedText.slice(0, 80))
      )
    }
  )

const promoteAndSelectBlock = async ({ blockIndex, container, dom, editor }) => {
  await promoteBlock({ blockIndex, container, dom })

  const selection = {
    anchor: { path: [blockIndex, 0], offset: 0 },
    focus: { path: [blockIndex, 0], offset: 0 },
  }
  const root = getEditableRoot(container)
  const handle = root.__slateBrowserHandle

  await act(async () => {
    root.focus()

    if (handle?.selectRange) {
      handle.selectRange(selection)
    } else {
      select(editor, selection)
    }
  })
  await settleBenchmark()

  return root
}

const createMissingBeforeInputTargetMessage = ({ blockIndex, root }) =>
  'Missing mounted text target for beforeinput: selection=' +
  JSON.stringify(root.__slateBrowserHandle?.getSelection?.()) +
  ', textHosts=' +
  root.querySelectorAll('[data-slate-node="text"]').length +
  ', blockIndex=' +
  blockIndex +
  ', mountedText=' +
  JSON.stringify((root.textContent ?? '').slice(0, 160))

const getPendingRootGroupCount = (container) =>
  container.querySelectorAll('[data-slate-root-group-state="pending-mount"]')
    .length

const waitForNativeSurfaceComplete = async (container) => {
  for (let attempt = 0; attempt < 2000; attempt += 1) {
    if (getPendingRootGroupCount(container) === 0) {
      return
    }

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1))
    })
  }

  throw new Error(
    'Timed out waiting for native surface completion: pendingGroups=' +
      getPendingRootGroupCount(container)
  )
}

const setupSelectedTextInputTarget = async ({
  blockIndex,
  domStrategy,
  renderElement,
}) => {
  const context = await mount({ domStrategy, renderElement })
  const editableRoot = await promoteAndSelectBlock({
    blockIndex,
    container: context.container,
    dom: context.dom,
    editor: context.editor,
  })
  const target = getCurrentSelectionTextEventTarget({
    blockIndex,
    dom: context.dom,
    root: editableRoot,
  })

  if (!target) {
    throw new Error(
      createMissingBeforeInputTargetMessage({ blockIndex, root: editableRoot })
    )
  }

  return { ...context, editableRoot, target }
}

const measureSelectThenModelBeforeInputType = async ({
  blockIndex,
  domStrategy,
  renderElement,
}) =>
  measureLane(
    () => mount({ domStrategy, renderElement }),
    async ({ container, dom, editor }) => {
      const root = await promoteAndSelectBlock({
        blockIndex,
        container,
        dom,
        editor,
      })
      let target = getCurrentSelectionTextEventTarget({
        blockIndex,
        dom,
        root,
      })

      for (let index = 0; index < typeOps; index += 1) {
        await profileBenchmarkDurationAsync(
          'select-then-model-beforeinput-act',
          () =>
            act(async () => {
              target = getCurrentSelectionTextEventTarget({
                blockIndex,
                dom,
                root,
              })

              if (!target) {
                throw new Error(
                  createMissingBeforeInputTargetMessage({ blockIndex, root })
                )
              }

              dispatchModelOwnedBeforeInputText({
                dom,
                target,
                text: modelOwnedBeforeInputText,
              })
            })
        )
        await settleBenchmark()
      }
      const typedText = Editor.string(editor, [blockIndex])
      assert.equal(
        (typedText.match(new RegExp(modelOwnedBeforeInputText, 'g')) ?? [])
          .length,
        typeOps,
        'current measureSelectThenModelBeforeInputType block=' +
          blockIndex +
          ' text=' +
          JSON.stringify(typedText.slice(0, 80))
      )
    }
  )

const measureModelBeforeInputType = async ({
  blockIndex,
  domStrategy,
  renderElement,
}) =>
  measureLane(
    () =>
      setupSelectedTextInputTarget({ blockIndex, domStrategy, renderElement }),
    async ({ dom, editableRoot, editor, target: initialTarget }) => {
      let target = initialTarget

      for (let index = 0; index < typeOps; index += 1) {
        await profileBenchmarkDurationAsync('model-beforeinput-act', () =>
          act(async () => {
            target = getCurrentSelectionTextEventTarget({
              blockIndex,
              dom,
              root: editableRoot,
            })

            if (!target) {
              throw new Error(
                createMissingBeforeInputTargetMessage({
                  blockIndex,
                  root: editableRoot,
                })
              )
            }

            dispatchModelOwnedBeforeInputText({
              dom,
              target,
              text: modelOwnedBeforeInputText,
            })
          })
        )
        await settleBenchmark()
      }

      const typedText = Editor.string(editor, [blockIndex])
      assert.equal(
        (typedText.match(new RegExp(modelOwnedBeforeInputText, 'g')) ?? [])
          .length,
        typeOps,
        'current measureModelBeforeInputType block=' +
          blockIndex +
          ' text=' +
          JSON.stringify(typedText.slice(0, 80))
      )
    }
  )

const measureSelectAll = async ({ domStrategy, renderElement }) =>
  measureLane(
    () => mount({ domStrategy, renderElement }),
    async ({ editor }) => {
      await act(async () => {
        select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        })
      })
      assert.deepEqual(getSelection(editor)?.anchor, Editor.start(editor, []))
    }
  )

const measureReplaceFullDocumentWithText = async ({
  domStrategy,
  renderElement,
}) =>
  measureLane(
    () => mount({ domStrategy, renderElement }),
    async ({ editor }) => {
      await act(async () => {
        select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        })
        insertText(editor, pasteText)
      })
      assert.equal(Editor.string(editor, []), pasteText)
    }
  )

const measureReplaceFullDocumentWithTextModelCommit = async () =>
  measureModelOnlyLane(
    createModelOnlyContext,
    async ({ editor }) => {
      select(editor, {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      })
      insertText(editor, pasteText)
      assert.equal(Editor.string(editor, []), pasteText)
    }
  )

const measureInsertFragmentFullDocument = async ({
  domStrategy,
  renderElement,
}) =>
  measureLane(
    () => mount({ domStrategy, renderElement }),
    async ({ editor }) => {
      await act(async () => {
        select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        })
        insertFragment(editor, createPasteFragment())
      })
      assert.equal(Editor.string(editor, []), pasteText)
    }
  )

const measureInsertFragmentFullDocumentModelCommit = async () =>
  measureModelOnlyLane(
    createModelOnlyContext,
    async ({ editor }) => {
      select(editor, {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      })
      insertFragment(editor, createPasteFragment())
      assert.equal(Editor.string(editor, []), pasteText)
    }
  )

const runSurface = async ({ domStrategy, renderElement, trace }) => {
  const readyMs = await measureReady({ domStrategy, renderElement })

  if (readyOnly) {
    return {
      trace: resolveReadyTrace({
        nativeSurfaceCompleteMs: null,
        readyMs,
        trace,
      }),
      readyMs,
    }
  }

  const nativeSurfaceCompleteMs =
    trace.stagedMountingEnabled && measureNativeSurfaceCompletion
    ? await measureNativeSurfaceComplete({ domStrategy, renderElement })
    : null

  return {
    trace: resolveReadyTrace({ nativeSurfaceCompleteMs, readyMs, trace }),
    nativeSurfaceCompleteMs,
    readyMs,
    selectAllMs: await measureSelectAll({ domStrategy, renderElement }),
    startBlockTypeMs: await measureType({
      blockIndex: 0,
      domStrategy,
      renderElement,
    }),
    ...(splitSelectionLanes
      ? {
          startBlockSelectMs: await measureSelectBlock({
          blockIndex: 0,
          domStrategy,
          renderElement,
        }),
        startBlockTypeAfterSelectMs: await measureTypeAfterSelect({
          blockIndex: 0,
          domStrategy,
          renderElement,
        }),
        }
      : {}),
    startBlockSelectThenTypeMs: await measureType({
      blockIndex: 0,
      domStrategy,
      renderElement,
      selectBefore: true,
    }),
    middleBlockTypeMs: await measureType({
      blockIndex: Math.floor(blocks / 2),
      domStrategy,
      renderElement,
    }),
    ...(splitSelectionLanes
      ? {
          middleBlockSelectMs: await measureSelectBlock({
          blockIndex: Math.floor(blocks / 2),
          domStrategy,
          renderElement,
        }),
        middleBlockTypeAfterSelectMs: await measureTypeAfterSelect({
          blockIndex: Math.floor(blocks / 2),
          domStrategy,
          renderElement,
        }),
        }
      : {}),
    middleBlockSelectThenTypeMs: await measureType({
      blockIndex: Math.floor(blocks / 2),
      domStrategy,
      renderElement,
      selectBefore: true,
    }),
    middleBlockPromoteMs: await measurePromoteBlock({
      blockIndex: Math.floor(blocks / 2),
      domStrategy,
      renderElement,
    }),
    middleBlockPromoteThenTypeMs: await measurePromoteThenType({
      blockIndex: Math.floor(blocks / 2),
      domStrategy,
      renderElement,
    }),
    ...(includeSyntheticBeforeInput
      ? {
          startBlockModelBeforeInputTypeMs: await measureModelBeforeInputType({
            blockIndex: 0,
            domStrategy,
            renderElement,
          }),
          middleBlockModelBeforeInputTypeMs: await measureModelBeforeInputType({
            blockIndex: Math.floor(blocks / 2),
            domStrategy,
            renderElement,
          }),
          startBlockSelectThenModelBeforeInputTypeMs:
            await measureSelectThenModelBeforeInputType({
              blockIndex: 0,
              domStrategy,
              renderElement,
            }),
          middleBlockSelectThenModelBeforeInputTypeMs:
            await measureSelectThenModelBeforeInputType({
              blockIndex: Math.floor(blocks / 2),
              domStrategy,
              renderElement,
            }),
        }
      : {}),
    replaceFullDocumentWithTextModelCommitMs:
      await measureReplaceFullDocumentWithTextModelCommit(),
    replaceFullDocumentWithTextMs: await measureReplaceFullDocumentWithText({
      domStrategy,
      renderElement,
    }),
    insertFragmentFullDocumentModelCommitMs:
      await measureInsertFragmentFullDocumentModelCommit(),
    insertFragmentFullDocumentMs: await measureInsertFragmentFullDocument({
      domStrategy,
      renderElement,
    }),
  }
}

const surfaces = {}

for (const surface of selectedSurfaceDefinitions) {
  logProgress('surface ' + surface.name + ' start')
  const surfaceResult = await runSurface(surface)
  logProgress(
    'surface ' +
      surface.name +
      ' done readyP95=' +
      formatProgressMs(surfaceResult.readyMs?.p95) +
      ' promoteP95=' +
      formatProgressMs(surfaceResult.middleBlockPromoteMs?.p95)
  )
  surfaces[surface.name] = surfaceResult
}

console.log(JSON.stringify({
  config: {
    overscan,
    blocks,
    disposeDelayMs,
    segmentSize,
    includeSyntheticBeforeInput,
    iterations,
    measureNativeSurfaceCompletion,
    profileEnabled,
    readyOnly,
    rootGroupSize,
    splitSelectionLanes,
    typeOps,
  },
  surfaces,
}))
`

const currentPackageManager = await parsePackageManager(currentRepo)

if (!skipBuild) {
  await buildRepo(currentRepo, currentPackageManager, './packages/slate')
  await buildRepo(currentRepo, currentPackageManager, './packages/slate-react')
}

const env = {
  BENCHMARK_PROGRESS: progressEnabled ? '1' : '0',
  REACT_HUGE_COMPARE_ACTIVE_RADIUS: String(overscan),
  REACT_HUGE_COMPARE_BLOCKS: String(blocks),
  REACT_HUGE_COMPARE_CHUNK_SIZE: String(chunkSize),
  REACT_HUGE_COMPARE_ISLAND_SIZE: String(segmentSize),
  REACT_HUGE_COMPARE_ISOLATE_SURFACES: isolateCurrentSurfaces ? '1' : '0',
  REACT_HUGE_COMPARE_ITERATIONS: String(iterations),
  REACT_HUGE_COMPARE_NATIVE_SURFACE_COMPLETE: measureNativeSurfaceCompletion
    ? '1'
    : '0',
  REACT_HUGE_COMPARE_PROFILE: profile ? '1' : '0',
  REACT_HUGE_COMPARE_PROGRESS: progressEnabled ? '1' : '0',
  REACT_HUGE_COMPARE_READY_ONLY: readyOnly ? '1' : '0',
  REACT_HUGE_COMPARE_SURFACES: process.env.REACT_HUGE_COMPARE_SURFACES || '',
  REACT_HUGE_COMPARE_TYPE_OPS: String(typeOps),
}
const currentSurfaceNames = [
  'v2Off',
  'v2DefaultRenderOff',
  'v2DefaultOmitted',
  'v2DefaultRenderAuto',
  'v2AutoExplicit',
  'v2DomPresent',
  'v2ShellExplicitRadius0',
  'v2ShellExplicitRadius1',
  'v2VirtualizedExperimental',
]
const selectedCurrentSurfaceNames = (
  process.env.REACT_HUGE_COMPARE_SURFACES || ''
)
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean)
const currentSurfaceNamesToRun =
  selectedCurrentSurfaceNames.length > 0
    ? selectedCurrentSurfaceNames
    : currentSurfaceNames

const current =
  isolateCurrentSurfaces && currentSurfaceNamesToRun.length > 1
    ? await (async () => {
        const surfaceEntries = []

        for (const surfaceName of currentSurfaceNamesToRun) {
          logProgress(
            `current surface ${surfaceName} start (${surfaceEntries.length + 1}/${currentSurfaceNamesToRun.length})`
          )
          const result = await benchmarkRepo({
            benchmarkSource: currentBenchmarkSource,
            env: {
              ...env,
              REACT_HUGE_COMPARE_SURFACES: surfaceName,
            },
            packageManager: currentPackageManager,
            repo: currentRepo,
          })
          logProgress(`current surface ${surfaceName} done`)

          surfaceEntries.push([surfaceName, result.surfaces[surfaceName]])
        }

        return {
          config: {
            overscan,
            blocks,
            disposeDelayMs,
            segmentSize,
            includeSyntheticBeforeInput,
            isolateCurrentSurfaces,
            iterations,
            measureNativeSurfaceCompletion,
            profileEnabled: profile,
            readyOnly,
            rootGroupSize,
            splitSelectionLanes,
            typeOps,
          },
          surfaces: Object.fromEntries(surfaceEntries),
        }
      })()
    : await (async () => {
        logProgress(
          `current surfaces ${currentSurfaceNamesToRun.join(',')} start`
        )
        const result = await benchmarkRepo({
          benchmarkSource: currentBenchmarkSource,
          env,
          packageManager: currentPackageManager,
          repo: currentRepo,
        })
        logProgress(
          `current surfaces ${currentSurfaceNamesToRun.join(',')} done`
        )

        return result
      })()

if (compareMode === 'current-only') {
  const summary = {
    lane: 'slate-react-huge-document-legacy-compare',
    mode: compareMode,
    currentRepo,
    config: {
      overscan,
      blocks,
      disposeDelayMs,
      segmentSize,
      includeSyntheticBeforeInput,
      isolateCurrentSurfaces,
      iterations,
      measureNativeSurfaceCompletion,
      profile,
      readyOnly,
      rootGroupSize,
      splitSelectionLanes,
      typeOps,
    },
    surfaces: current.surfaces,
    resourceSummaryBySurface: createResourceSummaryBySurface(current.surfaces),
  }

  await writeHugeDocumentArtifact({
    path: getRunArtifactPath({ mode: compareMode }),
    summary,
  })

  printHugeDocumentSummary(summary)
  process.exit(0)
}

const legacyPackageManager = await parsePackageManager(legacyRepo)

if (!skipBuild) {
  logProgress('legacy build start')
  await buildRepo(legacyRepo, legacyPackageManager, './packages/slate-react')
  logProgress('legacy build done')
}

logProgress('legacy benchmark start')
const legacy = await benchmarkRepo({
  benchmarkSource: legacyBenchmarkSource,
  env,
  packageManager: legacyPackageManager,
  repo: legacyRepo,
})
logProgress('legacy benchmark done')

const legacyChunkOn = legacy.surfaces.legacyChunkOn

const createDeltaMeanMs = (surface) =>
  Object.fromEntries(
    Object.keys(surface)
      .filter((lane) => legacyChunkOn[lane])
      .map((lane) => [
        lane,
        {
          v2MinusLegacyChunkOn: round(
            surface[lane].mean - legacyChunkOn[lane].mean
          ),
        },
      ])
  )

const productSurfaceNames = ['v2DefaultRenderAuto', 'v2DomPresent']
const comparableProductLaneNames = readyOnly
  ? ['readyMs']
  : [
      'readyMs',
      'middleBlockTypeMs',
      'middleBlockSelectThenTypeMs',
      'replaceFullDocumentWithTextMs',
      'insertFragmentFullDocumentMs',
    ]
const v2OnlyProductLaneNames = readyOnly
  ? []
  : ['middleBlockPromoteMs', 'middleBlockPromoteThenTypeMs']
const p95RatioRows = productSurfaceNames.flatMap((surfaceName) => {
  const surface = current.surfaces[surfaceName]

  if (!surface) {
    return []
  }

  return comparableProductLaneNames.flatMap((laneName) => {
    const currentLane = surface[laneName]
    const legacyLane = legacyChunkOn[laneName]

    if (!currentLane || !legacyLane || legacyLane.p95 === 0) {
      return []
    }

    return [
      {
        currentP95Ms: currentLane.p95,
        laneName,
        legacyP95Ms: legacyLane.p95,
        p95Ratio: currentLane.p95 / legacyLane.p95,
        surfaceName,
      },
    ]
  })
})
const v2OnlyP95Rows = productSurfaceNames.flatMap((surfaceName) => {
  const surface = current.surfaces[surfaceName]

  if (!surface) {
    return []
  }

  return v2OnlyProductLaneNames.flatMap((laneName) => {
    const currentLane = surface[laneName]

    if (!currentLane?.p95) {
      return []
    }

    return [
      {
        currentP95Ms: currentLane.p95,
        laneName,
        surfaceName,
      },
    ]
  })
})
const worstP95RatioRow = p95RatioRows.reduce(
  (worst, row) => (!worst || row.p95Ratio > worst.p95Ratio ? row : worst),
  null
)

const deltaMeanMsBySurface = Object.fromEntries(
  Object.entries(current.surfaces).map(([surfaceName, surface]) => [
    surfaceName,
    createDeltaMeanMs(surface),
  ])
)

const summary = {
  lane: 'slate-react-huge-document-legacy-compare',
  currentRepo,
  legacyRepo,
  config: {
    overscan,
    blocks,
    chunkSize,
    disposeDelayMs,
    segmentSize,
    includeSyntheticBeforeInput,
    isolateCurrentSurfaces,
    iterations,
    measureNativeSurfaceCompletion,
    profile,
    readyOnly,
    rootGroupSize,
    splitSelectionLanes,
    typeOps,
  },
  comparableLaneNames: comparableProductLaneNames,
  surfaces: {
    legacyChunkOn,
    ...current.surfaces,
  },
  resourceSummaryBySurface: createResourceSummaryBySurface({
    legacyChunkOn,
    ...current.surfaces,
  }),
  deltaMeanMsBySurface,
  v2OnlyLaneNames: v2OnlyProductLaneNames,
  v2OnlyP95Rows,
}

await writeHugeDocumentArtifact({
  path: getRunArtifactPath({ mode: compareMode }),
  summary,
})

if (worstP95RatioRow) {
  console.log(
    `METRIC react_huge_doc_legacy_compare_worst_p95_ratio=${round(
      worstP95RatioRow.p95Ratio
    )}`
  )
  console.log(
    `METRIC react_huge_doc_legacy_compare_worst_p95_delta_ms=${round(
      worstP95RatioRow.currentP95Ms - worstP95RatioRow.legacyP95Ms
    )}`
  )
  console.log(
    `huge-document legacy compare worst p95 surface=${worstP95RatioRow.surfaceName} lane=${worstP95RatioRow.laneName} current=${round(
      worstP95RatioRow.currentP95Ms
    )}ms legacy=${round(worstP95RatioRow.legacyP95Ms)}ms`
  )
}

const defaultAutoPromotionRow = v2OnlyP95Rows.find(
  (row) =>
    row.surfaceName === 'v2DefaultRenderAuto' &&
    row.laneName === 'middleBlockPromoteThenTypeMs'
)
const defaultAutoPromotionOnlyRow = v2OnlyP95Rows.find(
  (row) =>
    row.surfaceName === 'v2DefaultRenderAuto' &&
    row.laneName === 'middleBlockPromoteMs'
)

if (defaultAutoPromotionRow) {
  console.log(
    `METRIC react_huge_doc_legacy_compare_partial_dom_promotion_then_type_p95_ms=${round(
      defaultAutoPromotionRow.currentP95Ms
    )}`
  )
}

if (defaultAutoPromotionOnlyRow) {
  console.log(
    `METRIC react_huge_doc_legacy_compare_partial_dom_promotion_p95_ms=${round(
      defaultAutoPromotionOnlyRow.currentP95Ms
    )}`
  )
}

printHugeDocumentSummary(summary)
