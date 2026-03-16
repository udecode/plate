import React from 'react';

import { useEditorSelector } from 'platejs/react';

import { getSelectedCellIds } from '../../../lib';

const hasSameIds = (
  nextValue: string[] | null | undefined,
  prevValue: string[] | null | undefined
) => {
  if (nextValue === prevValue) return true;
  if (!nextValue || !prevValue) return !nextValue && !prevValue;
  if (nextValue.length !== prevValue.length) return false;

  for (const [index, nextId] of nextValue.entries()) {
    if (nextId !== prevValue[index]) return false;
  }

  return true;
};

const TABLE_CELL_SELECTED_ATTRIBUTE = 'data-table-cell-selected';
const TABLE_SELECTING_ATTRIBUTE = 'data-table-selecting';
const TABLE_CELL_SELECTOR = '[data-table-cell-id]';

const setTableSelectingAttribute = (
  table: HTMLTableElement,
  isSelecting: boolean
) => {
  if (isSelecting) {
    table.setAttribute(TABLE_SELECTING_ATTRIBUTE, 'true');

    return;
  }

  table.removeAttribute(TABLE_SELECTING_ATTRIBUTE);
};

const escapeForAttributeSelector = (value: string) =>
  globalThis.CSS?.escape
    ? globalThis.CSS.escape(value)
    : value.replaceAll('"', '\\"');

const createTableCellElementsById = (table: HTMLTableElement) => {
  const tableCellElementsById = new Map<string, HTMLElement>();

  table
    .querySelectorAll<HTMLElement>(TABLE_CELL_SELECTOR)
    .forEach((element) => {
      const cellId = element.getAttribute('data-table-cell-id');

      if (cellId) {
        tableCellElementsById.set(cellId, element);
      }
    });

  return tableCellElementsById;
};

const getSelectedCellElement = (
  table: HTMLTableElement,
  cellId: string,
  tableCellElementsById: Map<string, HTMLElement>
) => {
  const cachedElement = tableCellElementsById.get(cellId);

  if (cachedElement?.isConnected && table.contains(cachedElement)) {
    return cachedElement;
  }

  const element = table.querySelector<HTMLElement>(
    `[data-table-cell-id="${escapeForAttributeSelector(cellId)}"]`
  );

  if (element) {
    tableCellElementsById.set(cellId, element);
  } else {
    tableCellElementsById.delete(cellId);
  }

  return element;
};

export const useTableSelectionDom = (
  tableRef: React.RefObject<HTMLTableElement | null>
) => {
  const previousTableRef = React.useRef<HTMLTableElement | null>(null);
  const previousSelectedCellIdsRef = React.useRef<string[] | null>(null);
  const tableCellElementsByIdRef = React.useRef<Map<
    string,
    HTMLElement
  > | null>(null);
  const selectedCellIds = useEditorSelector(
    (editor) => getSelectedCellIds(editor),
    [],
    {
      equalityFn: hasSameIds,
    }
  );

  React.useLayoutEffect(() => {
    const table = tableRef.current;

    if (!table) return;

    const tableChanged = previousTableRef.current !== table;
    const previousSelectedCellIdsRefValue = previousSelectedCellIdsRef.current;

    if (
      !tableChanged &&
      hasSameIds(selectedCellIds, previousSelectedCellIdsRefValue)
    ) {
      return;
    }

    const previousSelectedCellIds: string[] = tableChanged
      ? []
      : (previousSelectedCellIdsRefValue ?? []);
    const nextSelectedCellIds: string[] = selectedCellIds ?? [];
    const tableCellElementsById =
      tableChanged || !tableCellElementsByIdRef.current
        ? createTableCellElementsById(table)
        : tableCellElementsByIdRef.current;

    tableCellElementsByIdRef.current = tableCellElementsById;

    if (previousSelectedCellIds.length === 0) {
      setTableSelectingAttribute(table, nextSelectedCellIds.length > 0);

      nextSelectedCellIds.forEach((cellId) => {
        getSelectedCellElement(
          table,
          cellId,
          tableCellElementsById
        )?.setAttribute(TABLE_CELL_SELECTED_ATTRIBUTE, 'true');
      });

      previousTableRef.current = table;
      previousSelectedCellIdsRef.current = nextSelectedCellIds;

      return;
    }

    if (nextSelectedCellIds.length === 0) {
      setTableSelectingAttribute(table, false);

      previousSelectedCellIds.forEach((cellId) => {
        getSelectedCellElement(
          table,
          cellId,
          tableCellElementsById
        )?.removeAttribute(TABLE_CELL_SELECTED_ATTRIBUTE);
      });

      previousTableRef.current = table;
      previousSelectedCellIdsRef.current = nextSelectedCellIds;

      return;
    }

    const nextSelectedCellIdsSet = new Set(nextSelectedCellIds);
    const previousSelectedCellIdsSet = new Set(previousSelectedCellIds);

    setTableSelectingAttribute(table, true);

    previousSelectedCellIds.forEach((cellId) => {
      if (nextSelectedCellIdsSet.has(cellId)) return;

      getSelectedCellElement(
        table,
        cellId,
        tableCellElementsById
      )?.removeAttribute(TABLE_CELL_SELECTED_ATTRIBUTE);
    });

    nextSelectedCellIds.forEach((cellId) => {
      if (previousSelectedCellIdsSet.has(cellId)) return;

      getSelectedCellElement(
        table,
        cellId,
        tableCellElementsById
      )?.setAttribute(TABLE_CELL_SELECTED_ATTRIBUTE, 'true');
    });

    previousTableRef.current = table;
    previousSelectedCellIdsRef.current = nextSelectedCellIds;
  });
};
