import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type {
  Descendant,
  EditorSnapshot,
  Path,
  Range,
  RootKey,
} from '@platejs/plite';
import { RangeApi } from '@platejs/plite';

import {
  createDecorationSource,
  type PliteDecoration,
  type PliteDecorationSource,
  type PliteDecorationSourceReadContext,
} from './decoration-source';
import { useIsomorphicLayoutEffect } from './hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from './plugin/react-editor';
import type {
  PliteProjectionRuntimeScope,
  PliteSourceDirtiness,
} from './projection-store';
import { MAIN_ROOT_KEY } from './root-key';
import {
  createPliteViewBoundaryRootMap,
  getPliteBoundaryPoint,
  getPliteDescendantAtPath,
  resolvePliteViewBoundarySegmentEndpoint,
  type PliteViewBoundaryOwner,
  type PliteViewBoundaryRangeEndpoint,
  type PliteViewBoundaryRangeSegment,
} from './view-boundary-graph';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  subscribePliteViewSelection,
} from './view-selection';

export const PLITE_VIEW_SELECTION_DECORATION_SOURCE_ID = 'plite-view-selection';
export const PLITE_VIEW_SELECTION_DECORATION_DIRTINESS = [
  'node',
  'text',
  'external',
] as const satisfies PliteSourceDirtiness;

export type PliteViewSelectionDecorationOwner = Readonly<{
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
}>;

export type PliteViewSelectionDecorationData = Readonly<{
  pliteViewSelection: true;
  owner: PliteViewSelectionDecorationOwner | null;
  root: RootKey;
}>;

export type PliteViewSelectionDecorationSourceOptions = Readonly<{
  runtimeScope?: PliteProjectionRuntimeScope;
}>;

const EMPTY_DECORATIONS = Object.freeze(
  []
) as readonly PliteDecoration<PliteViewSelectionDecorationData>[];

const cloneOwner = (
  owner: PliteViewBoundaryOwner | null
): PliteViewSelectionDecorationOwner | null =>
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
  left: PliteViewSelectionDecorationOwner | null,
  right: PliteViewSelectionDecorationOwner | null
) =>
  (!left && !right) ||
  Boolean(
    left &&
      right &&
      left.childRoot === right.childRoot &&
      left.ownerRoot === right.ownerRoot &&
      isSamePath(left.ownerPath, right.ownerPath)
  );

const isPliteViewSelectionDecorationData = (
  value: unknown
): value is PliteViewSelectionDecorationData =>
  typeof value === 'object' &&
  value !== null &&
  (value as { pliteViewSelection?: unknown }).pliteViewSelection === true;

export const hasVisiblePliteViewSelectionDecoration = (
  slices: readonly { data?: unknown }[],
  {
    owner,
    root,
  }: {
    owner: PliteViewSelectionDecorationOwner | null;
    root: RootKey | null;
  }
) => {
  const viewRoot = root ?? MAIN_ROOT_KEY;

  return slices.some((slice) => {
    const data = slice.data;

    if (!isPliteViewSelectionDecorationData(data)) {
      return false;
    }

    if (data.owner) {
      return isSameOwner(data.owner, owner);
    }

    return !owner && data.root === viewRoot;
  });
};

const getRangeKey = (segment: PliteViewBoundaryRangeSegment, index: number) =>
  `${PLITE_VIEW_SELECTION_DECORATION_SOURCE_ID}:${segment.root}:${segment.ownerKey ?? 'main'}:${index}`;

const rootPointForSegment = (
  point: Range['anchor'],
  root: RootKey
): Range['anchor'] => ({
  ...(root === MAIN_ROOT_KEY ? {} : { root }),
  offset: point.offset,
  path: [...point.path] as Path,
});

const resolvePliteViewSelectionDecorationEndpoint = (
  roots: () => Readonly<Record<string, readonly Descendant[]>>,
  segment: PliteViewBoundaryRangeSegment,
  endpoint: PliteViewBoundaryRangeEndpoint
) => {
  if (endpoint.kind === 'point') {
    return rootPointForSegment(endpoint.point, segment.root);
  }

  return resolvePliteViewBoundarySegmentEndpoint(roots(), segment, endpoint);
};

const createPliteViewSelectionDecoration = (
  segment: PliteViewBoundaryRangeSegment,
  index: number,
  range: Range,
  keySuffix = ''
): PliteDecoration<PliteViewSelectionDecorationData> => ({
  data: {
    pliteViewSelection: true,
    owner: cloneOwner(segment.owner),
    root: segment.root,
  },
  key: `${getRangeKey(segment, index)}${keySuffix}`,
  range,
});

