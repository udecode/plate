import { Ancestor, Editor, NodeEntry, Transforms } from 'slate';
import { getText } from '../../../common';
import { deleteStartSpace } from './deleteStartSpace';

export interface OutdentCodeBlockLineOptions {
  codeBlock: NodeEntry<Ancestor>;
  codeBlockLineItem: NodeEntry<Ancestor>;
}

export const outdentCodeBlockLine = (
  editor: Editor,
  { codeBlock, codeBlockLineItem }: OutdentCodeBlockLineOptions
) => {
  const [, codeBlockLinePath] = codeBlockLineItem;
  const deleted = deleteStartSpace(editor, {codeBlock, codeBlockLineItem});
  deleted && deleteStartSpace(editor, {codeBlock, codeBlockLineItem});
  const text = getText(editor, codeBlockLinePath);
  }
};
