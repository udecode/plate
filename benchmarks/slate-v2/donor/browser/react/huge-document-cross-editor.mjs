import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

import {
  round,
  summarize,
  writeBenchmarkArtifact,
} from '../../shared/stats.mjs';

const currentRepo = process.cwd();
const defaultProseMirrorRepo = resolve(currentRepo, '../../../prosemirror');
const defaultLexicalRepo = resolve(currentRepo, '../../../lexical');

const prosemirrorRepo = resolve(
  currentRepo,
  process.env.CROSS_EDITOR_HUGE_PROSEMIRROR_REPO || defaultProseMirrorRepo
);
const lexicalRepo = resolve(
  currentRepo,
  process.env.CROSS_EDITOR_HUGE_LEXICAL_REPO || defaultLexicalRepo
);

const blocks = Number(process.env.CROSS_EDITOR_HUGE_BLOCKS || 5000);
const iterations = Number(process.env.CROSS_EDITOR_HUGE_ITERATIONS || 5);
const typeOps = Number(process.env.CROSS_EDITOR_HUGE_TYPE_OPS || 10);
const repeatedShiftDownCount = Number(
  process.env.CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_COUNT || 3
);
const repeatedShiftDownMode =
  process.env.CROSS_EDITOR_HUGE_REPEATED_SHIFT_DOWN_MODE || 'shortcut';
const slateVirtualizedEstimatedBlockSize = Number(
  process.env.CROSS_EDITOR_HUGE_SLATE_VIRTUALIZED_ESTIMATED_BLOCK_SIZE || 24
);
const slateVirtualizedOverscan = Number(
  process.env.CROSS_EDITOR_HUGE_SLATE_VIRTUALIZED_OVERSCAN || 0
);
const strictRepeatedShiftDown =
  process.env.CROSS_EDITOR_HUGE_STRICT_REPEATED_SHIFT_DOWN !== '0';
const headless = process.env.CROSS_EDITOR_HUGE_HEADLESS !== '0';
const debugEvents = process.env.CROSS_EDITOR_HUGE_DEBUG_EVENTS === '1';
const debugTrace = process.env.CROSS_EDITOR_HUGE_DEBUG_TRACE === '1';
const skipSlateReactBuild =
  process.env.CROSS_EDITOR_HUGE_SKIP_SLATE_REACT_BUILD === '1';
const selectedSurfaces = new Set(
  (
    process.env.CROSS_EDITOR_HUGE_SURFACES ||
    'slateAuto,slateVirtualized,prosemirror,lexical'
  )
    .split(',')
    .map((surface) => surface.trim())
    .filter(Boolean)
);

const latestArtifactPath =
  'tmp/slate-react-huge-document-cross-editor-benchmark.json';

const sanitizeArtifactSegment = (value) =>
  String(value)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180) || 'default';

const runArtifactPath = `${[
  'tmp/slate-react-huge-document-cross-editor-benchmark',
  `surfaces-${sanitizeArtifactSegment(Array.from(selectedSurfaces).join('-'))}`,
  `blocks-${blocks}`,
  `iters-${iterations}`,
  `ops-${typeOps}`,
  `repeat-${repeatedShiftDownCount}`,
  `repeat-mode-${sanitizeArtifactSegment(repeatedShiftDownMode)}`,
  `voverscan-${slateVirtualizedOverscan}`,
].join('-')}.json`;

const modulePaths = {
  lexical: resolve(lexicalRepo, 'packages/lexical/dist/Lexical.mjs'),
  prosemirrorModel: resolve(prosemirrorRepo, 'model/dist/index.js'),
  prosemirrorState: resolve(prosemirrorRepo, 'state/dist/index.js'),
  prosemirrorTransform: resolve(prosemirrorRepo, 'transform/dist/index.js'),
  prosemirrorView: resolve(prosemirrorRepo, 'view/dist/index.js'),
};

const missingModulePaths = Object.entries(modulePaths)
  .filter(([, path]) => !existsSync(path))
  .map(([key, path]) => `${key}: ${path}`);

if (missingModulePaths.length > 0) {
  throw new Error(
    [
      'Missing external editor build outputs:',
      ...missingModulePaths.map((path) => `- ${path}`),
      '',
      'Build ProseMirror core packages and Lexical before running this lane.',
    ].join('\n')
  );
}

