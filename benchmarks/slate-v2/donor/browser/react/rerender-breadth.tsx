import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

import React, {
  Activity,
  act,
  memo,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type {
  Bookmark,
  createEditor,
  Descendant,
  EditorSnapshot,
  Range,
  RuntimeId,
} from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import {
  createReactEditor,
  Editable,
  EditableElement,
  Slate,
  type SlateAnnotation,
  type SlateAnnotationStore,
  type SlateProjectionStore,
  type SlateWidget,
  type SlateWidgetStore,
  useEditor as useSlate,
  useSlateAnnotationStore,
  useSlateAnnotations,
  useSlateProjectionEntries,
  useEditorSelection as useSlateSelection,
  useEditorSelector as useSlateSelector,
  useSlateWidgetStore,
  useSlateWidgets,
} from '../../../../../packages/slate-react/src/index.ts';
import { createSlateProjectionStore } from '../../../../../packages/slate-react/src/projection-store.ts';
import {
  cloneCounts,
  deltaCounts,
  increment,
  mountApp,
  summarizeMetrics,
} from '../../shared/react-benchmark.tsx';

const select = (editor: ReturnType<typeof createEditor>, target: Range) => {
  editor.update((tx) => {
    tx.selection.set(target);
  });
};

const insertText = (
  editor: ReturnType<typeof createEditor>,
  text: string,
  options: Parameters<ReturnType<typeof createEditor>['insertText']>[1]
) => {
  editor.update((tx) => {
    tx.text.insert(text, options);
  });
};

const iterations = Number(process.env.REACT_BREADTH_BENCH_ITERATIONS || 5);
const selectionOps = Number(process.env.REACT_BREADTH_SELECTION_OPS || 20);
const leafCount = Number(process.env.REACT_BREADTH_LEAF_COUNT || 24);
const nestedDepth = Number(process.env.REACT_BREADTH_DEPTH || 12);
const targetLeafIndex = Number(
  process.env.REACT_BREADTH_TARGET_LEAF_INDEX || Math.floor(leafCount / 2)
);

const now = () => performance.now();

void React;

const EMPTY_PROJECTIONS = Object.freeze([]) as readonly unknown[];

const getProjectionMetricCounts = (
  store: Pick<SlateProjectionStore<unknown>, 'getMetrics'> | null | undefined
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

const createSelectionChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const createManyLeafChildren = (count: number): Descendant[] => [
  {
    type: 'paragraph',
    children: Array.from({ length: count }, (_, index) => ({
      leafKey: `leaf-${index}`,
      text: `leaf-${index}`,
    })),
  },
];

const createNestedDepthChildren = (depth: number) => {
  const ancestorKeys: string[] = [];

  let branch: Descendant = {
    nodeKey: 'ancestor-paragraph',
    type: 'paragraph',
    children: [{ leafKey: 'deep-leaf', text: 'deep' }],
  };
  ancestorKeys.push('ancestor-paragraph');

  for (let level = depth - 1; level >= 0; level -= 1) {
    const nodeKey = `ancestor-${level}`;
    ancestorKeys.unshift(nodeKey);
    branch = {
      nodeKey,
      type: `wrapper-${level}`,
      children: [branch],
    };
  }

  return {
    ancestorKeys,
    children: [
      branch,
      {
        nodeKey: 'sibling-branch',
        type: 'paragraph',
        children: [{ leafKey: 'sibling-leaf', text: 'sibling' }],
      },
    ] as Descendant[],
    deepTextPath: Array.from({ length: depth + 2 }, () => 0),
  };
};

const createDecorationToggleChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha-left-target' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta-right-target' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'alpha-extra-target' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'alpha-third-target' }],
  },
];

const createSourceInvalidationChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha-left-target' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta-right-target' }],
  },
];

const deriveDecorationToggleRanges = (snapshot: EditorSnapshot) =>
  snapshot.children.flatMap((node, index) => {
    if (index % 2 !== 0 || !('children' in node)) {
      return [];
    }

    const child = (node as unknown as { children: unknown[] }).children[0];
    const text =
      child && typeof child === 'object' && 'text' in child
        ? String((child as { text: unknown }).text ?? '')
        : '';

    if (!text.startsWith('alpha')) {
      return [];
    }

    return [
      {
        data: { highlight: true },
        key: `overlay-${index}`,
        range: {
          anchor: { path: [index, 0], offset: 0 },
          focus: { path: [index, 0], offset: Math.min(5, text.length) },
        },
      },
    ];
  });

