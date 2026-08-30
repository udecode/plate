import { type ReactNode, useCallback, useMemo } from 'react';

import type { EditorCommit, NodeKey, Path } from '../..';
import { NodeApi, SelectionApi } from '../..';
import { useEditorContext } from '../hooks/use-editor-context';
import { useEditorSelector } from '../hooks/use-editor-selector';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import { toPublicRootOption } from '../root-key';
import { toInternalRoot } from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';

export type DOMStrategyRootConfig = {
  overscan: number;
  segmentSize: number;
  previewChars: number;
  promotionWindowSize: number;
  threshold: number;
};

const EMPTY_RUNTIME_IDS: readonly NodeKey[] = [];

type SegmentNodeKeyGroup = {
  endIndex: number;
  nodeKeys: readonly NodeKey[];
  segmentIndex: number;
  startIndex: number;
};

const createSegmentNodeKeyGroups = ({
  segmentSize,
  topLevelNodeKeys,
}: {
  segmentSize: number;
  topLevelNodeKeys: readonly NodeKey[];
}) => {
  const groups: SegmentNodeKeyGroup[] = [];

  for (
    let startIndex = 0, segmentIndex = 0;
    startIndex < topLevelNodeKeys.length;
    startIndex += segmentSize, segmentIndex += 1
  ) {
    const endIndex = Math.min(
      topLevelNodeKeys.length - 1,
      startIndex + segmentSize - 1
    );

    groups.push({
      endIndex,
      nodeKeys: topLevelNodeKeys.slice(startIndex, endIndex + 1),
      segmentIndex,
      startIndex,
    });
  }

  return groups;
};

const createSegmentPlanFromGroups = ({
  defaultActiveSegmentIndex,
  groups,
  overscan,
  promotedSegmentIndex,
  promotedWindowStartIndex,
  promotionWindowSize,
}: {
  defaultActiveSegmentIndex: number;
  groups: readonly SegmentNodeKeyGroup[];
  overscan: number;
  promotedSegmentIndex: number | null;
  promotedWindowStartIndex: number | null;
  promotionWindowSize: number;
}) => {
  const activeSegmentIndex = promotedSegmentIndex ?? defaultActiveSegmentIndex;
  const activeStart = Math.max(0, activeSegmentIndex - overscan);
  const activeEnd = activeSegmentIndex + overscan;

  return {
    activeSegmentIndex,
    segments: groups.map((group) => {
      const isActive =
        group.segmentIndex >= activeStart && group.segmentIndex <= activeEnd;
      const shouldWindowPromotedSegment =
        promotedSegmentIndex === group.segmentIndex &&
        promotedWindowStartIndex != null &&
        promotionWindowSize > 0 &&
        promotionWindowSize < group.nodeKeys.length;
      const windowOffset = shouldWindowPromotedSegment
        ? Math.min(
            Math.max(0, promotedWindowStartIndex - group.startIndex),
            Math.max(0, group.nodeKeys.length - promotionWindowSize)
          )
        : 0;
      const mountedNodeKeys =
        isActive && shouldWindowPromotedSegment
          ? group.nodeKeys.slice(
              windowOffset,
              windowOffset + promotionWindowSize
            )
          : isActive
            ? group.nodeKeys
            : EMPTY_RUNTIME_IDS;
      const mountedStartIndex =
        isActive && mountedNodeKeys.length > 0
          ? group.startIndex + windowOffset
          : null;
      const mountedEndIndex =
        mountedStartIndex == null
          ? null
          : mountedStartIndex + mountedNodeKeys.length - 1;

      return {
        ...group,
        isActive,
        mountedEndIndex,
        mountedNodeKeys,
        mountedStartIndex,
      };
    }),
  };
};

const isSelectionChangeForRoot = (root: string, change: EditorCommit) =>
  change.selectionChanged &&
  ((change.selectionBefore !== null &&
    toInternalRoot(change.selectionBeforeRoot) === root) ||
    (change.selectionAfter !== null &&
      toInternalRoot(change.selectionAfterRoot) === root));

const getSelectionPathKey = (
  selection: EditorCommit['selectionAfter'],
  root: string | undefined
) =>
  selection
    ? `${toInternalRoot(root)}:${
        SelectionApi.isNode(selection)
          ? selection.paths.map((path) => path.join('.')).join(';')
          : `${selection.anchor.path.join('.')}:${selection.focus.path.join('.')}`
      }`
    : 'null';

const isSelectionPathChangeForRoot = (root: string, change: EditorCommit) =>
  isSelectionChangeForRoot(root, change) &&
  getSelectionPathKey(change.selectionBefore, change.selectionBeforeRoot) !==
    getSelectionPathKey(change.selectionAfter, change.selectionAfterRoot);

