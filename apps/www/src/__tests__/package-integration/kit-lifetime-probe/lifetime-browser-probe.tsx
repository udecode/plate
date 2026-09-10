'use client';
import { NodeApi } from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import { DndPlugin } from 'platejs/dnd/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { createEditor, ParagraphPlugin, Plate } from 'platejs/react';
import * as React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { AIKit as ProductionAIKit } from '@/registry/components/editor/ai';
import { DndKit as ProductionDndKit } from '@/registry/components/editor/dnd';
import { Editor } from '@/registry/components/editor/editor';

import { AIChatSession, AIKit as BaselineAIKit } from './baseline-ai';
import {
  DndRoot as BaselineDndRoot,
  DndKit as BaselineDndKit,
} from './baseline-dnd';

export type Cohort = {
  blocks: number;
  views: number;
  editors: number;
  cycles: number;
  features: boolean;
  debug?: boolean;
};
export type Variant = 'current' | 'production';
let cohort: Cohort;
function BaselineView({
  attach,
  index,
  readOnly,
}: {
  attach: (index: number, element: HTMLDivElement | null) => void;
  index: number;
  readOnly: boolean;
}) {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const ref = React.useCallback(
    (next: HTMLDivElement | null) => {
      setElement(next);
      attach(index, next);
    },
    [attach, index]
  );
  return (
    <BaselineDndRoot editableElement={element}>
      <Editor domStrategy="full" ref={ref} readOnly={readOnly} />
    </BaselineDndRoot>
  );
}
function Assembly({
  editor,
  variant,
  visible,
  readOnly,
}: {
  editor: ReturnType<typeof makeEditor>;
  variant: Variant;
  visible: readonly boolean[];
  readOnly: boolean;
}) {
  const [elements, setElements] = React.useState<Array<HTMLDivElement | null>>(
    []
  );
  const attach = React.useCallback(
    (index: number, element: HTMLDivElement | null) => {
      setElements((previous) => {
        const next = previous.slice();
        next[index] = element;
        return next;
      });
    },
    []
  );
  const content = Array.from({ length: cohort.views }, (_, index) => {
    if (!visible[index]) return null;
    const viewReadOnly = readOnly || (index > 0 && index % 2 === 0);
    const view =
      variant === 'current' && cohort.features ? (
        <BaselineView attach={attach} index={index} readOnly={viewReadOnly} />
      ) : (
        <Editor domStrategy="full" readOnly={viewReadOnly} />
      );
    return index === 0 ? (
      // oxlint-disable-next-line react-doctor/no-array-index-as-key -- Each fixed view position is its identity; hiding a view never reindexes siblings.
      <React.Fragment key={index}>{view}</React.Fragment>
    ) : (
      <Plate
        // oxlint-disable-next-line react-doctor/no-array-index-as-key -- Fixed view positions retain their identity through detach and reattach.
        key={index}
        editor={editor}
        suppressInstanceWarning
        readOnly={viewReadOnly}
      >
        {view}
      </Plate>
    );
  });
  return (
    <Plate editor={editor} suppressInstanceWarning readOnly={readOnly}>
      {variant === 'current' && cohort.features && (
        <AIChatSession
          elements={elements.filter(
            (element): element is HTMLDivElement => element !== null
          )}
        />
      )}
      {content}
    </Plate>
  );
}
function makeEditor(variant: Variant) {
  return createEditor({
    plugins: [
      ParagraphPlugin,
      ...(cohort.features
        ? [
            MarkdownPlugin,
            ...(variant === 'production' ? ProductionAIKit : BaselineAIKit),
            ...(variant === 'current' ? BaselineDndKit : ProductionDndKit),
            AIChatPlugin.configure({
              slots: { afterEditable: () => null, afterContainer: () => null },
            }),
            DndPlugin.configure({ initialState: { enableScroller: false } }),
          ]
        : []),
    ],
    initialValue: Array.from({ length: cohort.blocks }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `Block ${index}` }],
    })),
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    },
  });
}

const check = (condition: unknown, label: string) => {
  if (!condition) throw new Error(label);
};

