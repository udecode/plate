import {
  type Descendant,
  NodeApi,
  type Path,
  type Point,
  type Range,
  type RootKey,
} from '@platejs/plite';

import {
  createPliteProjectionGraph,
  getPliteProjectionOwnerKey,
  type PliteProjectedPoint,
  PliteProjectionGraph,
  type PliteProjectionGraphModel,
  type PliteProjectionGraphNodeInput,
  type PliteProjectionGraphRangeEndpoint,
  type PliteProjectionGraphRangeSegment,
  type PliteProjectionGraphRangeSegments,
  type PliteProjectionOwner,
} from './projection-graph';
import { getPointRoot, MAIN_ROOT_KEY } from './root-key';

export type PliteViewBoundaryOwner = PliteProjectionOwner;
export type PliteViewBoundaryGraphNodeInput = PliteProjectionGraphNodeInput;
export type PliteViewBoundaryGraphModel = PliteProjectionGraphModel;
export type PliteViewBoundaryPoint = PliteProjectedPoint;
export type PliteViewBoundaryRangeEndpoint = PliteProjectionGraphRangeEndpoint;
export type PliteViewBoundaryRangeSegment = PliteProjectionGraphRangeSegment;
export type PliteViewBoundaryRangeSegments = PliteProjectionGraphRangeSegments;

export type PliteViewBoundarySelectionTargetInput = Readonly<{
  anchor: PliteViewBoundaryPoint;
  focus: PliteViewBoundaryPoint;
  segments: PliteViewBoundaryRangeSegments;
}>;

export const createPliteViewBoundaryGraph = createPliteProjectionGraph;
export const getPliteViewBoundaryOwnerKey = getPliteProjectionOwnerKey;
export const PliteViewBoundaryGraph = PliteProjectionGraph;

export const createPliteViewBoundaryRootMap = (value: {
  children: readonly Descendant[];
  roots?: Readonly<Record<string, readonly Descendant[]>>;
}): Readonly<Record<string, readonly Descendant[]>> => ({
  [MAIN_ROOT_KEY]: value.children,
  ...(value.roots ?? {}),
});

export const clonePliteViewBoundaryPath = (path: Path): Path =>
  [...path] as Path;

export const clonePliteViewBoundaryPoint = (point: Point): Point =>
  Object.freeze({
    ...(point.root ? { root: point.root } : {}),
    offset: point.offset,
    path: Object.freeze(clonePliteViewBoundaryPath(point.path)) as Path,
  }) as Point;

export const clonePliteViewBoundaryOwner = (
  owner: PliteViewBoundaryOwner | null | undefined
): PliteViewBoundaryOwner | null =>
  owner
    ? Object.freeze({
        childRoot: owner.childRoot,
        ownerPath: Object.freeze(
          clonePliteViewBoundaryPath(owner.ownerPath)
        ) as Path,
        ownerRoot: owner.ownerRoot,
      })
    : null;

export const clonePliteViewBoundaryProjectedPoint = (
  point: PliteViewBoundaryPoint
): PliteViewBoundaryPoint =>
  Object.freeze({
    ...(point.owner ? { owner: clonePliteViewBoundaryOwner(point.owner) } : {}),
    point: clonePliteViewBoundaryPoint(point.point),
  });

export const rootPlitePoint = (point: Point, root: RootKey): Point => ({
  ...(root === MAIN_ROOT_KEY ? {} : { root }),
  offset: point.offset,
  path: [...point.path],
});

export const getPlitePointRoot = (
  point: Point,
  fallbackRoot: RootKey = MAIN_ROOT_KEY
): RootKey => getPointRoot(point, fallbackRoot);

export const getPliteViewBoundaryPointRoot = (
  point: PliteViewBoundaryPoint
): RootKey => getPlitePointRoot(point.point, point.owner?.childRoot);

export const toPliteRootedViewBoundaryPoint = (
  point: PliteViewBoundaryPoint
): Point => rootPlitePoint(point.point, getPliteViewBoundaryPointRoot(point));

export const samePliteRootPoint = (
  left: Point,
  right: Point,
  root: RootKey
): boolean =>
  getPlitePointRoot(left, root) === getPlitePointRoot(right, root) &&
  left.offset === right.offset &&
  left.path.length === right.path.length &&
  left.path.every((value, index) => value === right.path[index]);

export const getPliteDescendantAtPath = (
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

export const getPliteBoundaryPoint = (
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
      child && getPliteBoundaryPoint(child, path.concat(index), edge);

    if (point) {
      return point;
    }
  }

  return null;
};

export const getPliteRootBoundaryPoint = (
  children: readonly Descendant[],
  edge: 'end' | 'start'
): Point | null => {
  const indexes =
    edge === 'start' ? children.keys() : [...children.keys()].reverse();

  for (const index of indexes) {
    const child = children[index];
    const point = child && getPliteBoundaryPoint(child, [index], edge);

    if (point) {
      return point;
    }
  }

  return null;
};

export const hasAmbiguousPliteViewBoundarySegments = (
  segments: PliteViewBoundaryRangeSegments
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

export const resolvePliteViewBoundarySegmentEndpoint = (
  roots: Readonly<Record<string, readonly Descendant[]>>,
  segment: PliteViewBoundaryRangeSegment,
  endpoint: PliteProjectionGraphRangeEndpoint
): Point | null => {
  if (endpoint.kind === 'point') {
    return rootPlitePoint(endpoint.point, segment.root);
  }

  const children = roots[endpoint.node.root];
  const node = children
    ? getPliteDescendantAtPath(children, endpoint.node.path)
    : null;
  const point =
    node && getPliteBoundaryPoint(node, [...endpoint.node.path], endpoint.edge);

  return point ? rootPlitePoint(point, endpoint.node.root) : null;
};

export const createPliteViewBoundarySelectionTarget = (
  roots: Readonly<Record<string, readonly Descendant[]>>,
  selection: PliteViewBoundarySelectionTargetInput
): { ranges: Range[]; start: Point } | null => {
  if (hasAmbiguousPliteViewBoundarySegments(selection.segments)) {
    return null;
  }

  const ranges: Range[] = [];

  for (const segment of selection.segments.parts) {
    const anchor = resolvePliteViewBoundarySegmentEndpoint(
      roots,
      segment,
      segment.start
    );
    const focus = resolvePliteViewBoundarySegmentEndpoint(
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
    start: toPliteRootedViewBoundaryPoint(
      selection.segments.backward ? selection.focus : selection.anchor
    ),
  };
};
