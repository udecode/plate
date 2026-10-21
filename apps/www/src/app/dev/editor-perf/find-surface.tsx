'use client';

import { definePlugin, NodeApi, type NodeKey, property } from 'platejs';
import { BaseFindPlugin } from 'platejs/find';
import {
  EditorContent,
  EditorLeaf,
  type EditorLeafProps,
  EditorRoot,
  toReactPlugin,
  useCreateEditor,
} from 'platejs/react';
import { VirtualizedEditorContent } from 'platejs/react/virtualized';
import * as React from 'react';

import { FindKit } from '@/registry/components/editor/find';

import {
  FIND_DENSE_QUERY,
  FIND_LEAF_MARK,
  type FindAction,
  type FindArm,
  type FindBurst,
  type FindDocSpec,
  type FindReadBack,
  type FindRefreshMode,
  type FindSample,
  type FindStep,
  buildFindValue,
  findStep,
} from './find-workload';

const FindLeafSchema = definePlugin(FIND_LEAF_MARK, {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

const counters = {
  inputEvents: 0,
  insertTextAt: 0,
  keydownAt: 0,
  keydownKey: '',
  leafCommits: 0,
  storeWrites: 0,
  untrustedInputs: 0,
};

function FindCountedLeaf(props: EditorLeafProps<typeof FindLeafSchema>) {
  React.useLayoutEffect(() => {
    counters.leafCommits += 1;
  });

  return <EditorLeaf {...props} />;
}

const FindLeafPlugin = toReactPlugin(FindLeafSchema, {
  component: FindCountedLeaf,
});

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const beforeDeferredRefresh = (callback: () => void) => {
  setTimeout(callback, 0);
};

// Headless Chromium on a loaded host sometimes stops producing frames, so
// nothing the harness waits on depends on a frame arriving.
const nextPresentation = (limitMs: number, onFirstFrame?: () => void) =>
  Promise.race([
    new Promise<number>((resolve) => {
      requestAnimationFrame(() => {
        onFirstFrame?.();
        requestAnimationFrame(() => resolve(performance.now()));
      });
    }),
    delay(limitMs).then(() => null),
  ]);

const PRESENTATION_LIMIT_MS = 1000;

const EXPECTED_ACTIVE_MATCH = 0;

const busyWait = (ms: number) => {
  const until = performance.now() + ms;

  while (performance.now() < until) {
    // Planted slowdown for the paired-timing arm that must fail.
  }
};

type DecorationRefresh = Readonly<{ nodeKeys: readonly string[] | 'all' }>;

type DecorationSourceLike = Readonly<{
  id: string;
  observe?: (context: {
    editor?: object;
    refresh: (input: DecorationRefresh) => void;
  }) => () => void;
  read: unknown;
}>;

type DecorationManagerLike = Readonly<{
  getMetrics: () => Readonly<{ sourceCount: number; sourceReadCount: number }>;
  setSources: (sources: readonly DecorationSourceLike[]) => void;
}>;

const probe = {
  refreshedKeys: null as Set<string> | null,
  detached: false,
  droppedCalls: 0,
  installed: false,
  mode: 'pass' as FindRefreshMode,
  refreshAllCalls: 0,
  refreshCalls: 0,
  refreshKeys: 0,
  refreshReads: 0,
  replacement: (_mode: FindRefreshMode): readonly string[] => [],
};

const isManager = (value: unknown): value is DecorationManagerLike =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as DecorationManagerLike).getMetrics === 'function' &&
  typeof (value as DecorationManagerLike).setSources === 'function';

const isSourceList = (value: unknown): value is DecorationSourceLike[] =>
  Array.isArray(value) &&
  value.some((source) => (source as DecorationSourceLike)?.id === 'find');

type FiberLike = {
  memoizedProps?: { value?: unknown };
  return: FiberLike | null;
};

function installRefreshProbe(editable: HTMLElement) {
  const fiberKey = Object.keys(editable).find((key) =>
    key.startsWith('__reactFiber$')
  );
  let fiber = fiberKey
    ? (Reflect.get(editable, fiberKey) as FiberLike | null)
    : null;
  let manager: DecorationManagerLike | null = null;
  let sources: DecorationSourceLike[] | null = null;

  while (fiber && !(manager && sources)) {
    const value = fiber.memoizedProps?.value;

    if (!manager && isManager(value)) manager = value;
    if (!sources && isSourceList(value)) sources = value;
    fiber = fiber.return;
  }
  if (!manager || !sources) {
    throw new Error('Refresh probe found no decoration manager or Find source');
  }

  const owner = manager;
  const wrapped = sources.map((source) => {
    const { observe } = source;

    if (source.id !== 'find') return source;
    if (!observe) throw new Error('Find decoration source has no observe');

    return {
      ...source,
      observe: (context: Parameters<NonNullable<typeof observe>>[0]) => {
        const cleanup = observe({
          ...context,
          refresh: (input) => {
            if (probe.mode === 'drop') {
              probe.droppedCalls += 1;

              return;
            }

            const forwarded: DecorationRefresh =
              probe.mode === 'pass' || input.nodeKeys === 'all'
                ? input
                : { nodeKeys: probe.replacement(probe.mode) };
            const before = owner.getMetrics().sourceReadCount;

            probe.refreshCalls += 1;
            if (forwarded.nodeKeys === 'all') {
              probe.refreshAllCalls += 1;
            } else {
              probe.refreshKeys += forwarded.nodeKeys.length;
              for (const key of forwarded.nodeKeys) {
                probe.refreshedKeys?.add(key);
              }
            }
            context.refresh(forwarded);
            probe.refreshReads += owner.getMetrics().sourceReadCount - before;
          },
        });

        return () => {
          probe.detached = true;
          cleanup();
        };
      },
    };
  });

  owner.setSources(wrapped);
  probe.detached = false;
  probe.installed = true;

  return owner;
}

type Highlight = Readonly<{
  active: boolean;
  block: number;
  offset: number;
  text: string;
}>;

const describe = (highlight: Highlight | undefined) =>
  highlight
    ? `block ${highlight.block} offset ${highlight.offset} "${highlight.text}"${
        highlight.active ? ' active' : ''
      }`
    : 'nothing';

function paintedHighlights(root: HTMLElement): Highlight[] {
  const blockIndex = new Map<Element, number>();

  Array.from(root.children).forEach((child, index) => {
    blockIndex.set(child, index);
  });

  return Array.from(root.querySelectorAll('[data-find-match]'), (element) => {
    let block: Element = element;

    while (block.parentElement && block.parentElement !== root) {
      block = block.parentElement;
    }

    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let offset = 0;

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (element.contains(node)) break;
      offset += node.textContent?.length ?? 0;
    }

    return {
      active: element.hasAttribute('data-find-active'),
      block: blockIndex.get(block) ?? -1,
      offset,
      text: element.textContent ?? '',
    };
  }).sort((a, b) => a.block - b.block || a.offset - b.offset);
}