function resources() {
  const active = new Map<EventListenerOrEventListenerObject, Set<string>>();
  const add = document.addEventListener;
  const remove = document.removeEventListener;
  document.addEventListener = function addEventListener(
    ...[type, listener, options]: Parameters<Document['addEventListener']>
  ) {
    if (
      typeof listener === 'function' &&
      ['dragleave', 'drop', 'dragend', 'mouseup'].includes(type)
    ) {
      const keys = active.get(listener) ?? new Set<string>();
      keys.add(`${type}:${options === true}`);
      active.set(listener, keys);
    }
    add.call(this, type, listener, options);
  };
  document.removeEventListener = function removeEventListener(
    ...[type, listener, options]: Parameters<Document['removeEventListener']>
  ) {
    if (listener) {
      active.get(listener)?.delete(`${type}:${options === true}`);
      if (!active.get(listener)?.size) active.delete(listener);
    }
    remove.call(this, type, listener, options);
  };
  const NativeObserver = globalThis.MutationObserver;
  const observers = new Set<MutationObserver>();
  globalThis.MutationObserver = function MutationObserver(
    callback: MutationCallback
  ) {
    const observer = new NativeObserver(callback);
    const observe = observer.observe.bind(observer);
    const disconnect = observer.disconnect.bind(observer);
    observer.observe = (target: Node, options?: MutationObserverInit) => {
      if (
        options?.attributeFilter?.join(',') ===
        'data-readonly,aria-readonly,aria-disabled'
      ) {
        observers.add(observer);
      }
      return observe(target, options);
    };
    observer.disconnect = () => {
      observers.delete(observer);
      disconnect();
    };
    return observer;
  } as unknown as typeof MutationObserver;
  return {
    listeners: () =>
      [...active.values()].reduce((sum, keys) => {
        const pattern = [...keys].sort().join(',');
        return (
          sum +
          ([
            'dragleave:true',
            'drop:true',
            'dragend:false,drop:false,mouseup:false',
          ].includes(pattern)
            ? keys.size
            : 0)
        );
      }, 0),
    allListeners: () =>
      [...active.values()].reduce((sum, keys) => sum + keys.size, 0),
    observers: () => observers.size,
    restore() {
      document.addEventListener = add;
      document.removeEventListener = remove;
      globalThis.MutationObserver = NativeObserver;
    },
  };
}

export function createProbeTransport() {
  const { fetch } = globalThis;
  const requests: Array<{
    readonly active: boolean;
    signal: AbortSignal;
    send: (part: unknown) => void;
    close: () => void;
  }> = [];
  let bytes = 0;
  globalThis.fetch = Object.assign(
    async (...[_input, init]: Parameters<typeof fetch>) => {
      let control!: ReadableStreamDefaultController<Uint8Array>;
      let closed = false;
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          control = controller;
        },
      });
      requests.push({
        get active() {
          return !closed && !init?.signal?.aborted;
        },
        signal: init?.signal as AbortSignal,
        send(part) {
          const data = new TextEncoder().encode(
            `data: ${JSON.stringify(part)}\n\n`
          );
          bytes += data.byteLength;
          control.enqueue(data);
        },
        close() {
          if (!closed) {
            closed = true;
            control.close();
          }
        },
      });
      return new Response(body, {
        headers: { 'content-type': 'text/event-stream' },
      });
    },
    fetch
  );
  return {
    requests,
    activeRequests: () => requests.filter((request) => request.active).length,
    bytes: () => bytes,
    restore() {
      globalThis.fetch = fetch;
    },
  };
}

