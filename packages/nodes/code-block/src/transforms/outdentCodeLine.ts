import { TEditor, TNodeEntry } from '@udecode/plate-core';
import { Ancestor, Node } from 'slate';
import { deleteStartSpace } from './deleteStartSpace';

export interface OutdentCodeLineOptions {
  codeBlock: TNodeEntry<Ancestor>;
  codeLine: TNodeEntry<Ancestor | Node>;
}

/**
 * Outdent the code line.
 * Remove 2 whitespace characters if any.
 */
export const outdentCodeLine = (
  editor: TEditor,
  { codeBlock, codeLine }: OutdentCodeLineOptions
) => {
  const deleted = deleteStartSpace(editor, { codeBlock, codeLine });
  deleted && deleteStartSpace(editor, { codeBlock, codeLine });
};
