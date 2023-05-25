import { Modify } from '@udecode/utils';
import { Path, Transforms } from 'slate';
import { NodeMatchOption } from '../../types/NodeMatchOption';
import { getAboveNode, getEndPoint } from '../editor';
import { TEditor, Value } from '../editor/TEditor';
import { EElementOrText } from '../element/TElement';

export type InsertNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.insertNodes>[2]>,
  NodeMatchOption<V>
> & {
  nextBlock?: boolean;
};

/**
 * Insert nodes at a specific location in the Editor.
 */
export const insertNodes = <
  N extends EElementOrText<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  nodes: N | N[],
  options?: InsertNodesOptions<V>
) => {
  if (options?.nextBlock) {
    const at = options?.at || editor.selection;
    if (at) {
      const endPoint = getEndPoint(editor, at);
      const blockEntry = getAboveNode(editor, {
        at: endPoint,
        block: true,
      });
      if (blockEntry) {
        const nextPath = Path.next(blockEntry[1]);
        options.at = nextPath;
      }
    }
  }

  Transforms.insertNodes(editor as any, nodes, options as any);
};
