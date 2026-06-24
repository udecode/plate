import React from 'react';
import type { Path, RuntimeId, Range as PliteRange } from '@platejs/plite';
import {
  DOMCoverage,
  type DOMCoverageBoundary,
} from '@platejs/plite-dom/internal';

import type { VirtualizedTopLevelItem } from '../dom-strategy/use-virtualized-root-plan';
import { useEditor } from '../hooks/use-editor';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

const ROOT_GROUP_SIZE = 16;

export const createRootGroups = (
  runtimeIds: readonly RuntimeId[],
  groupSize = ROOT_GROUP_SIZE
) => {
  const groups: {
    endIndex: number;
    groupId: string;
    runtimeIds: readonly RuntimeId[];
    startIndex: number;
  }[] = [];

  for (
    let startIndex = 0;
    startIndex < runtimeIds.length;
    startIndex += groupSize
  ) {
    const endIndex = Math.min(
      runtimeIds.length - 1,
      startIndex + groupSize - 1
    );

    groups.push({
      endIndex,
      groupId: `${startIndex}-${endIndex}`,
      runtimeIds: runtimeIds.slice(startIndex, endIndex + 1),
      startIndex,
    });
  }

  return groups;
};

export type EditableRootGroupRecord = ReturnType<
  typeof createRootGroups
>[number];

export const getRootGroupPlanKey = (
  runtimeIds: readonly RuntimeId[],
  documentEpoch: number
) => `${documentEpoch}:${runtimeIds.join('\u001f')}`;

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
  groups,
  planKey,
}: {
  activeGroupIds: ReadonlySet<string>;
  groups: readonly EditableRootGroupRecord[] | null;
  planKey: string | null;
}) => {
  const [mountedState, setMountedState] = React.useState<{
    groupIds: ReadonlySet<string>;
    planKey: string | null;
  }>(() => ({
    groupIds: new Set(),
    planKey: null,
  }));

  const mountedGroupIds =
    mountedState.planKey === planKey
      ? mountedState.groupIds
      : new Set<string>();
  const mountGroupIds = React.useCallback(
    (groupIds: readonly string[]) => {
      if (!planKey || groupIds.length === 0) {
        return;
      }

      setMountedState((previous) => {
        const nextGroupIds =
          previous.planKey === planKey
            ? new Set(previous.groupIds)
            : new Set<string>();
        let changed = previous.planKey !== planKey;

        for (const groupId of groupIds) {
          if (!nextGroupIds.has(groupId)) {
            nextGroupIds.add(groupId);
            changed = true;
          }
        }

        return changed ? { groupIds: nextGroupIds, planKey } : previous;
      });
    },
    [planKey]
  );

  React.useEffect(() => {
    if (!groups || !planKey) {
      setMountedState((previous) =>
        previous.planKey == null && previous.groupIds.size === 0
          ? previous
          : { groupIds: new Set(), planKey: null }
      );

      return;
    }

    setMountedState((previous) => {
      const nextGroupIds =
        previous.planKey === planKey
          ? new Set(previous.groupIds)
          : new Set<string>();

      for (const groupId of activeGroupIds) {
        nextGroupIds.add(groupId);
      }

      return previous.planKey === planKey &&
        sameStringSet(previous.groupIds, nextGroupIds)
        ? previous
        : { groupIds: nextGroupIds, planKey };
    });
  }, [activeGroupIds, groups, planKey]);

  return { activeGroupIds, mountedGroupIds, mountGroupIds };
};

export const createRootGroupRenderItems = (
  groups: readonly (EditableRootGroupRecord & { isMounted: boolean })[]
) => {
  const items: (
    | {
        group: EditableRootGroupRecord;
        kind: 'mounted';
      }
    | {
        anchorRuntimeId: RuntimeId | null;
        endIndex: number;
        focusRuntimeId: RuntimeId | null;
        groupId: string;
        kind: 'pending';
        startIndex: number;
      }
  )[] = [];
  let pendingStartGroup: EditableRootGroupRecord | null = null;
  let pendingEndGroup: EditableRootGroupRecord | null = null;

  const flushPendingGroups = () => {
    if (!pendingStartGroup || !pendingEndGroup) {
      return;
    }

    items.push({
      anchorRuntimeId: pendingStartGroup.runtimeIds[0] ?? null,
      endIndex: pendingEndGroup.endIndex,
      focusRuntimeId: pendingEndGroup.runtimeIds.at(-1) ?? null,
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
  anchorRuntimeId,
  endIndex,
  focusRuntimeId,
  groupId,
  startIndex,
}: {
  anchorRuntimeId: RuntimeId | null;
  endIndex: number;
  focusRuntimeId: RuntimeId | null;
  groupId: string;
  startIndex: number;
}) => {
  const editor = useEditor();
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
        anchorRuntimeId && focusRuntimeId
          ? [{ anchor: anchorRuntimeId, focus: focusRuntimeId }]
          : [],
      findPolicy: 'native' as const,
      ownerPath: [] as Path,
      ownerRuntimeId: null,
      reason: 'rendering-staged' as const,
      selectionPolicy: 'materialize' as const,
      state: 'pending-mount' as const,
      version: 1,
    }),
    [anchorRuntimeId, boundaryId, endIndex, focusRuntimeId, startIndex]
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
    currentGroup.groupId = `virtual-row-group:${currentGroup.items[0]!.index}:${item.index}`;
  }

  return groups;
};
