import type { ValueOf } from '@udecode/plate-common';

import {
  type InsertNodesOptions,
  type PlateEditor,
  type TText,
  insertNodes,
} from '@udecode/plate-common/server';

import type { TLinkElement } from '../types';

import { type CreateLinkNodeOptions, createLinkNode } from '../utils/index';

/** Insert a link node. */
export const insertLink = <E extends PlateEditor>(
  editor: E,
  createLinkNodeOptions: CreateLinkNodeOptions,
  options?: InsertNodesOptions<ValueOf<E>>
) => {
  insertNodes<TLinkElement | TText>(
    editor,
    [createLinkNode(editor, createLinkNodeOptions)],
    options as any
  );
};
