import {
  getEditorString,
  getRange,
  getStartPoint,
  insertText,
  isExpanded,
  TEditor,
  TElementEntry,
  Value,
} from '@udecode/plate-core';

export interface IndentCodeLineOptions {
  codeBlock: TElementEntry;
  codeLine: TElementEntry;
}

/**
 * Indent if:
 * - the selection is expanded
 * - the selected code line has no whitespace character
 * Indentation = 2 spaces.
 */
export const indentCodeLine = <V extends Value>(
  editor: TEditor<V>,
  { codeLine }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = getStartPoint(editor, codeLinePath);
  if (!isExpanded(editor.selection)) {
    const cursor = editor.selection?.anchor;
    const range = getRange(editor, codeLineStart, cursor);
    const text = getEditorString(editor, range);

    if (/\S/.test(text)) {
      insertText(editor, '  ', { at: editor.selection! });
      return;
    }
  }

  insertText(editor, '  ', { at: codeLineStart });
};
