import { type ReactNode, useCallback, useMemo, useRef } from 'react';
import type { EditorCommit, Operation, Path, RuntimeId } from '@platejs/plite';
import { NodeApi } from '@platejs/plite';
import { getSelectionRoot } from '../hooks/root-selection-cache';
import { useEditor } from '../hooks/use-editor';
import { useEditorSelector } from '../hooks/use-editor-selector';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import { getCachedFullRootReplaceTopLevelRuntimeIds } from './runtime-editor-api';

export type DOMStrategyRootConfig = {
  overscan: number;
  segmentSize: number;
  previewChars: number;
  promotionWindowSize: number;
  threshold: number;
};

const EMPTY_RUNTIME_IDS: readonly RuntimeId[] = [];

type SegmentRuntimeIdGroup = {
  endIndex: number;
  runtimeIds: readonly RuntimeId[];
  segmentIndex: number;
  startIndex: number;
};

const createSegmentRuntimeIdGroups = ({
  segmentSize,
  topLevelRuntimeIds,
}: {
  segmentSize: number;
  topLevelRuntimeIds: readonly RuntimeId[];
}) => {
  const groups: SegmentRuntimeIdGroup[] = [];

  for (
    let startIndex = 0, segmentIndex = 0;
    startIndex < topLevelRuntimeIds.length;
    startIndex += segmentSize, segmentIndex += 1
  ) {
    const endIndex = Math.min(
      topLevelRuntimeIds.length - 1,
      startIndex + segmentSize - 1
    );

    groups.push({
      endIndex,
      runtimeIds: topLevelRuntimeIds.slice(startIndex, endIndex + 1),
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
  groups: readonly SegmentRuntimeIdGroup[];
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
        promotionWindowSize < group.runtimeIds.length;
      const windowOffset = shouldWindowPromotedSegment
        ? Math.min(
            Math.max(0, promotedWindowStartIndex - group.startIndex),
            Math.max(0, group.runtimeIds.length - promotionWindowSize)
          )
        : 0;
      const mountedRuntimeIds =
        isActive && shouldWindowPromotedSegment
          ? group.runtimeIds.slice(
              windowOffset,
              windowOffset + promotionWindowSize
            )
          : isActive
            ? group.runtimeIds
            : EMPTY_RUNTIME_IDS;
      const mountedStartIndex =
        isActive && mountedRuntimeIds.length > 0
          ? group.startIndex + windowOffset
          : null;
      const mountedEndIndex =
        mountedStartIndex == null
          ? null
          : mountedStartIndex + mountedRuntimeIds.length - 1;

      return {
        ...group,
        isActive,
        mountedEndIndex,
        mountedRuntimeIds,
        mountedStartIndex,
      };
    }),
  };
};

const isTextOperation = (operation: Operation | undefined) =>
  operation?.type === 'insert_text' || operation?.type === 'remove_text';

const isSelectionOperation = (operation: Operation | undefined) =>
  operation?.type === 'set_selection';

const hasNoOperations = (operations: readonly Operation[] | undefined) =>
  !operations || operations.length === 0;

const getOperationRoot = (operation: Operation) =>
  ((operation as { root?: string }).root ?? 'main') as string;

const getSingleFullRootReplaceOperation = (
  operations: readonly Operation[] | undefined,
  root: string
) => {
  if (!operations || operations.length === 0) {
    return null;
  }

  const contentOperations = operations.filter(
    (operation) => operation.type !== 'set_selection'
  );

  if (contentOperations.length !== 1) {
    return null;
  }

  const operation = contentOperations[0];

  return operation?.type === 'replace_children' &&
    operation.path.length === 0 &&
    operation.index === 0 &&
    getOperationRoot(operation) === root
    ? operation
    : null;
};

const getChangedOperations = (
  operations?: readonly Operation[],
  change?: EditorCommit
) => operations ?? change?.operations;