export async function runProbe(variant: Variant, fixture: Cohort) {
  cohort = fixture;
  const tracked = resources();
  const http = createProbeTransport();
  const channel = new MessageChannel();
  const task = () =>
    new Promise<void>((resolve) => {
      channel.port1.addEventListener('message', () => resolve(), {
        once: true,
      });
      channel.port1.start();
      channel.port2.postMessage(null);
    });
  let diagnostic: () => unknown = () => ({ variant, cohort });
  const waitFor = async (predicate: () => boolean, label: string) => {
    const start = performance.now();
    while (!predicate()) {
      if (performance.now() - start >= 60_000) {
        throw new Error(`${label}: ${JSON.stringify(diagnostic())}`);
      }
      await task();
    }
    await task();
    flushSync(() => {});
  };
  const constructionStart = performance.now();
  const editors = Array.from({ length: cohort.editors }, () =>
    makeEditor(variant)
  );
  const construction = performance.now() - constructionStart;
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  let visible = Array.from({ length: cohort.views }, () => true);
  let commits = 0;
  const tree = (readOnly = false) => (
    <React.Profiler
      id="kit"
      onRender={() => {
        commits += 1;
      }}
    >
      {editors.map((editor, index) => (
        <Assembly
          key={index}
          editor={editor}
          variant={variant}
          visible={visible}
          readOnly={readOnly}
        />
      ))}
    </React.Profiler>
  );
  let unmounted = false;
  let pending: Promise<void> | undefined;
  let unsubscribeDebug: (() => void) | undefined;
  try {
    const start = performance.now();
    flushSync(() => root.render(tree()));
    const mount = performance.now() - start;
    const mountedCommits = commits;
    const ownedListeners = tracked.listeners();
    const ownedObservers = tracked.observers();
    const mountedDOM = container.querySelectorAll(
      '[data-plite-node="element"]'
    ).length;
    check(
      mountedDOM === cohort.blocks * cohort.views * cohort.editors,
      `full DOM count ${mountedDOM}`
    );
    check(
      ownedListeners ===
        (cohort.features ? cohort.views * cohort.editors * 5 : 0),
      `owned listeners ${ownedListeners}`
    );
    check(
      ownedObservers ===
        (cohort.features
          ? cohort.editors * (variant === 'current' ? 1 : cohort.views)
          : 0),
      `owned observers ${ownedObservers}`
    );
    let firstChunk = 0;
    let chunks = 0;
    let streamCommits = 0;
    let activation = 0;
    let activationStart = 0;
    let activeCommits = 0;
    let siblingDetach = 0;
    if (cohort.features) {
      const editor = editors[0];
      const { store } = editor.plugin(AIChatPlugin);
      const selections: unknown[] = [];
      if (cohort.debug) {
        unsubscribeDebug = editor.subscribeCommit((commit) => {
          if (commit.selectionChanged) {
            selections.push({
              selection: editor.read.selection(),
              stack: new Error('Selection commit').stack,
            });
          }
        });
      }
      diagnostic = () => ({
        variant,
        cohort,
        selections,
        readOnly: editor.read.view.isReadOnly(),
        selection: editor.read.selection(),
        status: store.get('chat')?.status,
        messageCount: store.get('chat')?.messages.length,
        blockChunks: store.get('_blockChunks').length,
        streaming: store.get('streaming'),
        mode: store.get('mode'),
        aborted: http.requests.map(({ signal }) => signal.aborted),
        views: [
          ...container.querySelectorAll('[data-plite-editor="true"]'),
        ].map((element) => ({
          connected: element.isConnected,
          readOnly: element.getAttribute('data-readonly'),
        })),
      });
      container
        .querySelector<HTMLElement>('[data-plite-editor="true"]')!
        .focus();
      editor.update.selection.set({
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      });
      await task();
      flushSync(() => {});
      check(
        editor.read.selection() !== null,
        'explicit writable command selection'
      );
      const beforeStream = commits;
      const firstStart = performance.now();
      pending = store.get('chat')!.sendMessage('probe');
      await waitFor(() => http.requests.length === 1, 'transport request');
      check(
        editor.read.selection() !== null,
        `selection before first chunk: ${cohort.debug ? JSON.stringify(diagnostic()) : ''}`
      );
      const request = http.requests[0];
      request.send({ type: 'start', messageId: 'assistant' });
      request.send({ type: 'text-start', id: 't' });
      request.send({ type: 'text-delta', id: 't', delta: 'x' });
      await waitFor(
        () => store.get('_blockChunks').trim() === 'x',
        'first chunk application'
      );
      firstChunk = performance.now() - firstStart;
      if (cohort.views > 1) {
        const detachStart = performance.now();
        visible = visible.map((value, index) => (index === 0 ? false : value));
        flushSync(() => root.render(tree()));
        siblingDetach = performance.now() - detachStart;
        check(
          container.querySelectorAll('[data-plite-editor="true"]').length ===
            (cohort.views - 1) * cohort.editors,
          'first view actually detached'
        );
        check(
          tracked.listeners() === (cohort.views - 1) * cohort.editors * 5,
          'detached view listeners'
        );
        check(
          tracked.observers() ===
            cohort.editors * (variant === 'current' ? 1 : cohort.views - 1),
          'detached view observers'
        );
        check(
          !request.signal.aborted,
          'first view detach aborted sibling stream'
        );
      }
      const chunkStart = performance.now();
      for (let index = 1; index < 100; index++) {
        request.send({ type: 'text-delta', id: 't', delta: 'x' });
        await waitFor(
          () => store.get('_blockChunks').trim() === 'x'.repeat(index + 1),
          'exact chunk application'
        );
      }
      chunks = performance.now() - chunkStart;
      streamCommits = commits - beforeStream;
      const path = store.get('_blockPath');
      check(
        path &&
          NodeApi.string(editor.read.nodes.get(path)![0]) === 'x'.repeat(100),
        'exact model text'
      );
      check(http.requests.length === 1, 'one stream consumer');
      request.send({ type: 'text-end', id: 't' });
      request.send({ type: 'finish' });
      request.close();
      await pending;
      await waitFor(() => !store.get('streaming'), 'stream completion');
      const drag = container.querySelector<HTMLButtonElement>(
        'button[aria-label="Drag block"]'
      );
      check(drag, 'drag handle');
      const beforeActivation = commits;
      activationStart = performance.now();
      flushSync(() =>
        drag!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      );
      activation = performance.now() - activationStart;
      activeCommits = commits - beforeActivation;
      flushSync(() => document.dispatchEvent(new Event('mouseup')));
    }
    const beforeReadOnly = commits;
    const readOnlyStart = performance.now();
    flushSync(() => root.render(tree(true)));
    check(
      editors.every((editor) => editor.read.view.isReadOnly() === visible[0]),
      'matched model readonly'
    );
    const readonly = performance.now() - readOnlyStart;
    const readOnlyCommits = commits - beforeReadOnly;
    const churnStart = performance.now();
    for (let cycle = 0; cycle < cohort.cycles; cycle++) {
      visible = visible.map(() => false);
      flushSync(() => root.render(tree()));
      check(tracked.listeners() === 0, 'detached listeners');
      visible = visible.map(() => true);
      flushSync(() => root.render(tree()));
      check(tracked.listeners() === ownedListeners, 'reattached listeners');
      flushSync(() => root.render(tree(true)));
      check(
        editors.every((editor) => editor.read.view.isReadOnly()),
        'churn readonly'
      );
    }
    const churn = performance.now() - churnStart;
    const cleanupStart = performance.now();
    flushSync(() => root.unmount());
    unmounted = true;
    const cleanup = performance.now() - cleanupStart;
    const workflow = performance.now() - constructionStart;
    check(tracked.listeners() === 0, 'retained listeners');
    check(tracked.observers() === 0, 'retained observers');
    check(tracked.allListeners() === 0, 'retained document listeners');
    if (cohort.features) {
      for (const editor of editors) {
        check(
          editor.plugin(AIChatPlugin).store.get('chat') === null,
          'retained AI owner'
        );
      }
    }
    check(http.activeRequests() === 0, 'retained transport authority');
    return {
      variant,
      cohort,
      construction,
      mount,
      firstChunk,
      chunks,
      activation,
      readonly,
      siblingDetach,
      churn,
      cleanup,
      workflow,
      timeline: {
        activation: cohort.features
          ? [activationStart, activationStart + activation]
          : null,
        readonly: [readOnlyStart, readOnlyStart + readonly],
        cleanup: [cleanupStart, cleanupStart + cleanup],
      },
      ownedListeners,
      retainedListeners: tracked.listeners(),
      ownedObservers,
      retainedObservers: tracked.observers(),
      retainedRequests: http.activeRequests(),
      mountedDOM,
      // A production build without React profiling never calls onRender.
      commits:
        mountedCommits > 0
          ? {
              mount: mountedCommits,
              stream: streamCommits,
              active: activeCommits,
              readonly: readOnlyCommits,
            }
          : null,
      transportBytes: http.bytes(),
      transportChunks: cohort.features ? 100 : 0,
      runtime: { react: React.version, userAgent: navigator.userAgent },
    };
  } finally {
    unsubscribeDebug?.();
    if (!unmounted) flushSync(() => root.unmount());
    http.requests.forEach((request) => request.close());
    await pending;
    container.remove();
    tracked.restore();
    http.restore();
    channel.port1.close();
    channel.port2.close();
  }
}

declare global {
  interface Window {
    kitLifetimeProbe: typeof runProbe;
  }
}

export function ProbePage() {
  React.useEffect(() => {
    window.kitLifetimeProbe = runProbe;
  }, []);
  return <p>Kit lifetime benchmark</p>;
}
