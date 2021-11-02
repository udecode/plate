import { someNode, unsetNodes } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { KEY_LIST_STYLE_TYPE } from '../defaults';
import { indentList, IndentListOptions } from './indentList';
import { outdentList } from './outdentList';

/**
 * Increase the indentation of the selected blocks.
 */
export const toggleIndentList = (
  editor: SPEditor,
  options?: IndentListOptions
) => {
  if (someNode(editor, { match: (n) => !!n[KEY_LIST_STYLE_TYPE] })) {
    outdentList(editor, options);
    unsetNodes(editor, KEY_LIST_STYLE_TYPE);
  } else {
    indentList(editor, options);
  }
};
