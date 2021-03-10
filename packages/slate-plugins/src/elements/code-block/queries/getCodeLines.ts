import { getNodes } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Location } from 'slate';

/**
 * Get code line entries
 */
export const getCodeLines = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  options: SlatePluginsOptions
) => {
  const { code_line } = options;

  if (!at) return;

  return [...getNodes(editor, { at, match: { type: code_line.type } })];
};
