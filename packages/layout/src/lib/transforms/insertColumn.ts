import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import type { TColumnElement } from '../types';

import { BaseColumnItemPlugin } from '../BaseColumnPlugin';

export const insertColumn = <E extends SlateEditor>(
  editor: E,
  { width = '33%', ...options }: { width?: string } & InsertNodesOptions<E> = {}
) => {
  insertNodes<TColumnElement>(
    editor,
    {
      children: [editor.api.create.block()],
      type: BaseColumnItemPlugin.key,
      width,
    },
    options as any
  );
};
