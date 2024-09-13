import type { SlateEditor } from '@udecode/plate-common';

import { setIndent } from '@udecode/plate-indent';

import type { IndentListOptions } from './indentList';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';

/** Decrease the indentation of the selected blocks. */
export const outdentList = <E extends SlateEditor>(
  editor: E,
  options: IndentListOptions<E> = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [BaseIndentListPlugin.key, INDENT_LIST_KEYS.checked],
    ...options,
  });
};
