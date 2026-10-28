import {
  type DocumentIndex,
  rootIndexOf,
} from '../../core/change/document-index';
import type { JsonEditorValue } from '../../core/change/tokens';

/** A stored value's content roots, main first, each as its index. */
export type Roots = ReadonlyMap<string, DocumentIndex>;

/** @internal */
export const rootOf = (value: JsonEditorValue, root: string) =>
  root === 'main'
    ? rootIndexOf(value, 'children')
    : rootIndexOf(
        (value.roots ?? {}) as Readonly<Record<string, readonly never[]>>,
        root
      );

/** @internal */
export const contentRootsOf = (value: JsonEditorValue): Roots =>
  new Map(
    ['main', ...Object.keys(value.roots ?? {})].map(
      (root) => [root, rootOf(value, root)] as const
    )
  );

/** @internal */
export const sameRoots = (left: Roots, right: Roots) =>
  left.size === right.size &&
  [...left].every(([root, index]) => right.get(root) === index);
