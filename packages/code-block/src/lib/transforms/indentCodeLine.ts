import type { Editor, ElementEntry } from '@udecode/plate';

export interface IndentCodeLineOptions {
  codeBlock: ElementEntry;
  codeLine: ElementEntry;
  indentDepth?: number;
}

/**
 * Indent if:
 *
 * - The selection is expanded OR
 * - There are no non-whitespace characters left of the cursor Indentation = 2
 *   spaces.
 */
export const indentCodeLine = (
  editor: Editor,
  { codeLine, indentDepth = 2 }: IndentCodeLineOptions
) => {
  const [, codeLinePath] = codeLine;
  const codeLineStart = editor.api.start(codeLinePath)!;
  const indent = ' '.repeat(indentDepth);

  if (!editor.api.isExpanded()) {
    const cursor = editor.selection?.anchor;
    const range = editor.api.range(codeLineStart, cursor);
    const text = editor.api.string(range);

    if (/\S/.test(text)) {
      editor.tf.insertText(indent, { at: editor.selection! });

      return;
    }
  }

  editor.tf.insertText(indent, { at: codeLineStart });
};