const topLevelRangesIncludeIndex = (
  ranges: ReadonlyArray<readonly [number, number]>,
  index: number
) => ranges.some(([start, end]) => start <= index && end >= index);

const shouldUpdateRootNodeKeys = (root: string, change?: EditorCommit) =>
  !change || change.changed.has('root-order', toPublicRootOption(root));

const shouldUpdateSelectedTopLevelIndex = (
  root: string,
  change?: EditorCommit
) =>
  !change ||
  isSelectionPathChangeForRoot(root, change) ||
  change.changed.has('root-order', toPublicRootOption(root));

const shouldUpdatePlaceholderValue = (root: string, change?: EditorCommit) => {
  const publicRoot = toPublicRootOption(root);
  const firstTopLevelChanged = change
    ? topLevelRangesIncludeIndex(change.changed.topLevelRanges(publicRoot), 0)
    : false;

  return (
    !change ||
    change.changed.has('root-order', publicRoot) ||
    (change.changed.has('document', publicRoot) && firstTopLevelChanged)
  );
};

const shouldUpdateEditableRootCommit = (root: string, change?: EditorCommit) =>
  !change ||
  change.changed.has('structure', toPublicRootOption(root)) ||
  change.changed.hasAny('state');

const shouldUpdateRootDocumentEpoch = (root: string, change?: EditorCommit) =>
  !change || change.changed.has('replace', toPublicRootOption(root));

const sameNodeKeys = (left: readonly NodeKey[], right: readonly NodeKey[]) =>
  left.length === right.length &&
  left.every((nodeKey, index) => nodeKey === right[index]);

const selectRootNodeKeys = (editor: ReactRuntimeEditor) =>
  editor.read(
    (state) =>
      state.nodes
        .children()
        .map((_node: unknown, index: number) => {
          const path = [index] as Path;

          return state.key(path);
        })
        .filter(Boolean) as NodeKey[]
  );

export const useRootNodeKeys = () => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (innerEditor: ReactRuntimeEditor) => selectRootNodeKeys(innerEditor),
    []
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdateRootNodeKeys(root, change),
    [root]
  );

  return useEditorSelector(selector, {
    equalityFn: (left, right) => left != null && sameNodeKeys(left, right),
    profileId: 'root-node-keys',
    shouldUpdate,
  });
};

export const useRootDocumentEpoch = () => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (innerEditor2: ReactRuntimeEditor) =>
      innerEditor2.read((state) => {
        const commit = state.lastCommit();

        return commit?.changed.has('replace', toPublicRootOption(root))
          ? commit.version
          : 0;
      }),
    [root]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdateRootDocumentEpoch(root, change),
    [root]
  );

  return useEditorSelector(selector, {
    equalityFn: Object.is,
    profileId: 'root-document-epoch',
    shouldUpdate,
  });
};

export const useTopLevelSelectionIndex = (enabled: boolean) => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (innerEditor3: ReactRuntimeEditor) => {
      if (!enabled) {
        return null;
      }

      const selection = readRuntimeSelection(innerEditor3);
      const indices = selection
        ? SelectionApi.isNode(selection)
          ? selection.paths.map((path) => path[0])
          : [selection.anchor.path[0], selection.focus.path[0]]
        : [];

      if (
        !indices.every((index): index is number => typeof index === 'number')
      ) {
        return null;
      }

      return indices.length > 0 ? Math.min(...indices) : null;
    },
    [enabled]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) =>
      enabled && shouldUpdateSelectedTopLevelIndex(root, change),
    [enabled, root]
  );

  return useEditorSelector(selector, {
    equalityFn: Object.is,
    profileId: 'top-level-selection-index',
    shouldUpdate,
  });
};

const sameSelectionPaths = (
  left: readonly Path[] | null,
  right: readonly Path[] | null
) =>
  left === right ||
  (left != null &&
    right != null &&
    left.length === right.length &&
    left.every(
      (leftPath, pathIndex) =>
        leftPath.length === right[pathIndex].length &&
        leftPath.every(
          (segment, segmentIndex) => segment === right[pathIndex][segmentIndex]
        )
    ));

