import { PlateEditor, Value } from '@udecode/plate-common';
import { setIndent } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { IndentListOptions } from './indentList';

/**
 * Decrease the indentation of the selected blocks.
 */
export const outdentList = <V extends Value>(
  editor: PlateEditor<V>,
  options: IndentListOptions<V> = {}
) => {
  setIndent(editor, {
    offset: -1,
    unsetNodesProps: [KEY_LIST_STYLE_TYPE],
    ...options,
  });
};
