import type { BasePlateEditor } from 'platejs';

import { setIndent } from '@platejs/indent';
import { KEYS } from 'platejs';

import type { ListOptions } from './indentList';

/** Decrease the indentation of the selected blocks. */
export const outdentList = (
  editor: BasePlateEditor,
  options: ListOptions = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [KEYS.listType, KEYS.listChecked],
    ...options,
  });
};
