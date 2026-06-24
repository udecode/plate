import type { Element } from '@platejs/plite';
import type { ElementEntry, BasePlateEditor } from 'platejs';

import { getTableGridAbove } from './getTableGridAbove';

type SelectionQueryCache = {
  cellEntries?: ElementEntry[];
  operationsLength: number;
  selection: BasePlateEditor['selection'];
  selectionKey: string;
  selectedCellIds?: string[] | null;
  selectedCells?: Element[] | null;
  selectedTableIds?: string[] | null;
  selectedTables?: Element[] | null;
};

const selectionQueryCache = new WeakMap<BasePlateEditor, SelectionQueryCache>();

const getSelectionQueryCache = (editor: BasePlateEditor) => {
  const { selection } = editor;
  const operationsLength = editor.operations.length;
  const selectionKey = selection ? JSON.stringify(selection) : '';
  const cachedValue = selectionQueryCache.get(editor);

  if (
    cachedValue &&
    cachedValue.operationsLength === operationsLength &&
    cachedValue.selectionKey === selectionKey
  ) {
    return cachedValue;
  }

  const nextValue: SelectionQueryCache = {
    operationsLength,
    selection,
    selectionKey,
  };

  selectionQueryCache.set(editor, nextValue);

  return nextValue;
};

export const getSelectedCellEntries = (
  editor: BasePlateEditor
): ElementEntry[] => {
  const cache = getSelectionQueryCache(editor);

  if ('cellEntries' in cache) {
    return cache.cellEntries ?? [];
  }

  const cellEntries = getTableGridAbove(editor, { format: 'cell' });
  const nextValue = cellEntries.length > 1 ? cellEntries : [];

  cache.cellEntries = nextValue;

  return nextValue;
};

export const getSelectedCells = (editor: BasePlateEditor): Element[] | null => {
  const cache = getSelectionQueryCache(editor);

  if ('selectedCells' in cache) {
    return cache.selectedCells ?? null;
  }

  const cellEntries = getSelectedCellEntries(editor);

  if (cellEntries.length === 0) {
    cache.selectedCells = null;

    return null;
  }

  const nextValue = cellEntries.map(([cell]) => cell);

  cache.selectedCells = nextValue;

  return nextValue;
};

export const getSelectedCellIds = (
  editor: BasePlateEditor
): string[] | null => {
  const cache = getSelectionQueryCache(editor);

  if ('selectedCellIds' in cache) {
    return cache.selectedCellIds ?? null;
  }

  const selectedCellIds = getSelectedCellEntries(editor)
    .map(([cell]) => cell.id)
    .filter((id): id is string => !!id);

  const nextValue = selectedCellIds.length > 0 ? selectedCellIds : null;

  cache.selectedCellIds = nextValue;

  return nextValue;
};

export const getSelectedTableIds = (
  editor: BasePlateEditor
): string[] | null => {
  const cache = getSelectionQueryCache(editor);

  if ('selectedTableIds' in cache) {
    return cache.selectedTableIds ?? null;
  }

  const selectedTables = getSelectedTables(editor);

  if (!selectedTables) {
    cache.selectedTableIds = null;

    return null;
  }

  const selectedTableIds = selectedTables
    .map((table) => table.id)
    .filter((id): id is string => !!id);

  const nextValue = selectedTableIds.length > 0 ? selectedTableIds : null;

  cache.selectedTableIds = nextValue;

  return nextValue;
};

export const getSelectedCell = (
  editor: BasePlateEditor,
  id?: string | null
) => {
  if (!id) return null;

  return (
    getSelectedCellEntries(editor).find(([cell]) => cell.id === id)?.[0] ?? null
  );
};

export const getSelectedTables = (
  editor: BasePlateEditor
): Element[] | null => {
  const cache = getSelectionQueryCache(editor);

  if ('selectedTables' in cache) {
    return cache.selectedTables ?? null;
  }

  const selectedCellEntries = getSelectedCellEntries(editor);

  if (selectedCellEntries.length === 0) {
    cache.selectedTables = null;

    return null;
  }

  const nextValue = getTableGridAbove(editor, { format: 'table' }).map(
    ([table]) => table
  );

  cache.selectedTables = nextValue;

  return nextValue;
};

export const isCellSelected = (editor: BasePlateEditor, id?: string | null) =>
  !!getSelectedCell(editor, id);

export const isSelectingCell = (editor: BasePlateEditor) =>
  getSelectedCellEntries(editor).length > 0;
