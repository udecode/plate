import type { InsertNodesOptions, SlateEditor, TText } from '@udecode/plate';

import type { TLinkElement } from '../types';

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
