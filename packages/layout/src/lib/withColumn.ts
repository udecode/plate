import type { ExtendPlateEditorExtension } from '@platejs/core';
import type { EditorUpdateTransaction, Element } from '@platejs/plite';
import { ElementApi, PathApi, RangeApi } from '@platejs/plite';
import type { TColumnElement, TColumnGroupElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

import type { ColumnConfig } from './BaseColumnPlugin';
export const selectColumnAll = (
  tx: EditorUpdateTransaction,
  columnType: string
) => {
  const selection = tx.selection();

  if (!selection) return false;

  const column = tx.nodes.above<Element>({
    at: selection,
    match: { type: columnType },
  });

  if (!column) return false;

  let targetPath = column[1];
  const [start, end] = RangeApi.edges(selection);

  if (
    tx.points.isStart(start, targetPath) &&
    tx.points.isEnd(end, targetPath)
  ) {
    targetPath = PathApi.parent(targetPath);
  }

  if (targetPath.length === 0) return false;

  tx.selection.set(targetPath);

  return true;
};

export const withColumn: ExtendPlateEditorExtension<ColumnConfig> = ({
  editor,
}) => ({
  corrections: [
    {
      event: 'content',
      correct({ entry: [node, path], tx }) {
        const columnGroupType = editor.getType(KEYS.columnGroup);

        if (
          ElementApi.isElementType<TColumnGroupElement>(node, columnGroupType)
        ) {
          const totalColumns = node.children.length;
          const widths = node.children.map((column) => {
            const parsed = Number.parseFloat(column.width);

            return Number.isNaN(parsed) ? 0 : parsed;
          });
          const sum = widths.reduce((total, width) => total + width, 0);

          if (sum !== 100) {
            const adjustment = (100 - sum) / totalColumns;

            widths.forEach((width, index) => {
              tx.nodes.set<TColumnElement>(
                { width: `${width + adjustment}%` },
                { at: path.concat([index]) }
              );
            });

            return;
          }
        }
      },
    },
  ],
});
