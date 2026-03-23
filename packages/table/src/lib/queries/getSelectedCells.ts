import type { ElementEntry, SlateEditor, TElement } from 'platejs';

import { getTableGridAbove } from './getTableGridAbove';

type SelectionQueryCache = {
  cellEntries?: ElementEntry[];
  children: SlateEditor['children'];
  selection: SlateEditor['selection'];
  selectedCellIds?: string[] | null;
  selectedCells?: TElement[] | null;
  selectedTableIds?: string[] | null;
  selectedTables?: TElement[] | null;
};

const selectionQueryCache = new WeakMap<SlateEditor, SelectionQueryCache>();

const getSelectionQueryCache = (editor: SlateEditor) => {
  const { selection } = editor;
  const { children } = editor;
  const cachedValue = selectionQueryCache.get(editor);

  if (
    cachedValue &&
    cachedValue.children === children &&
    cachedValue.selection === selection
  ) {
    return cachedValue;
  }

  const nextValue: SelectionQueryCache = {
    children,
    selection,
  };

  selectionQueryCache.set(editor, nextValue);

  return nextValue;
};

export const getSelectedCellEntries = (editor: SlateEditor): ElementEntry[] => {
  const cache = getSelectionQueryCache(editor);

  if ('cellEntries' in cache) {
    return cache.cellEntries ?? [];
  }

  const cellEntries = getTableGridAbove(editor, { format: 'cell' });
  const nextValue = cellEntries.length > 1 ? cellEntries : [];

  cache.cellEntries = nextValue;

  return nextValue;
};

export const getSelectedCells = (editor: SlateEditor): TElement[] | null => {
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

export const getSelectedCellIds = (editor: SlateEditor): string[] | null => {
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

export const getSelectedTableIds = (editor: SlateEditor): string[] | null => {
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

export const getSelectedCell = (editor: SlateEditor, id?: string | null) => {
  if (!id) return null;

  return (
    getSelectedCellEntries(editor).find(([cell]) => cell.id === id)?.[0] ?? null
  );
};

export const getSelectedTables = (editor: SlateEditor): TElement[] | null => {
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

export const isCellSelected = (editor: SlateEditor, id?: string | null) =>
  !!getSelectedCell(editor, id);

export const isSelectingCell = (editor: SlateEditor) =>
  getSelectedCellEntries(editor).length > 0;
