import { getPluginType, PlateEditor, wrapNodes } from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_COMMENT } from '../createCommentsPlugin';

/**
 * Wrap selected nodes with a link and collapse at the end.
 */
export const wrapComment = <T = {}>(
  editor: PlateEditor<T>,
  { at, comment }: { comment: string; at?: Location }
) => {
  wrapNodes(
    editor,
    {
      type: getPluginType(editor, ELEMENT_COMMENT),
      comment,
      children: [],
    },
    { at, split: true }
  );
};