const deriveTextTailRanges = (snapshot: EditorSnapshot) => {
  const text = getTopLevelBlockText(snapshot, 0);

  if (!text) {
    return [];
  }

  const start = Math.max(0, text.length - 5);

  return [
    {
      data: { highlight: true, source: 'text' },
      key: 'text-tail',
      range: {
        anchor: { path: [0, 0], offset: start },
        focus: { path: [0, 0], offset: text.length },
      },
    },
  ];
};

const deriveSelectionRanges = (snapshot: EditorSnapshot) =>
  snapshot.selection
    ? [
        {
          data: { highlight: true, source: 'selection' },
          key: 'selection-range',
          range: snapshot.selection,
        },
      ]
    : [];

const deriveExternalRanges = (active: boolean) =>
  active
    ? [
        {
          data: { highlight: true, source: 'external' },
          key: 'external-left',
          range: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 5 },
          },
        },
      ]
    : [];

const formatRange = (range: Range | null) =>
  range
    ? `${range.anchor.path.join('.')}:${range.anchor.offset}|${range.focus.path.join(
        '.'
      )}:${range.focus.offset}`
    : 'none';

const BroadSlateSlice = memo(
  ({ counts }: { counts: Record<string, number> }) => {
    useSlate();
    increment(counts, 'broad');
    return <span id="broad-subscriber">broad</span>;
  }
);

const SelectionSlice = memo(
  ({ counts }: { counts: Record<string, number> }) => {
    const selection = useSlateSelection();
    increment(counts, 'selection');
    return (
      <span id="selection-subscriber">
        {selection ? selection.anchor.path.join('.') : 'none'}
      </span>
    );
  }
);

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
    const value = useSlateSelector((editor) =>
      getTopLevelBlockText(Editor.getSnapshot(editor), index)
    );
    increment(counts, slot);
    return <span>{value}</span>;
  }
);

const ProjectionSlice = memo(
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
      runtimeId
    );

    increment(counts, slot);

    return <span>{projections.length}</span>;
  }
);

const StoreProjectionSlice = memo(
  ({
    counts,
    runtimeId,
    slot,
    store,
  }: {
    counts: Record<string, number>;
    runtimeId: RuntimeId | null;
    slot: string;
    store: SlateProjectionStore<{
      highlight?: boolean;
      source?: string;
    }>;
  }) => {
    const snapshot = useSyncExternalStore(
      store.subscribe,
      store.getSnapshot,
      store.getSnapshot
    );
    const projections = (
      runtimeId ? (snapshot[runtimeId] ?? EMPTY_PROJECTIONS) : EMPTY_PROJECTIONS
    ) as readonly unknown[];

    increment(counts, slot);

    return <span>{projections.length}</span>;
  }
);

const SelectionBreadthApp = ({
  counts,
  editor,
}: {
  counts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
}) => (
  <Slate editor={editor}>
    <BroadSlateSlice counts={counts} />
    <SelectionSlice counts={counts} />
    <TopLevelBlockSlice counts={counts} index={0} slot="leftBlock" />
    <TopLevelBlockSlice counts={counts} index={1} slot="rightBlock" />
  </Slate>
);

const LeafRenderMarker = ({
  children,
  counts,
  leafKey,
}: {
  children: ReactNode;
  counts: Record<string, number>;
  leafKey: string;
}) => {
  increment(counts, leafKey);
  return <>{children}</>;
};

const ElementRenderMarker = ({
  as,
  children,
  counts,
  isInline,
  nodeKey,
}: {
  as?: keyof HTMLElementTagNameMap;
  children: ReactNode;
  counts: Record<string, number>;
  isInline?: boolean;
  nodeKey: string;
}) => {
  increment(counts, nodeKey);
  return (
    <EditableElement as={as} isInline={isInline}>
      {children}
    </EditableElement>
  );
};

const assertSingleElementHosts = (
  container: HTMLElement,
  expectedCount: number
) => {
  const elementHosts = Array.from(
    container.querySelectorAll<HTMLElement>('[data-slate-node="element"]')
  );
  const runtimeIds = elementHosts.map(
    (elementHost) => elementHost.dataset.slateRuntimeId
  );

  assert.equal(
    elementHosts.length,
    expectedCount,
    'deep-ancestor lane should render one element host per model element'
  );
  assert.ok(
    runtimeIds.every(Boolean),
    'deep-ancestor lane should bind every element host to a runtime id'
  );
  assert.equal(
    new Set(runtimeIds).size,
    elementHosts.length,
    'deep-ancestor lane should not duplicate element hosts for a runtime id'
  );
};

