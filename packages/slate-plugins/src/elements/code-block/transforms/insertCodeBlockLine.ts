import { Editor } from 'slate';
import { setDefaults } from '../../../common';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockLineOptions, CodeBlockOptions } from '../types';

export const insertCodeBlockLine = (
  editor: Editor,
  options?: CodeBlockOptions & CodeBlockLineOptions,
  indentDepth?: number
) => {
  const { code_block_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);
  if (editor.selection) {
    // determine where to insert the new line
    // insert it
    // indentCodeBlockLine() call indent depth / 2 ?
  }
};
