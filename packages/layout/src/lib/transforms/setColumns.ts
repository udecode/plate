import type { Path } from 'slate';

import {
  type SlateEditor,
  getNode,
  getNodeEntry,
  insertNodes,
  moveChildren,
  removeNodes,
  setNodes,
} from '@udecode/plate-common';

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
    at?: Path;
    columns?: number;
    widths?: string[];
  }
) => {
  editor.withoutNormalizing(() => {
    if (!at) return;

    widths = widths ?? columnsToWidths({ columns });

    // If widths is empty, do nothing.
    if (widths.length === 0) {
      return;
    }

    const columnGroup = getNode<TColumnGroupElement>(editor, at);

    if (!columnGroup) return;

    const { children } = columnGroup;

    const currentCount = children.length;
    const targetCount = widths.length;

    if (currentCount === targetCount) {
      // Same number of columns: just set widths directly
      widths.forEach((width, i) => {
        setNodes<TColumnElement>(editor, { width }, { at: at.concat([i]) });
      });

      return;
    }
    if (targetCount > currentCount) {
      // Need more columns than we have: insert extra columns at the end
      const columnsToAdd = targetCount - currentCount;
      const insertPath = at.concat([currentCount]);

      // Insert the extra columns
      const newColumns = Array(columnsToAdd)
        .fill(null)
        .map((_, i) => ({
          children: [editor.api.create.block()],
          type: editor.getType(BaseColumnItemPlugin),
          width: widths![currentCount + i] || `${100 / targetCount}%`,
        }));

      insertNodes(editor, newColumns, { at: insertPath });

      // Just ensure final widths match exactly
      widths.forEach((width, i) => {
        setNodes<TColumnElement>(editor, { width }, { at: at.concat([i]) });
      });

      return;
    }
    if (targetCount < currentCount) {
      // Need fewer columns than we have: merge extra columns into the last kept column
      const keepColumnIndex = targetCount - 1;
      const keepColumnPath = at.concat([keepColumnIndex]);
      const keepColumnNode = getNode<TColumnElement>(editor, keepColumnPath);

      if (!keepColumnNode) return;

      const to = keepColumnPath.concat([keepColumnNode.children.length]);

      // Move content from columns beyond keepIndex into keepIndex column
      for (let i = currentCount - 1; i > keepColumnIndex; i--) {
        const columnPath = at.concat([i]);
        const columnEntry = getNodeEntry<TColumnElement>(editor, columnPath);

        if (!columnEntry) continue;

        moveChildren(editor, {
          at: columnEntry[1],
          to,
        });
      }

      // Remove the now-empty extra columns
      // Removing from the end to avoid path shifts
      for (let i = currentCount - 1; i > keepColumnIndex; i--) {
        removeNodes(editor, { at: at.concat([i]) });
      }

      // Set the final widths
      widths.forEach((width, i) => {
        setNodes<TColumnElement>(editor, { width }, { at: at.concat([i]) });
      });
    }
  });
};
