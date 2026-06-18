import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type {
  Descendant,
  EditorSnapshot,
  Path,
  Range,
  RootKey,
} from '@platejs/slate';
import { RangeApi } from '@platejs/slate';

import {
  createDecorationSource,
  type SlateDecoration,
  type SlateDecorationSource,
  type SlateDecorationSourceReadContext,
} from './decoration-source';
import { useIsomorphicLayoutEffect } from './hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from './plugin/react-editor';
import type {
  SlateProjectionRuntimeScope,
  SlateSourceDirtiness,
} from './projection-store';
import { MAIN_ROOT_KEY } from './root-key';
import {
  createSlateViewBoundaryRootMap,
  getSlateBoundaryPoint,
  getSlateDescendantAtPath,
  resolveSlateViewBoundarySegmentEndpoint,
  type SlateViewBoundaryOwner,
  type SlateViewBoundaryRangeEndpoint,
  type SlateViewBoundaryRangeSegment,
} from './view-boundary-graph';
import {
  isSlateViewSelectionCollapsed,
  readSlateViewSelection,
  subscribeSlateViewSelection,
} from './view-selection';

export const SLATE_VIEW_SELECTION_DECORATION_SOURCE_ID = 'slate-view-selection';
export const SLATE_VIEW_SELECTION_DECORATION_DIRTINESS = [
  'node',
  'text',
  'external',
] as const satisfies SlateSourceDirtiness;

export type SlateViewSelectionDecorationOwner = Readonly<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
}>;

export type SlateViewSelectionDecorationData = Readonly<{
  slateViewSelection: true;
  owner: SlateViewSelectionDecorationOwner | null;
  root: RootKey;
}>;

export type SlateViewSelectionDecorationSourceOptions = Readonly<{
  runtimeScope?: SlateProjectionRuntimeScope;
}>;

const EMPTY_DECORATIONS = Object.freeze(
  []
) as readonly SlateDecoration<SlateViewSelectionDecorationData>[];

const cloneOwner = (
  owner: SlateViewBoundaryOwner | null
): SlateViewSelectionDecorationOwner | null =>
  owner
    ? {
        childRoot: owner.childRoot,
        ownerPath: [...owner.ownerPath] as Path,
        ownerRoot: owner.ownerRoot,
      }
    : null;

const isSamePath = (left: Path, right: Path) =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

const isSameOwner = (
  left: SlateViewSelectionDecorationOwner | null,
  right: SlateViewSelectionDecorationOwner | null
) =>
  (!left && !right) ||
  Boolean(
    left &&
      right &&
      left.childRoot === right.childRoot &&
      left.ownerRoot === right.ownerRoot &&
      isSamePath(left.ownerPath, right.ownerPath)
  );

const isSlateViewSelectionDecorationData = (
  value: unknown
): value is SlateViewSelectionDecorationData =>
  typeof value === 'object' &&
  value !== null &&
  (value as { slateViewSelection?: unknown }).slateViewSelection === true;

export const hasVisibleSlateViewSelectionDecoration = (
  slices: readonly { data?: unknown }[],
  {
    owner,
    root,
  }: {
    owner: SlateViewSelectionDecorationOwner | null;
    root: RootKey | null;
  }
) => {
  const viewRoot = root ?? MAIN_ROOT_KEY;

  return slices.some((slice) => {
    const data = slice.data;

    if (!isSlateViewSelectionDecorationData(data)) {
      return false;
    }

    if (data.owner) {
      return isSameOwner(data.owner, owner);
    }

    return !owner && data.root === viewRoot;
  });
};

const getRangeKey = (segment: SlateViewBoundaryRangeSegment, index: number) =>
  `${SLATE_VIEW_SELECTION_DECORATION_SOURCE_ID}:${segment.root}:${segment.ownerKey ?? 'main'}:${index}`;

const rootPointForSegment = (
  point: Range['anchor'],
  root: RootKey
): Range['anchor'] => ({
  ...(root === MAIN_ROOT_KEY ? {} : { root }),
  offset: point.offset,
  path: [...point.path] as Path,
});

const resolveSlateViewSelectionDecorationEndpoint = (
  roots: () => Readonly<Record<string, readonly Descendant[]>>,
  segment: SlateViewBoundaryRangeSegment,
  endpoint: SlateViewBoundaryRangeEndpoint
) => {
  if (endpoint.kind === 'point') {
    return rootPointForSegment(endpoint.point, segment.root);
  }

  return resolveSlateViewBoundarySegmentEndpoint(roots(), segment, endpoint);
};

const createSlateViewSelectionDecoration = (
  segment: SlateViewBoundaryRangeSegment,
  index: number,
  range: Range,
  keySuffix = ''
): SlateDecoration<SlateViewSelectionDecorationData> => ({
  data: {
    slateViewSelection: true,
    owner: cloneOwner(segment.owner),
    root: segment.root,
  },
  key: `${getRangeKey(segment, index)}${keySuffix}`,
  range,
});

const isScopedSegment = (segment: SlateViewBoundaryRangeSegment) =>
  segment.root === MAIN_ROOT_KEY && !segment.owner;

