import {
  type InsertNodesOptions,
  type SlateEditor,
  BaseParagraphPlugin,
  getQueryOptions,
  insertNodes,
} from '@udecode/plate-common';

import type { TColumnElement } from '../types';

import { BaseColumnItemPlugin } from '../BaseColumnPlugin';

export const insertEmptyColumn = <E extends SlateEditor>(
  editor: E,
  options?: { width?: string } & InsertNodesOptions<E>
) => {
  const width = options?.width || '33%';

  insertNodes<TColumnElement>(
    editor,
    {
      children: [{ children: [{ text: '' }], type: BaseParagraphPlugin.key }],
      type: BaseColumnItemPlugin.key,
      width,
    },
    getQueryOptions(editor, options)
  );
};
