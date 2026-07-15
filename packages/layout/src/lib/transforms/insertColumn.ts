import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import { ElementApi, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import type { TColumnElement, TColumnGroupElement } from '@platejs/utils';

export type InsertColumnOptions = NodeInsertNodesOptions<Element> & {
  width?: string;
};

export const insertColumn = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { width = '33%', ...options }: InsertColumnOptions = {}
) => {
  if (PathApi.isPath(options.at) && options.at.length > 0) {
    const groupPath = PathApi.parent(options.at);
    const group = tx.nodes.get<TColumnGroupElement>(groupPath)?.[0];

    if (
      group &&
      ElementApi.isElementType(group, editor.getType(KEYS.columnGroup))
    ) {
      const insertedWidth = Number.parseFloat(width);

      if (Number.isFinite(insertedWidth)) {
        const availableWidth = Math.max(0, 100 - insertedWidth);
        const currentWidths = group.children.map((column) => {
          const value = Number.parseFloat(column.width);

          return Number.isFinite(value) ? value : 0;
        });
        const currentTotal = currentWidths.reduce(
          (total, currentWidth) => total + currentWidth,
          0
        );
        const fallbackWidth = availableWidth / group.children.length;

        group.children.forEach((_, index) => {
          const nextWidth =
            currentTotal > 0
              ? (currentWidths[index] / currentTotal) * availableWidth
              : fallbackWidth;

          tx.nodes.set<TColumnElement>(
            { width: `${nextWidth}%` },
            { at: groupPath.concat(index) }
          );
        });
      }
    }
  }

  tx.nodes.insert(
    {
      children: [{ children: [{ text: '' }], type: editor.getType(KEYS.p) }],
      type: editor.getType(KEYS.column),
      width,
    },
    options
  );
};