const ManyLeafApp = ({
  blockCounts,
  editor,
  leafCounts,
}: {
  blockCounts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
  leafCounts: Record<string, number>;
}) => (
  <Slate editor={editor}>
    <Editable
      renderElement={({ children, element }) => (
        <ElementRenderMarker
          counts={blockCounts}
          nodeKey={String((element as { nodeKey?: string }).nodeKey ?? 'block')}
        >
          {children}
        </ElementRenderMarker>
      )}
      renderLeaf={({ children, leaf }) => (
        <LeafRenderMarker
          counts={leafCounts}
          leafKey={String((leaf as { leafKey?: string }).leafKey ?? leaf.text)}
        >
          {children}
        </LeafRenderMarker>
      )}
    />
  </Slate>
);

const DeepAncestorApp = ({
  editor,
  elementCounts,
  leafCounts,
}: {
  editor: ReturnType<typeof createEditor>;
  elementCounts: Record<string, number>;
  leafCounts: Record<string, number>;
}) => (
  <Slate editor={editor}>
    <Editable
      renderElement={({ children, element, isInline }) => (
        <ElementRenderMarker
          as={isInline ? 'span' : 'div'}
          counts={elementCounts}
          isInline={isInline}
          nodeKey={String(
            (element as { nodeKey?: string }).nodeKey ?? element.type
          )}
        >
          {children}
        </ElementRenderMarker>
      )}
      renderLeaf={({ children, leaf }) => (
        <LeafRenderMarker
          counts={leafCounts}
          leafKey={String((leaf as { leafKey?: string }).leafKey ?? leaf.text)}
        >
          {children}
        </LeafRenderMarker>
      )}
    />
  </Slate>
);

const DecorationSourceToggleApp = ({
  counts,
  editor,
  onProjectionStore,
}: {
  counts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
  onProjectionStore?: (
    store: SlateProjectionStore<{ highlight?: boolean }>
  ) => void;
}) => {
  const [active, setActive] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const projectionStore = useMemo(
    () =>
      createSlateProjectionStore(
        editor,
        (snapshot) =>
          activeRef.current ? deriveDecorationToggleRanges(snapshot) : [],
        {
          dirtiness: 'external',
          sourceId: 'overlay-toggle',
        }
      ),
    [editor]
  );

  useEffect(() => {
    onProjectionStore?.(projectionStore);
  }, [onProjectionStore, projectionStore]);

  useEffect(
    () => () => {
      projectionStore.destroy();
    },
    [projectionStore]
  );

  useEffect(() => {
    projectionStore.refresh({ reason: 'external' });
  }, [active, projectionStore]);

  return (
    <Slate decorationSources={[projectionStore]} editor={editor}>
      <button
        id="overlay-toggle"
        onClick={() => {
          setActive((value) => !value);
        }}
        type="button"
      >
        {active ? 'on' : 'off'}
      </button>
      <DecorationSourceToggleSlices counts={counts} />
    </Slate>
  );
};

const DecorationSourceToggleSlices = ({
  counts,
}: {
  counts: Record<string, number>;
}) => {
  const leftLeafId = useSlateSelector(
    (editor) => Editor.getSnapshot(editor).index.pathToId['0.0'] ?? null
  );
  const rightLeafId = useSlateSelector(
    (editor) => Editor.getSnapshot(editor).index.pathToId['1.0'] ?? null
  );

  return (
    <>
      <TopLevelBlockSlice counts={counts} index={0} slot="leftText" />
      <TopLevelBlockSlice counts={counts} index={1} slot="rightText" />
      <ProjectionSlice
        counts={counts}
        runtimeId={leftLeafId}
        slot="leftOverlay"
      />
      <ProjectionSlice
        counts={counts}
        runtimeId={rightLeafId}
        slot="rightOverlay"
      />
    </>
  );
};

type HiddenPanelAnnotation = SlateAnnotation<{
  label: string;
}>;

type AnnotationBreadthAnnotation = SlateAnnotation<{
  kind: string;
  label: string;
  tone: string;
}>;

type AnnotationBreadthWidget = SlateWidget<
  {
    label: string;
  },
  {
    kind: string;
    label: string;
    tone: string;
  }
>;

const HiddenPanelSidebar = ({
  annotations,
  counts,
  editor,
}: {
  annotations: readonly HiddenPanelAnnotation[];
  counts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
}) => {
  const store = useSlateAnnotationStore(editor, annotations);
  const snapshot = useSlateAnnotations(store);
  const [localCount, setLocalCount] = useState(0);
  const firstAnnotation = snapshot.allIds[0]
    ? (snapshot.byId.get(snapshot.allIds[0]) ?? null)
    : null;

  increment(counts, 'hiddenPanel');

  return (
    <div>
      <button
        id="activity-panel-count"
        onClick={() => {
          setLocalCount((value) => value + 1);
        }}
        type="button"
      >
        {localCount}
      </button>
      <span id="activity-panel-state">
        {firstAnnotation
          ? `${firstAnnotation.id}:${formatRange(firstAnnotation.range)}`
          : 'none'}
      </span>
    </div>
  );
};

