import type { NodeInsertNodesOptions, Text } from '@platejs/plite';

import type { BasePlateEditor, TLinkElement } from 'platejs';

import { type CreateLinkNodeOptions, createLinkNode } from '../utils';

type InsertNodesOptions = NodeInsertNodesOptions<TLinkElement | Text>;

/** Insert a link node. */
export const insertLink = (
  editor: BasePlateEditor,
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
