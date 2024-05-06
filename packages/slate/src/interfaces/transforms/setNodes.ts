import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { NodeMatchOption } from '../../types/NodeMatchOption';
import type { TEditor, Value } from '../editor/TEditor';
import type { ENode, TNodeProps } from '../node/TNode';

export type SetNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.setNodes>[2]>,
  NodeMatchOption<V>
>;

/** Set new properties on the nodes at a location. */
export const setNodes = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  props: Partial<TNodeProps<N>>,
  options?: SetNodesOptions<V>
) => Transforms.setNodes(editor as any, props, options as any);
