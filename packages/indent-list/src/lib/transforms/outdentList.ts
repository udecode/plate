import type { SlateEditor } from 'platejs';

import { setIndent } from '@platejs/indent';

import type { IndentListOptions } from './indentList';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';

/** Decrease the indentation of the selected blocks. */
export const outdentList = (
  editor: SlateEditor,
  options: IndentListOptions = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [BaseIndentListPlugin.key, INDENT_LIST_KEYS.checked],
    ...options,
  });
};
