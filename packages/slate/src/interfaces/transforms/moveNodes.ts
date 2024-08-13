import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { NodeMatchOption } from '../../types/NodeMatchOption';
import type { TEditor } from '../editor/TEditor';

export type MoveNodesOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<Parameters<typeof Transforms.moveNodes>[1]>,
  NodeMatchOption<E>
>;

/** Move the nodes at a location to a new location. */
export const moveNodes = <E extends TEditor>(
  editor: E,
  options?: MoveNodesOptions<E>
) => Transforms.moveNodes(editor as any, options as any);
