import { mkdir, writeFile } from 'node:fs/promises';

import React, { act, memo, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Descendant,
  EditorSnapshot,
  RuntimeId,
} from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import { createDecorationSource } from '../../../../../packages/slate-react/src/decoration-source.ts';
import {
  createReactEditor,
  Editable,
  type ReactEditor,
  Slate,
  type SlateDecorationSource,
  useEditorSelector,
  useElementPath,
  useSlateProjectionEntries,
} from '../../../../../packages/slate-react/src/index.ts';
import { createSlateReactRenderCounter } from '../../../../../packages/slate-react/src/render-profiler.ts';
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

const createOverlayRanges = (snapshot: EditorSnapshot) => {
  const start = getFarBlockIndex();
  const end = Math.min(blockCount, start + 3);
  const ranges: {
    data: {
      highlight: boolean;
    };
    key: string;
    range: {
      anchor: {
        offset: number;
        path: [number, 0];
      };
      focus: {
        offset: number;
        path: [number, 0];
      };
    };
  }[] = [];

  for (let index = start; index < end; index += 1) {
    const text = getTopLevelBlockText(snapshot, index);

    if (!text) {
      continue;
    }

    ranges.push({
      data: { highlight: true },
      key: `far-overlay-${index}`,
      range: {
        anchor: { path: [index, 0], offset: 0 },
        focus: { path: [index, 0], offset: Math.min(8, text.length) },
      },
    });
  }

  return ranges;
};

const getProjectionMetricCounts = (
  store: Pick<SlateDecorationSource<unknown>, 'getMetrics'> | null | undefined
) => {
  const metrics =
    store && typeof store.getMetrics === 'function' ? store.getMetrics() : null;

  return {
    changedRuntimeBucketCount: metrics?.changedRuntimeBucketCount ?? 0,
    fullFallbackCount: metrics?.fullFallbackCount ?? 0,
    globalSubscriberWakeCount: metrics?.globalSubscriberWakeCount ?? 0,
    invalidRangeDropCount: metrics?.invalidRangeDropCount ?? 0,
    projectedRangeCount: metrics?.projectedRangeCount ?? 0,
    recomputeCount: metrics?.recomputeCount ?? 0,
    runtimeSubscriberWakeCount: metrics?.runtimeSubscriberWakeCount ?? 0,
    sourceReadCount: metrics?.sourceReadCount ?? 0,
    sourceSubscriberWakeCount: metrics?.sourceSubscriberWakeCount ?? 0,
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
      getTopLevelBlockText(Editor.getSnapshot(editor), index)
    );
    increment(counts, slot);
    return <span>{value}</span>;
  }
);

const ProjectionCountSlice = memo(
  ({
    counts,
    runtimeId,
    slot,
  }: {
    counts: Record<string, number>;
    runtimeId: RuntimeId | null;
    slot: string;
  }) => {
    const projections = useSlateProjectionEntries<{ highlight?: boolean }>(
      runtimeId ?? ''
    ) as readonly unknown[];

    increment(counts, slot);
    return <span>{projections.length}</span>;
  }
);

