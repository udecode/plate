import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { NodeMatchOption } from '../../types/NodeMatchOption';
import type { TEditor } from '../editor/TEditor';
import type { NodeOf, TNodeProps } from '../node/TNode';

export type SetNodesOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<Parameters<typeof Transforms.setNodes>[2]>,
  NodeMatchOption<E>
>;

/** Set new properties on the nodes at a location. */
export const setNodes = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  props: Partial<TNodeProps<N>>,
  options?: SetNodesOptions<E>
) => Transforms.setNodes(editor as any, props, options as any);
