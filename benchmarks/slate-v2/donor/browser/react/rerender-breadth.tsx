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
} from 'react';
import type {
  Anchor,
  Descendant,
  EditorSnapshot,
  NodeKey,
  Range,
} from '../../../../../packages/plitejs/src/index.ts';
import { NodeApi } from '../../../../../packages/plitejs/src/index.ts';
import {
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
} from '../../../../../packages/plitejs/src/internal/index.ts';
import {
  createEditor,
  Editable,
  Plite,
  PliteElement,
  type PliteAnnotation,
  type PliteAnnotationStore,
  type PliteDecorationSource,
  type PliteWidget,
  type PliteWidgetStore,
  useEditorContext,
  useEditorSelection,
  useEditorSelector,
  usePliteAnnotationStore,
  usePliteAnnotations,
  usePliteWidgetStore,
  usePliteWidgets,
} from '../../../../../packages/plitejs/src/react/index.ts';
import { usePliteDecorationEntries } from '../../../../../packages/plitejs/src/react/decoration-context.tsx';
import {
  cloneCounts,
  deltaCounts,
  increment,
  mountApp,
  summarizeMetrics,
} from '../../shared/react-benchmark.tsx';

const select = (editor: ReturnType<typeof createEditor>, target: Range) => {
  editor.update((tx) => {
    tx.selection.set({ ...target, kind: 'text' });
  });
};

const insertText = (
  editor: ReturnType<typeof createEditor>,
  text: string,
  options: Parameters<
    ReturnType<typeof createEditor>['update']['text']['insert']
  >[1],
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
  process.env.REACT_BREADTH_TARGET_LEAF_INDEX || Math.floor(leafCount / 2),
);

const now = () => performance.now();

void React;

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

type DecorationProbe = Readonly<{
  getReadCount: () => number;
  refresh: () => void;
  source: PliteDecorationSource<ReturnType<typeof createEditor>>;
}>;

const createDecorationProbe = (
  editor: ReturnType<typeof createEditor>,
  activeRef: React.RefObject<boolean>,
): DecorationProbe => {
  let readCount = 0;
  let refreshSource:
    | ((input: { nodeKeys: readonly NodeKey[] }) => void)
    | null = null;
  const source: PliteDecorationSource<ReturnType<typeof createEditor>> = {
    id: 'overlay-toggle',
    observe: ({ refresh }) => {
      refreshSource = refresh;

      return () => {
        refreshSource = null;
      };
    },
    read: ({ entry: [node, path] }) => {
      readCount += 1;

      if (
        !activeRef.current ||
        !NodeApi.isText(node) ||
        path.length !== 2 ||
        path[0] % 2 !== 0 ||
        !node.text.startsWith('alpha')
      ) {
        return [];
      }

      return [
        {
          attributes: { 'data-rerender-breadth-overlay': true },
          key: `overlay-${path[0]}`,
          range: {
            anchor: { path, offset: 0 },
            focus: { path, offset: Math.min(5, node.text.length) },
          },
        },
      ];
    },
  };

  return {
    getReadCount: () => readCount,
    refresh: () => {
      const snapshot = editorGetSnapshot(editor);
      const nodeKeys = snapshot.children.flatMap((_node, index) => {
        const nodeKey =
          index % 2 === 0 ? snapshot.index.keyAt([index, 0]) : null;

        return nodeKey ? [nodeKey] : [];
      });

      refreshSource?.({ nodeKeys });
    },
    source,
  };
};

const formatRange = (range: Range | null) =>
  range
    ? `${range.anchor.path.join('.')}:${range.anchor.offset}|${range.focus.path.join(
        '.',
      )}:${range.focus.offset}`
    : 'none';

const BroadEditorSlice = memo(
  ({ counts }: { counts: Record<string, number> }) => {
    useEditorContext();
    increment(counts, 'broad');
    return <span id="broad-subscriber">broad</span>;
  },
);