const entrySource = `
import {
  Schema,
} from ${JSON.stringify(modulePaths.prosemirrorModel)}
import {
  EditorState,
  TextSelection,
} from ${JSON.stringify(modulePaths.prosemirrorState)}
import {
  EditorView,
} from ${JSON.stringify(modulePaths.prosemirrorView)}
import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  createReactEditor,
  Editable,
  Slate,
} from '@platejs/slate-react'
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  createEditor,
} from ${JSON.stringify(modulePaths.lexical)}

const typeOps = ${JSON.stringify(typeOps)}
const slateVirtualizedEstimatedBlockSize = ${JSON.stringify(
  slateVirtualizedEstimatedBlockSize
)}
const slateVirtualizedOverscan = ${JSON.stringify(slateVirtualizedOverscan)}
const typeText = 'X'.repeat(typeOps)
const app = document.getElementById('app')

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      content: 'text*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0]
      },
    },
    text: { group: 'inline' },
  },
})

const state = {
  lexical: null,
  lexicalTextKeys: [],
  prosemirror: null,
  reactRoot: null,
  slateDOMStrategyMetrics: null,
  slateEditor: null,
}

const recordReactProfile = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  globalThis.__CROSS_EDITOR_TRACE__?.reactProfilerEvents.push({
    actualDuration,
    baseDuration,
    commitTime,
    id,
    phase,
    startTime,
  })
}

const clearApp = () => {
  if (state.reactRoot) {
    state.reactRoot.unmount()
    state.reactRoot = null
  }

  state.slateDOMStrategyMetrics = null
  app.textContent = ''
}

const createShell = (surface) => {
  clearApp()
  const shell = document.createElement('div')
  shell.id = surface + '-editor'
  shell.dataset.surface = surface
  shell.style.cssText = [
    'height:600px',
    'overflow:auto',
    'border:0',
    'outline:0',
    'font:16px/1.35 system-ui, sans-serif',
  ].join(';')
  app.appendChild(shell)
  return shell
}

const installProseMirror = (blockCount) => {
  const shell = createShell('prosemirror')
  const children = Array.from({ length: blockCount }, (_, index) =>
    schema.nodes.paragraph.create(null, schema.text('block-' + index))
  )
  const doc = schema.nodes.doc.create(null, children)
  const editorState = EditorState.create({ doc })
  const view = new EditorView(shell, {
    state: editorState,
  })

  state.prosemirror = view
}

const waitLexicalUpdate = (editor, update) =>
  new Promise((resolvePromise) => {
    editor.update(update, {
      discrete: true,
      onUpdate: resolvePromise,
    })
  })

const createSlateValue = (blockCount) =>
  Array.from({ length: blockCount }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: 'block-' + index }],
  }))

const renderSlateElement = ({ attributes, children }) =>
  React.createElement('p', attributes, children)

const installSlate = async (surface, blockCount) => {
  const shell = createShell(surface)
  const editor = createReactEditor({
    initialValue: createSlateValue(blockCount),
  })
  const stagedSurface =
    surface === 'slateStaged' || surface === 'slateStagedNativeComplete'
  const waitForNativeSurfaceComplete = surface === 'slateStagedNativeComplete'
  const domStrategy =
    surface === 'slateVirtualized'
      ? {
          estimatedBlockSize: slateVirtualizedEstimatedBlockSize,
          overscan: slateVirtualizedOverscan,
          threshold: 1,
          type: 'virtualized',
        }
      : stagedSurface
        ? 'staged'
      : 'auto'
  const editableStyle =
    surface === 'slateVirtualized'
      ? {
          height: 600,
          overflowY: 'auto',
        }
      : undefined
  const root = createRoot(shell)
  const renderEditable = (collectDOMStrategyMetrics = false) => {
    root.render(
      React.createElement(
        React.Profiler,
        {
          id: 'slate:' + surface,
          onRender: recordReactProfile,
        },
        React.createElement(
          Slate,
          { editor },
          React.createElement(Editable, {
            domStrategy,
            onDOMStrategyMetrics: collectDOMStrategyMetrics
              ? (metrics) => {
                  state.slateDOMStrategyMetrics = metrics
                }
              : undefined,
            renderElement: renderSlateElement,
            spellCheck: false,
            style: editableStyle,
          })
        )
      )
    )
  }

  state.reactRoot = root
  state.slateEditor = editor
  renderEditable(waitForNativeSurfaceComplete)
  await globalThis.__CROSS_EDITOR_HUGE__.nextPaint()

  if (waitForNativeSurfaceComplete) {
    await globalThis.__CROSS_EDITOR_HUGE__.waitForSlateStagedNativeSurface()
    renderEditable()
    await globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
  }
}

const installLexical = async (blockCount) => {
  const shell = createShell('lexical')
  const rootElement = document.createElement('div')
  rootElement.contentEditable = 'true'
  rootElement.spellcheck = false
  rootElement.style.cssText = 'outline:0;min-height:600px'
  shell.appendChild(rootElement)

  const editor = createEditor({
    namespace: 'cross-editor-huge-document',
    onError(error) {
      throw error
    },
  })
  const textKeys = []

  editor.setRootElement(rootElement)
  await waitLexicalUpdate(editor, () => {
    const root = $getRoot()
    root.clear()

    for (let index = 0; index < blockCount; index += 1) {
      const paragraph = $createParagraphNode()
      const text = $createTextNode('block-' + index)
      textKeys.push(text.getKey())
      paragraph.append(text)
      root.append(paragraph)
    }
  })

  state.lexical = editor
  state.lexicalTextKeys = textKeys
}

const prosemirrorTextPosition = (view, blockIndex, offset) => {
  let position = 1

  for (let index = 0; index < blockIndex; index += 1) {
    position += view.state.doc.child(index).nodeSize
  }

  return position + 1 + offset
}

const scrollNativeSelectionFocusIntoView = () => {
  const node = document.getSelection()?.focusNode ?? null
  const element =
    node instanceof Element
      ? node
      : node?.parentElement instanceof Element
        ? node.parentElement
        : null

  element?.scrollIntoView({ block: 'center', inline: 'nearest' })
}

const selectProseMirrorBlock = (blockIndex, offset = 0) => {
  const view = state.prosemirror
  const position = prosemirrorTextPosition(view, blockIndex, offset)
  view.dispatch(
    view.state.tr
      .setSelection(TextSelection.create(view.state.doc, position))
      .scrollIntoView()
  )
  view.focus()
  scrollNativeSelectionFocusIntoView()
}

const selectLexicalBlock = async (blockIndex, offset = 0) => {
  const editor = state.lexical
  const key = state.lexicalTextKeys[blockIndex]

  await waitLexicalUpdate(editor, () => {
    const text = $getNodeByKey(key)
    text.select(offset, offset)
  })

  editor.focus()
  scrollNativeSelectionFocusIntoView()
}

const selectSlateBlock = async (blockIndex, offset = 0) => {
  const editor = state.slateEditor
  const root = document.querySelector('[data-slate-editor="true"]')
  const handle = root?.__slateBrowserHandle

  if (handle?.selectRange) {
    handle.setViewSelection?.(null)
    handle.selectRange({
      anchor: { path: [blockIndex, 0], offset },
      focus: { path: [blockIndex, 0], offset },
    })
    return
  }

  if (handle?.focus) {
    handle.scrollPathIntoView?.([blockIndex, 0], 'center')
    editor.update((tx) => {
      tx.selection.set({ path: [blockIndex, 0], offset })
    })
    handle.focus()

    return
  }

  editor.update((tx) => {
    tx.selection.set({ path: [blockIndex, 0], offset })
  })

  root?.focus()
}

const waitForTypingSurface = async (surface, blockIndex) => {
  if (!surface.startsWith('@platejs/slate')) {
    await globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
    return
  }

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const root = document.querySelector('[data-slate-editor="true"]')
    const element = root?.__slateBrowserHandle?.getElementByPath?.([
      blockIndex,
      0,
    ])

    if (element?.isConnected) {
      if (root instanceof HTMLElement) {
        root.focus({ preventScroll: true })
      }
      return
    }

    await globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
  }

  throw new Error(
    surface + ' text path [' + blockIndex + ',0] was not mounted before typing'
  )
}

const selectTypingSurface = async (surface, blockIndex, offset) => {
  if (!surface.startsWith('@platejs/slate')) {
    return
  }

  const root = document.querySelector('[data-slate-editor="true"]')
  const handle = root?.__slateBrowserHandle
  const textElement = root?.querySelector(
    '[data-slate-node="text"][data-slate-path="' + blockIndex + ',0"]'
  )

  if (!(root instanceof HTMLElement) || !(textElement instanceof HTMLElement)) {
    throw new Error(
      surface + ' text path [' + blockIndex + ',0] was not mounted for typing'
    )
  }

  const selection = {
    anchor: { offset, path: [blockIndex, 0] },
    focus: { offset, path: [blockIndex, 0] },
  }

  if (handle?.setNativeDOMSelection?.(selection)) {
    handle.importDOMSelection?.()
    await globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
    return
  }

  const walker = document.createTreeWalker(textElement, NodeFilter.SHOW_TEXT)
  const textNode = walker.nextNode()

  if (!textNode) {
    throw new Error(
      surface + ' text path [' + blockIndex + ',0] has no text node'
    )
  }

  const nativeSelection = document.getSelection()
  const range = document.createRange()

  root.focus({ preventScroll: true })
  range.setStart(textNode, offset)
  range.collapse(true)
  nativeSelection?.removeAllRanges()
  nativeSelection?.addRange(range)
  document.dispatchEvent(new Event('selectionchange', { bubbles: true }))
  await globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
}

const waitForPendingTextInputRepair = async (surface) => {
  if (!surface.startsWith('@platejs/slate')) {
    return
  }

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const root = document.querySelector('[data-slate-editor="true"]')
    const inputState = root?.__slateBrowserHandle?.getInputState?.()

    if (!inputState?.pendingNativeTextInputRepairPathKey) {
      return
    }

    await globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
  }

  throw new Error(surface + ' still had pending native text repair after typing')
}

const blockText = (surface, blockIndex) => {
  if (surface.startsWith('@platejs/slate')) {
    return state.slateEditor.read(
      (readState) =>
        readState.runtime.snapshot().children[blockIndex]?.children[0]?.text ??
        ''
    )
  }

  if (surface === 'prosemirror') {
    return state.prosemirror.state.doc.child(blockIndex).textContent
  }

  let textContent = ''
  state.lexical.getEditorState().read(() => {
    textContent = $getNodeByKey(state.lexicalTextKeys[blockIndex]).getTextContent()
  })
  return textContent
}

const modelSelectionTextLength = (surface) => {
  if (!surface.startsWith('@platejs/slate')) {
    return document
      .getSelection()
      ?.toString()
      .replace(/\uFEFF/g, '').length ?? 0
  }

  const root = document.querySelector('[data-slate-editor="true"]')
  const selection = root?.__slateBrowserHandle?.getSelection?.()

  if (!selection) {
    return 0
  }

  const points = [selection.anchor, selection.focus].sort((left, right) => {
    const leftBlock = left.path[0] ?? 0
    const rightBlock = right.path[0] ?? 0

    return leftBlock === rightBlock
      ? left.offset - right.offset
      : leftBlock - rightBlock
  })
  const start = points[0]
  const end = points[1]
  const startBlock = start.path[0] ?? 0
  const endBlock = end.path[0] ?? 0

  if (startBlock === endBlock) {
    return Math.max(0, end.offset - start.offset)
  }

  let length = Math.max(0, blockText(surface, startBlock).length - start.offset)

  for (let index = startBlock + 1; index < endBlock; index += 1) {
    length += blockText(surface, index).length
  }

  length += Math.max(0, end.offset)

  return length
}

const visibleEditor = () => app.firstElementChild

globalThis.__CROSS_EDITOR_HUGE__ = {
  async assertTyped(surface, blockIndex, expectedCount = typeOps) {
    const text = blockText(surface, blockIndex)
    const typedCount = this.typedCount(surface, blockIndex)

    if (typedCount !== expectedCount) {
      throw new Error(
        surface +
          ' typed count mismatch at block ' +
          blockIndex +
          ': expected count ' +
          expectedCount +
          ', got ' +
          typedCount +
          ' in ' +
          JSON.stringify(text)
      )
    }
  },
  async install(surface, blockCount) {
    if (surface.startsWith('@platejs/slate')) {
      await installSlate(surface, blockCount)
      return
    }

    if (surface === 'prosemirror') {
      installProseMirror(blockCount)
      return
    }

    if (surface === 'lexical') {
      await installLexical(blockCount)
      return
    }

    throw new Error('Unknown surface: ' + surface)
  },
  nextPaint() {
    return new Promise((resolvePromise) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolvePromise(performance.now())
        })
      })
    })
  },
  async waitForSlateStagedNativeSurface() {
    for (let attempt = 0; attempt < 240; attempt += 1) {
      const metrics = state.slateDOMStrategyMetrics

      if (
        metrics &&
        (metrics.effectiveStrategy !== 'staged' || metrics.nativeSurfaceComplete)
      ) {
        return
      }

      await this.nextPaint()
    }

    throw new Error(
      'Timed out waiting for Slate staged native surface: ' +
        JSON.stringify(state.slateDOMStrategyMetrics)
    )
  },
  resetTrace() {
    globalThis.__CROSS_EDITOR_TRACE__.longTasks.length = 0
    globalThis.__CROSS_EDITOR_TRACE__.profilerEvents.length = 0
    globalThis.__CROSS_EDITOR_TRACE__.reactProfilerEvents.length = 0
    globalThis.__CROSS_EDITOR_EVENT_TRACE__?.events.splice(0)
  },
  async select(surface, blockIndex, offset = 0) {
    if (surface.startsWith('@platejs/slate')) {
      await selectSlateBlock(blockIndex, offset)
    } else if (surface === 'prosemirror') {
      selectProseMirrorBlock(blockIndex, offset)
    } else if (surface === 'lexical') {
      await selectLexicalBlock(blockIndex, offset)
    } else {
      throw new Error('Unknown surface: ' + surface)
    }

    await this.nextPaint()
  },
  snapshot(surface) {
    const editor = visibleEditor()
    return {
      domNodes: editor ? editor.querySelectorAll('*').length : 0,
      heapMB:
        performance.memory && performance.memory.usedJSHeapSize
          ? performance.memory.usedJSHeapSize / 1024 / 1024
          : 0,
      longTaskMaxMs: Math.max(
        0,
        ...globalThis.__CROSS_EDITOR_TRACE__.longTasks.map((entry) => entry.duration)
      ),
      observedBlocks:
        surface.startsWith('@platejs/slate')
          ? state.slateEditor.read(
              (readState) => readState.runtime.snapshot().children.length
            )
          : surface === 'prosemirror'
          ? state.prosemirror.state.doc.childCount
          : state.lexicalTextKeys.length,
    }
  },
  typedCount(surface, blockIndex) {
    const text = blockText(surface, blockIndex)
    return (text.match(/X/g) || []).length
  },
  selectedTextLength(surface) {
    return modelSelectionTextLength(surface)
  },
  selectTypingSurface,
  typeText,
  waitForPendingTextInputRepair,
  waitForTypingSurface,
}

globalThis.__CROSS_EDITOR_TRACE__ = {
  longTasks: [],
  profilerEvents: [],
  reactProfilerEvents: [],
}

globalThis.__SLATE_REACT_RENDER_PROFILER__ = {
  record(event) {
    globalThis.__CROSS_EDITOR_TRACE__.profilerEvents.push({ ...event })
  },
}

if ('PerformanceObserver' in globalThis) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        globalThis.__CROSS_EDITOR_TRACE__.longTasks.push({
          attribution: Array.from(entry.attribution ?? []).map(
            (attribution) => ({
              containerId: attribution.containerId ?? '',
              containerName: attribution.containerName ?? '',
              containerSrc: attribution.containerSrc ?? '',
              containerType: attribution.containerType ?? '',
              entryType: attribution.entryType,
              name: attribution.name,
            })
          ),
          duration: entry.duration,
          name: entry.name,
          startTime: entry.startTime,
        })
      }
    })
    observer.observe({ type: 'longtask', buffered: false })
  } catch {}
}

globalThis.__CROSS_EDITOR_HUGE_READY__ = true
`;

