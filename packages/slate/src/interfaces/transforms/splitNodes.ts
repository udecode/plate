import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { NodeMatchOption } from '../../types/NodeMatchOption';
import type { TEditor } from '../editor/TEditor';

export type SplitNodesOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<Parameters<typeof Transforms.splitNodes>[1]>,
  NodeMatchOption<E>
>;

/** Split the nodes at a specific location. */
export const splitNodes = <E extends TEditor>(
  editor: E,
  options?: SplitNodesOptions<E>
) => Transforms.splitNodes(editor as any, options as any);
