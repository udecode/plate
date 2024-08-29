import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { NodeMatchOption } from '../../types/NodeMatchOption';
import type { TEditor } from '../editor/TEditor';
import type { ElementOf } from '../element/TElement';

import { unhangRange } from '../editor/unhangRange';

export type WrapNodesOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<Parameters<typeof Transforms.wrapNodes>[2]>,
  NodeMatchOption<E>
>;

/**
 * Wrap the nodes at a location in a new container node, splitting the edges of
 * the range first to ensure that only the content in the range is wrapped.
 */
export const wrapNodes = <N extends ElementOf<E>, E extends TEditor = TEditor>(
  editor: E,
  element: N,
  options?: WrapNodesOptions<E>
) => {
  unhangRange(editor, options?.at, options);

  Transforms.wrapNodes(editor as any, element as any, options as any);
};
