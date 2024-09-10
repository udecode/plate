import type { SlateEditor } from '@udecode/plate-common';

import { setIndent } from '@udecode/plate-indent';

import type { IndentListOptions } from './indentList';

import { INDENT_LIST_KEYS, IndentListPlugin } from '../IndentListPlugin';

/** Decrease the indentation of the selected blocks. */
export const outdentList = <E extends SlateEditor>(
  editor: E,
  options: IndentListOptions<E> = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [IndentListPlugin.key, INDENT_LIST_KEYS.checked],
    ...options,
  });
};
