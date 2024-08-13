import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { NodeMatchOption } from '../../types/NodeMatchOption';
import type { TEditor } from '../editor/TEditor';

export type LiftNodesOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<Parameters<typeof Transforms.liftNodes>[1]>,
  NodeMatchOption<E>
>;

/**
 * Lift nodes at a specific location upwards in the document tree, splitting
 * their parent in two if necessary.
 */
export const liftNodes = <E extends TEditor>(
  editor: E,
  options?: LiftNodesOptions<E>
) => Transforms.liftNodes(editor as any, options as any);
