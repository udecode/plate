import { getNodes } from '@udecode/plate-common';
import { PlateEditor } from '@udecode/plate-core';
import { Location } from 'slate';
import { getCodeLineType } from '../options';

/**
 * Get code line entries
 */
export const getCodeLines = (
  editor: PlateEditor,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (!at) return;

  return [
    ...getNodes(editor, {
      at,
      match: { type: getCodeLineType(editor) },
    }),
  ];
};
