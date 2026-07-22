import { type ReactNode, useCallback, useMemo, useRef } from 'react';
import type { EditorCommit, Path, RuntimeId } from '@platejs/plite';
import { NodeApi } from '@platejs/plite';
import { toInternalRoot } from './runtime-editor-api';
import { toPublicRootOption } from '../root-key';
import { useEditor } from '../hooks/use-editor';
import { useEditorSelector } from '../hooks/use-editor-selector';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';

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
    ? `${toInternalRoot(root)}:${selection.anchor.path.join('.')}:${selection.focus.path.join('.')}`
    : 'null';

const isSelectionPathChangeForRoot = (root: string, change: EditorCommit) =>
  isSelectionChangeForRoot(root, change) &&
  getSelectionPathKey(change.selectionBefore, change.selectionBeforeRoot) !==
    getSelectionPathKey(change.selectionAfter, change.selectionAfterRoot);

const topLevelRangesIncludeIndex = (
  ranges: readonly (readonly [number, number])[],
  index: number
) => ranges.some(([start, end]) => start <= index && end >= index);

const shouldUpdateRootRuntimeIds = (root: string, change?: EditorCommit) =>
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

const sameRuntimeIds = (
  left: readonly RuntimeId[],
  right: readonly RuntimeId[]
) =>
  left.length === right.length &&
  left.every((runtimeId, index) => runtimeId === right[index]);

const selectRootRuntimeIds = (editor: ReactRuntimeEditor) =>
  editor.read(
    (state) =>
      state.nodes
        .children()
        .map((_node: unknown, index: number) => {
          const path = [index] as Path;

          return state.runtime.idAt(path);
        })
        .filter(Boolean) as RuntimeId[]
  );

export const useRootRuntimeIds = () => {
  const editor = useEditor<ReactRuntimeEditor>();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (editor: ReactRuntimeEditor) => selectRootRuntimeIds(editor),
    [root]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdateRootRuntimeIds(root, change),
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
  const editor = useEditor<ReactRuntimeEditor>();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const lastEpochRef = useRef({ root, value: 0 });

  if (lastEpochRef.current.root !== root) {
    lastEpochRef.current = { root, value: 0 };
  }
  const selector = useCallback(
    (editor: ReactRuntimeEditor) =>
      editor.read((state) => {
        const commit = state.lastCommit();

        if (commit?.changed.has('replace', toPublicRootOption(root))) {
          lastEpochRef.current.value = commit.version;
        }

        return lastEpochRef.current.value;
      }),
    [root]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdateRootDocumentEpoch(root, change),
    [root]
  );

  return useEditorSelector(selector, Object.is, {
    profileId: 'root-document-epoch',
    shouldUpdate,
  });
};

export const useTopLevelSelectionIndex = (enabled: boolean) => {
  const editor = useEditor<ReactRuntimeEditor>();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (editor: ReactRuntimeEditor) => {
      if (!enabled) {
        return null;
      }

      const selection = editor.read((state) => state.selection());
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
    (change?: EditorCommit) =>
      enabled && shouldUpdateSelectedTopLevelIndex(root, change),
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
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const selector = useCallback(
    (editor: ReactRuntimeEditor) => {
      if (!enabled) {
        return null;
      }

      const selection = editor.read((state) => state.selection());

      if (!selection) {
        return null;
      }

      return [selection.anchor.path, selection.focus.path] as const;
    },
    [enabled]
  );
  const shouldUpdate = useCallback(
    (change?: EditorCommit) =>
      enabled && shouldUpdateSelectedTopLevelIndex(root, change),
    [enabled, root]
  );

  return useEditorSelector(selector, sameSelectionPaths, {
    profileId: 'selection-paths',
    shouldUpdate,
  });
};

export const usePlaceholderValue = (placeholder?: ReactNode) => {
  const editor = useEditor<ReactRuntimeEditor>();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
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
    (change?: EditorCommit) => shouldUpdatePlaceholderValue(root, change),
    [root]
  );

  return useEditorSelector(selector, Object.is, {
    profileId: 'placeholder',
    shouldUpdate,
  });
};

export const useEditableRootCommitWakeup = () => {
  const editor = useEditor<ReactRuntimeEditor>();
  const root = toInternalRoot(editor.read((state) => state.view.root()));
  const shouldUpdate = useCallback(
    (change?: EditorCommit) => shouldUpdateEditableRootCommit(root, change),
    [root]
  );

  useEditorSelector(
    (editor: ReactRuntimeEditor) =>
      editor.read((state) => state.lastCommit()?.version ?? 0),
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
