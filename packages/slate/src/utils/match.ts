import { isBlock } from '../interfaces/editor/isBlock';
import { TEditor, Value } from '../interfaces/editor/TEditor';
import { ENode, TNode } from '../interfaces/node/TNode';
import { TPath } from '../types/interfaces';

export type PredicateObj = Record<string, any | any[]>;
export type PredicateFn<T extends TNode> = (obj: T, path: TPath) => boolean;
export type Predicate<T extends TNode> = PredicateObj | PredicateFn<T>;

function castArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Match the object with a predicate object or function.
 * If predicate is:
 * - object: every predicate key/value should be in obj.
 * - function: it should return true.
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
 * - `match` can be an object predicate where one of the values should include the node value.
 * Example: { type: ['1', '2'] } will match the nodes having one of these 2 types.
 */
export const getQueryOptions = <V extends Value>(
  editor: TEditor<V>,
  options: any = {}
) => {
  const { match: _match, block } = options;

  return {
    ...options,
    match:
      _match || block
        ? (n: ENode<V>, path: TPath) =>
            match(n, path, _match) && (!block || isBlock(editor, n))
        : undefined,
  };
};

export type ENodeMatch<N extends TNode> = Predicate<N>;

export interface ENodeMatchOptions<V extends Value = Value> {
  match?: ENodeMatch<ENode<V>>;
  block?: boolean;
}
