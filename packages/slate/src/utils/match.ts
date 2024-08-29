import type { TEditor } from '../interfaces/editor/TEditor';
import type { NodeOf, TNode } from '../interfaces/node/TNode';
import type { TPath } from '../types/interfaces';

import { isBlock } from '../interfaces/editor/isBlock';

export type PredicateObj = Record<string, any | any[]>;

export type PredicateFn<T extends TNode> = (obj: T, path: TPath) => boolean;

export type Predicate<T extends TNode> = PredicateFn<T> | PredicateObj;

function castArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Match the object with a predicate object or function. If predicate is:
 *
 * - Object: every predicate key/value should be in obj.
 * - Function: it should return true.
 */
export const match = <T extends TNode>(
  obj: T,
  path: TPath,
  predicate?: Predicate<T>
): boolean => {
  if (!predicate) return true;
  if (typeof predicate === 'object') {
    return Object.entries(predicate).every(([key, value]) => {
      const values = castArray<any>(value);

      return values.includes(obj[key]);
    });
  }

  return predicate(obj, path);
};

/**
 * Extended query options for slate queries:
 *
 * - `match` can be an object predicate where one of the values should include the
 *   node value. Example: { type: ['1', '2'] } will match the nodes having one
 *   of these 2 types.
 */
export const getQueryOptions = <E extends TEditor>(
  editor: E,
  options: any = {}
) => {
  const { block, match: _match } = options;

  return {
    ...options,
    match:
      _match || block
        ? (n: NodeOf<E>, path: TPath) =>
            match(n, path, _match) && (!block || isBlock(editor, n))
        : undefined,
  };
};

export type ENodeMatch<N extends TNode> = Predicate<N>;

export interface ENodeMatchOptions<E extends TEditor = TEditor> {
  block?: boolean;
  match?: ENodeMatch<NodeOf<E>>;
}
