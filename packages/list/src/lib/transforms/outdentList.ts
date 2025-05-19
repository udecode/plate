import type { SlateEditor } from '@udecode/plate';

import { setIndent } from '@udecode/plate-indent';

import type { ListOptions } from './indentList';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';

/** Decrease the indentation of the selected blocks. */
export const outdentList = (editor: SlateEditor, options: ListOptions = {}) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [INDENT_LIST_KEYS.listStyleType, INDENT_LIST_KEYS.checked],
    ...options,
  });
};