const HiddenPanelActivityApp = ({
  annotations,
  counts,
  editor,
}: {
  annotations: readonly HiddenPanelAnnotation[];
  counts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
}) => {
  const [hidden, setHidden] = useState(false);

  return (
    <Slate editor={editor}>
      <button
        id="toggle-activity"
        onClick={() => {
          setHidden((value) => !value);
        }}
        type="button"
      >
        {hidden ? 'show' : 'hide'}
      </button>
      <TopLevelBlockSlice counts={counts} index={0} slot="activityLeftText" />
      <TopLevelBlockSlice counts={counts} index={1} slot="activityRightText" />
      <Activity mode={hidden ? 'hidden' : 'visible'}>
        <HiddenPanelSidebar
          annotations={annotations}
          counts={counts}
          editor={editor}
        />
      </Activity>
    </Slate>
  );
};

const AnnotationProjectionSlice = memo(
  ({
    counts,
    runtimeId,
  }: {
    counts: Record<string, number>;
    runtimeId: RuntimeId | null;
  }) => {
    useSlateProjectionEntries<{
      annotationId: string;
      kind: string;
      tone?: string;
    }>(runtimeId);
    increment(counts, 'annotationProjection');
    return <span id="annotation-projection">projection</span>;
  }
);

const AnnotationSidebarSlice = memo(
  ({ counts }: { counts: Record<string, number> }) => {
    useSlateAnnotations();
    increment(counts, 'annotationSidebar');
    return <span id="annotation-sidebar">sidebar</span>;
  }
);

const AnnotationWidgetSlice = memo(
  ({
    counts,
    widgetStore,
  }: {
    counts: Record<string, number>;
    widgetStore: ReturnType<
      typeof useSlateWidgetStore<
        {
          label: string;
        },
        {
          kind: string;
          label: string;
          tone: string;
        }
      >
    >;
  }) => {
    useSlateWidgets(widgetStore);
    increment(counts, 'annotationWidget');
    return <span id="annotation-widget">widget</span>;
  }
);

const AnnotationWidgetBreadthSlices = ({
  counts,
  widgetStore,
}: {
  counts: Record<string, number>;
  widgetStore: ReturnType<
    typeof useSlateWidgetStore<
      {
        label: string;
      },
      {
        kind: string;
        label: string;
        tone: string;
      }
    >
  >;
}) => {
  const leftLeafId = useSlateSelector(
    (editor) => Editor.getSnapshot(editor).index.pathToId['0.0'] ?? null
  );

  return (
    <>
      <TopLevelBlockSlice counts={counts} index={0} slot="annotationLeftText" />
      <TopLevelBlockSlice
        counts={counts}
        index={1}
        slot="annotationRightText"
      />
      <AnnotationProjectionSlice counts={counts} runtimeId={leftLeafId} />
      <AnnotationSidebarSlice counts={counts} />
      <AnnotationWidgetSlice counts={counts} widgetStore={widgetStore} />
    </>
  );
};

const AnnotationWidgetBreadthApp = ({
  annotations,
  counts,
  editor,
  onStores,
  widgets,
}: {
  annotations: readonly AnnotationBreadthAnnotation[];
  counts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
  onStores?: (stores: {
    annotationStore: SlateAnnotationStore<{
      kind: string;
      label: string;
      tone: string;
    }>;
    widgetStore: SlateWidgetStore<
      {
        label: string;
      },
      {
        kind: string;
        label: string;
        tone: string;
      }
    >;
  }) => void;
  widgets: readonly AnnotationBreadthWidget[];
}) => {
  const annotationStore = useSlateAnnotationStore(editor, annotations);
  const widgetStore = useSlateWidgetStore(editor, widgets, annotationStore);

  useEffect(() => {
    onStores?.({
      annotationStore,
      widgetStore,
    });
  }, [annotationStore, onStores, widgetStore]);

  return (
    <Slate annotationStore={annotationStore} editor={editor}>
      <AnnotationWidgetBreadthSlices
        counts={counts}
        widgetStore={widgetStore}
      />
    </Slate>
  );
};

