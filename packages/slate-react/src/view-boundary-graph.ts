import {
  type Descendant,
  NodeApi,
  type Path,
  type Point,
  type Range,
  type RootKey,
} from '@platejs/slate';

import {
  createSlateProjectionGraph,
  getSlateProjectionOwnerKey,
  type SlateProjectedPoint,
  SlateProjectionGraph,
  type SlateProjectionGraphModel,
  type SlateProjectionGraphNodeInput,
  type SlateProjectionGraphRangeEndpoint,
  type SlateProjectionGraphRangeSegment,
  type SlateProjectionGraphRangeSegments,
  type SlateProjectionOwner,
} from './projection-graph';
import { getPointRoot, MAIN_ROOT_KEY } from './root-key';

export type SlateViewBoundaryOwner = SlateProjectionOwner;
export type SlateViewBoundaryGraphNodeInput = SlateProjectionGraphNodeInput;
export type SlateViewBoundaryGraphModel = SlateProjectionGraphModel;
export type SlateViewBoundaryPoint = SlateProjectedPoint;
export type SlateViewBoundaryRangeEndpoint = SlateProjectionGraphRangeEndpoint;
export type SlateViewBoundaryRangeSegment = SlateProjectionGraphRangeSegment;
export type SlateViewBoundaryRangeSegments = SlateProjectionGraphRangeSegments;

export type SlateViewBoundarySelectionTargetInput = Readonly<{
  anchor: SlateViewBoundaryPoint;
  focus: SlateViewBoundaryPoint;
  segments: SlateViewBoundaryRangeSegments;
}>;

export const createSlateViewBoundaryGraph = createSlateProjectionGraph;
export const getSlateViewBoundaryOwnerKey = getSlateProjectionOwnerKey;
export const SlateViewBoundaryGraph = SlateProjectionGraph;

export const createSlateViewBoundaryRootMap = (value: {
  children: readonly Descendant[];
  roots?: Readonly<Record<string, readonly Descendant[]>>;
}): Readonly<Record<string, readonly Descendant[]>> => ({
  [MAIN_ROOT_KEY]: value.children,
  ...(value.roots ?? {}),
});

export const cloneSlateViewBoundaryPath = (path: Path): Path =>
  [...path] as Path;

export const cloneSlateViewBoundaryPoint = (point: Point): Point =>
  Object.freeze({
    ...(point.root ? { root: point.root } : {}),
    offset: point.offset,
    path: Object.freeze(cloneSlateViewBoundaryPath(point.path)) as Path,
  }) as Point;

export const cloneSlateViewBoundaryOwner = (
  owner: SlateViewBoundaryOwner | null | undefined
): SlateViewBoundaryOwner | null =>
  owner
    ? Object.freeze({
        childRoot: owner.childRoot,
        ownerPath: Object.freeze(
          cloneSlateViewBoundaryPath(owner.ownerPath)
        ) as Path,
        ownerRoot: owner.ownerRoot,
      })
    : null;

export const cloneSlateViewBoundaryProjectedPoint = (
  point: SlateViewBoundaryPoint
): SlateViewBoundaryPoint =>
  Object.freeze({
    ...(point.owner ? { owner: cloneSlateViewBoundaryOwner(point.owner) } : {}),
    point: cloneSlateViewBoundaryPoint(point.point),
  });

export const rootSlatePoint = (point: Point, root: RootKey): Point => ({
  ...(root === MAIN_ROOT_KEY ? {} : { root }),
  offset: point.offset,
  path: [...point.path],
});

export const getSlatePointRoot = (
  point: Point,
  fallbackRoot: RootKey = MAIN_ROOT_KEY
): RootKey => getPointRoot(point, fallbackRoot);

export const getSlateViewBoundaryPointRoot = (
  point: SlateViewBoundaryPoint
): RootKey => getSlatePointRoot(point.point, point.owner?.childRoot);

export const toSlateRootedViewBoundaryPoint = (
  point: SlateViewBoundaryPoint
): Point => rootSlatePoint(point.point, getSlateViewBoundaryPointRoot(point));

