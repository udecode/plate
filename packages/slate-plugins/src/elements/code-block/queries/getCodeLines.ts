import { getNodes } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Location } from 'slate';
import { ELEMENT_CODE_LINE } from '../defaults';

/**
 * Get code line entries
 */
export const getCodeLines = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (!at) return;

  return [
    ...getNodes(editor, {
      at,
      match: { type: getPluginType(editor, ELEMENT_CODE_LINE) },
    }),
  ];
};