const createHtml = (bundleSource) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
      }
      p {
        margin: 0 0 4px;
      }
      .ProseMirror {
        outline: 0;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
      globalThis.__CROSS_EDITOR_EVENT_TRACE__ = { events: [] };
      if (${JSON.stringify(debugEvents)}) {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
        const listenerWrappers = new WeakMap();
        const getWrapper = (listener, type) => {
          if (
            !listener ||
            (type !== 'selectionchange' && type !== 'keydown')
          ) {
            return listener;
          }

          const existingWrapper = listenerWrappers.get(listener);

          if (existingWrapper) {
            return existingWrapper;
          }

          const wrappedListener =
            typeof listener === 'function'
              ? function wrappedEventListener(event) {
                  const startedAt = performance.now();

                  try {
                    return listener.call(this, event);
                  } finally {
                    const duration = performance.now() - startedAt;

                    if (duration > 1 || type === 'keydown') {
                      globalThis.__CROSS_EDITOR_EVENT_TRACE__.events.push({
                        altKey: event && 'altKey' in event ? event.altKey : null,
                        ctrlKey: event && 'ctrlKey' in event ? event.ctrlKey : null,
                        defaultPrevented: event.defaultPrevented,
                        duration,
                        key: event && 'key' in event ? event.key : null,
                        metaKey: event && 'metaKey' in event ? event.metaKey : null,
                        shiftKey: event && 'shiftKey' in event ? event.shiftKey : null,
                        startTime: startedAt,
                        target:
                          this === document
                            ? 'document'
                            : this === window
                              ? 'window'
                              : this?.nodeName ?? 'unknown',
                        type,
                      });
                    }
                  }
                }
              : {
                  handleEvent(event) {
                    const startedAt = performance.now();

                    try {
                      return listener.handleEvent(event);
                    } finally {
                      const duration = performance.now() - startedAt;

                      if (duration > 1 || type === 'keydown') {
                        globalThis.__CROSS_EDITOR_EVENT_TRACE__.events.push({
                          altKey: event && 'altKey' in event ? event.altKey : null,
                          ctrlKey: event && 'ctrlKey' in event ? event.ctrlKey : null,
                          defaultPrevented: event.defaultPrevented,
                          duration,
                          key: event && 'key' in event ? event.key : null,
                          metaKey: event && 'metaKey' in event ? event.metaKey : null,
                          shiftKey: event && 'shiftKey' in event ? event.shiftKey : null,
                          startTime: startedAt,
                          target:
                            this === document
                              ? 'document'
                              : this === window
                                ? 'window'
                                : this?.nodeName ?? 'unknown',
                          type,
                        });
                      }
                    }
                  },
                };

          listenerWrappers.set(listener, wrappedListener);

          return wrappedListener;
        };

        EventTarget.prototype.addEventListener = function addEventListener(
          type,
          listener,
          options
        ) {
          return originalAddEventListener.call(
            this,
            type,
            getWrapper(listener, type),
            options
          );
        };
        EventTarget.prototype.removeEventListener =
          function removeEventListener(type, listener, options) {
            return originalRemoveEventListener.call(
              this,
              type,
              getWrapper(listener, type),
              options
            );
          };
      }
    </script>
    <script type="module">${bundleSource.replaceAll(
      '</script',
      '<\\/script'
    )}</script>
  </body>
</html>`;

const run = async (command, args, cwd) => {
  const process = Bun.spawn([command, ...args], {
    cwd,
    stderr: 'pipe',
    stdout: 'pipe',
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed in ${cwd}\n${stdout}\n${stderr}`
    );
  }

  return { stderr, stdout };
};

const buildBrowserBundle = async () => {
  const outDir = resolve(currentRepo, 'tmp/cross-editor-huge-document');
  const entryPath = resolve(outDir, 'entry.mjs');
  const bundlePath = resolve(outDir, 'bundle.js');

  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });
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
    currentRepo
  );

  const bundleSource = await readFile(bundlePath, 'utf8');
  const htmlSource = createHtml(bundleSource);

  return {
    htmlSource,
    outDir,
  };
};