const SourceScopedInvalidationApp = ({
  counts,
  editor,
  externalStore,
  leftLeafId,
  rightLeafId,
  selectionStore,
  textStore,
}: {
  counts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
  externalStore: SlateProjectionStore<{
    highlight?: boolean;
    source?: string;
  }>;
  leftLeafId: RuntimeId | null;
  rightLeafId: RuntimeId | null;
  selectionStore: SlateProjectionStore<{
    highlight?: boolean;
    source?: string;
  }>;
  textStore: SlateProjectionStore<{
    highlight?: boolean;
    source?: string;
  }>;
}) => (
  <Slate editor={editor}>
    <StoreProjectionSlice
      counts={counts}
      runtimeId={leftLeafId}
      slot="selectionLeft"
      store={selectionStore}
    />
    <StoreProjectionSlice
      counts={counts}
      runtimeId={rightLeafId}
      slot="selectionRight"
      store={selectionStore}
    />
    <StoreProjectionSlice
      counts={counts}
      runtimeId={leftLeafId}
      slot="textLeft"
      store={textStore}
    />
    <StoreProjectionSlice
      counts={counts}
      runtimeId={rightLeafId}
      slot="textRight"
      store={textStore}
    />
    <StoreProjectionSlice
      counts={counts}
      runtimeId={leftLeafId}
      slot="externalLeft"
      store={externalStore}
    />
    <StoreProjectionSlice
      counts={counts}
      runtimeId={rightLeafId}
      slot="externalRight"
      store={externalStore}
    />
  </Slate>
);

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

const measureSelectionBreadth = async () =>
  measureLane(async () => {
    const editor = createReactEditor();
    const counts: Record<string, number> = {};

    Editor.replace(editor, {
      children: createSelectionChildren(),
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    const mounted = await mountApp(
      <SelectionBreadthApp counts={counts} editor={editor} />
    );
    const baseline = cloneCounts(counts);

    const start = now();

    for (let index = 0; index < selectionOps; index += 1) {
      const blockIndex = index % 2;

      await act(async () => {
        select(editor, {
          anchor: { path: [blockIndex, 0], offset: 0 },
          focus: { path: [blockIndex, 0], offset: 1 },
        });
      });
    }

    const selectionOpsMs = now() - start;
    const delta = deltaCounts(counts, baseline);

    await mounted.dispose();

    return {
      broadRenders: delta.broad ?? 0,
      leftBlockRenders: delta.leftBlock ?? 0,
      rightBlockRenders: delta.rightBlock ?? 0,
      selectionOpsMs,
      selectionRenders: delta.selection ?? 0,
    };
  });

const measureManyLeafBreadth = async () =>
  measureLane(async () => {
    const editor = createReactEditor();
    const blockCounts: Record<string, number> = {};
    const leafCounts: Record<string, number> = {};
    const targetLeafKey = `leaf-${targetLeafIndex}`;

    Editor.replace(editor, {
      children: createManyLeafChildren(leafCount),
      selection: {
        anchor: { path: [0, targetLeafIndex], offset: 0 },
        focus: { path: [0, targetLeafIndex], offset: 0 },
      },
    });

    const mounted = await mountApp(
      <ManyLeafApp
        blockCounts={blockCounts}
        editor={editor}
        leafCounts={leafCounts}
      />
    );
    const baselineLeafCounts = cloneCounts(leafCounts);
    const baselineBlockCounts = cloneCounts(blockCounts);

    const start = now();

    await act(async () => {
      insertText(editor, '!', {
        at: { path: [0, targetLeafIndex], offset: 0 },
      });
    });

    const editMs = now() - start;
    const leafDelta = deltaCounts(leafCounts, baselineLeafCounts);
    const blockDelta = deltaCounts(blockCounts, baselineBlockCounts);
    const siblingLeafEntries = Object.entries(leafDelta).filter(
      ([key]) => key !== targetLeafKey
    );

    assert.equal(
      typeof Editor.getSnapshot(editor).children[0],
      'object',
      'many-leaf lane lost the paragraph root'
    );

    await mounted.dispose();

    return {
      blockRenders: blockDelta.block ?? 0,
      editMs,
      editedLeafRenders: leafDelta[targetLeafKey] ?? 0,
      rerenderedSiblingLeafCount: siblingLeafEntries.filter(
        ([, count]) => count > 0
      ).length,
      siblingLeafRenders: siblingLeafEntries.reduce(
        (total, [, count]) => total + count,
        0
      ),
    };
  });

const measureDeepAncestorBreadth = async () =>
  measureLane(async () => {
    const editor = createReactEditor();
    const elementCounts: Record<string, number> = {};
    const leafCounts: Record<string, number> = {};
    const { ancestorKeys, children, deepTextPath } =
      createNestedDepthChildren(nestedDepth);

    Editor.replace(editor, {
      children,
      selection: {
        anchor: { path: deepTextPath, offset: 0 },
        focus: { path: deepTextPath, offset: 0 },
      },
    });

    const mounted = await mountApp(
      <DeepAncestorApp
        editor={editor}
        elementCounts={elementCounts}
        leafCounts={leafCounts}
      />
    );
    assertSingleElementHosts(mounted.container, ancestorKeys.length + 1);
    const baselineElementCounts = cloneCounts(elementCounts);
    const baselineLeafCounts = cloneCounts(leafCounts);

    const start = now();

    await act(async () => {
      insertText(editor, '!', {
        at: { path: deepTextPath, offset: 0 },
      });
    });

    const editMs = now() - start;
    const elementDelta = deltaCounts(elementCounts, baselineElementCounts);
    const leafDelta = deltaCounts(leafCounts, baselineLeafCounts);
    const rerenderedAncestorCount = ancestorKeys.filter(
      (key) => (elementDelta[key] ?? 0) > 0
    ).length;
    const ancestorRenderEvents = ancestorKeys.reduce(
      (total, key) => total + (elementDelta[key] ?? 0),
      0
    );

    await mounted.dispose();

    return {
      ancestorRenderEvents,
      deepLeafRenders: leafDelta['deep-leaf'] ?? 0,
      editMs,
      rerenderedAncestorCount,
      siblingBranchRenders: elementDelta['sibling-branch'] ?? 0,
      siblingLeafRenders: leafDelta['sibling-leaf'] ?? 0,
    };
  });

const measureDecorationSourceToggleBreadth = async () =>
  measureLane(async () => {
    const editor = createReactEditor();
    const counts: Record<string, number> = {};
    let projectionStore: SlateProjectionStore<{
      highlight?: boolean;
    }> | null = null;

    Editor.replace(editor, {
      children: createDecorationToggleChildren(),
      selection: null,
    });

    const mounted = await mountApp(
      <DecorationSourceToggleApp
        counts={counts}
        editor={editor}
        onProjectionStore={(store) => {
          projectionStore = store;
        }}
      />
    );
    const baseline = cloneCounts(counts);
    const view = mounted.container.ownerDocument.defaultView;
    const toggle =
      mounted.container.querySelector<HTMLButtonElement>('#overlay-toggle');

    if (!view || !toggle) {
      throw new Error('Missing overlay toggle controls');
    }

    const start = now();

    await act(async () => {
      toggle.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        })
      );
    });

    const toggleMs = now() - start;
    const delta = deltaCounts(counts, baseline);

    await mounted.dispose();

    const metricCounts = getProjectionMetricCounts(projectionStore);

    return {
      leftOverlayRenders: delta.leftOverlay ?? 0,
      leftTextRenders: delta.leftText ?? 0,
      projectionRecomputeCount: metricCounts.recomputeCount,
      rightOverlayRenders: delta.rightOverlay ?? 0,
      rightTextRenders: delta.rightText ?? 0,
      toggleMs,
    };
  });

