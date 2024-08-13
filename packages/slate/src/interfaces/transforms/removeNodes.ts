import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { NodeMatchOption } from '../../types/NodeMatchOption';
import type { TEditor } from '../editor/TEditor';

export type RemoveNodesOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<Parameters<typeof Transforms.removeNodes>[1]>,
  NodeMatchOption<E>
>;

/** Remove the nodes at a specific location in the document. */
export const removeNodes = <E extends TEditor>(
  editor: E,
  options?: RemoveNodesOptions<E>
) => Transforms.removeNodes(editor as any, options as any);