const buildSlateReactPackage = async () => {
  if (skipSlateReactBuild) {
    return;
  }

  console.log('Building slate-react package for cross-editor benchmark');
  await run('bun', ['--filter', '@platejs/slate-react', 'build'], currentRepo);
};

const summarizeMetric = (samples, key) =>
  summarize(samples.map((sample) => sample[key]));

const summarizeNestedMetric = (samples, sampleKey, metricKey) =>
  summarize(
    samples.flatMap((sample) =>
      (sample[sampleKey] ?? []).map((entry) => entry[metricKey])
    )
  );

const summarizeNestedProfilerSummary = (samples, sampleKey, summaryKey) => {
  const buckets = new Map();

  for (const sample of samples) {
    for (const entry of sample[sampleKey] ?? []) {
      for (const [key, value] of Object.entries(entry[summaryKey] ?? {})) {
        const current = buckets.get(key) ?? {
          count: 0,
          durationMs: 0,
        };

        current.count += Number.isFinite(value.count) ? value.count : 0;
        current.durationMs += Number.isFinite(value.durationMs)
          ? value.durationMs
          : 0;
        buckets.set(key, current);
      }
    }
  }

  return Object.fromEntries(
    [...buckets.entries()]
      .sort(
        ([leftKey, left], [rightKey, right]) =>
          right.durationMs - left.durationMs ||
          right.count - left.count ||
          leftKey.localeCompare(rightKey)
      )
      .slice(0, 12)
  );
};

const summarizeNestedReactProfilerSummary = (
  samples,
  sampleKey,
  summaryKey
) => {
  const summaries = samples.flatMap((sample) =>
    (sample[sampleKey] ?? []).map((entry) => entry[summaryKey]).filter(Boolean)
  );

  return {
    actualDurationMs: summarize(
      summaries
        .map((summary) => summary.actualDurationMs?.p95)
        .filter(Number.isFinite)
    ),
    baseDurationMs: summarize(
      summaries
        .map((summary) => summary.baseDurationMs?.p95)
        .filter(Number.isFinite)
    ),
    count: summaries.reduce(
      (total, summary) =>
        total + (Number.isFinite(summary.count) ? summary.count : 0),
      0
    ),
    totalActualDurationMs: round(
      summaries.reduce(
        (total, summary) =>
          total +
          (Number.isFinite(summary.totalActualDurationMs)
            ? summary.totalActualDurationMs
            : 0),
        0
      )
    ),
  };
};

const summarizeNestedRenderSummary = (samples, sampleKey, summaryKey) => {
  const byKind = new Map();
  const topKeys = new Map();
  let total = 0;

  for (const sample of samples) {
    for (const entry of sample[sampleKey] ?? []) {
      const summary = entry[summaryKey];

      if (!summary) {
        continue;
      }

      total += Number.isFinite(summary.total) ? summary.total : 0;

      for (const [key, count] of Object.entries(summary.byKind ?? {})) {
        byKind.set(key, (byKind.get(key) ?? 0) + count);
      }

      for (const [key, count] of Object.entries(summary.topKeys ?? {})) {
        topKeys.set(key, (topKeys.get(key) ?? 0) + count);
      }
    }
  }

  const sortCounts = ([leftKey, leftCount], [rightKey, rightCount]) =>
    rightCount - leftCount || leftKey.localeCompare(rightKey);

  return {
    byKind: Object.fromEntries([...byKind.entries()].sort(sortCounts)),
    topKeys: Object.fromEntries(
      [...topKeys.entries()].sort(sortCounts).slice(0, 16)
    ),
    total,
  };
};

const summarizeProfilerEvents = (events = []) => {
  const buckets = new Map();
  let selectorCheckCount = 0;
  let selectorNotifyCount = 0;
  let selectorSubscriptionCount = 0;

  for (const event of events) {
    const key = event.id ? `${event.kind}:${event.id}` : event.kind;
    const current = buckets.get(key) ?? {
      count: 0,
      durationMs: 0,
    };

    if (event.kind === 'selector' && typeof event.id === 'string') {
      if (event.id.endsWith('-check')) {
        selectorCheckCount += 1;
      } else if (event.id.endsWith('-notify')) {
        selectorNotifyCount += 1;
      } else if (event.id.startsWith('selector-subscription-')) {
        selectorSubscriptionCount += 1;
      }
    }

    current.count += 1;
    current.durationMs +=
      typeof event.duration === 'number' && Number.isFinite(event.duration)
        ? event.duration
        : 0;
    buckets.set(key, current);
  }

  buckets.set('selector:selector-dispatch-checks', {
    count: selectorCheckCount,
    durationMs: 0,
  });
  buckets.set('selector:selector-dispatch-notifies', {
    count: selectorNotifyCount,
    durationMs: 0,
  });
  buckets.set('selector:selector-dispatch-subscriptions', {
    count: selectorSubscriptionCount,
    durationMs: 0,
  });

  return Object.fromEntries(
    [...buckets.entries()]
      .sort(
        ([leftKey, left], [rightKey, right]) =>
          right.durationMs - left.durationMs ||
          right.count - left.count ||
          leftKey.localeCompare(rightKey)
      )
      .slice(0, 12)
  );
};

const isRenderProfilerEvent = (event) =>
  event.kind !== 'core-time' &&
  event.kind !== 'dom-text-sync' &&
  event.kind !== 'runtime-time' &&
  event.kind !== 'selector';

const summarizeProjectionProfilerEvents = (events = []) =>
  summarizeProfilerEvents(
    events.filter(
      (event) =>
        event.kind === 'runtime-time' &&
        typeof event.id === 'string' &&
        event.id.startsWith('projection-store.')
    )
  );

const summarizeViewSelectionProfilerEvents = (events = []) =>
  summarizeProfilerEvents(
    events.filter(
      (event) =>
        typeof event.id === 'string' && event.id.includes('view-selection')
    )
  );

const summarizeRenderProfilerEvents = (events = []) => {
  const renderEvents = events.filter(isRenderProfilerEvent);
  const byKind = new Map();
  const byKey = new Map();

  for (const event of renderEvents) {
    const kindEntry = byKind.get(event.kind) ?? 0;
    const key = event.id ? `${event.kind}:${event.id}` : event.kind;
    const keyEntry = byKey.get(key) ?? 0;

    byKind.set(event.kind, kindEntry + 1);
    byKey.set(key, keyEntry + 1);
  }

  return {
    byKind: Object.fromEntries(
      [...byKind.entries()].sort(
        ([leftKind, leftCount], [rightKind, rightCount]) =>
          rightCount - leftCount || leftKind.localeCompare(rightKind)
      )
    ),
    topKeys: Object.fromEntries(
      [...byKey.entries()]
        .sort(
          ([leftKey, leftCount], [rightKey, rightCount]) =>
            rightCount - leftCount || leftKey.localeCompare(rightKey)
        )
        .slice(0, 16)
    ),
    total: renderEvents.length,
  };
};

const summarizeReactProfilerEvents = (events = []) => {
  const actualDurations = events
    .map((event) => event.actualDuration)
    .filter(Number.isFinite);
  const baseDurations = events
    .map((event) => event.baseDuration)
    .filter(Number.isFinite);

  return {
    actualDurationMs: summarize(actualDurations),
    baseDurationMs: summarize(baseDurations),
    count: events.length,
    totalActualDurationMs: round(
      actualDurations.reduce((total, duration) => total + duration, 0)
    ),
  };
};

const resetCrossEditorTrace = (page) =>
  page.evaluate(() => globalThis.__CROSS_EDITOR_HUGE__.resetTrace());

const readCrossEditorLongTaskMax = (page) =>
  page.evaluate(() =>
    Math.max(
      0,
      ...globalThis.__CROSS_EDITOR_TRACE__.longTasks.map(
        (entry) => entry.duration
      )
    )
  );

const readCrossEditorLongTasks = (page) =>
  page.evaluate(() => globalThis.__CROSS_EDITOR_TRACE__.longTasks);

const readCrossEditorTrace = (page) =>
  page.evaluate(() => ({
    longTasks: globalThis.__CROSS_EDITOR_TRACE__.longTasks.slice(),
    profilerEvents: globalThis.__CROSS_EDITOR_TRACE__.profilerEvents.slice(),
    reactProfilerEvents:
      globalThis.__CROSS_EDITOR_TRACE__.reactProfilerEvents.slice(),
  }));