function scanText(text: string, query: string) {
  const offsets: number[] = [];
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();

  if (!needle) return offsets;
  for (
    let at = haystack.indexOf(needle);
    at !== -1;
    at = haystack.indexOf(needle, at + needle.length)
  ) {
    offsets.push(at);
  }

  return offsets;
}

function firstMismatch(painted: Highlight[], fresh: Highlight[]) {
  const length = Math.max(painted.length, fresh.length);

  for (let index = 0; index < length; index++) {
    const a = painted[index];
    const b = fresh[index];

    if (
      a?.block !== b?.block ||
      a?.offset !== b?.offset ||
      a?.text.toLowerCase() !== b?.text.toLowerCase() ||
      a?.active !== b?.active
    ) {
      return `highlight ${index}: painted ${describe(a)}, fresh search ${describe(
        b
      )}`;
    }
  }

  return null;
}

type Snapshot = Readonly<{
  inputEvents: number;
  leafCommits: number;
  probe: Omit<typeof probe, 'refreshedKeys' | 'replacement'>;
  sourceReads: number;
  storeWrites: number;
  untrustedInputs: number;
}>;

type EditedBlock = Readonly<{
  activeId: string | null;
  activeKey: string | null;
  keys: readonly string[];
}>;

type BurstState = {
  before: Snapshot;
  children: unknown;
  changedSteps: number;
  edited: EditedBlock | null;
  firstFrameChecks: number;
  firstFrameMismatch: string | null;
  presentationMs: number | null;
};

export type FindSurfaceHandle = Readonly<{
  arm: (options: FindArm) => void;
  between: () => Promise<void>;
  burst: (burst: FindBurst) => Promise<FindSample>;
  finish: (burst: FindBurst) => Promise<FindSample>;
  mountKey: number;
  prepare: (action: FindAction, index: number) => Promise<void>;
  readBack: () => FindReadBack;
}>;

