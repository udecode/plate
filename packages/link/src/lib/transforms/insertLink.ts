import type {
  InsertNodesOptions,
  SlateEditor,
  TLinkElement,
  TText,
} from '@udecode/plate';

import { type CreateLinkNodeOptions, createLinkNode } from '../utils';

/** Insert a link node. */
export const insertLink = (
  editor: SlateEditor,
  createLinkNodeOptions: CreateLinkNodeOptions,
  options?: InsertNodesOptions
) => {
  editor.tf.insertNodes<TLinkElement | TText>(
    [createLinkNode(editor, createLinkNodeOptions)],
    options as any
  );
};