const readSelectedTextLength = (page, surface) =>
  page.evaluate(
    (selectedSurface) =>
      globalThis.__CROSS_EDITOR_HUGE__.selectedTextLength(selectedSurface),
    surface
  );

const readCrossEditorEventTrace = (page) =>
  page.evaluate(() => globalThis.__CROSS_EDITOR_EVENT_TRACE__?.events ?? []);

const readSlateDebugSnapshot = (page, surface) =>
  page.evaluate((selectedSurface) => {
    if (!selectedSurface.startsWith('@platejs/slate')) {
      return null;
    }

    const root = document.querySelector('[data-slate-editor="true"]');
    const handle = root?.__slateBrowserHandle;

    if (!handle) {
      return null;
    }

    return {
      inputState: handle.getInputState(),
      nativeSelectionLength:
        document
          .getSelection()
          ?.toString()
          .replace(/\uFEFF/g, '').length ?? 0,
      selection: handle.getSelection(),
      trace: handle.getKernelTrace().slice(-6),
      viewSelection: handle.getViewSelection(),
    };
  }, surface);

const measureSurface = async ({ page, surface }) => {
  const lanes = [
    { blockIndex: 0, key: 'startBlock' },
    { blockIndex: Math.floor(blocks / 2), key: 'middleBlock' },
  ];
  const laneSummaries = {};
  let latestSnapshot = null;

  for (const lane of lanes) {
    const samples = [];

    for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
      await page.evaluate(
        async ({ blockCount, selectedSurface }) => {
          await globalThis.__CROSS_EDITOR_HUGE__.install(
            selectedSurface,
            blockCount
          );
          await globalThis.__CROSS_EDITOR_HUGE__.nextPaint();
        },
        { blockCount: blocks, selectedSurface: surface }
      );
      await page.evaluate(() => globalThis.__CROSS_EDITOR_HUGE__.resetTrace());

      const selectStart = await page.evaluate(() => performance.now());
      await page.evaluate(
        async ({ blockIndex, selectedSurface }) => {
          await globalThis.__CROSS_EDITOR_HUGE__.select(
            selectedSurface,
            blockIndex
          );
        },
        { blockIndex: lane.blockIndex, selectedSurface: surface }
      );
      const selectCommandReady = await page.evaluate(() => performance.now());
      const selectPaint = await page.evaluate(() =>
        globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
      );
      const selectTrace = await readCrossEditorTrace(page);
      await resetCrossEditorTrace(page);
      const materializedSelectStart = await page.evaluate(() =>
        performance.now()
      );
      await page.evaluate(
        async ({ blockIndex, selectedSurface }) => {
          await globalThis.__CROSS_EDITOR_HUGE__.select(
            selectedSurface,
            blockIndex,
            1
          );
          await globalThis.__CROSS_EDITOR_HUGE__.waitForTypingSurface(
            selectedSurface,
            blockIndex
          );
          await globalThis.__CROSS_EDITOR_HUGE__.selectTypingSurface(
            selectedSurface,
            blockIndex,
            1
          );
        },
        { blockIndex: lane.blockIndex, selectedSurface: surface }
      );
      const materializedSelectCommandReady = await page.evaluate(() =>
        performance.now()
      );
      const materializedSelectPaint = await page.evaluate(() =>
        globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
      );
      const materializedSelectTrace = await readCrossEditorTrace(page);
      await resetCrossEditorTrace(page);
      await page.keyboard.down('Shift');
      await resetCrossEditorTrace(page);
      const shiftDownStart = await page.evaluate(() => performance.now());
      await page.keyboard.press('ArrowDown');
      const shiftDownCommandReady = await page.evaluate(() =>
        performance.now()
      );
      const shiftDownPaint = await page.evaluate(() =>
        globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
      );
      const shiftDownTrace = await readCrossEditorTrace(page);
      const shiftDownLongTaskMaxMs = await readCrossEditorLongTaskMax(page);
      const shiftDownSelectedTextLength = await readSelectedTextLength(
        page,
        surface
      );
      if (shiftDownSelectedTextLength <= 0) {
        throw new Error(
          `${surface} ${lane.key} Shift+ArrowDown selected no displayed text`
        );
      }
      if (repeatedShiftDownMode !== 'held') {
        await page.keyboard.up('Shift');
      }
      const repeatedShiftDownSamples = [];
      let previousRepeatedShiftDownSelectedTextLength =
        shiftDownSelectedTextLength;

      for (let step = 0; step < repeatedShiftDownCount; step += 1) {
        await resetCrossEditorTrace(page);
        const repeatedShiftDownStart = await page.evaluate(() =>
          performance.now()
        );
        if (repeatedShiftDownMode === 'held') {
          await page.keyboard.press('ArrowDown');
        } else {
          await page.keyboard.press('Shift+ArrowDown');
        }
        const repeatedShiftDownCommandReady = await page.evaluate(() =>
          performance.now()
        );
        const repeatedShiftDownPaint = await page.evaluate(() =>
          globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
        );
        const repeatedShiftDownTrace = await readCrossEditorTrace(page);
        const repeatedShiftDownLongTaskMaxMs =
          await readCrossEditorLongTaskMax(page);
        const repeatedShiftDownSelectedTextLength =
          await readSelectedTextLength(page, surface);

        const extended =
          repeatedShiftDownSelectedTextLength >
          previousRepeatedShiftDownSelectedTextLength;

        if (
          strictRepeatedShiftDown &&
          repeatedShiftDownSelectedTextLength <=
            previousRepeatedShiftDownSelectedTextLength
        ) {
          throw new Error(
            `${surface} ${lane.key} repeated Shift+ArrowDown did not extend selection at step ${
              step + 1
            }: ${previousRepeatedShiftDownSelectedTextLength} -> ${repeatedShiftDownSelectedTextLength}`
          );
        }

        repeatedShiftDownSamples.push({
          commandMs: repeatedShiftDownCommandReady - repeatedShiftDownStart,
          longTaskMaxMs: repeatedShiftDownLongTaskMaxMs,
          paintAfterCommandMs:
            repeatedShiftDownPaint - repeatedShiftDownCommandReady,
          profilerSummary: summarizeProfilerEvents(
            repeatedShiftDownTrace.profilerEvents
          ),
          projectionProfilerSummary: summarizeProjectionProfilerEvents(
            repeatedShiftDownTrace.profilerEvents
          ),
          reactProfilerSummary: summarizeReactProfilerEvents(
            repeatedShiftDownTrace.reactProfilerEvents
          ),
          renderCount: repeatedShiftDownTrace.profilerEvents.filter(
            isRenderProfilerEvent
          ).length,
          renderSummary: summarizeRenderProfilerEvents(
            repeatedShiftDownTrace.profilerEvents
          ),
          selectedTextLength: repeatedShiftDownSelectedTextLength,
          viewSelectionProfilerSummary: summarizeViewSelectionProfilerEvents(
            repeatedShiftDownTrace.profilerEvents
          ),
          extended,
          step: step + 1,
          toPaintMs: repeatedShiftDownPaint - repeatedShiftDownStart,
        });
        previousRepeatedShiftDownSelectedTextLength =
          repeatedShiftDownSelectedTextLength;
      }
      if (repeatedShiftDownMode === 'held') {
        await page.keyboard.up('Shift');
      }
      if (debugTrace) {
        const eventTrace = debugEvents
          ? await readCrossEditorEventTrace(page)
          : [];
        const longTasks = debugEvents
          ? await readCrossEditorLongTasks(page)
          : [];
        const snapshot = await readSlateDebugSnapshot(page, surface);
        if (snapshot) {
          console.log(
            `DEBUG ${surface} ${lane.key} shiftDown ${JSON.stringify(
              debugEvents
                ? {
                    ...snapshot,
                    eventTrace,
                    longTasks,
                  }
                : snapshot
            )}`
          );
        }
      }
      await resetCrossEditorTrace(page);
      const shiftUpStart = await page.evaluate(() => performance.now());
      await page.keyboard.press('Shift+ArrowUp');
      const shiftUpPaint = await page.evaluate(() =>
        globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
      );
      const shiftUpLongTaskMaxMs = await readCrossEditorLongTaskMax(page);
      const shiftUpSelectedTextLength = await readSelectedTextLength(
        page,
        surface
      );
      await page.evaluate(
        async ({ blockIndex, selectedSurface }) => {
          await globalThis.__CROSS_EDITOR_HUGE__.select(
            selectedSurface,
            blockIndex,
            1
          );
          await globalThis.__CROSS_EDITOR_HUGE__.waitForTypingSurface(
            selectedSurface,
            blockIndex
          );
          await globalThis.__CROSS_EDITOR_HUGE__.selectTypingSurface(
            selectedSurface,
            blockIndex,
            1
          );
        },
        { blockIndex: lane.blockIndex, selectedSurface: surface }
      );
      if (debugTrace) {
        const beforeTypeSnapshot = await readSlateDebugSnapshot(page, surface);
        if (beforeTypeSnapshot) {
          console.log(
            `DEBUG ${surface} ${lane.key} beforeType ${JSON.stringify(
              beforeTypeSnapshot
            )}`
          );
        }
      }
      await resetCrossEditorTrace(page);
      const typedCountBefore = await page.evaluate(
        ({ blockIndex, selectedSurface }) =>
          globalThis.__CROSS_EDITOR_HUGE__.typedCount(
            selectedSurface,
            blockIndex
          ),
        { blockIndex: lane.blockIndex, selectedSurface: surface }
      );
      const expectedTypedCount = typedCountBefore + typeOps;
      const typeStart = await page.evaluate(() => performance.now());
      await page.keyboard.type('X'.repeat(typeOps));
      const typeCommandReady = await page.evaluate(() => performance.now());
      const typeTextReady = await page.evaluate(
        async ({ blockIndex, expected, selectedSurface }) => {
          for (let attempt = 0; attempt < 300; attempt += 1) {
            const typedCount = globalThis.__CROSS_EDITOR_HUGE__.typedCount(
              selectedSurface,
              blockIndex
            );

            if (typedCount === expected) {
              return performance.now();
            }

            await new Promise((resolvePromise) => {
              requestAnimationFrame(resolvePromise);
            });
          }

          const root = document.querySelector('[data-slate-editor="true"]');
          const handle = root?.__slateBrowserHandle;
          const debugState = selectedSurface.startsWith('@platejs/slate')
            ? {
                activeElement:
                  document.activeElement instanceof Element
                    ? {
                        dataSlateEditor:
                          document.activeElement.getAttribute(
                            'data-slate-editor'
                          ),
                        dataSlateNode:
                          document.activeElement.getAttribute(
                            'data-slate-node'
                          ),
                        tagName: document.activeElement.tagName,
                      }
                    : null,
                blockText: handle?.getBlockText?.(blockIndex) ?? null,
                focusedRoot: document.activeElement === root,
                inputState: handle?.getInputState?.() ?? null,
                mountedText: !!handle?.getElementByPath?.([blockIndex, 0]),
                nativeSelection:
                  document
                    .getSelection()
                    ?.toString()
                    .replace(/\uFEFF/g, '') ?? '',
                selection: handle?.getSelection?.() ?? null,
                viewSelection: handle?.getViewSelection?.() ?? null,
              }
            : null;

          throw new Error(
            selectedSurface +
              ' typed text was not visible after 300 frames: ' +
              JSON.stringify(debugState)
          );
        },
        {
          blockIndex: lane.blockIndex,
          expected: expectedTypedCount,
          selectedSurface: surface,
        }
      );
      const typePaint = await page.evaluate(() =>
        globalThis.__CROSS_EDITOR_HUGE__.nextPaint()
      );
      const typeTrace = await readCrossEditorTrace(page);
      const typeLongTaskMaxMs = await readCrossEditorLongTaskMax(page);
      await page.evaluate(
        async ({ blockIndex, expectedTypedCount, selectedSurface }) => {
          await globalThis.__CROSS_EDITOR_HUGE__.assertTyped(
            selectedSurface,
            blockIndex,
            expectedTypedCount
          );
        },
        {
          blockIndex: lane.blockIndex,
          expectedTypedCount,
          selectedSurface: surface,
        }
      );
      await page.evaluate(async (selectedSurface) => {
        await globalThis.__CROSS_EDITOR_HUGE__.waitForPendingTextInputRepair(
          selectedSurface
        );
      }, surface);
      const snapshot = await page.evaluate(
        (selectedSurface) =>
          globalThis.__CROSS_EDITOR_HUGE__.snapshot(selectedSurface),
        surface
      );

      if (iteration > 0) {
        samples.push({
          burstToPaintMs: typePaint - typeStart,
          burstToPaintPerOpMs: (typePaint - typeStart) / typeOps,
          domNodes: snapshot.domNodes,
          heapMB: snapshot.heapMB,
          longTaskMaxMs: typeLongTaskMaxMs,
          materializedSelectToPaintMs:
            materializedSelectPaint - materializedSelectStart,
          materializedSelectCommandMs:
            materializedSelectCommandReady - materializedSelectStart,
          materializedSelectPaintAfterCommandMs:
            materializedSelectPaint - materializedSelectCommandReady,
          materializedSelectProfilerSummary: summarizeProfilerEvents(
            materializedSelectTrace.profilerEvents
          ),
          materializedSelectRenderCount:
            materializedSelectTrace.profilerEvents.filter(isRenderProfilerEvent)
              .length,
          materializedSelectRenderSummary: summarizeRenderProfilerEvents(
            materializedSelectTrace.profilerEvents
          ),
          observedBlocks: snapshot.observedBlocks,
          selectCommandMs: selectCommandReady - selectStart,
          selectPaintAfterCommandMs: selectPaint - selectCommandReady,
          selectProfilerSummary: summarizeProfilerEvents(
            selectTrace.profilerEvents
          ),
          selectRenderCount: selectTrace.profilerEvents.filter(
            isRenderProfilerEvent
          ).length,
          selectRenderSummary: summarizeRenderProfilerEvents(
            selectTrace.profilerEvents
          ),
          selectToPaintMs: selectPaint - selectStart,
          shiftDownCommandMs: shiftDownCommandReady - shiftDownStart,
          shiftDownPaintAfterCommandMs: shiftDownPaint - shiftDownCommandReady,
          shiftDownLongTaskMaxMs,
          shiftDownProfilerSummary: summarizeProfilerEvents(
            shiftDownTrace.profilerEvents
          ),
          shiftDownProjectionProfilerSummary: summarizeProjectionProfilerEvents(
            shiftDownTrace.profilerEvents
          ),
          shiftDownRenderCount: shiftDownTrace.profilerEvents.filter(
            isRenderProfilerEvent
          ).length,
          shiftDownRenderSummary: summarizeRenderProfilerEvents(
            shiftDownTrace.profilerEvents
          ),
          shiftDownReactProfilerSummary: summarizeReactProfilerEvents(
            shiftDownTrace.reactProfilerEvents
          ),
          shiftDownSelectedTextLength,
          shiftDownToPaintMs: shiftDownPaint - shiftDownStart,
          shiftDownViewSelectionProfilerSummary:
            summarizeViewSelectionProfilerEvents(shiftDownTrace.profilerEvents),
          repeatedShiftDownSamples,
          shiftUpLongTaskMaxMs,
          shiftUpSelectedTextLength,
          shiftUpToPaintMs: shiftUpPaint - shiftUpStart,
          typeProfilerSummary: summarizeProfilerEvents(
            typeTrace.profilerEvents
          ),
          typeReactProfilerSummary: summarizeReactProfilerEvents(
            typeTrace.reactProfilerEvents
          ),
          typeCommandMs: typeCommandReady - typeStart,
          typePaintAfterReadyMs: typePaint - typeTextReady,
          typeRenderCount: typeTrace.profilerEvents.filter(
            isRenderProfilerEvent
          ).length,
          typeRenderSummary: summarizeRenderProfilerEvents(
            typeTrace.profilerEvents
          ),
          typeTextReadyMs: typeTextReady - typeCommandReady,
          typeToPaintMs: typePaint - typeStart,
        });
      }

      latestSnapshot = snapshot;
    }

    laneSummaries[lane.key] = {
      blockIndex: lane.blockIndex,
      burstToPaintMs: summarizeMetric(samples, 'burstToPaintMs'),
      burstToPaintPerOpMs: summarizeMetric(samples, 'burstToPaintPerOpMs'),
      domNodes: summarizeMetric(samples, 'domNodes'),
      heapMB: summarizeMetric(samples, 'heapMB'),
      longTaskMaxMs: summarizeMetric(samples, 'longTaskMaxMs'),
      materializedSelectToPaintMs: summarizeMetric(
        samples,
        'materializedSelectToPaintMs'
      ),
      materializedSelectCommandMs: summarizeMetric(
        samples,
        'materializedSelectCommandMs'
      ),
      materializedSelectPaintAfterCommandMs: summarizeMetric(
        samples,
        'materializedSelectPaintAfterCommandMs'
      ),
      materializedSelectRenderCount: summarizeMetric(
        samples,
        'materializedSelectRenderCount'
      ),
      observedBlocks: summarizeMetric(samples, 'observedBlocks'),
      samples,
      selectCommandMs: summarizeMetric(samples, 'selectCommandMs'),
      selectPaintAfterCommandMs: summarizeMetric(
        samples,
        'selectPaintAfterCommandMs'
      ),
      selectRenderCount: summarizeMetric(samples, 'selectRenderCount'),
      selectToPaintMs: summarizeMetric(samples, 'selectToPaintMs'),
      shiftDownCommandMs: summarizeMetric(samples, 'shiftDownCommandMs'),
      shiftDownLongTaskMaxMs: summarizeMetric(
        samples,
        'shiftDownLongTaskMaxMs'
      ),
      shiftDownPaintAfterCommandMs: summarizeMetric(
        samples,
        'shiftDownPaintAfterCommandMs'
      ),
      shiftDownRenderCount: summarizeMetric(samples, 'shiftDownRenderCount'),
      repeatedShiftDownCommandMs: summarizeNestedMetric(
        samples,
        'repeatedShiftDownSamples',
        'commandMs'
      ),
      repeatedShiftDownLongTaskMaxMs: summarizeNestedMetric(
        samples,
        'repeatedShiftDownSamples',
        'longTaskMaxMs'
      ),
      repeatedShiftDownPaintAfterCommandMs: summarizeNestedMetric(
        samples,
        'repeatedShiftDownSamples',
        'paintAfterCommandMs'
      ),
      repeatedShiftDownProfilerSummary: summarizeNestedProfilerSummary(
        samples,
        'repeatedShiftDownSamples',
        'profilerSummary'
      ),
      repeatedShiftDownProjectionProfilerSummary:
        summarizeNestedProfilerSummary(
          samples,
          'repeatedShiftDownSamples',
          'projectionProfilerSummary'
        ),
      repeatedShiftDownReactProfilerSummary:
        summarizeNestedReactProfilerSummary(
          samples,
          'repeatedShiftDownSamples',
          'reactProfilerSummary'
        ),
      repeatedShiftDownRenderCount: summarizeNestedMetric(
        samples,
        'repeatedShiftDownSamples',
        'renderCount'
      ),
      repeatedShiftDownRenderSummary: summarizeNestedRenderSummary(
        samples,
        'repeatedShiftDownSamples',
        'renderSummary'
      ),
      repeatedShiftDownSelectedTextLength: summarizeNestedMetric(
        samples,
        'repeatedShiftDownSamples',
        'selectedTextLength'
      ),
      repeatedShiftDownToPaintMs: summarizeNestedMetric(
        samples,
        'repeatedShiftDownSamples',
        'toPaintMs'
      ),
      repeatedShiftDownViewSelectionProfilerSummary:
        summarizeNestedProfilerSummary(
          samples,
          'repeatedShiftDownSamples',
          'viewSelectionProfilerSummary'
        ),
      shiftDownSelectedTextLength: summarizeMetric(
        samples,
        'shiftDownSelectedTextLength'
      ),
      shiftDownToPaintMs: summarizeMetric(samples, 'shiftDownToPaintMs'),
      shiftUpLongTaskMaxMs: summarizeMetric(samples, 'shiftUpLongTaskMaxMs'),
      shiftUpSelectedTextLength: summarizeMetric(
        samples,
        'shiftUpSelectedTextLength'
      ),
      shiftUpToPaintMs: summarizeMetric(samples, 'shiftUpToPaintMs'),
      typeCommandMs: summarizeMetric(samples, 'typeCommandMs'),
      typePaintAfterReadyMs: summarizeMetric(samples, 'typePaintAfterReadyMs'),
      typeRenderCount: summarizeMetric(samples, 'typeRenderCount'),
      typeTextReadyMs: summarizeMetric(samples, 'typeTextReadyMs'),
      typeToPaintMs: summarizeMetric(samples, 'typeToPaintMs'),
    };
  }

  return {
    latestSnapshot,
    lanes: laneSummaries,
  };
};

