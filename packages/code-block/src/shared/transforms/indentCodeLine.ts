import {
  getEditorString,
  getRange,
  getStartPoint,
  insertText,
  isExpanded,
  TEditor,
  TElementEntry,
  Value,
} from '@udecode/plate-common/server';

export interface IndentCodeLineOptions {
  codeBlock: TElementEntry;
  codeLine: TElementEntry;
  indentDepth?: number;
}

/**
 * Indent if:
 * - the selection is expanded OR
 * - there are no non-whitespace characters left of the cursor
 * Indentation = 2 spaces.
 */
export const indentCodeLine = <V extends Value>(
  editor: TEditor<V>,
  { codeLine, indentDepth = 2 }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = getStartPoint(editor, codeLinePath);
  const indent = ' '.repeat(indentDepth);

  if (!isExpanded(editor.selection)) {
    const cursor = editor.selection?.anchor;
    const range = getRange(editor, codeLineStart, cursor);
    const text = getEditorString(editor, range);

    if (/\S/.test(text)) {
      insertText(editor, indent, { at: editor.selection! });
      return;
    }
  }

  insertText(editor, indent, { at: codeLineStart });
};
