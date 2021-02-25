import { Editor, Location } from 'slate';
import { getNodes } from '../../../common';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeLineOptions } from '../types';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getCodeLines = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  options?: CodeLineOptions
) => {
  const { code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  return [...getNodes(editor, { match: { type: code_line.type } })];
};
