import type { NamedRootKey, RootKey } from '../interfaces/editor';
import type { Location, Span } from '../interfaces/location';
import { RangeApi } from '../interfaces/range';
import {
  getCommonLocationRoot,
  MAIN_ROOT_KEY,
} from '../internal/root-location';

export { MAIN_ROOT_KEY } from '../internal/root-location';

export const assertPublicRootKey = (root: string | undefined) => {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('[Plite] Omit root to target the primary document.');
  }
};

export const assertPublicLocationRoot = (
  location: Location | Span | undefined
) => {
  if (!location || Array.isArray(location)) {
    return;
  }

  if ('path' in location && 'offset' in location) {
    assertPublicRootKey(location.root);
    return;
  }

  if ('anchor' in location && 'focus' in location) {
    assertPublicRootKey(location.anchor.root);
    assertPublicRootKey(location.focus.root);
  }
};

export const getReadLocationRoot = (
  ...locations: Array<Location | Span | undefined>
) => {
  for (const location of locations) {
    assertPublicLocationRoot(location);
  }

  const root = getCommonLocationRoot(...locations);

  if (root === null) {
    throw new Error('Cannot read a Plite location across multiple roots.');
  }

  return root;
};

export const usesImplicitSelectionLocation = (
  options: { at?: Location | Span } | undefined
) => options?.at === undefined;

export const getExplicitRangeRoot = (value: unknown): string | undefined => {
  if (!RangeApi.isRange(value)) {
    return undefined;
  }

  const anchorRoot = value.anchor.root;
  const focusRoot = value.focus.root;

  if (anchorRoot && focusRoot && anchorRoot !== focusRoot) {
    return undefined;
  }

  return anchorRoot ?? focusRoot;
};

export const getPublicExplicitRangeRoot = (
  value: unknown
): string | undefined => {
  if (!RangeApi.isRange(value)) {
    return undefined;
  }

  const anchorRoot = value.anchor.root;
  const focusRoot = value.focus.root;

  assertPublicRootKey(anchorRoot);
  assertPublicRootKey(focusRoot);

  if (anchorRoot && focusRoot && anchorRoot !== focusRoot) {
    throw new Error('Cannot target multiple editor roots in one range.');
  }

  const root = anchorRoot ?? focusRoot;

  return root;
};

export const getPublicExplicitLocationRoot = (
  location: Location | undefined
): string | undefined => {
  if (!location || Array.isArray(location)) {
    return undefined;
  }

  if ('path' in location && 'offset' in location) {
    const root = typeof location.root === 'string' ? location.root : undefined;
    assertPublicRootKey(root);

    return root;
  }

  return getPublicExplicitRangeRoot(location);
};

export const requireMutableRoot = (root: RootKey) => {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('Cannot mutate the primary editor root through tx.roots.');
  }
};

/** Project an internal root without exposing the primary-root sentinel. */
export const toPublicRoot = (root: RootKey): NamedRootKey | undefined =>
  root === MAIN_ROOT_KEY ? undefined : root;

/** Normalize a public root option into the private runtime root key. */
export const toInternalRoot = (root: RootKey | undefined): RootKey => {
  assertPublicRootKey(root);

  return root ?? MAIN_ROOT_KEY;
};
