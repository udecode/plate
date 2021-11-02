import { SPEditor } from '@udecode/plate-core';
import { setIndent, SetIndentOptions } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '../defaults';
import { ListStyleType } from '../types';

export interface IndentListOptions extends SetIndentOptions {
  listStyleType?: ListStyleType | string;
}

/**
 * Increase the indentation of the selected blocks.
 */
export const indentList = (
  editor: SPEditor,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [KEY_LIST_STYLE_TYPE]: listStyleType,
    }),
    ...options,
  });
};
