import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
  Text,
} from '@platejs/plite';
import type { TLinkElement } from '@platejs/utils';

import { type CreateLinkNodeOptions, createLinkNode } from '../utils';

/** Insert a link node. */
export const insertLink = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  createLinkNodeOptions: CreateLinkNodeOptions,
  options?: NodeInsertNodesOptions<TLinkElement | Text>
) => {
  tx.nodes.insert(createLinkNode(editor, createLinkNodeOptions), options);
};
