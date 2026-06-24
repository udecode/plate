import type { Operation } from '../interfaces/operation';
import type { Path } from '../interfaces/path';
import type { PathRef } from '../interfaces/path-ref';
import type { Point } from '../interfaces/point';
import type { PointRef } from '../interfaces/point-ref';
import type { Range } from '../interfaces/range';
import type { RangeRef } from '../interfaces/range-ref';

export const MAIN_ROOT_KEY = 'main';

export type RootVisibility = 'explicit' | 'implicit';

export type PointRootMeta = {
  root: string;
  visibility: RootVisibility;
};

export type RangeRootMeta = {
  anchor: PointRootMeta;
  focus: PointRootMeta;
  root: string | null;
};

export type RangeRefVisibility = 'public' | 'internal';

const PATH_REF_ROOT = new WeakMap<PathRef, string>();
const POINT_REF_ROOT = new WeakMap<PointRef, PointRootMeta>();
const RANGE_REF_ROOT = new WeakMap<RangeRef, RangeRootMeta>();
const RANGE_REF_DRAFT = new WeakMap<RangeRef, Range | null>();
const RANGE_REF_VISIBILITY = new WeakMap<RangeRef, RangeRefVisibility>();

export const getOperationRoot = (operation: Operation): string =>
  'root' in operation && typeof operation.root === 'string'
    ? operation.root
    : MAIN_ROOT_KEY;

export const getPointRoot = (
  point: Point,
  fallback = MAIN_ROOT_KEY
): PointRootMeta => ({
  root: point.root ?? fallback,
  visibility: point.root === undefined ? 'implicit' : 'explicit',
});

export const getRangeRoot = (
  range: Range,
  fallback = MAIN_ROOT_KEY
): RangeRootMeta => {
  const anchor = getPointRoot(range.anchor, fallback);
  const focus = getPointRoot(range.focus, fallback);

  return {
    anchor,
    focus,
    root: anchor.root === focus.root ? anchor.root : null,
  };
};

export const getSelectionPatchRoot = (
  patch: Partial<Range> | Range | null,
  fallback = MAIN_ROOT_KEY
): string | undefined => {
  if (!patch) {
    return;
  }

  const { anchor, focus } = patch;

  if (anchor && focus) {
    return getRangeRoot({ anchor, focus }, fallback).root ?? undefined;
  }

  return anchor?.root ?? focus?.root;
};

export const getLocationRoot = (
  location: Path | Point | Range | readonly unknown[] | undefined
): string | undefined => {
  if (!location || Array.isArray(location)) {
    return;
  }

  if ('path' in location && 'offset' in location) {
    return location.root;
  }

  if ('anchor' in location && 'focus' in location) {
    return getExplicitRangeLocationRoot(location) ?? undefined;
  }

  return;
};

const getExplicitRangeLocationRoot = (
  range: Range
): string | null | undefined => {
  const anchorRoot = range.anchor.root;
  const focusRoot = range.focus.root;

  if (anchorRoot && focusRoot && anchorRoot !== focusRoot) {
    return null;
  }

  return anchorRoot ?? focusRoot;
};

export const getCommonLocationRoot = (
  ...locations: Array<Path | Point | Range | readonly unknown[] | undefined>
): string | null | undefined => {
  let root: string | undefined;

  for (const location of locations) {
    const nextRoot =
      location &&
      !Array.isArray(location) &&
      'anchor' in location &&
      'focus' in location
        ? getExplicitRangeLocationRoot(location)
        : getLocationRoot(location);

    if (nextRoot === null) {
      return null;
    }

    if (!nextRoot) {
      continue;
    }

    if (root && root !== nextRoot) {
      return null;
    }

    root = nextRoot;
  }

  return root;
};

export const hasSelectionPatchExplicitRoot = (
  patch: Partial<Range> | Range | null
): boolean =>
  Boolean(
    patch?.anchor?.root !== undefined || patch?.focus?.root !== undefined
  );

export const getSelectionPatchInverseRoot = (
  restoredPatch: Partial<Range> | Range,
  replacedPatch: Partial<Range> | Range | null,
  fallback = MAIN_ROOT_KEY
): string | undefined => {
  if (
    !hasSelectionPatchExplicitRoot(restoredPatch) &&
    hasSelectionPatchExplicitRoot(replacedPatch)
  ) {
    return getSelectionPatchRoot(restoredPatch);
  }

  return getSelectionPatchRoot(restoredPatch, fallback);
};

export const withImplicitPointRoot = (point: Point, root: string): Point =>
  point.root === undefined ? { ...point, root } : point;

export const withImplicitRangeRoot = (range: Range, root: string): Range => ({
  anchor: withImplicitPointRoot(range.anchor, root),
  focus: withImplicitPointRoot(range.focus, root),
});

export const stripImplicitPointRoot = (
  point: Point,
  meta: PointRootMeta
): Point => {
  if (meta.visibility === 'explicit' || point.root === undefined) {
    return point;
  }

  const { root: _root, ...pointWithoutRoot } = point;

  return pointWithoutRoot;
};

export const stripImplicitRangeRoots = (
  range: Range,
  meta: RangeRootMeta
): Range => ({
  anchor: stripImplicitPointRoot(range.anchor, meta.anchor),
  focus: stripImplicitPointRoot(range.focus, meta.focus),
});

export const stripLocationRoots = <TLocation extends Path | Point | Range>(
  location: TLocation
): TLocation => {
  if (Array.isArray(location)) {
    return location;
  }

  if ('path' in location && 'offset' in location) {
    const { root: _root, ...point } = location;

    return point as TLocation;
  }

  return {
    anchor: stripLocationRoots(location.anchor),
    focus: stripLocationRoots(location.focus),
  } as TLocation;
};

export const setPathRefRoot = (ref: PathRef, root: string) => {
  PATH_REF_ROOT.set(ref, root);
};

export const getPathRefRoot = (ref: PathRef): string =>
  PATH_REF_ROOT.get(ref) ?? MAIN_ROOT_KEY;

export const setPointRefRootMeta = (ref: PointRef, meta: PointRootMeta) => {
  POINT_REF_ROOT.set(ref, meta);
};

export const getPointRefRootMeta = (ref: PointRef) => POINT_REF_ROOT.get(ref);

export const setRangeRefRootMeta = (ref: RangeRef, meta: RangeRootMeta) => {
  RANGE_REF_ROOT.set(ref, meta);
};

export const getRangeRefRootMeta = (ref: RangeRef) => RANGE_REF_ROOT.get(ref);

export const setRangeRefDraftCurrent = (ref: RangeRef, range: Range | null) => {
  RANGE_REF_DRAFT.set(ref, range);
};

export const getRangeRefDraftCurrent = (ref: RangeRef) =>
  RANGE_REF_DRAFT.get(ref);

export const hasRangeRefDraftCurrent = (ref: RangeRef) =>
  RANGE_REF_DRAFT.has(ref);

export const clearRangeRefDraftCurrent = (ref: RangeRef) => {
  RANGE_REF_DRAFT.delete(ref);
};

export const setRangeRefVisibility = (
  ref: RangeRef,
  visibility: RangeRefVisibility
) => {
  RANGE_REF_VISIBILITY.set(ref, visibility);
};

export const getRangeRefVisibility = (ref: RangeRef): RangeRefVisibility =>
  RANGE_REF_VISIBILITY.get(ref) ?? 'public';
