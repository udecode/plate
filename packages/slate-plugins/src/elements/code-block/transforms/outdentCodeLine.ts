import { Ancestor, Editor, Node, NodeEntry } from 'slate';
import { deleteStartSpace } from './deleteStartSpace';

export interface OutdentCodeLineOptions {
  codeBlock: NodeEntry<Ancestor>;
  codeLine: NodeEntry<Ancestor | Node>;
}

/**
 * Outdent the code line.
 * Remove 2 whitespace characters if any.
 */
export const outdentCodeLine = (
  editor: Editor,
  { codeBlock, codeLine }: OutdentCodeLineOptions
) => {
  const deleted = deleteStartSpace(editor, { codeBlock, codeLine });
  deleted && deleteStartSpace(editor, { codeBlock, codeLine });
};
