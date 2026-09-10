import { mkdir, writeFile } from 'node:fs/promises';

import React, { act, memo, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Descendant,
  EditorSnapshot,
  NodeKey,
} from '../../../../../packages/plitejs/src/index.ts';
import { NodeApi } from '../../../../../packages/plitejs/src/index.ts';
import { getSnapshot as editorGetSnapshot, replace as editorReplace } from '../../../../../packages/plitejs/src/internal/index.ts';
import { usePliteDecorationEntries } from '../../../../../packages/plitejs/src/react/decoration-context.tsx';
import {
  createEditor,
  Editable,
  type Editor,
  Plite,
  type PliteDecorationSource,
  useEditorSelector,
  useElementPath,
} from '../../../../../packages/plitejs/src/react/index.ts';
import { createPliteReactRenderCounter } from '../../../../../packages/plitejs/src/react/render-profiler.ts';
import {
  cloneCounts,
  deltaCounts,
  increment,
  mountApp,
  now,
  summarizeMetrics,
} from '../../shared/react-benchmark.tsx';

const iterations = Number(process.env.REACT_HUGE_DOC_BENCH_ITERATIONS || 5);
const blockCount = Number(process.env.REACT_HUGE_DOC_BLOCKS || 200);
const segmentSize = Number(process.env.REACT_HUGE_DOC_ISLAND_SIZE || 32);
const overscan = Number(process.env.REACT_HUGE_DOC_ACTIVE_RADIUS || 1);

const getSegmentCount = () => Math.ceil(blockCount / segmentSize);
const getFarSegmentIndex = () =>
  Math.min(
    getSegmentCount() - 1,
    Math.max(2, Math.floor(getSegmentCount() / 2))
  );
const getFarBlockIndex = () =>
  Math.min(blockCount - 1, getFarSegmentIndex() * segmentSize);

const getWarmupSegmentIndex = () => {
  const targetSegmentIndex = getFarSegmentIndex();
  const segmentCount = getSegmentCount();
  const initialActiveEnd = Math.min(segmentCount - 1, overscan);
  const candidates = [
    targetSegmentIndex - 3,
    targetSegmentIndex + 3,
    targetSegmentIndex - 2,
    targetSegmentIndex + 2,
    0,
    segmentCount - 1,
  ];

  return (
    candidates.find(
      (segmentIndex) =>
        segmentIndex >= 0 &&
        segmentIndex < segmentCount &&
        segmentIndex > initialActiveEnd &&
        Math.abs(segmentIndex - targetSegmentIndex) > overscan
    ) ?? null
  );
};

const createChildren = () =>
  Array.from({ length: blockCount }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: `block-${index + 1}` }],
  })) as Descendant[];

const getDescendantText = (node: Descendant): string => {
  if ('text' in node) {
    return node.text;
  }

  return node.children.map(getDescendantText).join('');
};

const getTopLevelBlockText = (snapshot: EditorSnapshot, index: number) => {
  const block = snapshot.children[index];

  if (!block || !('children' in block)) {
    return '';
  }

  return block.children.map(getDescendantText).join('');
};

type DecorationProbe = Readonly<{
  getReadCount: () => number;
  refresh: () => void;
  source: PliteDecorationSource<Editor>;
}>;

const createDecorationProbe = (
  editor: Editor,
  activeRef: React.RefObject<boolean>
): DecorationProbe => {
  let readCount = 0;
  let refreshSource: ((input: { nodeKeys: readonly NodeKey[] }) => void) | null =
    null;
  const source: PliteDecorationSource<Editor> = {
    id: 'huge-document-overlays',
    observe: ({ refresh }) => {
      refreshSource = refresh;

      return () => {
        refreshSource = null;
      };
    },
    read: ({ entry: [node, path] }) => {
      readCount += 1;
      const blockIndex = path[0];
      const start = getFarBlockIndex();

      if (
        !activeRef.current ||
        !NodeApi.isText(node) ||
        path.length !== 2 ||
        blockIndex < start ||
        blockIndex >= Math.min(blockCount, start + 3)
      ) {
        return [];
      }

      return [
        {
          attributes: { 'data-huge-document-overlay': true },
          key: `far-overlay-${blockIndex}`,
          range: {
            anchor: { path, offset: 0 },
            focus: { path, offset: Math.min(8, node.text.length) },
          },
        },
      ];
    },
  };

  return {
    getReadCount: () => readCount,
    refresh: () => {
      const snapshot = editorGetSnapshot(editor);
      const start = getFarBlockIndex();
      const nodeKeys = Array.from({ length: 3 }, (_value, offset) =>
        snapshot.index.keyAt([start + offset, 0])
      ).filter((nodeKey): nodeKey is NodeKey => !!nodeKey);

      refreshSource?.({ nodeKeys });
    },
    source,
  };
};

