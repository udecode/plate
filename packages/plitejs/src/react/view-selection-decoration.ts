import { useMemo, useSyncExternalStore } from 'react';

import type { Descendant, EditorSnapshot, Path, Range, RootKey } from '..';
import { RangeApi } from '..';
import {
  createDecorationSource,
  type PliteDecoration,
  type PliteDecorationSource,
  type PliteDecorationSourceReadContext,
} from './decoration-source';
import { useIsomorphicLayoutEffect } from './hooks/use-isomorphic-layout-effect';
import { useDecorationSourceLifecycle } from './hooks/use-plite-decoration-source';
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

export type PliteViewSelectionDecorationScope = Readonly<{
  owner: PliteViewSelectionDecorationOwner | null;
  root: RootKey;
}>;

type PliteViewSelectionDecorationOptions<T> = Readonly<{
  data: (scope: PliteViewSelectionDecorationScope) => T;
  sourceId: string;
}>;

const EMPTY_DECORATIONS = Object.freeze([]) as ReadonlyArray<
  PliteDecoration<PliteViewSelectionDecorationData>
>;

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
  slices: ReadonlyArray<{ data?: unknown }>,
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
    const { data } = slice;

    if (!isPliteViewSelectionDecorationData(data)) {
      return false;
    }

    if (data.owner) {
      return isSameOwner(data.owner, owner);
    }

    return !owner && data.root === viewRoot;
  });
};

const getRangeKey = (
  sourceId: string,
  segment: PliteViewBoundaryRangeSegment,
  index: number
) => `${sourceId}:${segment.root}:${segment.ownerKey ?? 'main'}:${index}`;

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

const createPliteViewSelectionDecoration = <T>(
  segment: PliteViewBoundaryRangeSegment,
  index: number,
  range: Range,
  options: PliteViewSelectionDecorationOptions<T>,
  keySuffix = ''
): PliteDecoration<T> => ({
  data: options.data({
    owner: cloneOwner(segment.owner),
    root: segment.root,
  }),
  key: `${getRangeKey(options.sourceId, segment, index)}${keySuffix}`,
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

const readScopedPliteViewSelectionDecorations = <T>(
  segment: PliteViewBoundaryRangeSegment,
  index: number,
  range: Range,
  context: PliteDecorationSourceReadContext,
  options: PliteViewSelectionDecorationOptions<T>
): ReadonlyArray<PliteDecoration<T>> | null => {
  if (!context.runtimeScope || !isScopedSegment(segment)) {
    return null;
  }

  const decorations: Array<PliteDecoration<T>> = [];
  const visitedPathKeys = new Set<string>();
  const scopedPaths: Path[] = [];

  context.runtimeScope.forEach((nodeKey) => {
    const path = context.snapshot.index.pathOf(nodeKey);

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
        options,
        `:${pathKey}`
      )
    );
  });

  return decorations;
};

export const createPliteViewSelectionDecorations = <T>(
  editor: ReactRuntimeEditor<any>,
  viewSelection: ReturnType<typeof readPliteViewSelection>,
  context: PliteDecorationSourceReadContext,
  options: PliteViewSelectionDecorationOptions<T>
): ReadonlyArray<PliteDecoration<T>> => {
  if (!viewSelection || isPliteViewSelectionCollapsed(viewSelection)) {
    return EMPTY_DECORATIONS as ReadonlyArray<PliteDecoration<T>>;
  }

  let roots: Readonly<Record<string, readonly Descendant[]>> | null = null;
  const getRoots = () => {
    roots ??= editor.read((state) =>
      createPliteViewBoundaryRootMap(state.value())
    );

    return roots;
  };
  const decorations: Array<PliteDecoration<T>> = [];

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
      context,
      options
    );

    if (scopedDecorations) {
      decorations.push(...scopedDecorations);
      return;
    }

    decorations.push(
      createPliteViewSelectionDecoration(segment, index, range, options)
    );
  });

  return decorations.length === 0
    ? (EMPTY_DECORATIONS as ReadonlyArray<PliteDecoration<T>>)
    : decorations;
};

export const createPliteViewSelectionDecorationSource = (
  editor: ReactRuntimeEditor<any>,
  options: PliteViewSelectionDecorationSourceOptions = {}
): PliteDecorationSource<PliteViewSelectionDecorationData> =>
  createDecorationSource(editor, {
    dirtiness: PLITE_VIEW_SELECTION_DECORATION_DIRTINESS,
    id: PLITE_VIEW_SELECTION_DECORATION_SOURCE_ID,
    read: (context) =>
      createPliteViewSelectionDecorations(
        editor,
        readPliteViewSelection(editor),
        context,
        {
          data: ({ owner, root }) => ({
            pliteViewSelection: true,
            owner,
            root,
          }),
          sourceId: PLITE_VIEW_SELECTION_DECORATION_SOURCE_ID,
        }
      ),
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
  const { runtimeScope } = options;
  const source = useMemo(() => {
    if (!enabled) {
      return null;
    }

    return createPliteViewSelectionDecorationSource(editor, {
      runtimeScope,
    });
  }, [editor, enabled, runtimeScope]);

  useDecorationSourceLifecycle(source);
  useIsomorphicLayoutEffect(() => {
    if (!source) {
      return undefined;
    }

    const refresh = (
      notification: Readonly<{ forceInvalidate?: boolean }> = {}
    ) => {
      source.refresh({
        forceInvalidate: notification.forceInvalidate,
        reason: 'external',
      });
    };
    const unsubscribe = subscribePliteViewSelection(editor, refresh);

    refresh({ forceInvalidate: true });

    return unsubscribe;
  }, [editor, source]);

  return source;
};
