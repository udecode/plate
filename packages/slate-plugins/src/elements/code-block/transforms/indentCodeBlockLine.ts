import { Ancestor, Editor, NodeEntry, Transforms } from 'slate';

export interface IndentCodeBlockLineOptions {
  codeBlock: NodeEntry<Ancestor>;
  codeBlockLineItem: NodeEntry<Ancestor>;
}

export const indentCodeBlockLine = (
  editor: Editor,
  { codeBlockLineItem }: IndentCodeBlockLineOptions
) => {
  const [, codeBlockLinePath] = codeBlockLineItem;
  const codeBlockLineStart = Editor.start(editor, codeBlockLinePath);
  Transforms.insertText(editor, '  ', { at: codeBlockLineStart });
};
