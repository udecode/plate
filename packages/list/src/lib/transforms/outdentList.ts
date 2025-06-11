import type { SlateEditor } from 'platejs';

import { setIndent } from '@platejs/indent';
import { KEYS } from 'platejs';

import type { ListOptions } from './indentList';

/** Decrease the indentation of the selected blocks. */
export const outdentList = (editor: SlateEditor, options: ListOptions = {}) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [KEYS.listType, KEYS.listChecked],
    ...options,
  });
};
