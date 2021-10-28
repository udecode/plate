import { EditorNodesOptions, setNodes } from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import { setIndent, SetIndentOptions } from '@udecode/plate-indent';
import { Transforms } from 'slate';
import { KEY_LIST_TYPE } from '../defaults';

/**
 * Increase the indentation of the selected blocks.
 */
export const indentList = (editor: TEditor, options: SetIndentOptions = {}) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [KEY_LIST_TYPE]: 'list-item',
    }),
    ...options,
  });
};
