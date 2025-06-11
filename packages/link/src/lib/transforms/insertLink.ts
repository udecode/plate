import type {
  InsertNodesOptions,
  SlateEditor,
  TLinkElement,
  TText,
} from 'platejs';

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
