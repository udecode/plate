import { SPEditor } from '@udecode/plate-core';
import { setIndent } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '../defaults';
import { IndentListOptions } from './indentList';

/**
 * Decrease the indentation of the selected blocks.
 */
export const outdentList = (
  editor: SPEditor,
  options: IndentListOptions = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [KEY_LIST_STYLE_TYPE],
    ...options,
  });
};
