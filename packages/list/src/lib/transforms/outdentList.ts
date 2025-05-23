import type { SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';
import { setIndent } from '@udecode/plate-indent';

import type { ListOptions } from './indentList';

/** Decrease the indentation of the selected blocks. */
export const outdentList = (editor: SlateEditor, options: ListOptions = {}) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [KEYS.listType, KEYS.listChecked],
    ...options,
  });
};
