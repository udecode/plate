import type { PlateEditor } from '@udecode/plate-common';

import { setIndent } from '@udecode/plate-indent';

import type { IndentListOptions } from './indentList';

import { KEY_LIST_CHECKED, IndentListPlugin } from '../IndentListPlugin';

/** Decrease the indentation of the selected blocks. */
export const outdentList = <E extends PlateEditor>(
  editor: E,
  options: IndentListOptions<E> = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [IndentListPlugin.key, KEY_LIST_CHECKED],
    ...options,
  });
};
