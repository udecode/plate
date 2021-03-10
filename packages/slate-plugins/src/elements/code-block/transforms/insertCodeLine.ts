import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';

/**
 * Insert a code line starting with indentation.
 */
export const insertCodeLine = (
  editor: Editor,
  indentDepth = 0,
  options: SlatePluginsOptions
) => {
  const { code_line } = options;

  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    Transforms.insertNodes(editor, {
      type: code_line.type,
      children: [{ text: indent }],
    });
  }
};
