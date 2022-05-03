import { castArray } from 'lodash';
import { isBlock } from '../../slate/editor/isBlock';
import { TEditor, Value } from '../../slate/types/TEditor';
import { TNode } from '../../slate/types/TNode';
import { AnyObject } from '../types/utility/AnyObject';

export type PredicateObj<T extends TNode> = Partial<T> & AnyObject;
export type PredicateFn<T extends TNode> = (obj: T) => boolean;
export type Predicate<T extends TNode> = PredicateObj<T> | PredicateFn<T>;

/**
 * Match the object with a predicate object or function.
 * If predicate is:
 * - object: every predicate key/value should be in obj.
 * - function: it should return true.
 */
export const match = <T extends TNode>(
  obj: T,
  predicate?: Predicate<T>
): boolean => {
  if (!predicate) return true;

  if (typeof predicate === 'object') {
    return Object.entries(predicate).every(([key, value]) => {
      const values = castArray<any>(value);

      return values.includes(obj[key]);
    });
  }

  return predicate(obj);
};

export const matchPredicate = <T extends TNode>(predicate?: Predicate<T>) => (
  obj: T
) => match(obj, predicate);

/**
 * Extended query options for slate queries:
 * - `match` can be an object predicate where one of the values should include the node value.
 * Example: { type: ['1', '2'] } will match the nodes having one of these 2 types.
 */
export const getQueryOptions = <V extends Value, T extends TNode>(
  editor: TEditor<V>,
  options: any
) => {
  return {
    ...options,
    match: (n: T) =>
      match<T>(n, options.match) && (!options?.block || isBlock(editor, n)),
  };
};
