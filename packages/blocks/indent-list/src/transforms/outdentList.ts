import { EditorNodesOptions } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { setIndent } from '@udecode/plate-indent';
import { KEY_LIST_TYPE } from '../defaults';

/**
 * Decrease the indentation of the selected blocks.
 */
export const outdentList = (
  editor: SPEditor,
  options: EditorNodesOptions = {}
) => {
  setIndent(editor, {
    offset: -1,
    setNodesProps: () => ({
      [KEY_LIST_TYPE]: 'list-item',
    }),
    ...options,
  });
};