const SelectionSlice = memo(
  ({ counts }: { counts: Record<string, number> }) => {
    const selection = useEditorSelection();
    increment(counts, 'selection');
    return (
      <span id="selection-subscriber">
        {selection ? selection.anchor.path.join('.') : 'none'}
      </span>
    );
  },
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
    const value = useEditorSelector((editor) =>
      getTopLevelBlockText(editorGetSnapshot(editor), index),
    );
    increment(counts, slot);
    return <span>{value}</span>;
  },
);

const DecorationSlice = memo(
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
  },
);

const SelectionBreadthApp = ({
  counts,
  editor,
}: {
  counts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
}) => (
  <Plite editor={editor}>
    <BroadEditorSlice counts={counts} />
    <SelectionSlice counts={counts} />
    <TopLevelBlockSlice counts={counts} index={0} slot="leftBlock" />
    <TopLevelBlockSlice counts={counts} index={1} slot="rightBlock" />
  </Plite>
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
    <PliteElement as={as} isInline={isInline}>
      {children}
    </PliteElement>
  );
};

const assertSingleElementHosts = (
  container: HTMLElement,
  expectedCount: number,
) => {
  const elementHosts = Array.from(
    container.querySelectorAll<HTMLElement>('[data-plite-node="element"]'),
  );
  const runtimeIds = elementHosts.map(
    (elementHost) => elementHost.dataset.pliteNodeKey,
  );

  assert.equal(
    elementHosts.length,
    expectedCount,
    'deep-ancestor lane should render one element host per model element',
  );
  assert.ok(
    runtimeIds.every(Boolean),
    'deep-ancestor lane should bind every element host to a runtime id',
  );
  assert.equal(
    new Set(runtimeIds).size,
    elementHosts.length,
    'deep-ancestor lane should not duplicate element hosts for a runtime id',
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
  <Plite editor={editor}>
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
  </Plite>
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
  <Plite editor={editor}>
    <Editable
      renderElement={({ children, element, isInline }) => (
        <ElementRenderMarker
          as={isInline ? 'span' : 'div'}
          counts={elementCounts}
          isInline={isInline}
          nodeKey={String(
            (element as { nodeKey?: string }).nodeKey ?? element.type,
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
  </Plite>
);

const DecorationSourceToggleApp = ({
  counts,
  editor,
  onDecorationProbe,
}: {
  counts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
  onDecorationProbe?: (probe: DecorationProbe) => void;
}) => {
  const [active, setActive] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const decorationProbe = useMemo(
    () => createDecorationProbe(editor, activeRef),
    [editor],
  );

  useEffect(() => {
    onDecorationProbe?.(decorationProbe);
  }, [decorationProbe, onDecorationProbe]);

  return (
    <Plite decorations={[decorationProbe.source]} editor={editor}>
      <button
        id="overlay-toggle"
        onClick={() => {
          const next = !activeRef.current;

          activeRef.current = next;
          setActive(next);
          decorationProbe.refresh();
        }}
        type="button"
      >
        {active ? 'on' : 'off'}
      </button>
      <DecorationSourceToggleSlices counts={counts} />
    </Plite>
  );
};

const DecorationSourceToggleSlices = ({
  counts,
}: {
  counts: Record<string, number>;
}) => {
  const leftLeafId = useEditorSelector(
    (editor) => editorGetSnapshot(editor).index.keyAt([0, 0]) ?? null,
  );
  const rightLeafId = useEditorSelector(
    (editor) => editorGetSnapshot(editor).index.keyAt([1, 0]) ?? null,
  );

  return (
    <>
      <TopLevelBlockSlice counts={counts} index={0} slot="leftText" />
      <TopLevelBlockSlice counts={counts} index={1} slot="rightText" />
      <DecorationSlice
        counts={counts}
        runtimeId={leftLeafId}
        slot="leftOverlay"
      />
      <DecorationSlice
        counts={counts}
        runtimeId={rightLeafId}
        slot="rightOverlay"
      />
    </>
  );
};

type HiddenPanelAnnotation = PliteAnnotation<{
  label: string;
}>;

type AnnotationBreadthAnnotation = PliteAnnotation<{
  kind: string;
  label: string;
  tone: string;
}>;

type AnnotationBreadthWidget = PliteWidget<
  {
    label: string;
  },
  {
    kind: string;
    label: string;
    tone: string;
  }
>;

const arePathsEqual = (left: readonly number[], right: readonly number[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const createAnnotationDecorationSource = (
  store: PliteAnnotationStore<{
    kind: string;
    label: string;
    tone: string;
  }>,
): PliteDecorationSource<ReturnType<typeof createEditor>> => ({
  id: 'annotation-breadth',
  observe: ({ editor, refresh }) => {
    let previous = store.getSnapshot();

    return store.subscribeChanges(({ ids }) => {
      const next = store.getSnapshot();
      const snapshot = editorGetSnapshot(editor);
      const nodeKeys = new Set<NodeKey>();

      for (const id of ids) {
        const ranges = [previous.byId.get(id)?.range, next.byId.get(id)?.range];

        for (const range of ranges) {
          if (!range) continue;
          const nodeKey = snapshot.index.keyAt(range.anchor.path);

          if (nodeKey) nodeKeys.add(nodeKey);
        }
      }
      previous = next;
      if (nodeKeys.size > 0) refresh({ nodeKeys: [...nodeKeys] });
    });
  },
  read: ({ entry: [node, path] }) => {
    if (!NodeApi.isText(node)) return [];

    return store.getSnapshot().allIds.flatMap((id) => {
      const annotation = store.getSnapshot().byId.get(id);

      if (
        !annotation?.range ||
        !arePathsEqual(annotation.range.anchor.path, path)
      ) {
        return [];
      }

      return [
        {
          attributes: { 'data-annotation-id': id },
          key: `annotation:${id}`,
          range: annotation.range,
        },
      ];
    });
  },
});

const HiddenPanelSidebar = ({
  annotations,
  counts,
  editor,
}: {
  annotations: readonly HiddenPanelAnnotation[];
  counts: Record<string, number>;
  editor: ReturnType<typeof createEditor>;
}) => {
  const store = usePliteAnnotationStore(editor, annotations);
  const snapshot = usePliteAnnotations(store);
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
    <Plite editor={editor}>
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
    </Plite>
  );
};

const AnnotationDecorationSlice = memo(
  ({
    counts,
    runtimeId,
  }: {
    counts: Record<string, number>;
    runtimeId: NodeKey | null;
  }) => {
    usePliteDecorationEntries(runtimeId);
    increment(counts, 'annotationDecoration');
    return <span id="annotation-decoration">decoration</span>;
  },
);

const AnnotationSidebarSlice = memo(
  ({
    annotationStore,
    counts,
  }: {
    annotationStore: PliteAnnotationStore<{
      kind: string;
      label: string;
      tone: string;
    }>;
    counts: Record<string, number>;
  }) => {
    usePliteAnnotations(annotationStore);
    increment(counts, 'annotationSidebar');
    return <span id="annotation-sidebar">sidebar</span>;
  },
);

const AnnotationWidgetSlice = memo(
  ({
    counts,
    widgetStore,
  }: {
    counts: Record<string, number>;
    widgetStore: ReturnType<
      typeof usePliteWidgetStore<
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
    usePliteWidgets(widgetStore);
    increment(counts, 'annotationWidget');
    return <span id="annotation-widget">widget</span>;
  },
);

const AnnotationWidgetBreadthSlices = ({
  annotationStore,
  counts,
  widgetStore,
}: {
  annotationStore: PliteAnnotationStore<{
    kind: string;
    label: string;
    tone: string;
  }>;
  counts: Record<string, number>;
  widgetStore: ReturnType<
    typeof usePliteWidgetStore<
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
  const leftLeafId = useEditorSelector(
    (editor) => editorGetSnapshot(editor).index.keyAt([0, 0]) ?? null,
  );

  return (
    <>
      <TopLevelBlockSlice counts={counts} index={0} slot="annotationLeftText" />
      <TopLevelBlockSlice
        counts={counts}
        index={1}
        slot="annotationRightText"
      />
      <AnnotationDecorationSlice counts={counts} runtimeId={leftLeafId} />
      <AnnotationSidebarSlice
        annotationStore={annotationStore}
        counts={counts}
      />
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
    annotationStore: PliteAnnotationStore<{
      kind: string;
      label: string;
      tone: string;
    }>;
    widgetStore: PliteWidgetStore<
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
  const annotationStore = usePliteAnnotationStore(editor, annotations);
  const widgetStore = usePliteWidgetStore(editor, widgets, annotationStore);
  const decorationSource = useMemo(
    () => createAnnotationDecorationSource(annotationStore),
    [annotationStore],
  );

  useEffect(() => {
    onStores?.({
      annotationStore,
      widgetStore,
    });
  }, [annotationStore, onStores, widgetStore]);

  return (
    <Plite decorations={[decorationSource]} editor={editor}>
      <AnnotationWidgetBreadthSlices
        annotationStore={annotationStore}
        counts={counts}
        widgetStore={widgetStore}
      />
    </Plite>
  );
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

const measureSelectionBreadth = async () =>
  measureLane(async () => {
    const editor = createEditor();
    const counts: Record<string, number> = {};

    editorReplace(editor, {
      children: createSelectionChildren(),
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
        kind: 'text',
      },
    });

    const mounted = await mountApp(
      <SelectionBreadthApp counts={counts} editor={editor} />,
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
    const editor = createEditor();
    const blockCounts: Record<string, number> = {};
    const leafCounts: Record<string, number> = {};
    const targetLeafKey = `leaf-${targetLeafIndex}`;

    editorReplace(editor, {
      children: createManyLeafChildren(leafCount),
      selection: {
        anchor: { path: [0, targetLeafIndex], offset: 0 },
        focus: { path: [0, targetLeafIndex], offset: 0 },
        kind: 'text',
      },
    });

    const mounted = await mountApp(
      <ManyLeafApp
        blockCounts={blockCounts}
        editor={editor}
        leafCounts={leafCounts}
      />,
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
      ([key]) => key !== targetLeafKey,
    );

    assert.equal(
      typeof editorGetSnapshot(editor).children[0],
      'object',
      'many-leaf lane lost the paragraph root',
    );

    await mounted.dispose();

    return {
      blockRenders: blockDelta.block ?? 0,
      editMs,
      editedLeafRenders: leafDelta[targetLeafKey] ?? 0,
      rerenderedSiblingLeafCount: siblingLeafEntries.filter(
        ([, count]) => count > 0,
      ).length,
      siblingLeafRenders: siblingLeafEntries.reduce(
        (total, [, count]) => total + count,
        0,
      ),
    };
  });

const measureDeepAncestorBreadth = async () =>
  measureLane(async () => {
    const editor = createEditor();
    const elementCounts: Record<string, number> = {};
    const leafCounts: Record<string, number> = {};
    const { ancestorKeys, children, deepTextPath } =
      createNestedDepthChildren(nestedDepth);

    editorReplace(editor, {
      children,
      selection: {
        anchor: { path: deepTextPath, offset: 0 },
        focus: { path: deepTextPath, offset: 0 },
        kind: 'text',
      },
    });

    const mounted = await mountApp(
      <DeepAncestorApp
        editor={editor}
        elementCounts={elementCounts}
        leafCounts={leafCounts}
      />,
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
      (key) => (elementDelta[key] ?? 0) > 0,
    ).length;
    const ancestorRenderEvents = ancestorKeys.reduce(
      (total, key) => total + (elementDelta[key] ?? 0),
      0,
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
    const editor = createEditor();
    const counts: Record<string, number> = {};
    let decorationProbe: DecorationProbe | null = null;

    editorReplace(editor, {
      children: createDecorationToggleChildren(),
      selection: null,
    });

    const mounted = await mountApp(
      <DecorationSourceToggleApp
        counts={counts}
        editor={editor}
        onDecorationProbe={(probe) => {
          decorationProbe = probe;
        }}
      />,
    );
    const baseline = cloneCounts(counts);
    const view = mounted.container.ownerDocument.defaultView;
    const toggle =
      mounted.container.querySelector<HTMLButtonElement>('#overlay-toggle');

    if (!view || !toggle || !decorationProbe) {
      throw new Error('Missing overlay toggle controls');
    }

    const readBaseline = decorationProbe.getReadCount();
    const start = now();

    await act(async () => {
      toggle.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        }),
      );
    });

    const toggleMs = now() - start;
    const delta = deltaCounts(counts, baseline);
    const decorationReadCount = decorationProbe.getReadCount() - readBaseline;

    await mounted.dispose();

    return {
      decorationReadCount,
      leftOverlayRenders: delta.leftOverlay ?? 0,
      leftTextRenders: delta.leftText ?? 0,
      rightOverlayRenders: delta.rightOverlay ?? 0,
      rightTextRenders: delta.rightText ?? 0,
      toggleMs,
    };
  });

const measureHiddenPanelActivity = async () =>
  measureLane(async () => {
    const editor = createEditor();
    const counts: Record<string, number> = {};

    editorReplace(editor, {
      children: createSelectionChildren(),
      selection: null,
    });

    const bookmark: Anchor<Range> = editor.anchor(
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      },
      { deletion: 'drop' },
    );
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
      />,
    );
    const view = mounted.container.ownerDocument.defaultView;
    const counterButton = mounted.container.querySelector<HTMLButtonElement>(
      '#activity-panel-count',
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
        }),
      );
    });

    await act(async () => {
      toggleButton.dispatchEvent(
        new view.MouseEvent('click', {
          bubbles: true,
        }),
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
        }),
      );
    });

    const afterShow = cloneCounts(counts);
    const hiddenDelta = deltaCounts(afterHiddenEdit, afterHide);
    const showDelta = deltaCounts(afterShow, afterHiddenEdit);
    const localCount = Number(
      mounted.container.querySelector('#activity-panel-count')?.textContent ??
        0,
    );
    const panelState =
      mounted.container.querySelector('#activity-panel-state')?.textContent ??
      'none';

    await mounted.dispose();
    bookmark.release();

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
    const editor = createEditor();
    const counts: Record<string, number> = {};
    let annotationStore: PliteAnnotationStore<{
      kind: string;
      label: string;
      tone: string;
    }> | null = null;
    let widgetStore: PliteWidgetStore<
      {
        label: string;
      },
      {
        kind: string;
        label: string;
        tone: string;
      }
    > | null = null;

    editorReplace(editor, {
      children: createSelectionChildren(),
      selection: null,
    });

    const bookmark = editor.anchor(
      {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      },
      { deletion: 'drop' },
    );
    const annotations = [
      {
        anchor: bookmark,
        data: {
          kind: 'annotation',
          label: 'Comment 1',
          tone: 'persistent',
        },
        id: 'comment-1',
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
      />,
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
    bookmark.release();

    return {
      annotationChangedCount: annotationMetrics?.changedAnnotationCount ?? 0,
      annotationDecorationRenders: delta.annotationDecoration ?? 0,
      annotationRecomputeCount: annotationMetrics?.recomputeCount ?? 0,
      annotationResolveCount: annotationMetrics?.annotationResolveCount ?? 0,
      annotationSidebarRenders: delta.annotationSidebar ?? 0,
      annotationSubscriberWakeCount:
        annotationMetrics?.annotationSubscriberWakeCount ?? 0,
      annotationWidgetRenders: delta.annotationWidget ?? 0,
      editMs,
      leftTextRenders: delta.annotationLeftText ?? 0,
      rightTextRenders: delta.annotationRightText ?? 0,
      widgetRecomputeCount: widgetStore?.getMetrics().recomputeCount ?? 0,
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
    lane: 'plite-react-rerender-breadth',
    selectionBreadth: await measureSelectionBreadth(),
    manyLeafBreadth: await measureManyLeafBreadth(),
    deepAncestorBreadth: await measureDeepAncestorBreadth(),
    decorationSourceToggleBreadth: await measureDecorationSourceToggleBreadth(),
    hiddenPanelActivity: await measureHiddenPanelActivity(),
    annotationWidgetBreadth: await measureAnnotationWidgetBreadth(),
  };

  await mkdir('tmp', { recursive: true });
  await writeFile(
    'tmp/slate-react-rerender-breadth-benchmark.json',
    JSON.stringify(summary, null, 2),
  );

  console.log(JSON.stringify(summary, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