const TopLevelBlockSlice = memo(
  ({
    counts,
    index,
    slot,
  }: {
    counts: Record<string, number>;
    index: number;
    slot: string;
  }) => {
    const value = useEditorSelector((editor) =>
      getTopLevelBlockText(editorGetSnapshot(editor), index)
    );
    increment(counts, slot);
    return <span>{value}</span>;
  }
);

const DecorationCountSlice = memo(
  ({
    counts,
    runtimeId,
    slot,
  }: {
    counts: Record<string, number>;
    runtimeId: NodeKey | null;
    slot: string;
  }) => {
    const decorations = usePliteDecorationEntries(runtimeId);

    increment(counts, slot);
    return <span>{decorations.length}</span>;
  }
);

const TrackedElement = ({
  attributes,
  children,
  counts,
  isInline,
}: {
  attributes: {
    'data-plite-inline'?: true;
    'data-plite-node': 'element';
    'data-plite-void'?: true;
    ref: React.RefCallback<HTMLElement>;
  };
  children: React.ReactNode;
  counts: Record<string, number>;
  isInline: boolean;
}) => {
  const path = useElementPath();

  if (path?.length === 1) {
    if (path[0] === 0) {
      increment(counts, 'activeElement');
    }

    if (path[0] === getFarBlockIndex()) {
      increment(counts, 'farElement');
    }
  }

  return React.createElement(isInline ? 'span' : 'div', attributes, children);
};

const RenderingStrategyOverlayApp = ({
  counts,
  editor,
  onDecorationProbe,
}: {
  counts: Record<string, number>;
  editor: Editor;
  onDecorationProbe?: (probe: DecorationProbe) => void;
}) => {
  const [overlayActive, setOverlayActive] = useState(false);
  const overlayActiveRef = useRef(overlayActive);
  overlayActiveRef.current = overlayActive;
  const decorationProbe = useMemo(
    () => createDecorationProbe(editor, overlayActiveRef),
    [editor]
  );

  useEffect(() => {
    onDecorationProbe?.(decorationProbe);
  }, [decorationProbe, onDecorationProbe]);

  return (
    <Plite decorations={[decorationProbe.source]} editor={editor}>
      <RenderingStrategyOverlayInner
        counts={counts}
        onToggle={() => {
          const next = !overlayActiveRef.current;

          overlayActiveRef.current = next;
          setOverlayActive(next);
          decorationProbe.refresh();
        }}
        overlayActive={overlayActive}
      />
    </Plite>
  );
};

const RenderingStrategyOverlayInner = ({
  counts,
  onToggle,
  overlayActive,
}: {
  counts: Record<string, number>;
  onToggle: () => void;
  overlayActive: boolean;
}) => {
  const activeLeafId = useEditorSelector(
    (editorValue) =>
      editorGetSnapshot(editorValue).index.keyAt([0, 0]) ?? null
  );
  const farLeafId = useEditorSelector(
    (editorValue) =>
      editorGetSnapshot(editorValue).index.keyAt([getFarBlockIndex(), 0])
  );

  return (
    <>
      <button id="overlay-toggle" onClick={onToggle} type="button">
        {overlayActive ? 'on' : 'off'}
      </button>
      <span id="active-decoration-count">
        <DecorationCountSlice
          counts={counts}
          runtimeId={activeLeafId}
          slot="activeDecoration"
        />
      </span>
      <span id="far-decoration-count">
        <DecorationCountSlice
          counts={counts}
          runtimeId={farLeafId}
          slot="farDecoration"
        />
      </span>
      <TopLevelBlockSlice counts={counts} index={0} slot="activeText" />
      <TopLevelBlockSlice
        counts={counts}
        index={getFarBlockIndex()}
        slot="farText"
      />
      <Editable
        domStrategy={{
          overscan,
          type: 'partial-dom',
          segmentSize,
          threshold: 1,
        }}
        id="huge-document-overlays"
        renderElement={({ attributes, children, isInline }) => (
          <TrackedElement
            attributes={attributes}
            counts={counts}
            isInline={isInline}
          >
            {children}
          </TrackedElement>
        )}
      />
    </>
  );
};

const countMountedTextNodes = (container: HTMLElement) =>
  container.querySelectorAll('[data-plite-node="text"]').length;

const countShells = (container: HTMLElement) =>
  container.querySelectorAll('[data-plite-dom-strategy-placeholder="true"]')
    .length;