const isScopedSegment = (segment: PliteViewBoundaryRangeSegment) =>
  segment.root === MAIN_ROOT_KEY && !segment.owner;

const getScopedNodeRange = (
  snapshot: EditorSnapshot,
  path: Path
): Range | null => {
  const node = getPliteDescendantAtPath(snapshot.children, path);

  if (!node) {
    return null;
  }

  const anchor = getPliteBoundaryPoint(node, path, 'start');
  const focus = getPliteBoundaryPoint(node, path, 'end');

  return anchor && focus ? { anchor, focus } : null;
};

const readScopedPliteViewSelectionDecorations = (
  segment: PliteViewBoundaryRangeSegment,
  index: number,
  range: Range,
  context: PliteDecorationSourceReadContext
): readonly PliteDecoration<PliteViewSelectionDecorationData>[] | null => {
  if (!context.runtimeScope || !isScopedSegment(segment)) {
    return null;
  }

  const decorations: PliteDecoration<PliteViewSelectionDecorationData>[] = [];
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
      createPliteViewSelectionDecoration(
        segment,
        index,
        intersection,
        `:${pathKey}`
      )
    );
  });

  return decorations;
};

const readPliteViewSelectionDecorations = (
  editor: ReactRuntimeEditor<any>,
  context: PliteDecorationSourceReadContext
): readonly PliteDecoration<PliteViewSelectionDecorationData>[] => {
  const viewSelection = readPliteViewSelection(editor);

  if (!viewSelection || isPliteViewSelectionCollapsed(viewSelection)) {
    return EMPTY_DECORATIONS;
  }

  let roots: Readonly<Record<string, readonly Descendant[]>> | null = null;
  const getRoots = () => {
    roots ??= editor.read((state) =>
      createPliteViewBoundaryRootMap(state.value.get())
    );

    return roots;
  };
  const decorations: PliteDecoration<PliteViewSelectionDecorationData>[] = [];

  viewSelection.segments.parts.forEach((segment, index) => {
    const anchor = resolvePliteViewSelectionDecorationEndpoint(
      getRoots,
      segment,
      segment.start
    );
    const focus = resolvePliteViewSelectionDecorationEndpoint(
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

    const scopedDecorations = readScopedPliteViewSelectionDecorations(
      segment,
      index,
      range,
      context
    );

    if (scopedDecorations) {
      decorations.push(...scopedDecorations);
      return;
    }

    decorations.push(createPliteViewSelectionDecoration(segment, index, range));
  });

  return decorations.length === 0 ? EMPTY_DECORATIONS : decorations;
};

export const createPliteViewSelectionDecorationSource = (
  editor: ReactRuntimeEditor<any>,
  options: PliteViewSelectionDecorationSourceOptions = {}
): PliteDecorationSource<PliteViewSelectionDecorationData> =>
  createDecorationSource<PliteViewSelectionDecorationData>(editor, {
    dirtiness: PLITE_VIEW_SELECTION_DECORATION_DIRTINESS,
    id: PLITE_VIEW_SELECTION_DECORATION_SOURCE_ID,
    read: (context) => readPliteViewSelectionDecorations(editor, context),
    runtimeScope: options.runtimeScope,
  });

export const usePliteViewSelectionPresence = (editor: object) =>
  useSyncExternalStore(
    (listener) => subscribePliteViewSelection(editor, listener),
    () => readPliteViewSelection(editor) !== null,
    () => false
  );

export const usePliteViewSelectionDecorationSource = (
  editor: ReactRuntimeEditor<any>,
  enabled: boolean,
  options: PliteViewSelectionDecorationSourceOptions = {}
): PliteDecorationSource<PliteViewSelectionDecorationData> | null => {
  const runtimeScope = options.runtimeScope;
  const source = useMemo(() => {
    if (!enabled) {
      return null;
    }

    return createPliteViewSelectionDecorationSource(editor, {
      runtimeScope,
    });
  }, [editor, enabled, runtimeScope]);

  useEffect(() => () => source?.destroy(), [source]);
  useIsomorphicLayoutEffect(() => {
    if (!source) {
      return;
    }

    return subscribePliteViewSelection(editor, () => {
      source.refresh({
        reason: 'external',
      });
    });
  }, [editor, source]);

  return source;
};
