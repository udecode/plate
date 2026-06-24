import type { Location, NodeEntry } from '@platejs/plite';
import type { TColumnElement, TColumnGroupElement } from 'platejs';
import { KEYS } from 'platejs';

import { columnsToWidths } from '../utils/columnsToWidths';
import { type ColumnEditor, createColumnBlock } from './ColumnEditor';

export type SetColumnsTarget = Location;

export const setColumns = (
  editor: ColumnEditor,
  {
    at,
    columns,
    widths,
  }: {
    /** Column group path */
    at?: SetColumnsTarget;
    columns?: number;
    widths?: string[];
  }
) => {
  editor.update((tx) => {
    let shouldNormalize = false;

    tx.withoutNormalizing(() => {
      if (!at) return;

      widths = widths ?? columnsToWidths({ columns });

      // If widths is empty, do nothing.
      if (widths.length === 0) {
        return;
      }

      let columnGroup: NodeEntry<TColumnGroupElement> | undefined;

      try {
        columnGroup = editor.api.node<TColumnGroupElement>(at);
      } catch {
        return;
      }

      if (!columnGroup) return;

      const [{ children }, path] = columnGroup;

      const currentCount = children.length;
      const targetCount = widths.length;

      if (currentCount === targetCount) {
        // Same number of columns: just set widths directly
        widths.forEach((width, i) => {
          tx.nodes.set<TColumnElement>({ width }, { at: path.concat([i]) });
        });
        shouldNormalize = true;
      }
      if (targetCount > currentCount) {
        // Need more columns than we have: insert extra columns at the end
        const columnsToAdd = targetCount - currentCount;
        const insertPath = path.concat([currentCount]);

        // Insert the extra columns
        const newColumns = new Array(columnsToAdd).fill(null).map((_, i) => ({
          children: [createColumnBlock(editor)],
          type: editor.getType(KEYS.column),
          width: widths![currentCount + i] || `${100 / targetCount}%`,
        }));

        tx.nodes.insert(newColumns, { at: insertPath });

        // Just ensure final widths match exactly
        widths.forEach((width, i) => {
          tx.nodes.set<TColumnElement>({ width }, { at: path.concat([i]) });
        });
        shouldNormalize = true;
      }
      if (targetCount < currentCount) {
        // Need fewer columns than we have: merge extra columns into the last kept column
        const keepColumnIndex = targetCount - 1;
        const keepColumnPath = path.concat([keepColumnIndex]);
        const keepColumnNode =
          editor.api.node<TColumnElement>(keepColumnPath)?.[0];

        if (!keepColumnNode) return;

        const appendOffset = keepColumnNode.children.length;

        // Move content from columns beyond keepIndex into keepIndex column.
        for (let i = currentCount - 1; i > keepColumnIndex; i--) {
          const columnPath = path.concat([i]);
          const columnEntry = editor.api.node<TColumnElement>(columnPath);

          if (!columnEntry) continue;

          const [columnNode] = columnEntry;

          columnNode.children.forEach((_, childIndex) => {
            tx.nodes.move({
              at: columnEntry[1].concat([0]),
              to: keepColumnPath.concat([appendOffset + childIndex]),
            });
          });
        }

        // Remove the now-empty extra columns
        // Removing from the end to avoid path shifts
        for (let i = currentCount - 1; i > keepColumnIndex; i--) {
          tx.nodes.remove({ at: path.concat([i]) });
        }

        // Set the final widths
        widths.forEach((width, i) => {
          tx.nodes.set<TColumnElement>({ width }, { at: path.concat([i]) });
        });
        shouldNormalize = true;
      }
    });

    if (shouldNormalize) {
      tx.normalize({ force: true });
    }
  });
};
