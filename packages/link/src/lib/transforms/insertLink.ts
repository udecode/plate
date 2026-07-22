import type { BaseEditor } from '@platejs/core';
import type {
  EditorTransactionSpecBuilder,
  TextInsertFragmentOptions,
} from '@platejs/plite';

import { type CreateLinkNodeOptions, createLinkNode } from '../utils';

/** Insert a link node. */
export const insertLink = (
  editor: BaseEditor,
  tx: EditorTransactionSpecBuilder,
  createLinkNodeOptions: CreateLinkNodeOptions,
  options?: TextInsertFragmentOptions
) => {
  tx.fragment.replace([createLinkNode(editor, createLinkNodeOptions)], options);
};
