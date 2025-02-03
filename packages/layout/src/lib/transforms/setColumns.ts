import { type At, type SlateEditor, NodeApi } from '@udecode/plate';

import type { TColumnElement, TColumnGroupElement } from '../types';

import { BaseColumnItemPlugin } from '../BaseColumnPlugin';
import { columnsToWidths } from '../utils/columnsToWidths';

export const setColumns = (
  editor: SlateEditor,
  {
    at,
    columns,
    widths,
  }: {
    /** Column group path */
    at?: At;
    columns?: number;
    widths?: string[];
  }
) => {
  editor.tf.withoutNormalizing(() => {
    if (!at) return;

    widths = widths ?? columnsToWidths({ columns });

    // If widths is empty, do nothing.
    if (widths.length === 0) {
      return;
    }

    const columnGroup = editor.api.node<TColumnGroupElement>(at);

    if (!columnGroup) return;

    const [{ children }, path] = columnGroup;

    const currentCount = children.length;
    const targetCount = widths.length;

    if (currentCount === targetCount) {
      // Same number of columns: just set widths directly
      widths.forEach((width, i) => {
        editor.tf.setNodes<TColumnElement>({ width }, { at: path.concat([i]) });
      });

      return;
    }
    if (targetCount > currentCount) {
      // Need more columns than we have: insert extra columns at the end
      const columnsToAdd = targetCount - currentCount;
      const insertPath = path.concat([currentCount]);

      // Insert the extra columns
      const newColumns = new Array(columnsToAdd).fill(null).map((_, i) => ({
        children: [editor.api.create.block()],
        type: editor.getType(BaseColumnItemPlugin),
        width: widths![currentCount + i] || `${100 / targetCount}%`,
      }));

      editor.tf.insertNodes(newColumns, { at: insertPath });

      // Just ensure final widths match exactly
      widths.forEach((width, i) => {
        editor.tf.setNodes<TColumnElement>({ width }, { at: path.concat([i]) });
      });

      return;
    }
    if (targetCount < currentCount) {
      // Need fewer columns than we have: merge extra columns into the last kept column
      const keepColumnIndex = targetCount - 1;
      const keepColumnPath = path.concat([keepColumnIndex]);
      const keepColumnNode = NodeApi.get<TColumnElement>(
        editor,
        keepColumnPath
      );

      if (!keepColumnNode) return;

      const to = keepColumnPath.concat([keepColumnNode.children.length]);

      // Move content from columns beyond keepIndex into keepIndex column
      for (let i = currentCount - 1; i > keepColumnIndex; i--) {
        const columnPath = path.concat([i]);
        const columnEntry = editor.api.node<TColumnElement>(columnPath);

        if (!columnEntry) continue;

        editor.tf.moveNodes({
          at: columnEntry[1],
          children: true,
          to,
        });
      }

      // Remove the now-empty extra columns
      // Removing from the end to avoid path shifts
      for (let i = currentCount - 1; i > keepColumnIndex; i--) {
        editor.tf.removeNodes({ at: path.concat([i]) });
      }

      // Set the final widths
      widths.forEach((width, i) => {
        editor.tf.setNodes<TColumnElement>({ width }, { at: path.concat([i]) });
      });
    }
  });
};
