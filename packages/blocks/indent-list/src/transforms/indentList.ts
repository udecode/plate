import { SPEditor } from '@udecode/plate-core';
import { setIndent, SetIndentOptions } from '@udecode/plate-indent';
import { KEY_LIST_TYPE } from '../defaults';

/**
 * Increase the indentation of the selected blocks.
 */
export const indentList = (
  editor: SPEditor,
  options: SetIndentOptions = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [KEY_LIST_TYPE]: 'list-item',
    }),
    ...options,
  });
};
