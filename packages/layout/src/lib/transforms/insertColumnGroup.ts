import {
  type InsertNodesOptions,
  type SlateEditor,
  findNode,
  insertNodes,
  select,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TColumnGroupElement } from '../types';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

export const insertColumnGroup = (
  editor: SlateEditor,
  {
    layout = 2,
    select: selectProp,
    ...options
  }: InsertNodesOptions & {
    layout?: number[] | number;
  } = {}
) => {
  const columnLayout = Array.isArray(layout)
    ? layout
    : Array(layout).fill(Math.floor(100 / layout));

  withoutNormalizing(editor, () => {
    insertNodes<TColumnGroupElement>(
      editor,
      {
        children: columnLayout.map((width) => ({
          children: [editor.api.create.block()],
          type: BaseColumnItemPlugin.key,
          width: `${width}%`,
        })),
        layout: columnLayout,
        type: BaseColumnPlugin.key,
      },
      options
    );

    if (selectProp) {
      const entry = findNode(editor, {
        at: options.at,
        match: { type: editor.getType(BaseColumnPlugin) },
      });

      if (!entry) return;

      select(editor, entry[1].concat([0]));
    }
  });
};
