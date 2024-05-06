import type { PlateEditor, Value } from '@udecode/plate-common/server';

import { setIndent } from '@udecode/plate-indent';

import type { IndentListOptions } from './indentList';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
} from '../createIndentListPlugin';

/** Decrease the indentation of the selected blocks. */
export const outdentList = <V extends Value>(
  editor: PlateEditor<V>,
  options: IndentListOptions<V> = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [KEY_LIST_STYLE_TYPE, KEY_LIST_CHECKED],
    ...options,
  });
};
