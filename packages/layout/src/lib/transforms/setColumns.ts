import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction, NodeTarget } from '@platejs/plite';
import type { TColumnElement, TColumnGroupElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

import { columnsToWidths } from '../utils/columnsToWidths';

export type SetColumnsOptions = {
  /** Column group location. */
  at?: NodeTarget<TColumnGroupElement>;
  columns?: number;
  widths?: string[];
};

export const setColumns = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { at, columns, widths }: SetColumnsOptions
) => {
  if (!at) return;

  const nextWidths = widths ?? columnsToWidths({ columns });

  if (nextWidths.length === 0) return;

  const columnGroup = tx.nodes.get<TColumnGroupElement>(at);

  if (!columnGroup) return;

  const [{ children }, path] = columnGroup;

  const currentCount = children.length;
  const targetCount = nextWidths.length;

  if (currentCount === targetCount) {
    // Same number of columns: just set widths directly
    nextWidths.forEach((width, i) => {
      tx.nodes.set<TColumnElement>({ width }, { at: path.concat([i]) });
    });
  } else if (targetCount > currentCount) {
    // Need more columns than we have: insert extra columns at the end
    const columnsToAdd = targetCount - currentCount;
    const insertPath = path.concat([currentCount]);

    // Insert the extra columns
    const newColumns = new Array(columnsToAdd).fill(null).map((_, i) => ({
      children: [{ children: [{ text: '' }], type: editor.getType(KEYS.p) }],
      type: editor.getType(KEYS.column),
      width: nextWidths[currentCount + i] || `${100 / targetCount}%`,
    }));

    tx.nodes.insert(newColumns, { at: insertPath });

    // Just ensure final widths match exactly
    nextWidths.forEach((width, i) => {
      tx.nodes.set<TColumnElement>({ width }, { at: path.concat([i]) });
    });
  } else if (targetCount < currentCount) {
    // Need fewer columns than we have: merge extra columns into the last kept column
    const keepColumnIndex = targetCount - 1;
    const keepColumnPath = path.concat([keepColumnIndex]);
    const keepColumnNode = tx.nodes.get<TColumnElement>(keepColumnPath)?.[0];

    if (!keepColumnNode) return;

    const mergedChildren = children
      .slice(keepColumnIndex)
      .flatMap((column) => column.children);

    tx.nodes.replaceChildren(mergedChildren, { at: keepColumnPath });

    // Remove the now-empty extra columns
    // Removing from the end to avoid path shifts
    for (let i = currentCount - 1; i > keepColumnIndex; i--) {
      tx.nodes.remove({ at: path.concat([i]) });
    }

    // Set the final widths
    nextWidths.forEach((width, i) => {
      tx.nodes.set<TColumnElement>({ width }, { at: path.concat([i]) });
    });
  }
};
