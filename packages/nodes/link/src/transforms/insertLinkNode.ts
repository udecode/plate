import { insertNodes, PlateEditor, TText, Value } from '@udecode/plate-core';
import { TLinkElement } from '../types';
import { createLinkNode, CreateLinkNodeOptions } from '../utils/index';

/**
 * Inserts a link node at the current selection.
 * Also inserts an empty text node so the cursor is out of the link
 */
export const insertLinkNode = <V extends Value>(
  editor: PlateEditor<V>,
  options: CreateLinkNodeOptions
) => {
  insertNodes<TLinkElement | TText>(editor, [
    createLinkNode(editor, options),
    {
      text: '',
    },
  ]);
};
