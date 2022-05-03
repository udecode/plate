import { isExpanded, TEditor, TNodeEntry } from '@udecode/plate-core';
import { Ancestor, Editor, Node, Transforms } from 'slate';

export interface IndentCodeLineOptions {
  codeBlock: TNodeEntry<Ancestor>;
  codeLine: TNodeEntry<Ancestor | Node>;
}

/**
 * Indent if:
 * - the selection is expanded
 * - the selected code line has no whitespace character
 * Indentation = 2 spaces.
 */
export const indentCodeLine = (
  editor: TEditor,
  { codeLine }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = Editor.start(editor, codeLinePath);
  if (!isExpanded(editor.selection)) {
    const cursor = editor.selection?.anchor;
    const range = Editor.range(editor, codeLineStart, cursor);
    const text = Editor.string(editor, range);

    if (/\S/.test(text)) {
      Transforms.insertText(editor, '  ', { at: editor.selection! });
      return;
    }
  }

  Transforms.insertText(editor, '  ', { at: codeLineStart });
};
