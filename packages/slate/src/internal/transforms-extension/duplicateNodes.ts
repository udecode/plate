import {
  type DuplicateNodesOptions,
  type Editor,
  PathApi,
} from '../../interfaces';
import { getAt } from '../../utils';

export const duplicateNodes = (
  editor: Editor,
  { block, nodes, ...options }: DuplicateNodesOptions = {}
) => {
  const at = getAt(editor, options.at) ?? editor.selection;

  if (!nodes || !at) return;

  // Use provided nodes or get blocks if block=true
  const entries = nodes ?? (block ? editor.api.blocks({ at }) : []);

  if (entries.length === 0) return;

  const lastEntry = entries.at(-1)!;
  const insertPath = PathApi.next(lastEntry[1]);
  const nodesToInsert = entries.map(([node]) => node);

  editor.tf.insertNodes(nodesToInsert as any, {
    at: insertPath,
    ...options,
  });
};
