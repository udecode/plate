import {
  type InsertNodesOptions,
  type PlateEditor,
  type TText,
  type Value,
  insertNodes,
} from '@udecode/plate-common/server';

import type { TLinkElement } from '../types';

import { type CreateLinkNodeOptions, createLinkNode } from '../utils/index';

/** Insert a link node. */
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
