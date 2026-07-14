import type { BaseEditor } from '@platejs/core';
import { RangeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  getNextTableCell,
  getPreviousTableCell,
  getTableEntries,
} from './queries';
import { moveSelectionFromCell } from './transforms';
import {
  getTableMoveSelectionContext,
  hasAdjacentBlockInCell,
  shouldMoveSelectionFromCell,
} from './transforms/shouldMoveSelectionFromCell';
import { getCellTypes } from './utils';

export const moveLineTable = (
  editor: BaseEditor,
  { reverse = false }: { reverse?: boolean }
) => {
  if (!editor.read.selection.isCollapsed()) return false;

  const context = getTableMoveSelectionContext(editor);

  if (!context) return false;

  const { blockPath, cellPath, point } = context;

  if (hasAdjacentBlockInCell(editor, { blockPath, cellPath, reverse })) {
    return false;
  }

  if (
    !shouldMoveSelectionFromCell(editor, {
      blockPath,
      point,
      reverse,
    })
  ) {
    return false;
  }

  return !!moveSelectionFromCell(editor, { reverse });
};

export const selectAllTable = (editor: BaseEditor) => {
  const type = editor.getType(KEYS.table);
  const table = editor.read.nodes.above({ match: { type } });

  if (!table) return false;

  const [, tablePath] = table;
  const tableRange = editor.read.ranges.get(tablePath);
  const selection = editor.read.selection();

  if (tableRange && selection && RangeApi.equals(selection, tableRange)) {
    const documentRange = editor.read.ranges.get([]);

    if (documentRange) editor.update.selection.set(documentRange);

    return true;
  }

  editor.update.selection.set(tablePath);

  return true;
};

export const tabTable = (
  editor: BaseEditor,
  { reverse = false }: { reverse?: boolean } = {}
) => {
  const selection = editor.read.selection();

  if (selection && editor.read.selection.isExpanded()) {
    const cells = editor.read.nodes.toArray({
      at: selection,
      match: { type: getCellTypes(editor) },
    });

    if (cells.length > 1) {
      editor.update.selection.collapse({ edge: 'end' });
      return true;
    }
  }

  const entries = getTableEntries(editor);

  if (!entries) return false;

  const { cell, row } = entries;
  const [, cellPath] = cell;
  const target = reverse
    ? getPreviousTableCell(editor, cell, cellPath, row)
    : getNextTableCell(editor, cell, cellPath, row);

  if (target) editor.update.selection.set(target[1]);

  return true;
};