const hasOperationForRoot = (root: string, operations?: readonly Operation[]) =>
  operations?.some((operation) => getOperationRoot(operation) === root);

const isRuntimeIdOperationForRoot = (operation: Operation, root: string) =>
  !isTextOperation(operation) &&
  !isSelectionOperation(operation) &&
  getOperationRoot(operation) === root;

const isStructureOperationForRoot = (operation: Operation, root: string) =>
  !isTextOperation(operation) &&
  !isSelectionOperation(operation) &&
  getOperationRoot(operation) === root;

const isSelectionChangeForRoot = (root: string, change: EditorCommit) =>
  change.selectionChanged &&
  (getSelectionRoot(change.selectionBefore) === root ||
    getSelectionRoot(change.selectionAfter) === root);

const getSelectionPathKey = (selection: EditorCommit['selectionAfter']) =>
  selection
    ? `${getSelectionRoot(selection)}:${selection.anchor.path.join('.')}:${selection.focus.path.join('.')}`
    : 'null';

const isSelectionPathChangeForRoot = (root: string, change: EditorCommit) =>
  isSelectionChangeForRoot(root, change) &&
  getSelectionPathKey(change.selectionBefore) !==
    getSelectionPathKey(change.selectionAfter);

const topLevelRangesIncludeIndex = (
  ranges: readonly (readonly [number, number])[] | null | undefined,
  index: number
) =>
  ranges == null ||
  ranges.some(([start, end]) => start <= index && end >= index);

const shouldUpdateRootRuntimeIds = (
  root: string,
  operations?: readonly Operation[],
  change?: EditorCommit
) => {
  const changedOperations = getChangedOperations(operations, change);

  return change
    ? change.fullDocumentChanged ||
        ((change.rootRuntimeIdsChanged || change.topLevelOrderChanged) &&
          (changedOperations?.some((operation) =>
            isRuntimeIdOperationForRoot(operation, root)
          ) ??
            true))
    : hasNoOperations(changedOperations) ||
        (changedOperations ?? []).some((operation) =>
          isRuntimeIdOperationForRoot(operation, root)
        );
};

const shouldUpdateSelectedTopLevelIndex = (
  root: string,
  operations?: readonly Operation[],
  change?: EditorCommit
) => {
  const changedOperations = getChangedOperations(operations, change);

  return change
    ? change.fullDocumentChanged ||
        isSelectionPathChangeForRoot(root, change) ||
        ((change.rootRuntimeIdsChanged || change.topLevelOrderChanged) &&
          (hasOperationForRoot(root, changedOperations) ?? true))
    : hasNoOperations(changedOperations) ||
        (changedOperations ?? []).some(
          (operation) =>
            isSelectionOperation(operation) || !isTextOperation(operation)
        );
};

const shouldUpdatePlaceholderValue = (
  root: string,
  operations?: readonly Operation[],
  change?: EditorCommit
) => {
  const changedOperations = getChangedOperations(operations, change);
  const firstTopLevelChanged = topLevelRangesIncludeIndex(
    change?.dirtyTopLevelRanges,
    0
  );

  return change
    ? change.fullDocumentChanged ||
        ((change.topLevelOrderChanged ||
          ((change.textChanged || change.structureChanged) &&
            firstTopLevelChanged)) &&
          (hasOperationForRoot(root, changedOperations) ?? true))
    : hasNoOperations(changedOperations) ||
        (changedOperations ?? []).some(
          (operation) => !isSelectionOperation(operation)
        );
};

const shouldUpdateEditableRootCommit = (
  root: string,
  operations?: readonly Operation[],
  change?: EditorCommit
) => {
  const changedOperations = getChangedOperations(operations, change);

  return change
    ? change.fullDocumentChanged ||
        ((change.rootRuntimeIdsChanged ||
          change.structureChanged ||
          change.topLevelOrderChanged) &&
          (changedOperations?.some((operation) =>
            isStructureOperationForRoot(operation, root)
          ) ??
            true)) ||
        change.dirtyStateKeys.length > 0
    : hasNoOperations(changedOperations) ||
        (changedOperations ?? []).some((operation) =>
          isStructureOperationForRoot(operation, root)
        );
};

