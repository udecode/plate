import React from 'react';

import type { NodeKey } from '../../../core';
import { useEditorSelector, useClaimEditableDOMCommit } from '../../core';
import { TablePlugin } from './TablePlugin';

/** Synchronizes structural table selection with the rendered table DOM. */
export const useTableSelectionDOM = (
  tableRef: React.RefObject<HTMLTableElement | null>
): void => {
  useClaimEditableDOMCommit();

  const previousTableRef = React.useRef<HTMLTableElement | null>(null);
  const previousCaretCellElementRef = React.useRef<HTMLElement | null>(null);
  const previousCaretCellKeyRef = React.useRef<NodeKey | null>(null);
  const previousCaretColorRef = React.useRef('');
  const previousSelectedCellKeysRef = React.useRef<readonly NodeKey[] | null>(
    null
  );
  const tableCellElementsByKeyRef = React.useRef<Map<
    string,
    HTMLElement
  > | null>(null);
  const { caretCellKey, selectedCellKeys } = useEditorSelector(
    (editor) => {
      const view = editor.plugin(TablePlugin).read.selection();
      const isExpanded = !!view && view.anchors.length > 1;

      return {
        caretCellKey: isExpanded
          ? (view.cellKeys[view.anchors.indexOf(view.anchor)] ?? null)
          : null,
        selectedCellKeys:
          isExpanded && view.cellKeys.length > 0 ? view.cellKeys : null,
      };
    },
    {
      equalityFn: hasSameSelectionDOMState,
    }
  );

  React.useLayoutEffect(
    () => () => {
      if (previousCaretCellElementRef.current) {
        previousCaretCellElementRef.current.style.caretColor =
          previousCaretColorRef.current;
      }
    },
    []
  );

  React.useLayoutEffect(() => {
    const table = tableRef.current;

    if (!table) return;

    const tableChanged = previousTableRef.current !== table;
    const previousSelectedCellKeysRefValue =
      previousSelectedCellKeysRef.current;

    if (
      !tableChanged &&
      caretCellKey === previousCaretCellKeyRef.current &&
      hasSameKeys(selectedCellKeys, previousSelectedCellKeysRefValue)
    ) {
      return;
    }

    const previousSelectedCellKeys = tableChanged
      ? []
      : (previousSelectedCellKeysRefValue ?? []);
    const nextSelectedCellKeys = selectedCellKeys ?? [];
    let tableCellElementsByKey = tableCellElementsByKeyRef.current;

    if (tableChanged || !tableCellElementsByKey) {
      const nextTableCellElementsByKey = new Map<string, HTMLElement>();

      table
        .querySelectorAll<HTMLElement>(
          'td[data-plite-node-key], th[data-plite-node-key]'
        )
        .forEach((element) => {
          const cellKey = element.getAttribute('data-plite-node-key');

          if (cellKey) nextTableCellElementsByKey.set(cellKey, element);
        });

      tableCellElementsByKey = nextTableCellElementsByKey;
    }

    tableCellElementsByKeyRef.current = tableCellElementsByKey;

    if (tableChanged || caretCellKey !== previousCaretCellKeyRef.current) {
      if (previousCaretCellElementRef.current) {
        previousCaretCellElementRef.current.style.caretColor =
          previousCaretColorRef.current;
      }

      const nextCaretCellElement = caretCellKey
        ? getSelectedCellElement(table, caretCellKey, tableCellElementsByKey)
        : null;

      previousCaretCellElementRef.current = nextCaretCellElement;
      previousCaretCellKeyRef.current = caretCellKey;
      previousCaretColorRef.current =
        nextCaretCellElement?.style.caretColor ?? '';

      if (nextCaretCellElement) {
        nextCaretCellElement.style.caretColor = 'transparent';
      }
    }

    if (previousSelectedCellKeys.length === 0) {
      nextSelectedCellKeys.forEach((cellKey) => {
        getSelectedCellElement(
          table,
          cellKey,
          tableCellElementsByKey
        )?.setAttribute(TABLE_CELL_SELECTED_ATTRIBUTE, 'true');
      });

      previousTableRef.current = table;
      previousSelectedCellKeysRef.current = nextSelectedCellKeys;

      return;
    }

    if (nextSelectedCellKeys.length === 0) {
      previousSelectedCellKeys.forEach((cellKey) => {
        getSelectedCellElement(
          table,
          cellKey,
          tableCellElementsByKey
        )?.removeAttribute(TABLE_CELL_SELECTED_ATTRIBUTE);
      });

      previousTableRef.current = table;
      previousSelectedCellKeysRef.current = nextSelectedCellKeys;

      return;
    }

    const nextSelectedCellKeysSet = new Set(nextSelectedCellKeys);
    const previousSelectedCellKeysSet = new Set(previousSelectedCellKeys);

    previousSelectedCellKeys.forEach((cellKey) => {
      if (nextSelectedCellKeysSet.has(cellKey)) return;

      getSelectedCellElement(
        table,
        cellKey,
        tableCellElementsByKey
      )?.removeAttribute(TABLE_CELL_SELECTED_ATTRIBUTE);
    });

    nextSelectedCellKeys.forEach((cellKey) => {
      if (previousSelectedCellKeysSet.has(cellKey)) return;

      getSelectedCellElement(
        table,
        cellKey,
        tableCellElementsByKey
      )?.setAttribute(TABLE_CELL_SELECTED_ATTRIBUTE, 'true');
    });

    previousTableRef.current = table;
    previousSelectedCellKeysRef.current = nextSelectedCellKeys;
  });
};

const hasSameKeys = (
  nextValue: readonly string[] | null | undefined,
  previousValue: readonly string[] | null | undefined
) => {
  if (nextValue === previousValue) return true;
  if (!nextValue || !previousValue) return !nextValue && !previousValue;
  if (nextValue.length !== previousValue.length) return false;

  for (const [index, nextKey] of nextValue.entries()) {
    if (nextKey !== previousValue[index]) return false;
  }

  return true;
};

const TABLE_CELL_SELECTED_ATTRIBUTE = 'data-table-cell-selected';

type TableSelectionDOMState = Readonly<{
  caretCellKey: NodeKey | null;
  selectedCellKeys: readonly NodeKey[] | null;
}>;

const hasSameSelectionDOMState = (
  nextValue: TableSelectionDOMState | null | undefined,
  previousValue: TableSelectionDOMState | null | undefined
) => {
  if (nextValue === previousValue) return true;
  if (!nextValue || !previousValue) return false;

  return (
    nextValue.caretCellKey === previousValue.caretCellKey &&
    hasSameKeys(nextValue.selectedCellKeys, previousValue.selectedCellKeys)
  );
};

const getSelectedCellElement = (
  table: HTMLTableElement,
  cellKey: string,
  tableCellElementsByKey: Map<string, HTMLElement>
) => {
  const cachedElement = tableCellElementsByKey.get(cellKey);

  if (cachedElement?.isConnected && table.contains(cachedElement)) {
    return cachedElement;
  }

  const escapedCellKey = globalThis.CSS?.escape
    ? globalThis.CSS.escape(cellKey)
    : cellKey.replaceAll('"', '\\"');
  const element = table.querySelector<HTMLElement>(
    `td[data-plite-node-key="${escapedCellKey}"], th[data-plite-node-key="${escapedCellKey}"]`
  );

  if (element) {
    tableCellElementsByKey.set(cellKey, element);
  } else {
    tableCellElementsByKey.delete(cellKey);
  }

  return element;
};