const setupScenario = async () => {
  const editor = createEditor();
  const counts: Record<string, number> = {};
  let decorationProbe: DecorationProbe | null = null;

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const mounted = await mountApp(
    <RenderingStrategyOverlayApp
      counts={counts}
      editor={editor}
      onDecorationProbe={(probe) => {
        decorationProbe = probe;
      }}
    />
  );

  const view = mounted.container.ownerDocument.defaultView;
  const toggle =
    mounted.container.querySelector<HTMLButtonElement>('#overlay-toggle');
  const root = mounted.container.querySelector<HTMLElement>(
    '#huge-document-overlays'
  );

  if (!view || !toggle || !root || !decorationProbe) {
    throw new Error('Missing rendering-strategy overlay benchmark controls');
  }

  return {
    counts,
    editor,
    mounted,
    decorationProbe,
    root,
    toggle,
    view,
  };
};

const measureLane = async (run: () => Promise<Record<string, number>>) => {
  const samples: Record<string, number>[] = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const metrics = await run();

    if (iteration > 0) {
      samples.push(metrics);
    }
  }

  return summarizeMetrics(samples);
};

const promoteSegment = async ({
  mounted,
  segmentIndex,
  view,
}: {
  mounted: Awaited<ReturnType<typeof setupScenario>>['mounted'];
  segmentIndex: number;
  view: Window;
}) => {
  const targetShell = mounted.container.querySelector<HTMLElement>(
    `[data-plite-dom-strategy-placeholder="true"][data-plite-dom-strategy-segment="${segmentIndex}"]`
  );

  if (!targetShell) {
    throw new Error(`Missing target partial DOM placeholder ${segmentIndex}`);
  }

  const start = now();

  await act(async () => {
    targetShell.dispatchEvent(
      new view.MouseEvent('mousedown', {
        bubbles: true,
      })
    );
  });

  return now() - start;
};

const measureOverlayToggle = async () =>
  measureLane(async () => {
    const { counts, decorationProbe, mounted, toggle, view } =
      await setupScenario();
    const partialDOMCountBefore = countShells(mounted.container);
    const mountedTextBefore = countMountedTextNodes(mounted.container);
    const baseline = cloneCounts(counts);
    const readBaseline = decorationProbe.getReadCount();
    const previousRenderProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    const renderCounter =
      process.env.REACT_HUGE_DOC_DEBUG_PROFILE === '1'
        ? createPliteReactRenderCounter()
        : null;
    if (renderCounter) {
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = renderCounter.profiler;
    }
    const start = now();

    await act(async () => {
      toggle.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        })
      );
    });

    const overlayToggleMs = now() - start;
    const renderProfile = renderCounter?.snapshot();
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousRenderProfiler;
    const delta = deltaCounts(counts, baseline);
    const partialDOMCountAfter = countShells(mounted.container);
    const mountedTextAfter = countMountedTextNodes(mounted.container);
    const activeDecorationValue = Number(
      mounted.container.querySelector('#active-decoration-count')
        ?.textContent ?? 0
    );
    const farDecorationValue = Number(
      mounted.container.querySelector('#far-decoration-count')?.textContent ?? 0
    );

    await mounted.dispose();

    return {
      activeDecorationCount: activeDecorationValue,
      activeDecorationRenders: delta.activeDecoration ?? 0,
      decorationReadCount: decorationProbe.getReadCount() - readBaseline,
      farDecorationCount: farDecorationValue,
      farDecorationRenders: delta.farDecoration ?? 0,
      mountedTextAfter,
      mountedTextBefore,
      overlayToggleMs,
      ...(renderProfile
        ? {
            renderElementCount: renderProfile.byKind.element ?? 0,
            renderLeafCount: renderProfile.byKind.leaf ?? 0,
            renderRootPlanCount: renderProfile.byKind['root-plan'] ?? 0,
            renderSelectorCount: renderProfile.byKind.selector ?? 0,
            renderTextCount: renderProfile.byKind.text ?? 0,
            renderTotalCount: renderProfile.total,
          }
        : {}),
      partialDOMCountAfter,
      partialDOMCountBefore,
    };
  });

