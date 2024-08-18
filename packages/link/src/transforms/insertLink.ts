import {
  type InsertNodesOptions,
  type SlateEditor,
  type TText,
  insertNodes,
} from '@udecode/plate-common';

import type { TLinkElement } from '../types';

import { type CreateLinkNodeOptions, createLinkNode } from '../utils/index';

/** Insert a link node. */
export const insertLink = <E extends SlateEditor>(
  editor: E,
  createLinkNodeOptions: CreateLinkNodeOptions,
  options?: InsertNodesOptions<E>
) => {
  insertNodes<TLinkElement | TText>(
    editor,
    [createLinkNode(editor, createLinkNodeOptions)],
    options as any
  );
};
