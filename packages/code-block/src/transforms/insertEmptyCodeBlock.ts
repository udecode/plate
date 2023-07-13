import {
  ELEMENT_DEFAULT,
  getPluginType,
  insertElements,
  isBlockAboveEmpty,
  isExpanded,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { CodeBlockInsertOptions } from '../types';
import { insertCodeBlock } from './insertCodeBlock';

/**
 * Called by toolbars to make sure a code-block gets inserted below a paragraph
 * rather than awkwardly splitting the current selection.
 */
export const insertEmptyCodeBlock = <V extends Value>(
  editor: PlateEditor<V>,
  {
    defaultType = getPluginType(editor, ELEMENT_DEFAULT),
    insertNodesOptions,
  }: CodeBlockInsertOptions<V> = {}
) => {
  if (!editor.selection) return;

  if (isExpanded(editor.selection) || !isBlockAboveEmpty(editor)) {
    insertElements(
      editor,
      { type: defaultType, children: [{ text: '' }] },
      {
        select: true,
        nextBlock: true,
        ...insertNodesOptions,
      }
    );
  }
  insertCodeBlock(editor, insertNodesOptions);
};
