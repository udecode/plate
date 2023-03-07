import {
  insertNodes,
  InsertNodesOptions,
  PlateEditor,
  TText,
  Value,
} from '@udecode/plate-common';
import { TLinkElement } from '../types';
import { createLinkNode, CreateLinkNodeOptions } from '../utils/index';

/**
 * Insert a link node.
 */
export const insertLink = <V extends Value>(
  editor: PlateEditor<V>,
  createLinkNodeOptions: CreateLinkNodeOptions,
  options?: InsertNodesOptions<V>
) => {
  insertNodes<TLinkElement | TText>(
    editor,
    [createLinkNode(editor, createLinkNodeOptions)],
    options as any
  );
};