const measureActiveEditAfterOverlay = async () =>
  measureLane(async () => {
    const { counts, decorationProbe, editor, mounted, toggle, view } =
      await setupScenario();

    await act(async () => {
      toggle.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        })
      );
    });

    const partialDOMCountBefore = countShells(mounted.container);
    const mountedTextBefore = countMountedTextNodes(mounted.container);
    const baseline = cloneCounts(counts);
    const readBaseline = decorationProbe.getReadCount();
    const start = now();

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', {
          at: { path: [0, 0], offset: 0 },
        });
      });
    });

    const editMs = now() - start;
    const delta = deltaCounts(counts, baseline);
    const partialDOMCountAfter = countShells(mounted.container);
    const mountedTextAfter = countMountedTextNodes(mounted.container);

    await mounted.dispose();

    return {
      activeElementRenders: delta.activeElement ?? 0,
      activeDecorationRenders: delta.activeDecoration ?? 0,
      activeTextRenders: delta.activeText ?? 0,
      decorationReadCount: decorationProbe.getReadCount() - readBaseline,
      editMs,
      farElementRenders: delta.farElement ?? 0,
      farDecorationRenders: delta.farDecoration ?? 0,
      farTextRenders: delta.farText ?? 0,
      mountedTextAfter,
      mountedTextBefore,
      partialDOMCountAfter,
      partialDOMCountBefore,
    };
  });

const measurePartialDOMPromotion = async () =>
  measureLane(async () => {
    const { decorationProbe, editor, mounted, toggle, view } =
      await setupScenario();
    const previousRenderProfiler = globalThis.__PLITE_REACT_RENDER_PROFILER__;
    const renderCounter = createPliteReactRenderCounter();

    globalThis.__PLITE_REACT_RENDER_PROFILER__ = renderCounter.profiler;

    await act(async () => {
      toggle.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        })
      );
    });

    const warmupSegmentIndex = getWarmupSegmentIndex();
    const coldPromotionMs =
      warmupSegmentIndex == null
        ? 0
        : await promoteSegment({
            mounted,
            segmentIndex: warmupSegmentIndex,
            view,
          });

    const partialDOMCountBefore = countShells(mounted.container);
    const mountedTextBefore = countMountedTextNodes(mounted.container);

    const readBaseline = decorationProbe.getReadCount();
    renderCounter.reset();
    const promotionMs = await promoteSegment({
      mounted,
      segmentIndex: getFarSegmentIndex(),
      view,
    });
    const renderProfile = renderCounter.snapshot();
    if (process.env.REACT_HUGE_DOC_DEBUG_PROFILE === '1') {
      const durationByKey = new Map<string, number>();

      renderProfile.events.forEach((event) => {
        if (!event.duration) {
          return;
        }

        const key = event.id ? `${event.kind}:${event.id}` : event.kind;
        durationByKey.set(key, (durationByKey.get(key) ?? 0) + event.duration);
      });
      console.error(
        JSON.stringify(
          Object.entries(renderProfile.byKey)
            .sort((left, right) => right[1] - left[1])
            .slice(0, 24),
          null,
          2
        )
      );
      console.error(
        JSON.stringify(
          [...durationByKey.entries()]
            .sort((left, right) => right[1] - left[1])
            .slice(0, 24),
          null,
          2
        )
      );
    }
    const partialDOMCountAfter = countShells(mounted.container);
    const mountedTextAfter = countMountedTextNodes(mounted.container);
    const selection = editorGetSnapshot(editor).selection;
    globalThis.__PLITE_REACT_RENDER_PROFILER__ = previousRenderProfiler;

    await mounted.dispose();

    return {
      coldPromotionMs,
      decorationReadCount: decorationProbe.getReadCount() - readBaseline,
      mountedTextAfter,
      mountedTextBefore,
      promotionMs,
      renderElementCount: renderProfile.byKind.element ?? 0,
      renderLeafCount: renderProfile.byKind.leaf ?? 0,
      renderRootPlanCount:
        renderProfile.byKey['root-plan:dom-strategy-root-sources'] ?? 0,
      renderSelectorCount: renderProfile.byKind.selector ?? 0,
      renderTextCount: renderProfile.byKind.text ?? 0,
      renderTotalCount: renderProfile.total,
      selectionAnchorPathLength: selection?.anchor.path.length ?? 0,
      selectionAnchorTopLevel: Number(selection?.anchor.path[0] ?? -1),
      partialDOMCountAfter,
      partialDOMCountBefore,
    };
  });

const main = async () => {
  const summary = {
    config: {
      overscan,
      blockCount,
      farBlockIndex: getFarBlockIndex(),
      farSegmentIndex: getFarSegmentIndex(),
      segmentSize,
      iterations,
    },
    lane: 'plite-react-huge-document-overlays',
    activeEditAfterOverlay: await measureActiveEditAfterOverlay(),
    overlayToggle: await measureOverlayToggle(),
    partialDOMPromotion: await measurePartialDOMPromotion(),
  };

  await mkdir('tmp', { recursive: true });
  await writeFile(
    'tmp/slate-react-huge-document-overlays-benchmark.json',
    JSON.stringify(summary, null, 2)
  );

  console.log(JSON.stringify(summary, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