export const useSelectionPaths = (enabled: boolean) => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (innerEditor4: ReactRuntimeEditor) => {
      if (!enabled) {
        return null;
      }

      const selection = readRuntimeSelection(innerEditor4);

      if (!selection) {
        return null;
      }

      return SelectionApi.isNode(selection)
        ? selection.paths
        : ([selection.anchor.path, selection.focus.path] as const);
    },
    [enabled]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) =>
      enabled && shouldUpdateSelectedTopLevelIndex(root, change),
    [enabled, root]
  );

  return useEditorSelector(selector, {
    equalityFn: sameSelectionPaths,
    profileId: 'selection-paths',
    shouldUpdate,
  });
};

export const usePlaceholderValue = (placeholder?: ReactNode) => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (innerEditor5: ReactRuntimeEditor) =>
      innerEditor5.read(
        (state) =>
          placeholder &&
          state.nodes.children().length === 1 &&
          Array.from(NodeApi.texts(innerEditor5)).length === 1 &&
          NodeApi.string(innerEditor5) === ''
      )
        ? placeholder
        : undefined,
    [placeholder]
  );

  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdatePlaceholderValue(root, change),
    [root]
  );

  return useEditorSelector(selector, {
    equalityFn: Object.is,
    profileId: 'placeholder',
    shouldUpdate,
  });
};

export const useEditableRootCommitWakeup = () => {
  const editor = useEditorContext();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdateEditableRootCommit(root, change),
    [root]
  );

  useEditorSelector(
    (innerEditor6) =>
      innerEditor6.read((state) => state.lastCommit()?.version ?? 0),
    {
      equalityFn: Object.is,
      profileId: 'editable-root-commit',
      shouldUpdate,
    }
  );
};

export const useInternalSegmentDOMStrategyRootSources = ({
  internalSegmentDOMStrategyConfig,
  promotedSegmentIndex,
  promotedSegmentOverscan,
  promotedWindowStartIndex,
}: {
  internalSegmentDOMStrategyConfig: DOMStrategyRootConfig | null;
  promotedSegmentIndex: number | null;
  promotedSegmentOverscan?: number | null;
  promotedWindowStartIndex: number | null;
}) => {
  const topLevelNodeKeys = useRootNodeKeys();
  const segmentNodeKeyGroups = useMemo(
    () =>
      internalSegmentDOMStrategyConfig &&
      topLevelNodeKeys.length >= internalSegmentDOMStrategyConfig.threshold
        ? createSegmentNodeKeyGroups({
            segmentSize: internalSegmentDOMStrategyConfig.segmentSize,
            topLevelNodeKeys,
          })
        : null,
    [internalSegmentDOMStrategyConfig, topLevelNodeKeys]
  );
  const selectedTopLevelIndex = useTopLevelSelectionIndex(
    segmentNodeKeyGroups != null
  );
  const selectedSegmentIndex =
    internalSegmentDOMStrategyConfig &&
    segmentNodeKeyGroups &&
    selectedTopLevelIndex != null
      ? Math.floor(
          selectedTopLevelIndex / internalSegmentDOMStrategyConfig.segmentSize
        )
      : 0;

  return useMemo(() => {
    recordPliteReactRender({
      id: internalSegmentDOMStrategyConfig
        ? 'dom-strategy-root-sources'
        : 'root-sources',
      kind: 'root-plan',
    });

    const segmentPlan =
      internalSegmentDOMStrategyConfig && segmentNodeKeyGroups
        ? createSegmentPlanFromGroups({
            overscan:
              promotedSegmentOverscan ??
              internalSegmentDOMStrategyConfig.overscan,
            defaultActiveSegmentIndex: selectedSegmentIndex,
            groups: segmentNodeKeyGroups,
            promotedSegmentIndex,
            promotedWindowStartIndex,
            promotionWindowSize:
              internalSegmentDOMStrategyConfig.promotionWindowSize,
          })
        : null;
    const mountedTopLevelNodeKeys = segmentPlan
      ? new Set(
          segmentPlan.segments.flatMap((segment) =>
            segment.isActive ? segment.mountedNodeKeys : []
          )
        )
      : null;
    const mountedTopLevelRanges = segmentPlan
      ? segmentPlan.segments
          .filter((segment) => segment.isActive)
          .map((segment) => ({
            endIndex: segment.mountedEndIndex ?? segment.endIndex,
            startIndex: segment.mountedStartIndex ?? segment.startIndex,
          }))
      : null;

    return {
      segmentPlan,
      mountedTopLevelRanges,
      mountedTopLevelNodeKeys,
      topLevelNodeKeys,
    };
  }, [
    internalSegmentDOMStrategyConfig,
    promotedSegmentIndex,
    promotedSegmentOverscan,
    promotedWindowStartIndex,
    segmentNodeKeyGroups,
    selectedSegmentIndex,
    topLevelNodeKeys,
  ]);
};
