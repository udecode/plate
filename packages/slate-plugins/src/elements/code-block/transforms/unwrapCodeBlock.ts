import { setDefaults, unwrapNodes } from '@udecode/slate-plugins-common';
import { Editor } from 'slate';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockOptions, CodeLineOptions } from '../types';

export const unwrapCodeBlock = (
  editor: Editor,
  options?: CodeBlockOptions & CodeLineOptions
) => {
  const { code_block, code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  unwrapNodes(editor, { match: { type: code_line.type } });
  unwrapNodes(editor, { match: { type: code_block.type }, split: true });
};
