import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';

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
