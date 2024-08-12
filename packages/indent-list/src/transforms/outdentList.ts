import type { ValueOf } from '@udecode/plate-common';
import type { PlateEditor } from '@udecode/plate-common';

import { setIndent } from '@udecode/plate-indent';

import type { IndentListOptions } from './indentList';

import { KEY_LIST_CHECKED, KEY_LIST_STYLE_TYPE } from '../IndentListPlugin';

/** Decrease the indentation of the selected blocks. */
export const outdentList = <E extends PlateEditor>(
  editor: E,
  options: IndentListOptions<ValueOf<E>> = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [KEY_LIST_STYLE_TYPE, KEY_LIST_CHECKED],
    ...options,
  });
};
