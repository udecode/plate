import { getNodes } from '@udecode/slate-plugins-common';
import { getPluginType, SPEditor } from '@udecode/slate-plugins-core';
import { Location } from 'slate';
import { ELEMENT_CODE_LINE } from '../defaults';

/**
 * Get code line entries
 */
export const getCodeLines = (
  editor: SPEditor,
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
