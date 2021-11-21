import { PlateEditor } from '@udecode/plate-core';
import { setIndent } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { IndentListOptions } from './indentList';

/**
 * Decrease the indentation of the selected blocks.
 */
export const outdentList = (
  editor: PlateEditor,
  options: IndentListOptions = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [KEY_LIST_STYLE_TYPE],
    ...options,
  });
};
