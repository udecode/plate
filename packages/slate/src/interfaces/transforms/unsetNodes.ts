import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { NodeMatchOption } from '../../types/NodeMatchOption';
import type { TEditor } from '../editor/TEditor';
import type { NodeOf, TNodeProps } from '../node/TNode';

export type UnsetNodesOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<Parameters<typeof Transforms.unsetNodes>[2]>,
  NodeMatchOption<E>
>;

/** Unset properties on the nodes at a location. */
export const unsetNodes = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  props: (keyof TNodeProps<N>)[] | keyof TNodeProps<N>,
  options?: UnsetNodesOptions<E>
) => {
  return Transforms.unsetNodes(editor as any, props as any, options as any);
};