export const sameSlateRootPoint = (
  left: Point,
  right: Point,
  root: RootKey
): boolean =>
  getSlatePointRoot(left, root) === getSlatePointRoot(right, root) &&
  left.offset === right.offset &&
  left.path.length === right.path.length &&
  left.path.every((value, index) => value === right.path[index]);

export const getSlateDescendantAtPath = (
  children: readonly Descendant[],
  path: Path
): Descendant | null => {
  if (path.length === 0) {
    return null;
  }

  let node: Descendant | null = children[path[0]!] ?? null;

  for (const index of path.slice(1)) {
    if (!node || !NodeApi.isElement(node)) {
      return null;
    }

    node = node.children[index] ?? null;
  }

  return node;
};

export const getSlateBoundaryPoint = (
  node: Descendant,
  path: Path,
  edge: 'end' | 'start'
): Point | null => {
  if (NodeApi.isText(node)) {
    return {
      offset: edge === 'start' ? 0 : node.text.length,
      path: [...path],
    };
  }

  const indexes =
    edge === 'start'
      ? node.children.keys()
      : [...node.children.keys()].reverse();

  for (const index of indexes) {
    const child = node.children[index];
    const point =
      child && getSlateBoundaryPoint(child, path.concat(index), edge);

    if (point) {
      return point;
    }
  }

  return null;
};

export const getSlateRootBoundaryPoint = (
  children: readonly Descendant[],
  edge: 'end' | 'start'
): Point | null => {
  const indexes =
    edge === 'start' ? children.keys() : [...children.keys()].reverse();

  for (const index of indexes) {
    const child = children[index];
    const point = child && getSlateBoundaryPoint(child, [index], edge);

    if (point) {
      return point;
    }
  }

  return null;
};

export const hasAmbiguousSlateViewBoundarySegments = (
  segments: SlateViewBoundaryRangeSegments
): boolean => {
  const ownerKeysByRoot = new Map<RootKey, Set<string | null>>();

  for (const segment of segments.parts) {
    const ownerKeys = ownerKeysByRoot.get(segment.root) ?? new Set();

    ownerKeys.add(segment.ownerKey);
    ownerKeysByRoot.set(segment.root, ownerKeys);

    if (ownerKeys.size > 1) {
      return true;
    }
  }

  return false;
};

export const resolveSlateViewBoundarySegmentEndpoint = (
  roots: Readonly<Record<string, readonly Descendant[]>>,
  segment: SlateViewBoundaryRangeSegment,
  endpoint: SlateProjectionGraphRangeEndpoint
): Point | null => {
  if (endpoint.kind === 'point') {
    return rootSlatePoint(endpoint.point, segment.root);
  }

  const children = roots[endpoint.node.root];
  const node = children
    ? getSlateDescendantAtPath(children, endpoint.node.path)
    : null;
  const point =
    node && getSlateBoundaryPoint(node, [...endpoint.node.path], endpoint.edge);

  return point ? rootSlatePoint(point, endpoint.node.root) : null;
};

export const createSlateViewBoundarySelectionTarget = (
  roots: Readonly<Record<string, readonly Descendant[]>>,
  selection: SlateViewBoundarySelectionTargetInput
): { ranges: Range[]; start: Point } | null => {
  if (hasAmbiguousSlateViewBoundarySegments(selection.segments)) {
    return null;
  }

  const ranges: Range[] = [];

  for (const segment of selection.segments.parts) {
    const anchor = resolveSlateViewBoundarySegmentEndpoint(
      roots,
      segment,
      segment.start
    );
    const focus = resolveSlateViewBoundarySegmentEndpoint(
      roots,
      segment,
      segment.end
    );

    if (!anchor || !focus) {
      return null;
    }

    ranges.push({ anchor, focus });
  }

  return {
    ranges,
    start: toSlateRootedViewBoundaryPoint(
      selection.segments.backward ? selection.focus : selection.anchor
    ),
  };
};
