import { getNodes, setDefaults } from '@udecode/slate-plugins-common';
import { Editor, Location } from 'slate';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeLineOptions } from '../types';

/**
 * Get code line entries
 */
export const getCodeLines = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  options?: CodeLineOptions
) => {
  if (!at) return;

  const { code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  return [...getNodes(editor, { at, match: { type: code_line.type } })];
};