const printSurface = (surface, summary) => {
  console.log(`\n${surface}`);

  const formatSummary = (metric) =>
    `median=${round(metric.median)}, p75=${round(metric.p75)}, p95=${round(
      metric.p95
    )}, max=${round(metric.max)}, n=${metric.samples.length}`;

  for (const [laneName, lane] of Object.entries(summary.lanes)) {
    console.log(
      `${laneName}: typeToPaintMs p95=${round(
        lane.typeToPaintMs.p95
      )}, typeCommandMs p95=${round(
        lane.typeCommandMs.p95
      )}, typeTextReadyMs p95=${round(
        lane.typeTextReadyMs.p95
      )}, typePaintAfterReadyMs p95=${round(
        lane.typePaintAfterReadyMs.p95
      )}, burstToPaintPerOpMs p95=${round(
        lane.burstToPaintPerOpMs.p95
      )}, materializedSelectToPaintMs p95=${round(
        lane.materializedSelectToPaintMs.p95
      )}, materializedSelectCommandMs p95=${round(
        lane.materializedSelectCommandMs.p95
      )}, materializedSelectPaintAfterCommandMs p95=${round(
        lane.materializedSelectPaintAfterCommandMs.p95
      )}, selectToPaintMs p95=${round(
        lane.selectToPaintMs.p95
      )}, selectCommandMs p95=${round(
        lane.selectCommandMs.p95
      )}, selectPaintAfterCommandMs p95=${round(
        lane.selectPaintAfterCommandMs.p95
      )}, shiftDownCommandMs p95=${round(
        lane.shiftDownCommandMs.p95
      )}, shiftDownPaintAfterCommandMs p95=${round(
        lane.shiftDownPaintAfterCommandMs.p95
      )}, shiftDownToPaintMs p95=${round(
        lane.shiftDownToPaintMs.p95
      )}, repeatedShiftDownToPaintMs ${formatSummary(
        lane.repeatedShiftDownToPaintMs
      )}, repeatedShiftDownCommandMs p95=${round(
        lane.repeatedShiftDownCommandMs.p95
      )}, shiftUpToPaintMs p95=${round(
        lane.shiftUpToPaintMs.p95
      )}, typeRenderCount p95=${round(
        lane.typeRenderCount.p95
      )}, shiftDownLongTaskMaxMs p95=${round(
        lane.shiftDownLongTaskMaxMs.p95
      )}, longTaskMaxMs p95=${round(
        lane.longTaskMaxMs.p95
      )}, domNodes p95=${round(lane.domNodes.p95)}, heapMB p95=${round(
        lane.heapMB.p95
      )}`
    );
  }
};

