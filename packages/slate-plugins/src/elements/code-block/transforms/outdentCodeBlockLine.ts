import { Ancestor, Editor, NodeEntry, Transforms } from 'slate';
import { getText } from '../../../common';

export interface OutdentCodeBlockLineOptions {
  codeBlock: NodeEntry<Ancestor>;
  codeBlockLineItem: NodeEntry<Ancestor>;
}

export const outdentCodeBlockLine = (
  editor: Editor,
  { codeBlockLineItem }: OutdentCodeBlockLineOptions
) => {
  const [, codeBlockLinePath] = codeBlockLineItem;
  const text = getText(editor, codeBlockLinePath);
  if (text.substring(0, 2) === `  `) {
    Transforms.insertText(editor, text.substring(2), { at: codeBlockLinePath });
  } else if (text.substring(0, 1) === ` `) {
    Transforms.insertText(editor, text.substring(1), { at: codeBlockLinePath });
  }
};
