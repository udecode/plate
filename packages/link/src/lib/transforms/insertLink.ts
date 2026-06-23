import type { NodeInsertNodesOptions, Text } from '@platejs/slate';

import type { SlateEditor, TLinkElement } from 'platejs';

import { type CreateLinkNodeOptions, createLinkNode } from '../utils';

type InsertNodesOptions = NodeInsertNodesOptions<TLinkElement | Text>;

/** Insert a link node. */
export const insertLink = (
  editor: SlateEditor,
  createLinkNodeOptions: CreateLinkNodeOptions,
  options?: InsertNodesOptions
) => {
  editor.update((tx) => {
    tx.nodes.insert<TLinkElement | Text>(
      [createLinkNode(editor, createLinkNodeOptions)],
      options
    );
  });
};
