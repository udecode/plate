import React from 'react';

import type { Path, NodeKey, Range as PliteRange } from '../..';
import { DOMCoverage, type DOMCoverageBoundary } from '../../dom/internal';
import type { VirtualizedTopLevelItem } from '../dom-strategy/use-virtualized-root-plan';
import { useEditorContext } from '../hooks/use-editor-context';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

const ROOT_GROUP_SIZE = 16;

export const createRootGroups = (
  nodeKeys: readonly NodeKey[],
  groupSize = ROOT_GROUP_SIZE
) => {
  const groups: Array<{
    endIndex: number;
    groupId: string;
    nodeKeys: readonly NodeKey[];
    startIndex: number;
  }> = [];

  for (
    let startIndex = 0;
    startIndex < nodeKeys.length;
    startIndex += groupSize
  ) {
    const endIndex = Math.min(nodeKeys.length - 1, startIndex + groupSize - 1);

    groups.push({
      endIndex,
      groupId: `${startIndex}-${endIndex}`,
      nodeKeys: nodeKeys.slice(startIndex, endIndex + 1),
      startIndex,
    });
  }

  return groups;
};

export type EditableRootGroupRecord = ReturnType<
  typeof createRootGroups
>[number];

export const getRootGroupPlanKey = (
  nodeKeys: readonly NodeKey[],
  documentEpoch: number
) => `${documentEpoch}:${nodeKeys.join('\u001F')}`;

export const getActiveRootGroupIds = (
  groups: readonly EditableRootGroupRecord[] | null,
  selectedTopLevelIndex: number | null
) => {
  if (!groups || groups.length === 0) {
    return new Set<string>();
  }

  const targetIndex = selectedTopLevelIndex ?? 0;
  const targetGroupIndex = Math.max(
    0,
    groups.findIndex(
      (group) =>
        group.startIndex <= targetIndex && group.endIndex >= targetIndex
    )
  );
  const groupIds = new Set<string>();
  const targetGroup = groups[targetGroupIndex];

  if (!targetGroup) {
    return groupIds;
  }

  groupIds.add(targetGroup.groupId);

  if (targetIndex <= targetGroup.startIndex + 1) {
    const previousGroup = groups[targetGroupIndex - 1];

    if (previousGroup) {
      groupIds.add(previousGroup.groupId);
    }
  }

  if (targetIndex >= targetGroup.endIndex - 1) {
    const nextGroup = groups[targetGroupIndex + 1];

    if (nextGroup) {
      groupIds.add(nextGroup.groupId);
    }
  }

  return groupIds;
};

const sameStringSet = (left: ReadonlySet<string>, right: ReadonlySet<string>) =>
  left.size === right.size && [...left].every((value) => right.has(value));

type MountedRootGroupState = {
  documentEpoch: number | null;
  groupIds: ReadonlySet<string>;
  planKey: string | null;
};

const EMPTY_MOUNTED_ROOT_GROUP_STATE: MountedRootGroupState = {
  documentEpoch: null,
  groupIds: new Set(),
  planKey: null,
};

const reconcileMountedRootGroupState = ({
  activeGroupIds,
  documentEpoch,
  groups,
  planKey,
  previous,
}: {
  activeGroupIds: ReadonlySet<string>;
  documentEpoch: number;
  groups: readonly EditableRootGroupRecord[] | null;
  planKey: string | null;
  previous: MountedRootGroupState;
}): MountedRootGroupState => {
  if (!groups || !planKey) {
    return previous.documentEpoch == null &&
      previous.planKey == null &&
      previous.groupIds.size === 0
      ? previous
      : EMPTY_MOUNTED_ROOT_GROUP_STATE;
  }

  const validGroupIds = new Set(groups.map((group) => group.groupId));
  const nextGroupIds =
    previous.documentEpoch === documentEpoch
      ? new Set(
          [...previous.groupIds].filter((groupId) => validGroupIds.has(groupId))
        )
      : new Set<string>();

  for (const groupId of activeGroupIds) {
    nextGroupIds.add(groupId);
  }

  return previous.documentEpoch === documentEpoch &&
    previous.planKey === planKey &&
    sameStringSet(previous.groupIds, nextGroupIds)
    ? previous
    : { documentEpoch, groupIds: nextGroupIds, planKey };
};

export const getRootGroupIdsForBoundary = (
  groups: readonly EditableRootGroupRecord[] | null,
  boundary: DOMCoverageBoundary,
  targetRange?: PliteRange
) => {
  if (!groups || boundary.reason !== 'rendering-staged') {
    return [];
  }

  const pathRanges = targetRange
    ? [{ anchor: targetRange.anchor.path, focus: targetRange.focus.path }]
    : boundary.coveredPathRanges;

  return groups
    .filter((group) =>
      pathRanges.some((range) => {
        const anchor = range.anchor[0];
        const focus = range.focus[0];

        if (typeof anchor !== 'number' || typeof focus !== 'number') {
          return false;
        }

        const start = Math.min(anchor, focus);
        const end = Math.max(anchor, focus);

        return group.startIndex <= end && group.endIndex >= start;
      })
    )
    .map((group) => group.groupId);
};