await buildSlateReactPackage();

const { htmlSource } = await buildBrowserBundle();
const browser = await chromium.launch({ headless });

try {
  const page = await browser.newPage();
  await page.setContent(htmlSource, { waitUntil: 'load' });
  await page.waitForFunction(() => globalThis.__CROSS_EDITOR_HUGE_READY__);

  const surfaces = {};

  for (const surface of selectedSurfaces) {
    console.log(`\nMeasuring ${surface}`);
    surfaces[surface] = await measureSurface({ page, surface });
    printSurface(surface, surfaces[surface]);
  }

  const summary = {
    artifactPaths: {
      latest: latestArtifactPath,
      run: runArtifactPath,
    },
    config: {
      blocks,
      iterations,
      lexicalRepo,
      prosemirrorRepo,
      repeatedShiftDownCount,
      repeatedShiftDownMode,
      slateVirtualizedEstimatedBlockSize,
      slateVirtualizedOverscan,
      surfaces: Array.from(selectedSurfaces),
      typeOps,
    },
    lane: 'slate-react-huge-document-cross-editor',
    surfaces,
  };

  await writeBenchmarkArtifact(latestArtifactPath, summary);
  await writeBenchmarkArtifact(runArtifactPath, summary);

  const surfaceP95 = (surfaceSummary, metric) =>
    Math.max(
      ...Object.values(surfaceSummary.lanes).map((lane) => lane[metric].p95)
    );
  const surfaceMetric = (surfaceSummary, metric, field) =>
    Math.max(
      ...Object.values(surfaceSummary.lanes).map(
        (lane) => lane[metric][field] ?? 0
      )
    );
  const surfaceSampleCount = (surfaceSummary, metric) =>
    Math.max(
      ...Object.values(surfaceSummary.lanes).map(
        (lane) => lane[metric].samples.length
      )
    );

  for (const [surface, surfaceSummary] of Object.entries(surfaces)) {
    for (const [laneName, lane] of Object.entries(surfaceSummary.lanes)) {
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_shift_down_to_paint_p95_ms=${round(
          lane.shiftDownToPaintMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_shift_down_command_p95_ms=${round(
          lane.shiftDownCommandMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_shift_down_paint_after_command_p95_ms=${round(
          lane.shiftDownPaintAfterCommandMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_repeated_shift_down_to_paint_p95_ms=${round(
          lane.repeatedShiftDownToPaintMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_repeated_shift_down_to_paint_median_ms=${round(
          lane.repeatedShiftDownToPaintMs.median
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_repeated_shift_down_to_paint_p75_ms=${round(
          lane.repeatedShiftDownToPaintMs.p75
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_repeated_shift_down_to_paint_max_ms=${round(
          lane.repeatedShiftDownToPaintMs.max
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_repeated_shift_down_sample_count=${lane.repeatedShiftDownToPaintMs.samples.length}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_repeated_shift_down_command_p95_ms=${round(
          lane.repeatedShiftDownCommandMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_repeated_shift_down_render_count_p95=${round(
          lane.repeatedShiftDownRenderCount.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_shift_up_to_paint_p95_ms=${round(
          lane.shiftUpToPaintMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_type_to_paint_p95_ms=${round(
          lane.typeToPaintMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_type_command_p95_ms=${round(
          lane.typeCommandMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_type_text_ready_p95_ms=${round(
          lane.typeTextReadyMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_type_paint_after_ready_p95_ms=${round(
          lane.typePaintAfterReadyMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_type_render_count_p95=${round(
          lane.typeRenderCount.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_select_command_p95_ms=${round(
          lane.selectCommandMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_select_paint_after_command_p95_ms=${round(
          lane.selectPaintAfterCommandMs.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_dom_nodes_p95=${round(
          lane.domNodes.p95
        )}`
      );
      console.log(
        `METRIC react_huge_doc_cross_editor_${surface}_${laneName}_long_task_max_p95_ms=${round(
          lane.longTaskMaxMs.p95
        )}`
      );
    }

    const burstToPaintPerOpP95 = surfaceP95(
      surfaceSummary,
      'burstToPaintPerOpMs'
    );
    const domNodesP95 = surfaceP95(surfaceSummary, 'domNodes');
    const longTaskMaxP95 = surfaceP95(surfaceSummary, 'longTaskMaxMs');
    const materializedSelectToPaintP95 = surfaceP95(
      surfaceSummary,
      'materializedSelectToPaintMs'
    );
    const materializedSelectCommandP95 = surfaceP95(
      surfaceSummary,
      'materializedSelectCommandMs'
    );
    const materializedSelectPaintAfterCommandP95 = surfaceP95(
      surfaceSummary,
      'materializedSelectPaintAfterCommandMs'
    );
    const selectCommandP95 = surfaceP95(surfaceSummary, 'selectCommandMs');
    const selectPaintAfterCommandP95 = surfaceP95(
      surfaceSummary,
      'selectPaintAfterCommandMs'
    );
    const selectToPaintP95 = surfaceP95(surfaceSummary, 'selectToPaintMs');
    const shiftDownToPaintP95 = surfaceP95(
      surfaceSummary,
      'shiftDownToPaintMs'
    );
    const shiftDownCommandP95 = surfaceP95(
      surfaceSummary,
      'shiftDownCommandMs'
    );
    const shiftDownPaintAfterCommandP95 = surfaceP95(
      surfaceSummary,
      'shiftDownPaintAfterCommandMs'
    );
    const repeatedShiftDownToPaintP95 = surfaceP95(
      surfaceSummary,
      'repeatedShiftDownToPaintMs'
    );
    const repeatedShiftDownToPaintMedian = surfaceMetric(
      surfaceSummary,
      'repeatedShiftDownToPaintMs',
      'median'
    );
    const repeatedShiftDownToPaintP75 = surfaceMetric(
      surfaceSummary,
      'repeatedShiftDownToPaintMs',
      'p75'
    );
    const repeatedShiftDownToPaintMax = surfaceMetric(
      surfaceSummary,
      'repeatedShiftDownToPaintMs',
      'max'
    );
    const repeatedShiftDownToPaintSampleCount = surfaceSampleCount(
      surfaceSummary,
      'repeatedShiftDownToPaintMs'
    );
    const repeatedShiftDownCommandP95 = surfaceP95(
      surfaceSummary,
      'repeatedShiftDownCommandMs'
    );
    const repeatedShiftDownRenderCountP95 = surfaceP95(
      surfaceSummary,
      'repeatedShiftDownRenderCount'
    );
    const shiftUpToPaintP95 = surfaceP95(surfaceSummary, 'shiftUpToPaintMs');
    const shiftDownLongTaskMaxP95 = surfaceP95(
      surfaceSummary,
      'shiftDownLongTaskMaxMs'
    );
    const typeCommandP95 = surfaceP95(surfaceSummary, 'typeCommandMs');
    const typePaintAfterReadyP95 = surfaceP95(
      surfaceSummary,
      'typePaintAfterReadyMs'
    );
    const typeTextReadyP95 = surfaceP95(surfaceSummary, 'typeTextReadyMs');
    const typeToPaintP95 = surfaceP95(surfaceSummary, 'typeToPaintMs');

    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_burst_to_paint_per_op_p95_ms=${round(
        burstToPaintPerOpP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_type_to_paint_p95_ms=${round(
        typeToPaintP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_type_command_p95_ms=${round(
        typeCommandP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_type_text_ready_p95_ms=${round(
        typeTextReadyP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_type_paint_after_ready_p95_ms=${round(
        typePaintAfterReadyP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_select_to_paint_p95_ms=${round(
        selectToPaintP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_select_command_p95_ms=${round(
        selectCommandP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_select_paint_after_command_p95_ms=${round(
        selectPaintAfterCommandP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_shift_down_to_paint_p95_ms=${round(
        shiftDownToPaintP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_shift_down_command_p95_ms=${round(
        shiftDownCommandP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_shift_down_paint_after_command_p95_ms=${round(
        shiftDownPaintAfterCommandP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_repeated_shift_down_to_paint_p95_ms=${round(
        repeatedShiftDownToPaintP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_repeated_shift_down_to_paint_median_ms=${round(
        repeatedShiftDownToPaintMedian
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_repeated_shift_down_to_paint_p75_ms=${round(
        repeatedShiftDownToPaintP75
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_repeated_shift_down_to_paint_max_ms=${round(
        repeatedShiftDownToPaintMax
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_repeated_shift_down_sample_count=${repeatedShiftDownToPaintSampleCount}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_repeated_shift_down_command_p95_ms=${round(
        repeatedShiftDownCommandP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_repeated_shift_down_render_count_p95=${round(
        repeatedShiftDownRenderCountP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_shift_up_to_paint_p95_ms=${round(
        shiftUpToPaintP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_shift_down_long_task_max_p95_ms=${round(
        shiftDownLongTaskMaxP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_materialized_select_to_paint_p95_ms=${round(
        materializedSelectToPaintP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_materialized_select_command_p95_ms=${round(
        materializedSelectCommandP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_materialized_select_paint_after_command_p95_ms=${round(
        materializedSelectPaintAfterCommandP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_dom_nodes_p95=${round(
        domNodesP95
      )}`
    );
    console.log(
      `METRIC react_huge_doc_cross_editor_${surface}_long_task_max_p95_ms=${round(
        longTaskMaxP95
      )}`
    );
  }

  console.log(`\nWrote ${runArtifactPath}`);
} finally {
  await browser.close();
}
