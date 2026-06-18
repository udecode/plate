import type { RootKey, Value } from '../interfaces/editor';
import type { Location, Span } from '../interfaces/location';
import type { Descendant, DescendantIn } from '../interfaces/node';
import type { Operation } from '../interfaces/operation';
import { RangeApi } from '../interfaces/range';
import {
  getCommonLocationRoot,
  MAIN_ROOT_KEY,
} from '../internal/root-location';
import { cloneValue } from './clone';

export { MAIN_ROOT_KEY } from '../internal/root-location';

export const assertPublicRootKey = (root: string | undefined) => {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('[Slate] Omit root to target the primary document.');
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
    throw new Error('Cannot read a Slate location across multiple roots.');
  }

  return root;
};

export const usesImplicitSelectionLocation = (
  options: { at?: Location | Span } | undefined
) => options?.at === undefined;

export const getExplicitRangeRoot = (value: unknown): string | undefined => {
  if (!RangeApi.isRange(value)) {
    return;
  }

  const anchorRoot = value.anchor.root;
  const focusRoot = value.focus.root;

  if (anchorRoot && focusRoot && anchorRoot !== focusRoot) {
    return;
  }

  return anchorRoot ?? focusRoot;
};

export const getPublicExplicitRangeRoot = (
  value: unknown
): string | undefined => {
  if (!RangeApi.isRange(value)) {
    return;
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
    return;
  }

  if ('path' in location && 'offset' in location) {
    const root = typeof location.root === 'string' ? location.root : undefined;
    assertPublicRootKey(root);

    return root;
  }

  return getPublicExplicitRangeRoot(location);
};

export const toPublicCommitOperation = (operation: Operation): Operation => {
  if (!('root' in operation) || operation.root !== MAIN_ROOT_KEY) {
    return operation;
  }

  const {
    root: _root,
    rootIsPresent: _rootIsPresent,
    rootWasPresent: _rootWasPresent,
    ...rest
  } = operation as Operation & {
    root?: RootKey;
    rootIsPresent?: boolean;
    rootWasPresent?: boolean;
  };

  return rest as Operation;
};

export const freezePublicCommitOperations = (
  operations: readonly Operation[]
): readonly Operation[] =>
  Object.freeze(operations.map(toPublicCommitOperation));

export const createRootReplaceChildrenOperation = <V extends Value>(
  root: RootKey,
  children: readonly Descendant[],
  newChildren: readonly Descendant[],
  options: {
    rootIsPresent: boolean;
    rootWasPresent: boolean;
  }
): Extract<Operation<V>, { type: 'replace_children' }> => ({
  children: cloneValue([...children]) as DescendantIn<V>[],
  index: 0,
  newChildren: cloneValue([...newChildren]) as DescendantIn<V>[],
  newSelection: null,
  path: [],
  root,
  rootIsPresent: options.rootIsPresent,
  rootWasPresent: options.rootWasPresent,
  selection: null,
  type: 'replace_children',
});

export const requireMutableRoot = (root: RootKey) => {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('Cannot mutate the primary editor root through tx.roots.');
  }
};

export const getPublicRootReadKey = (root: RootKey | undefined): RootKey => {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('Cannot read the primary editor root by key. Omit root.');
  }

  return root ?? MAIN_ROOT_KEY;
};
