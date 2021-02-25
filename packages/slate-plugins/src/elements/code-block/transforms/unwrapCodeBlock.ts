import { Editor } from 'slate';
import { unwrapNodes } from '../../../common/transforms';
import { setDefaults } from '../../../common/utils/setDefaults';
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
