import { Modify } from '@udecode/utils';
import { Transforms } from 'slate';

import { NodeMatchOption } from '../../types/NodeMatchOption';
import { TEditor, Value } from '../editor/TEditor';

export type LiftNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.liftNodes>[1]>,
  NodeMatchOption<V>
>;

/**
 * Lift nodes at a specific location upwards in the document tree, splitting
 * their parent in two if necessary.
 */
export const liftNodes = <V extends Value>(
  editor: TEditor<V>,
  options?: LiftNodesOptions<V>
) => Transforms.liftNodes(editor as any, options as any);
