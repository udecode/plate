import { getNodes } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
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
      match: { type: getPlatePluginType(editor, ELEMENT_CODE_LINE) },
    }),
  ];
};
