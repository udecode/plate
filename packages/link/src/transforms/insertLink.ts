import {
  InsertNodesOptions,
  PlateEditor,
  TText,
  Value,
  insertNodes,
} from '@udecode/plate-common';

import { TLinkElement } from '../types';
import { CreateLinkNodeOptions, createLinkNode } from '../utils/index';

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
