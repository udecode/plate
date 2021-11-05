import { findNode, setNodes, unsetNodes } from '@udecode/plate-common';
import { PlateEditor } from '@udecode/plate-core';
import { KEY_LIST_STYLE_TYPE } from '../defaults';
import { indentList, IndentListOptions } from './indentList';
import { outdentList } from './outdentList';

/**
 * Increase the indentation of the selected blocks.
 */
export const toggleIndentList = (
  editor: PlateEditor,
  options?: IndentListOptions
) => {
  const nodeEntry = findNode(editor, {
    match: (n) => !!n[KEY_LIST_STYLE_TYPE],
  });

  if (!nodeEntry) {
    indentList(editor, options);
    return;
  }

  const [node, path] = nodeEntry;

  if (node[KEY_LIST_STYLE_TYPE] && options?.listStyleType) {
    if (node[KEY_LIST_STYLE_TYPE] === options?.listStyleType) {
      outdentList(editor, options);
      unsetNodes(editor, KEY_LIST_STYLE_TYPE);
      return;
    }

    setNodes(
      editor,
      { [KEY_LIST_STYLE_TYPE]: options?.listStyleType },
      { at: path }
    );
  }
};
