import { Ancestor, Editor, NodeEntry, Transforms } from 'slate';
import { getText } from '../../../common';

export interface IndentCodeBlockLineOptions {
  codeBlock: NodeEntry<Ancestor>;
  codeBlockLineItem: NodeEntry<Ancestor>;
}

export const indentCodeBlockLine = (
  editor: Editor,
  { codeBlockLineItem }: IndentCodeBlockLineOptions
) => {
  const [, codeBlockLinePath] = codeBlockLineItem;
  const text = getText(editor, codeBlockLinePath);
  Transforms.insertText(editor, `  ${text}`, { at: codeBlockLinePath });
};