export const useMountedRootGroupIds = ({
  activeGroupIds,
  documentEpoch,
  groups,
  planKey,
}: {
  activeGroupIds: ReadonlySet<string>;
  documentEpoch: number;
  groups: readonly EditableRootGroupRecord[] | null;
  planKey: string | null;
}) => {
  const [mountedState, setMountedState] = React.useState<MountedRootGroupState>(
    EMPTY_MOUNTED_ROOT_GROUP_STATE
  );
  const reconciledMountedState = reconcileMountedRootGroupState({
    activeGroupIds,
    documentEpoch,
    groups,
    planKey,
    previous: mountedState,
  });

  if (reconciledMountedState !== mountedState) {
    setMountedState(reconciledMountedState);
  }

  const mountedGroupIds = reconciledMountedState.groupIds;
  const mountGroupIds = React.useCallback(
    (groupIds: readonly string[]) => {
      if (!planKey || groupIds.length === 0) {
        return;
      }

      setMountedState((previous) => {
        const nextGroupIds =
          previous.documentEpoch === documentEpoch
            ? new Set(previous.groupIds)
            : new Set<string>();
        let changed =
          previous.documentEpoch !== documentEpoch ||
          previous.planKey !== planKey;

        for (const groupId of groupIds) {
          if (!nextGroupIds.has(groupId)) {
            nextGroupIds.add(groupId);
            changed = true;
          }
        }

        return changed
          ? { documentEpoch, groupIds: nextGroupIds, planKey }
          : previous;
      });
    },
    [documentEpoch, planKey]
  );

  return { activeGroupIds, mountedGroupIds, mountGroupIds };
};

export const createRootGroupRenderItems = (
  groups: ReadonlyArray<EditableRootGroupRecord & { isMounted: boolean }>
) => {
  const items: Array<
    | {
        group: EditableRootGroupRecord;
        kind: 'mounted';
      }
    | {
        anchorNodeKey: NodeKey | null;
        endIndex: number;
        focusNodeKey: NodeKey | null;
        groupId: string;
        kind: 'pending';
        startIndex: number;
      }
  > = [];
  let pendingStartGroup: EditableRootGroupRecord | null = null;
  let pendingEndGroup: EditableRootGroupRecord | null = null;

  const flushPendingGroups = () => {
    if (!pendingStartGroup || !pendingEndGroup) {
      return;
    }

    items.push({
      anchorNodeKey: pendingStartGroup.nodeKeys[0] ?? null,
      endIndex: pendingEndGroup.endIndex,
      focusNodeKey: pendingEndGroup.nodeKeys.at(-1) ?? null,
      groupId: `${pendingStartGroup.groupId}-${pendingEndGroup.groupId}`,
      kind: 'pending',
      startIndex: pendingStartGroup.startIndex,
    });
    pendingStartGroup = null;
    pendingEndGroup = null;
  };

  for (const group of groups) {
    if (group.isMounted) {
      flushPendingGroups();
      items.push({ group, kind: 'mounted' });
      continue;
    }

    pendingStartGroup ??= group;
    pendingEndGroup = group;
  }

  flushPendingGroups();

  return items;
};

export const EditableRootGroupPlaceholder = ({
  anchorNodeKey,
  endIndex,
  focusNodeKey,
  groupId,
  startIndex,
}: {
  anchorNodeKey: NodeKey | null;
  endIndex: number;
  focusNodeKey: NodeKey | null;
  groupId: string;
  startIndex: number;
}) => {
  const editor = useEditorContext();
  const boundaryId = `rendering-staged:${groupId}`;
  const boundary = React.useMemo(
    () => ({
      anchor: { type: 'placeholder' as const },
      boundaryId,
      copyPolicy: 'materialize' as const,
      coveredPathRanges: [
        {
          anchor: [startIndex] as Path,
          focus: [endIndex] as Path,
        },
      ],
      coveredRuntimeRanges:
        anchorNodeKey && focusNodeKey
          ? [{ anchor: anchorNodeKey, focus: focusNodeKey }]
          : [],
      findPolicy: 'native' as const,
      ownerPath: [] as Path,
      ownerNodeKey: null,
      reason: 'rendering-staged' as const,
      selectionPolicy: 'materialize' as const,
      state: 'pending-mount' as const,
      version: 1,
    }),
    [anchorNodeKey, boundaryId, endIndex, focusNodeKey, startIndex]
  );

  useIsomorphicLayoutEffect(
    () => DOMCoverage.registerBoundary(editor, boundary),
    [boundary, editor]
  );

  return React.createElement('div', {
    'aria-hidden': 'true',
    contentEditable: false,
    'data-plite-dom-coverage-boundary': boundaryId,
    'data-plite-dom-coverage-edge': 'owner',
    'data-plite-root-group': 'true',
    'data-plite-root-group-end': endIndex,
    'data-plite-root-group-id': groupId,
    'data-plite-root-group-start': startIndex,
    'data-plite-root-group-state': 'pending-mount',
    style: { display: 'none' },
  });
};

export type VirtualizedTopLevelItemGroup = {
  groupId: string;
  items: VirtualizedTopLevelItem[];
  start: number;
};

export const createVirtualizedTopLevelItemGroups = (
  items: readonly VirtualizedTopLevelItem[]
): VirtualizedTopLevelItemGroup[] => {
  const groups: VirtualizedTopLevelItemGroup[] = [];

  for (const item of items) {
    const currentGroup = groups.at(-1);
    const previousItem = currentGroup?.items.at(-1);
    const previousEnd =
      previousItem == null ? null : previousItem.start + previousItem.size;

    if (
      !currentGroup ||
      previousItem?.index !== item.index - 1 ||
      previousEnd !== item.start
    ) {
      groups.push({
        groupId: `virtual-row-group:${item.index}:${String(item.key)}`,
        items: [item],
        start: item.start,
      });
      continue;
    }

    currentGroup.items.push(item);
    currentGroup.groupId = `virtual-row-group:${currentGroup.items[0].index}:${item.index}`;
  }

  return groups;
};
