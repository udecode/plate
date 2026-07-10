import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction, ElementEntry } from '@platejs/plite';

const nonWhitespaceRegex = /\S/;

export type IndentCodeLineOptions = {
  codeBlock: ElementEntry;
  codeLine: ElementEntry;
  indentDepth?: number;
};

/**
 * Indent if:
 *
 * - The selection is expanded OR
 * - There are no non-whitespace characters left of the cursor Indentation = 2
 *   spaces.
 */
export const indentCodeLine = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { codeLine, indentDepth = 2 }: IndentCodeLineOptions
) => {
  const codeLineStart = editor.read.points.start(codeLine[0]);

  if (!codeLineStart) return;

  const indent = ' '.repeat(indentDepth);

  if (!editor.read.selection.isExpanded()) {
    const selection = editor.read.selection();
    const cursor = selection?.anchor;
    const range = cursor && editor.read.ranges.get(codeLineStart, cursor);
    const text = range ? editor.read.text.string(range) : '';

    if (nonWhitespaceRegex.test(text)) {
      if (selection) {
        tx.text.insert(indent, { at: selection });
      }

      return;
    }
  }

  tx.text.insert(indent, { at: codeLineStart });
};