export function FindSurface({
  handleRef,
  mountKey,
  spec,
}: {
  handleRef: React.Ref<FindSurfaceHandle>;
  mountKey: number;
  spec: FindDocSpec;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const plantRef = React.useRef(0);
  const firstFrameRef = React.useRef<(() => void) | null>(null);
  const managerRef = React.useRef<DecorationManagerLike | null>(null);
  const burstRef = React.useRef<BurstState | null>(null);
  const [initialValue] = React.useState(() => buildFindValue(spec.blocks));
  const editor = useCreateEditor({
    plugins: [FindLeafPlugin, ...FindKit],
    initialValue,
  });

  React.useEffect(
    () =>
      editor.plugin(BaseFindPlugin).store.subscribe(() => {
        counters.storeWrites += 1;
      }),
    [editor]
  );

  React.useEffect(() => {
    const container =
      containerRef.current ??
      (() => {
        throw new Error('Find surface has no container');
      })();

    // Plite handles Backspace on keydown, so a trusted step may dispatch no
    // beforeinput; both events count as the step's input.
    const onInput = (event: Event) => {
      counters.inputEvents += 1;
      if (!event.isTrusted) counters.untrustedInputs += 1;
      if (
        event.isTrusted &&
        event instanceof InputEvent &&
        event.inputType === 'insertText'
      ) {
        counters.insertTextAt = event.timeStamp;
      }
      const check = event.isTrusted ? firstFrameRef.current : null;
      if (check) beforeDeferredRefresh(check);
    };
    const onKeydown = (event: KeyboardEvent) => {
      onInput(event);
      counters.keydownAt = event.timeStamp;
      counters.keydownKey = event.key;
      if (plantRef.current > 0) {
        busyWait(plantRef.current);
        plantRef.current = 0;
      }
    };

    container.addEventListener('keydown', onKeydown, true);
    container.addEventListener('beforeinput', onInput, true);

    return () => {
      container.removeEventListener('keydown', onKeydown, true);
      container.removeEventListener('beforeinput', onInput, true);
    };
  }, []);

  React.useEffect(() => {
    const find = editor.plugin(BaseFindPlugin);

    if (spec.query) {
      find.api.search(spec.query);
      if (spec.wrongActiveIndex !== undefined) {
        find.store.set({ activeIndex: spec.wrongActiveIndex });
      }
    } else {
      // Coverage lists only functions that have run, so a document without a
      // query runs the search function once, before any counted step.
      NodeApi.findTextRanges(editor, FIND_DENSE_QUERY, {
        caseSensitive: false,
      });
    }
  }, [editor, spec.wrongActiveIndex, spec.query]);

  React.useImperativeHandle(handleRef, () => {
    const find = editor.plugin(BaseFindPlugin);
    const editable = () =>
      containerRef.current?.querySelector<HTMLElement>(
        '[contenteditable="true"]'
      ) ??
      (() => {
        throw new Error('Find surface has no editable');
      })();
    const manager = () => {
      managerRef.current ??= installRefreshProbe(editable());

      return managerRef.current;
    };
    const firstTextLength = () => {
      const [first] = editor.read.children();

      return first ? NodeApi.string(first).length : 0;
    };
    const snapshot = (): Snapshot => ({
      inputEvents: counters.inputEvents,
      leafCommits: counters.leafCommits,
      probe: { ...probe },
      sourceReads: manager().getMetrics().sourceReadCount,
      storeWrites: counters.storeWrites,
      untrustedInputs: counters.untrustedInputs,
    });
    const textKeys = (index: number) => {
      const block = editor.read.children()[index];

      return block && 'children' in block
        ? block.children.flatMap((_child, child) => {
            const key = editor.key([index, child]);

            return key ? [key] : [];
          })
        : [];
    };
    const editedBlock = (): EditedBlock => {
      const matches = find.store.get('matches');
      const active = matches[find.store.get('activeIndex')];

      return {
        activeId: active?.id ?? null,
        activeKey: active ? editor.key(active.range.anchor.path) : null,
        keys: textKeys(0),
      };
    };
    const describeKey = (key: string) =>
      `${key}@${editor.read.nodes.path(key as NodeKey)?.join('.') ?? 'gone'}`;
    const freshHighlights = (): Highlight[] => {
      const query = find.store.get('query');
      const fresh: Highlight[] = [];

      editor.read.children().forEach((block, index) => {
        const text = NodeApi.string(block);

        for (const offset of scanText(text, query)) {
          fresh.push({
            active: fresh.length === EXPECTED_ACTIVE_MATCH,
            block: index,
            offset,
            text: text.slice(offset, offset + query.length),
          });
        }
      });

      return fresh;
    };
    const paintCheck = () => {
      const painted = paintedHighlights(editable());
      const fresh = freshHighlights();

      return {
        fresh,
        mismatch:
          spec.rendering === 'complete' ? firstMismatch(painted, fresh) : null,
        painted,
      };
    };
    const checkFirstFrame = (state: BurstState) => () => {
      state.firstFrameChecks += 1;
      state.firstFrameMismatch ??= paintCheck().mismatch;
    };
    const point = (at: 'end' | 'start') => ({
      offset: at === 'start' ? 0 : firstTextLength(),
      path: [0, 0],
    });
    const runStep = (step: FindStep) => {
      const children = editor.read.children();
      const query = find.store.get('query');

      switch (step.kind) {
        case 'delete-backward': {
          const end =
            step.at === 'start' ? { offset: 1, path: [0, 0] } : point('end');

          editor.update.text.delete({
            at: { anchor: { ...end, offset: end.offset - 1 }, focus: end },
          });
          break;
        }
        case 'insert-block': {
          editor.update.nodes.insert(
            { children: [{ text: '' }], type: 'paragraph' },
            { at: [0] }
          );
          break;
        }
        case 'insert-text': {
          editor.update.text.insert(step.text, { at: point(step.at) });
          break;
        }
        case 'remove-block': {
          editor.update.nodes.remove({ at: [0] });
          break;
        }
        case 'search': {
          find.api.search(step.query);
          break;
        }
      }

      return editor.read.children() !== children ||
        find.store.get('query') !== query
        ? 1
        : 0;
    };
    probe.replacement = (mode) => {
      const edited = textKeys(0);

      if (mode === 'oracle') return edited;

      const blocks = editor.read.children().length;

      return edited.flatMap((_key, index) => textKeys(blocks - 1 - index));
    };

    const begin = (options: FindArm) => {
      probe.mode = options.refresh;
      probe.refreshedKeys = options.inspect ? new Set() : null;
      plantRef.current = options.plantMs;
      counters.keydownAt = 0;

      const state: BurstState = {
        before: snapshot(),
        changedSteps: 0,
        children: editor.read.children(),
        edited: options.inspect ? editedBlock() : null,
        firstFrameChecks: 0,
        firstFrameMismatch: null,
        presentationMs: null,
      };

      firstFrameRef.current = options.inspect ? checkFirstFrame(state) : null;
      burstRef.current = state;

      return state;
    };
    const judgeKeys = (state: BurstState) => {
      const { refreshedKeys } = probe;
      const before = state.edited;

      if (!refreshedKeys || !before) {
        return {
          refreshExtra: [],
          refreshExtraCount: 0,
        };
      }

      const after = editedBlock();
      const permitted = new Set([...before.keys, ...after.keys]);

      if (before.activeId !== after.activeId) {
        for (const key of [before.activeKey, after.activeKey]) {
          if (key) permitted.add(key);
        }
      }

      const extra = [...refreshedKeys].filter((key) => !permitted.has(key));

      return {
        refreshExtra: extra.slice(0, 5).map(describeKey),
        refreshExtraCount: extra.length,
      };
    };
    const end = async (burst: FindBurst, state: BurstState) => {
      await delay(burst.drainMs);
      probe.mode = 'pass';
      plantRef.current = 0;
      firstFrameRef.current = null;
      burstRef.current = null;

      const keys = judgeKeys(state);

      probe.refreshedKeys = null;

      const { before } = state;
      const after = snapshot();
      const inputEvents = after.inputEvents - before.inputEvents;
      const refreshReads = after.probe.refreshReads - before.probe.refreshReads;
      const sourceReads = after.sourceReads - before.sourceReads;

      if (after.probe.detached) {
        throw new Error('Find refresh probe was detached by a source reload');
      }

      return {
        changedSteps: state.changedSteps,
        droppedRefreshes: after.probe.droppedCalls - before.probe.droppedCalls,
        firstFrameMismatch:
          burst.inspect && state.firstFrameChecks < burst.steps
            ? (state.firstFrameMismatch ?? 'no frame')
            : state.firstFrameMismatch,
        firstIndex: burst.firstIndex,
        inputEvents,
        leafRenders: after.leafCommits - before.leafCommits,
        presentationMs: state.presentationMs,
        refreshAllCalls:
          after.probe.refreshAllCalls - before.probe.refreshAllCalls,
        refreshCalls: after.probe.refreshCalls - before.probe.refreshCalls,
        refreshKeys: after.probe.refreshKeys - before.probe.refreshKeys,
        ...keys,
        refreshReads,
        runtimeReads: sourceReads - refreshReads,
        steps: burst.steps,
        storeWrites: after.storeWrites - before.storeWrites,
        trustedInput:
          inputEvents > 0 && after.untrustedInputs === before.untrustedInputs,
      };
    };

    return {
      mountKey,
      arm: (options) => {
        begin(options);
      },
      between: async () => {
        const state =
          burstRef.current ??
          (() => {
            throw new Error('Trusted step ran before arm');
          })();
        const startedAt = counters.keydownAt;

        if (startedAt === 0) {
          throw new Error('Trusted step dispatched no keydown');
        }
        if (
          counters.keydownKey.length === 1 &&
          counters.insertTextAt < startedAt
        ) {
          throw new Error(
            `Trusted step typed ${counters.keydownKey} with no trusted insertText beforeinput`
          );
        }

        const children = editor.read.children();

        if (children !== state.children) state.changedSteps += 1;
        state.children = children;

        const presentedAt = await nextPresentation(PRESENTATION_LIMIT_MS);

        state.presentationMs ??=
          presentedAt === null ? null : presentedAt - startedAt;
        counters.keydownAt = 0;
      },
      burst: async (burst) => {
        const state = begin(burst);

        for (let offset = 0; offset < burst.steps; offset++) {
          const startedAt = performance.now();

          if (offset === 0 && burst.plantMs > 0) busyWait(burst.plantMs);
          state.changedSteps += runStep(
            findStep(burst.action, burst.firstIndex + offset)
          );

          const presentedAt = await nextPresentation(
            PRESENTATION_LIMIT_MS,
            firstFrameRef.current ?? undefined
          );

          state.presentationMs ??=
            presentedAt === null ? null : presentedAt - startedAt;
        }

        return end(burst, state);
      },
      finish: async (burst) =>
        end(
          burst,
          burstRef.current ??
            (() => {
              throw new Error('Trusted burst finished before arm');
            })()
        ),
      prepare: async (action, index) => {
        const step = findStep(action, index);

        if (step.kind !== 'insert-text' && step.kind !== 'delete-backward') {
          throw new Error(`Trusted input has no key for ${step.kind}`);
        }

        const caret =
          step.at === 'start'
            ? { offset: step.kind === 'insert-text' ? 0 : 1, path: [0, 0] }
            : point('end');

        editable().focus();
        editor.update.selection.set({ anchor: caret, focus: caret });
        await nextPresentation(PRESENTATION_LIMIT_MS);
      },
      readBack: () => {
        manager();
        const root = editable();
        const matches = find.store.get('matches');
        const { fresh, mismatch, painted } = paintCheck();

        return {
          blocks: editor.read.children().length,
          freshMatches: fresh.length,
          matchedBlocks: new Set(
            matches.map((match) => match.range.anchor.path[0])
          ).size,
          matches: matches.length,
          paintedMatches: painted.length,
          paintMismatch: mismatch,
          query: find.store.get('query'),
          renderedBlocks: root.childElementCount,
        };
      },
    };
  }, [editor, mountKey, spec.rendering]);

  const Content =
    spec.rendering === 'virtualized' ? VirtualizedEditorContent : EditorContent;

  return (
    <div ref={containerRef} className="h-[70vh] overflow-auto p-4">
      <EditorRoot editor={editor}>
        <Content className="min-h-[70vh] outline-none" spellCheck={false} />
      </EditorRoot>
    </div>
  );
}

export function useFindHarness() {
  const [mounted, setMounted] = React.useState<{
    key: number;
    spec: FindDocSpec;
  } | null>(null);
  const handleRef = React.useRef<FindSurfaceHandle | null>(null);
  const keyRef = React.useRef(0);
  const harness = React.useMemo(() => {
    const requireHandle = () =>
      handleRef.current ??
      (() => {
        throw new Error('No Find document is mounted');
      })();

    return {
      arm: (options: FindArm) => requireHandle().arm(options),
      between: () => requireHandle().between(),
      burst: (burst: FindBurst) => requireHandle().burst(burst),
      finish: (burst: FindBurst) => requireHandle().finish(burst),
      mount: async (spec: FindDocSpec) => {
        keyRef.current += 1;
        const key = keyRef.current;
        const deadline = performance.now() + 180_000;

        setMounted({ key, spec });
        while (handleRef.current?.mountKey !== key) {
          if (performance.now() > deadline) {
            throw new Error(`Find document ${spec.id} did not mount`);
          }
          await delay(16);
        }
        await delay(100);

        return requireHandle().readBack();
      },
      prepare: ({ action, index }: { action: FindAction; index: number }) =>
        requireHandle().prepare(action, index),
      readBack: () => requireHandle().readBack(),
      unmount: async () => {
        setMounted(null);
        await delay(50);
      },
    };
  }, []);

  return { handleRef, harness, mounted };
}

export type FindHarness = ReturnType<typeof useFindHarness>['harness'];
