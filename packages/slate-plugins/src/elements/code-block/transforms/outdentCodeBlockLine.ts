import { Ancestor, Editor, NodeEntry } from 'slate';
import { deleteStartSpace } from './deleteStartSpace';

export interface OutdentCodeBlockLineOptions {
  codeBlock: NodeEntry<Ancestor>;
  codeBlockLineItem: NodeEntry<Ancestor>;
}

export const outdentCodeBlockLine = (
  editor: Editor,
  { codeBlock, codeBlockLineItem }: OutdentCodeBlockLineOptions
) => {
  const deleted = deleteStartSpace(editor, { codeBlock, codeBlockLineItem });
  deleted && deleteStartSpace(editor, { codeBlock, codeBlockLineItem });
};