const TrackedElement = ({
  attributes,
  children,
  counts,
  isInline,
}: {
  attributes: {
    'data-slate-inline'?: true;
    'data-slate-node': 'element';
    'data-slate-void'?: true;
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
  onDecorationSource,
}: {
  counts: Record<string, number>;
  editor: ReactEditor;
  onDecorationSource?: (
    source: SlateDecorationSource<{ highlight?: boolean }>
  ) => void;
}) => {
  const [overlayActive, setOverlayActive] = useState(false);
  const overlayActiveRef = useRef(overlayActive);
  overlayActiveRef.current = overlayActive;
  const decorationSource = useMemo(
    () =>
      createDecorationSource(editor, {
        id: 'huge-document-overlays',
        read: ({ snapshot }) =>
          overlayActiveRef.current ? createOverlayRanges(snapshot) : [],
        dirtiness: 'external',
      }),
    [editor]
  );
  const decorationSources = useMemo(
    () => [decorationSource] as const,
    [decorationSource]
  );

  useEffect(() => {
    onDecorationSource?.(decorationSource);
  }, [onDecorationSource, decorationSource]);

  useEffect(
    () => () => {
      decorationSource.destroy();
    },
    [decorationSource]
  );

  useEffect(() => {
    decorationSource.refresh({ reason: 'external' });
  }, [decorationSource, overlayActive]);

  return (
    <Slate decorationSources={decorationSources} editor={editor}>
      <RenderingStrategyOverlayInner
        counts={counts}
        onToggle={() => {
          setOverlayActive((value) => !value);
        }}
        overlayActive={overlayActive}
      />
    </Slate>
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
      Editor.getSnapshot(editorValue).index.pathToId['0.0'] ?? null
  );
  const farLeafId = useEditorSelector(
    (editorValue) =>
      Editor.getSnapshot(editorValue).index.pathToId[
        `${getFarBlockIndex()}.0`
      ] ?? null
  );

  return (
    <>
      <button id="overlay-toggle" onClick={onToggle} type="button">
        {overlayActive ? 'on' : 'off'}
      </button>
      <span id="active-projection-count">
        <ProjectionCountSlice
          counts={counts}
          runtimeId={activeLeafId}
          slot="activeProjection"
        />
      </span>
      <span id="far-projection-count">
        <ProjectionCountSlice
          counts={counts}
          runtimeId={farLeafId}
          slot="farProjection"
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
  container.querySelectorAll('[data-slate-node="text"]').length;

const countShells = (container: HTMLElement) =>
  container.querySelectorAll('[data-slate-dom-strategy-placeholder="true"]')
    .length;

const setupScenario = async () => {
  const editor = createReactEditor();
  const counts: Record<string, number> = {};
  let decorationSource: SlateDecorationSource<{ highlight?: boolean }> | null =
    null;

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  });

  const mounted = await mountApp(
    <RenderingStrategyOverlayApp
      counts={counts}
      editor={editor}
      onDecorationSource={(source) => {
        decorationSource = source;
      }}
    />
  );

  const view = mounted.container.ownerDocument.defaultView;
  const toggle =
    mounted.container.querySelector<HTMLButtonElement>('#overlay-toggle');
  const root = mounted.container.querySelector<HTMLElement>(
    '#huge-document-overlays'
  );

  if (!view || !toggle || !root || !decorationSource) {
    throw new Error('Missing rendering-strategy overlay benchmark controls');
  }

  return {
    counts,
    editor,
    mounted,
    projectionStore: decorationSource,
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
    `[data-slate-dom-strategy-placeholder="true"][data-slate-dom-strategy-segment="${segmentIndex}"]`
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
    const { counts, mounted, projectionStore, toggle, view } =
      await setupScenario();
    const partialDOMCountBefore = countShells(mounted.container);
    const mountedTextBefore = countMountedTextNodes(mounted.container);
    const baseline = cloneCounts(counts);
    const recomputeBaseline =
      getProjectionMetricCounts(projectionStore).recomputeCount;
    const start = now();

    await act(async () => {
      toggle.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        })
      );
    });

    const overlayToggleMs = now() - start;
    const delta = deltaCounts(counts, baseline);
    const partialDOMCountAfter = countShells(mounted.container);
    const mountedTextAfter = countMountedTextNodes(mounted.container);
    const activeProjectionValue = Number(
      mounted.container.querySelector('#active-projection-count')
        ?.textContent ?? 0
    );
    const farProjectionValue = Number(
      mounted.container.querySelector('#far-projection-count')?.textContent ?? 0
    );

    await mounted.dispose();

    return {
      activeProjectionCount: activeProjectionValue,
      activeProjectionRenders: delta.activeProjection ?? 0,
      farProjectionCount: farProjectionValue,
      farProjectionRenders: delta.farProjection ?? 0,
      mountedTextAfter,
      mountedTextBefore,
      overlayToggleMs,
      projectionRecomputeCount:
        getProjectionMetricCounts(projectionStore).recomputeCount -
        recomputeBaseline,
      partialDOMCountAfter,
      partialDOMCountBefore,
    };
  });

const measureActiveEditAfterOverlay = async () =>
  measureLane(async () => {
    const { counts, editor, mounted, projectionStore, toggle, view } =
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
    const recomputeBaseline =
      getProjectionMetricCounts(projectionStore).recomputeCount;
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
      activeProjectionRenders: delta.activeProjection ?? 0,
      activeTextRenders: delta.activeText ?? 0,
      editMs,
      farElementRenders: delta.farElement ?? 0,
      farProjectionRenders: delta.farProjection ?? 0,
      farTextRenders: delta.farText ?? 0,
      mountedTextAfter,
      mountedTextBefore,
      projectionRecomputeCount:
        getProjectionMetricCounts(projectionStore).recomputeCount -
        recomputeBaseline,
      partialDOMCountAfter,
      partialDOMCountBefore,
    };
  });

const measurePartialDOMPromotion = async () =>
  measureLane(async () => {
    const { editor, mounted, projectionStore, toggle, view } =
      await setupScenario();
    const previousRenderProfiler = globalThis.__SLATE_REACT_RENDER_PROFILER__;
    const renderCounter = createSlateReactRenderCounter();

    globalThis.__SLATE_REACT_RENDER_PROFILER__ = renderCounter.profiler;

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

    const recomputeBaseline =
      getProjectionMetricCounts(projectionStore).recomputeCount;
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
    const selection = Editor.getSnapshot(editor).selection;
    globalThis.__SLATE_REACT_RENDER_PROFILER__ = previousRenderProfiler;

    await mounted.dispose();

    return {
      coldPromotionMs,
      mountedTextAfter,
      mountedTextBefore,
      projectionRecomputeCount:
        getProjectionMetricCounts(projectionStore).recomputeCount -
        recomputeBaseline,
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
    lane: 'slate-react-huge-document-overlays',
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