const getScopedNodeRange = (
  snapshot: EditorSnapshot,
  path: Path
): Range | null => {
  const node = getSlateDescendantAtPath(snapshot.children, path);

  if (!node) {
    return null;
  }

  const anchor = getSlateBoundaryPoint(node, path, 'start');
  const focus = getSlateBoundaryPoint(node, path, 'end');

  return anchor && focus ? { anchor, focus } : null;
};

const readScopedSlateViewSelectionDecorations = (
  segment: SlateViewBoundaryRangeSegment,
  index: number,
  range: Range,
  context: SlateDecorationSourceReadContext
): readonly SlateDecoration<SlateViewSelectionDecorationData>[] | null => {
  if (!context.runtimeScope || !isScopedSegment(segment)) {
    return null;
  }

  const decorations: SlateDecoration<SlateViewSelectionDecorationData>[] = [];
  const visitedPathKeys = new Set<string>();
  const scopedPaths: Path[] = [];

  context.runtimeScope.forEach((runtimeId) => {
    const path = context.snapshot.index.idToPath[runtimeId];

    if (!path) {
      return;
    }

    scopedPaths.push(path);
  });

  [range.anchor, range.focus].forEach((point) => {
    const topLevelIndex = point.path[0];

    if (typeof topLevelIndex === 'number') {
      scopedPaths.push([topLevelIndex] as Path);
    }
  });

  scopedPaths.forEach((path) => {
    const pathKey = path.join('.');

    if (visitedPathKeys.has(pathKey)) {
      return;
    }

    visitedPathKeys.add(pathKey);

    const scopedRange = getScopedNodeRange(context.snapshot, path);
    const intersection = scopedRange
      ? RangeApi.intersection(range, scopedRange)
      : null;

    if (!intersection || RangeApi.isCollapsed(intersection)) {
      return;
    }

    decorations.push(
      createSlateViewSelectionDecoration(
        segment,
        index,
        intersection,
        `:${pathKey}`
      )
    );
  });

  return decorations;
};

const readSlateViewSelectionDecorations = (
  editor: ReactRuntimeEditor<any>,
  context: SlateDecorationSourceReadContext
): readonly SlateDecoration<SlateViewSelectionDecorationData>[] => {
  const viewSelection = readSlateViewSelection(editor);

  if (!viewSelection || isSlateViewSelectionCollapsed(viewSelection)) {
    return EMPTY_DECORATIONS;
  }

  let roots: Readonly<Record<string, readonly Descendant[]>> | null = null;
  const getRoots = () => {
    roots ??= editor.read((state) =>
      createSlateViewBoundaryRootMap(state.value.get())
    );

    return roots;
  };
  const decorations: SlateDecoration<SlateViewSelectionDecorationData>[] = [];

  viewSelection.segments.parts.forEach((segment, index) => {
    const anchor = resolveSlateViewSelectionDecorationEndpoint(
      getRoots,
      segment,
      segment.start
    );
    const focus = resolveSlateViewSelectionDecorationEndpoint(
      getRoots,
      segment,
      segment.end
    );

    if (!anchor || !focus) {
      return;
    }

    const range = { anchor, focus };

    if (RangeApi.isCollapsed(range)) {
      return;
    }

    const scopedDecorations = readScopedSlateViewSelectionDecorations(
      segment,
      index,
      range,
      context
    );

    if (scopedDecorations) {
      decorations.push(...scopedDecorations);
      return;
    }

    decorations.push(createSlateViewSelectionDecoration(segment, index, range));
  });

  return decorations.length === 0 ? EMPTY_DECORATIONS : decorations;
};

export const createSlateViewSelectionDecorationSource = (
  editor: ReactRuntimeEditor<any>,
  options: SlateViewSelectionDecorationSourceOptions = {}
): SlateDecorationSource<SlateViewSelectionDecorationData> =>
  createDecorationSource<SlateViewSelectionDecorationData>(editor, {
    dirtiness: SLATE_VIEW_SELECTION_DECORATION_DIRTINESS,
    id: SLATE_VIEW_SELECTION_DECORATION_SOURCE_ID,
    read: (context) => readSlateViewSelectionDecorations(editor, context),
    runtimeScope: options.runtimeScope,
  });

export const useSlateViewSelectionPresence = (editor: object) =>
  useSyncExternalStore(
    (listener) => subscribeSlateViewSelection(editor, listener),
    () => readSlateViewSelection(editor) !== null,
    () => false
  );

export const useSlateViewSelectionDecorationSource = (
  editor: ReactRuntimeEditor<any>,
  enabled: boolean,
  options: SlateViewSelectionDecorationSourceOptions = {}
): SlateDecorationSource<SlateViewSelectionDecorationData> | null => {
  const runtimeScope = options.runtimeScope;
  const source = useMemo(() => {
    if (!enabled) {
      return null;
    }

    return createSlateViewSelectionDecorationSource(editor, {
      runtimeScope,
    });
  }, [editor, enabled, runtimeScope]);

  useEffect(() => () => source?.destroy(), [source]);
  useIsomorphicLayoutEffect(() => {
    if (!source) {
      return;
    }

    return subscribeSlateViewSelection(editor, () => {
      source.refresh({
        reason: 'external',
      });
    });
  }, [editor, source]);

  return source;
};