const shouldUpdateRootDocumentEpoch = (
  operations?: readonly Operation[],
  change?: EditorCommit
) => (change ? change.fullDocumentChanged : hasNoOperations(operations));

const sameRuntimeIds = (
  left: readonly RuntimeId[],
  right: readonly RuntimeId[]
) =>
  left.length === right.length &&
  left.every((runtimeId, index) => runtimeId === right[index]);

const selectRootRuntimeIds = (
  editor: ReactRuntimeEditor,
  root: string,
  operations?: readonly Operation[]
) => {
  const fullRootReplace = getSingleFullRootReplaceOperation(operations, root);
  const cachedRuntimeIds = fullRootReplace
    ? getCachedFullRootReplaceTopLevelRuntimeIds(fullRootReplace)
    : null;

  if (cachedRuntimeIds) {
    return cachedRuntimeIds;
  }

  return editor.read(
    (state) =>
      state.nodes
        .children()
        .map((_node: unknown, index: number) => {
          const path = [index] as Path;

          return state.runtime.idAt(path);
        })
        .filter(Boolean) as RuntimeId[]
  );
};

export const useRootRuntimeIds = () => {
  const editor = useEditor<ReactRuntimeEditor>();
  const root = editor.read((state) => state.view.root());
  const selector = useCallback(
    (editor: ReactRuntimeEditor, operations?: readonly Operation[]) =>
      selectRootRuntimeIds(editor, root, operations),
    [root]
  );
  const shouldUpdate = useCallback(
    (operations?: readonly Operation[], change?: EditorCommit) =>
      shouldUpdateRootRuntimeIds(root, operations, change),
    [root]
  );

  return useEditorSelector(
    selector,
    (left, right) => left != null && sameRuntimeIds(left as RuntimeId[], right),
    {
      profileId: 'root-runtime-ids',
      shouldUpdate,
    }
  );
};

export const useRootDocumentEpoch = () => {
  const lastEpochRef = useRef(0);
  const selector = useCallback(
    (editor: ReactRuntimeEditor) =>
      editor.read((state) => {
        const commit = state.value.lastCommit();

        if (commit?.fullDocumentChanged) {
          lastEpochRef.current = commit.version;
        }

        return lastEpochRef.current;
      }),
    []
  );

  return useEditorSelector(selector, Object.is, {
    profileId: 'root-document-epoch',
    shouldUpdate: shouldUpdateRootDocumentEpoch,
  });
};