const measureHiddenPanelActivity = async () =>
  measureLane(async () => {
    const editor = createReactEditor();
    const counts: Record<string, number> = {};

    Editor.replace(editor, {
      children: createSelectionChildren(),
      selection: null,
    });

    const bookmark: Bookmark = Editor.bookmark(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    const annotations = [
      {
        anchor: bookmark,
        data: {
          label: 'Hidden panel annotation',
        },
        id: 'hidden-panel-annotation',
      },
    ] as const;
    const mounted = await mountApp(
      <HiddenPanelActivityApp
        annotations={annotations}
        counts={counts}
        editor={editor}
      />
    );
    const view = mounted.container.ownerDocument.defaultView;
    const counterButton = mounted.container.querySelector<HTMLButtonElement>(
      '#activity-panel-count'
    );
    const toggleButton =
      mounted.container.querySelector<HTMLButtonElement>('#toggle-activity');

    if (!view || !counterButton || !toggleButton) {
      throw new Error('Missing hidden panel controls');
    }

    await act(async () => {
      counterButton.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        })
      );
    });

    await act(async () => {
      toggleButton.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        })
      );
    });

    const afterHide = cloneCounts(counts);
    const start = now();

    await act(async () => {
      insertText(editor, '!', {
        at: { path: [0, 0], offset: 0 },
      });
    });

    const hiddenEditMs = now() - start;
    const afterHiddenEdit = cloneCounts(counts);

    await act(async () => {
      toggleButton.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        })
      );
    });

    const afterShow = cloneCounts(counts);
    const hiddenDelta = deltaCounts(afterHiddenEdit, afterHide);
    const showDelta = deltaCounts(afterShow, afterHiddenEdit);
    const localCount = Number(
      mounted.container.querySelector('#activity-panel-count')?.textContent ?? 0
    );
    const panelState =
      mounted.container.querySelector('#activity-panel-state')?.textContent ??
      'none';

    await mounted.dispose();
    bookmark.unref();

    return {
      hiddenEditMs,
      hiddenPanelRendersWhileHidden: hiddenDelta.hiddenPanel ?? 0,
      leftTextRendersWhileHidden: hiddenDelta.activityLeftText ?? 0,
      preservedLocalCount: localCount,
      resumedPanelRenders: showDelta.hiddenPanel ?? 0,
      rightTextRendersWhileHidden: hiddenDelta.activityRightText ?? 0,
      visiblePanelStateLength: panelState.length,
    };
  });

