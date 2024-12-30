import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../editor/TEditor';
import type { ElementOf } from '../element/TElement';

import { getQueryOptions } from '../../utils';
import { unhangRange } from '../editor/unhangRange';

export type WrapNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.wrapNodes>[2]>,
  QueryOptions<V> &
    QueryMode &
    QueryVoids & {
      /**
       * Indicates that it's okay to split a node in order to wrap the location.
       * For example, if `ipsum` was selected in a `Text` node with `lorem ipsum
       * dolar`, `split: true` would wrap the word `ipsum` only, resulting in
       * splitting the `Text` node. If `split: false`, the entire `Text` node
       * `lorem ipsum dolar` would be wrapped.
       */
      split?: boolean;
    }
>;

export const wrapNodes = <N extends ElementOf<E>, E extends TEditor = TEditor>(
  editor: E,
  element: N,
  options?: WrapNodesOptions<ValueOf<E>>
) => {
  options = getQueryOptions(editor, options);

  if (options?.at) {
    unhangRange(editor, options.at as any, options);
  }

  Transforms.wrapNodes(editor as any, element as any, options as any);
};
