import { getNodes } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
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
      match: { type: getSlatePluginType(editor, ELEMENT_CODE_LINE) },
    }),
  ];
};