const measureAnnotationWidgetBreadth = async () =>
  measureLane(async () => {
    const editor = createReactEditor();
    const counts: Record<string, number> = {};
    let annotationStore: SlateAnnotationStore<{
      kind: string;
      label: string;
      tone: string;
    }> | null = null;
    let widgetStore: SlateWidgetStore<
      {
        label: string;
      },
      {
        kind: string;
        label: string;
        tone: string;
      }
    > | null = null;

    Editor.replace(editor, {
      children: createSelectionChildren(),
      selection: null,
    });

    const bookmark = Editor.bookmark(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    const annotations = [
      {
        anchor: bookmark,
        data: {
          kind: 'annotation',
          label: 'Comment 1',
          tone: 'persistent',
        },
        id: 'comment-1',
        projection: {
          kind: 'annotation',
          tone: 'persistent',
        },
      },
    ] as const;
    const widgets = [
      {
        anchor: {
          annotationId: 'comment-1',
          type: 'annotation' as const,
        },
        data: {
          label: 'Comment widget',
        },
        id: 'comment-widget',
      },
    ] as const;

    const mounted = await mountApp(
      <AnnotationWidgetBreadthApp
        annotations={annotations}
        counts={counts}
        editor={editor}
        onStores={(stores) => {
          annotationStore = stores.annotationStore;
          widgetStore = stores.widgetStore;
        }}
        widgets={widgets}
      />
    );
    const baseline = cloneCounts(counts);
    const start = now();

    await act(async () => {
      insertText(editor, '>', {
        at: { path: [0, 0], offset: 0 },
      });
    });

    const editMs = now() - start;
    const delta = deltaCounts(counts, baseline);
    const annotationMetrics = annotationStore?.getMetrics();

    await mounted.dispose();
    bookmark.unref();

    return {
      annotationProjectionRenders: delta.annotationProjection ?? 0,
      annotationProjectCount: annotationMetrics?.annotationProjectCount ?? 0,
      annotationProjectionRecomputeCount:
        annotationMetrics?.recomputeCount ?? 0,
      annotationResolveCount: annotationMetrics?.annotationResolveCount ?? 0,
      annotationRuntimeSubscriberWakeCount:
        annotationMetrics?.runtimeSubscriberWakeCount ?? 0,
      annotationSidebarRenders: delta.annotationSidebar ?? 0,
      annotationWidgetRenders: delta.annotationWidget ?? 0,
      editMs,
      leftTextRenders: delta.annotationLeftText ?? 0,
      rightTextRenders: delta.annotationRightText ?? 0,
      widgetRecomputeCount: widgetStore?.getMetrics().recomputeCount ?? 0,
    };
  });

const measureSourceScopedInvalidation = async () =>
  measureLane(async () => {
    const editor = createReactEditor();
    const counts: Record<string, number> = {};
    const externalActiveRef = { current: false };

    Editor.replace(editor, {
      children: createSourceInvalidationChildren(),
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      },
    });

    const snapshot = Editor.getSnapshot(editor);
    const leftLeafId = snapshot.index.pathToId['0.0'] ?? null;
    const rightLeafId = snapshot.index.pathToId['1.0'] ?? null;
    const selectionStore = createSlateProjectionStore(
      editor,
      deriveSelectionRanges,
      {
        dirtiness: 'selection',
        sourceId: 'selection-source',
      }
    );
    const textStore = createSlateProjectionStore(editor, deriveTextTailRanges, {
      dirtiness: 'text',
      sourceId: 'text-source',
    });
    const externalStore = createSlateProjectionStore(
      editor,
      () => deriveExternalRanges(externalActiveRef.current),
      {
        dirtiness: 'external',
        sourceId: 'external-source',
      }
    );

    const mounted = await mountApp(
      <SourceScopedInvalidationApp
        counts={counts}
        editor={editor}
        externalStore={externalStore}
        leftLeafId={leftLeafId}
        rightLeafId={rightLeafId}
        selectionStore={selectionStore}
        textStore={textStore}
      />
    );

    const selectionBaseline = cloneCounts(counts);
    const selectionSelectionBaseline =
      getProjectionMetricCounts(selectionStore).recomputeCount;
    const selectionTextBaseline =
      getProjectionMetricCounts(textStore).recomputeCount;
    const selectionExternalBaseline =
      getProjectionMetricCounts(externalStore).recomputeCount;
    const selectionStart = now();

    await act(async () => {
      select(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      });
    });

    const selectionChangeMs = now() - selectionStart;
    const selectionDelta = deltaCounts(counts, selectionBaseline);
    const selectionChangeSelectionRecomputeCount =
      getProjectionMetricCounts(selectionStore).recomputeCount -
      selectionSelectionBaseline;
    const selectionChangeTextRecomputeCount =
      getProjectionMetricCounts(textStore).recomputeCount -
      selectionTextBaseline;
    const selectionChangeExternalRecomputeCount =
      getProjectionMetricCounts(externalStore).recomputeCount -
      selectionExternalBaseline;

    const textBaseline = cloneCounts(counts);
    const textSelectionBaseline =
      getProjectionMetricCounts(selectionStore).recomputeCount;
    const textTextBaseline =
      getProjectionMetricCounts(textStore).recomputeCount;
    const textExternalBaseline =
      getProjectionMetricCounts(externalStore).recomputeCount;
    const textStart = now();

    await act(async () => {
      insertText(editor, '!', {
        at: { path: [0, 0], offset: 0 },
      });
    });

    const textEditMs = now() - textStart;
    const textDelta = deltaCounts(counts, textBaseline);
    const textEditSelectionRecomputeCount =
      getProjectionMetricCounts(selectionStore).recomputeCount -
      textSelectionBaseline;
    const textEditTextRecomputeCount =
      getProjectionMetricCounts(textStore).recomputeCount - textTextBaseline;
    const textEditExternalRecomputeCount =
      getProjectionMetricCounts(externalStore).recomputeCount -
      textExternalBaseline;

    const externalBaseline = cloneCounts(counts);
    const externalSelectionBaseline =
      getProjectionMetricCounts(selectionStore).recomputeCount;
    const externalTextBaseline =
      getProjectionMetricCounts(textStore).recomputeCount;
    const externalExternalBaseline =
      getProjectionMetricCounts(externalStore).recomputeCount;
    externalActiveRef.current = true;
    const externalStart = now();

    await act(async () => {
      externalStore.refresh({ reason: 'external' });
    });

    const externalRefreshMs = now() - externalStart;
    const externalDelta = deltaCounts(counts, externalBaseline);
    const externalRefreshSelectionRecomputeCount =
      getProjectionMetricCounts(selectionStore).recomputeCount -
      externalSelectionBaseline;
    const externalRefreshTextRecomputeCount =
      getProjectionMetricCounts(textStore).recomputeCount -
      externalTextBaseline;
    const externalRefreshExternalRecomputeCount =
      getProjectionMetricCounts(externalStore).recomputeCount -
      externalExternalBaseline;

    await mounted.dispose();
    selectionStore.destroy();
    textStore.destroy();
    externalStore.destroy();

    return {
      externalRefreshExternalLeftRenders: externalDelta.externalLeft ?? 0,
      externalRefreshExternalRecomputeCount,
      externalRefreshExternalRightRenders: externalDelta.externalRight ?? 0,
      externalRefreshMs,
      externalRefreshSelectionRecomputeCount,
      externalRefreshTextRecomputeCount,
      selectionChangeExternalRecomputeCount,
      selectionChangeMs,
      selectionChangeSelectionLeftRenders: selectionDelta.selectionLeft ?? 0,
      selectionChangeSelectionRecomputeCount,
      selectionChangeSelectionRightRenders: selectionDelta.selectionRight ?? 0,
      selectionChangeTextRecomputeCount,
      textEditExternalRecomputeCount,
      textEditMs,
      textEditSelectionRecomputeCount,
      textEditTextLeftRenders: textDelta.textLeft ?? 0,
      textEditTextRecomputeCount,
      textEditTextRightRenders: textDelta.textRight ?? 0,
    };
  });

const main = async () => {
  const summary = {
    config: {
      iterations,
      leafCount,
      nestedDepth,
      selectionOps,
      targetLeafIndex,
    },
    lane: 'slate-react-rerender-breadth',
    selectionBreadth: await measureSelectionBreadth(),
    manyLeafBreadth: await measureManyLeafBreadth(),
    deepAncestorBreadth: await measureDeepAncestorBreadth(),
    decorationSourceToggleBreadth: await measureDecorationSourceToggleBreadth(),
    hiddenPanelActivity: await measureHiddenPanelActivity(),
    annotationWidgetBreadth: await measureAnnotationWidgetBreadth(),
    sourceScopedInvalidation: await measureSourceScopedInvalidation(),
  };

  await mkdir('tmp', { recursive: true });
  await writeFile(
    'tmp/slate-react-rerender-breadth-benchmark.json',
    JSON.stringify(summary, null, 2)
  );

  console.log(JSON.stringify(summary, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
