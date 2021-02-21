import { Editor, Transforms } from 'slate';
import { setDefaults } from '../../../common';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockOptions, CodeLineOptions } from '../types';

/**
 * Insert a code line starting with indentation.
 */
export const insertCodeLine = (
  editor: Editor,
  indentDepth = 0,
  options?: CodeBlockOptions & CodeLineOptions
) => {
  const { code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);
  if (editor.selection) {
    const indent = ' '.repeat(indentDepth);

    Transforms.insertNodes(editor, {
      type: code_line.type,
      children: [{ text: indent }],
    });
  }
};