export const useTopLevelSelectionIndex = (enabled: boolean) => {
  const editor = useEditor<ReactRuntimeEditor>();
  const root = editor.read((state) => state.view.root());
  const selector = useCallback(
    (editor: ReactRuntimeEditor) => {
      if (!enabled) {
        return null;
      }

      const selection = editor.read((state) => state.selection.get());
      const anchorIndex = selection?.anchor.path[0];
      const focusIndex = selection?.focus.path[0];

      if (typeof anchorIndex !== 'number' || typeof focusIndex !== 'number') {
        return null;
      }

      return Math.min(anchorIndex, focusIndex);
    },
    [enabled]
  );
  const shouldUpdate = useCallback(
    (operations?: readonly Operation[], change?: EditorCommit) =>
      enabled && shouldUpdateSelectedTopLevelIndex(root, operations, change),
    [enabled, root]
  );

  return useEditorSelector(selector, Object.is, {
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
        leftPath.length === right[pathIndex]!.length &&
        leftPath.every(
          (segment, segmentIndex) => segment === right[pathIndex]![segmentIndex]
        )
    ));

export const useSelectionPaths = (enabled: boolean) => {
  const editor = useEditor<ReactRuntimeEditor>();
  const root = editor.read((state) => state.view.root());
  const selector = useCallback(
    (editor: ReactRuntimeEditor) => {
      if (!enabled) {
        return null;
      }

      const selection = editor.read((state) => state.selection.get());

      if (!selection) {
        return null;
      }

      return [selection.anchor.path, selection.focus.path] as const;
    },
    [enabled]
  );
  const shouldUpdate = useCallback(
    (operations?: readonly Operation[], change?: EditorCommit) =>
      enabled && shouldUpdateSelectedTopLevelIndex(root, operations, change),
    [enabled, root]
  );

  return useEditorSelector(selector, sameSelectionPaths, {
    profileId: 'selection-paths',
    shouldUpdate,
  });
};

export const usePlaceholderValue = (placeholder?: ReactNode) => {
  const editor = useEditor<ReactRuntimeEditor>();
  const root = editor.read((state) => state.view.root());
  const selector = useCallback(
    (editor: ReactRuntimeEditor) =>
      editor.read(
        (state) =>
          placeholder &&
          state.nodes.children().length === 1 &&
          Array.from(NodeApi.texts(editor)).length === 1 &&
          NodeApi.string(editor) === ''
      )
        ? placeholder
        : undefined,
    [placeholder]
  );

  const shouldUpdate = useCallback(
    (operations?: readonly Operation[], change?: EditorCommit) =>
      shouldUpdatePlaceholderValue(root, operations, change),
    [root]
  );

  return useEditorSelector(selector, Object.is, {
    profileId: 'placeholder',
    shouldUpdate,
  });
};

export const useEditableRootCommitWakeup = () => {
  const editor = useEditor<ReactRuntimeEditor>();
  const root = editor.read((state) => state.view.root());
  const shouldUpdate = useCallback(
    (operations?: readonly Operation[], change?: EditorCommit) =>
      shouldUpdateEditableRootCommit(root, operations, change),
    [root]
  );

  useEditorSelector(
    (editor: ReactRuntimeEditor) =>
      editor.read((state) => state.value.lastCommit()?.version ?? 0),
    Object.is,
    {
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
  const topLevelRuntimeIds = useRootRuntimeIds();
  const segmentRuntimeIdGroups = useMemo(
    () =>
      internalSegmentDOMStrategyConfig &&
      topLevelRuntimeIds.length >= internalSegmentDOMStrategyConfig.threshold
        ? createSegmentRuntimeIdGroups({
            segmentSize: internalSegmentDOMStrategyConfig.segmentSize,
            topLevelRuntimeIds,
          })
        : null,
    [internalSegmentDOMStrategyConfig, topLevelRuntimeIds]
  );
  const selectedTopLevelIndex = useTopLevelSelectionIndex(
    segmentRuntimeIdGroups != null
  );
  const selectedSegmentIndex =
    internalSegmentDOMStrategyConfig &&
    segmentRuntimeIdGroups &&
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
      internalSegmentDOMStrategyConfig && segmentRuntimeIdGroups
        ? createSegmentPlanFromGroups({
            overscan:
              promotedSegmentOverscan ??
              internalSegmentDOMStrategyConfig.overscan,
            defaultActiveSegmentIndex: selectedSegmentIndex,
            groups: segmentRuntimeIdGroups,
            promotedSegmentIndex,
            promotedWindowStartIndex,
            promotionWindowSize:
              internalSegmentDOMStrategyConfig.promotionWindowSize,
          })
        : null;
    const mountedTopLevelRuntimeIds = segmentPlan
      ? new Set(
          segmentPlan.segments.flatMap((segment) =>
            segment.isActive ? segment.mountedRuntimeIds : []
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
      mountedTopLevelRuntimeIds,
      topLevelRuntimeIds,
    };
  }, [
    internalSegmentDOMStrategyConfig,
    promotedSegmentIndex,
    promotedSegmentOverscan,
    promotedWindowStartIndex,
    segmentRuntimeIdGroups,
    selectedSegmentIndex,
    topLevelRuntimeIds,
  ]);
};
