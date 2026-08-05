import { useTableValue } from './useTableStore';
import { TablePlugin } from './TablePlugin';
import {
  useEditorPlugin,
  useEditorSelector,
  useElement,
} from '@platejs/core/react';

import { useClaimEditableDOMCommit } from '@platejs/plite-react/internal';
import { KEYS, type TTableElement } from '@platejs/utils';
import React from 'react';

export const useTableElement = () => {
  useClaimEditableDOMCommit();

  const { editor, store } = useEditorPlugin(TablePlugin);

  const { disableMarginLeft } = store.get();

  const element = useElement<TTableElement>();
  const marginLeftOverride = useTableValue('marginLeftOverride');

  const marginLeft = disableMarginLeft
    ? 0
    : (marginLeftOverride ?? element.marginLeft ?? 0);

  return {
    marginLeft,
    props: {
      onMouseDown: () => {
        // Ordinary table presses collapse a multi-cell selection before caret
        // placement. Product drag handles stop this event at the table boundary.
        if (editor.plugin(TablePlugin).read.isSelectingCell()) {
          editor.update.selection.collapse();
        }
      },
    },
  };
};

/**
 * Returns colSizes with overrides applied. Unset node.colSizes if `colCount`
 * updates to 1.
 */
export const useTableColSizes = ({
  disableOverrides = false,
  transformColSizes,
}: {
  disableOverrides?: boolean;
  transformColSizes?: (colSizes: number[]) => number[];
} = {}): number[] => {
  const { editor } = useEditorPlugin(TablePlugin);
  const colSizeOverrides = useTableValue('colSizeOverrides');

  // Read the table element from React context rather than re-reading from the
  // editor via a path. During a transaction that inserts or splits a block
  // before the table (e.g. pressing Enter in a heading), the path from
  // useElementSelector can become stale and resolve to the wrong node, crashing
  // compileTableGrid. useElement always returns the context-bound table node.
  const tableElement = useElement<TTableElement>(KEYS.table);

  const overriddenColSizes = React.useMemo(() => {
    if (!tableElement) return [];

    const colSizes = editor
      .plugin(TablePlugin)
      .api.getOverriddenColumnSizes(
        tableElement,
        disableOverrides ? undefined : colSizeOverrides
      );

    if (transformColSizes) {
      return transformColSizes(colSizes);
    }

    return colSizes;
  }, [tableElement, colSizeOverrides, disableOverrides, editor, transformColSizes]);

  return overriddenColSizes;
};

const hasSameIds = (
  nextValue: readonly string[] | null | undefined,
  prevValue: readonly string[] | null | undefined
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

type TableSelectionDomState = Readonly<{
  caretCellId: string | null;
  selectedCellIds: readonly string[] | null;
}>;

const hasSameSelectionDomState = (
  nextValue: TableSelectionDomState | null | undefined,
  prevValue: TableSelectionDomState | null | undefined
) => {
  if (nextValue === prevValue) return true;
  if (!nextValue || !prevValue) return false;

  return (
    nextValue.caretCellId === prevValue.caretCellId &&
    hasSameIds(nextValue.selectedCellIds, prevValue.selectedCellIds)
  );
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

  const escapedCellId = globalThis.CSS?.escape
    ? globalThis.CSS.escape(cellId)
    : cellId.replaceAll('"', '\\"');
  const element = table.querySelector<HTMLElement>(
    `[data-table-cell-id="${escapedCellId}"]`
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
  const previousCaretCellElementRef = React.useRef<HTMLElement | null>(null);
  const previousCaretCellIdRef = React.useRef<string | null>(null);
  const previousCaretColorRef = React.useRef('');
  const previousSelectedCellIdsRef = React.useRef<readonly string[] | null>(
    null
  );
  const tableCellElementsByIdRef = React.useRef<Map<
    string,
    HTMLElement
  > | null>(null);
  const { caretCellId, selectedCellIds } = useEditorSelector(
    (editor) => {
      const view = editor.plugin(TablePlugin).read.getSelection();
      const isExpanded = !!view && view.anchors.length > 1;

      return {
        caretCellId: isExpanded ? (view.anchor.id ?? null) : null,
        selectedCellIds:
          isExpanded && view.cellIds.length > 0 ? view.cellIds : null,
      };
    },
    {
      equalityFn: hasSameSelectionDomState,
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
    const previousSelectedCellIdsRefValue = previousSelectedCellIdsRef.current;

    if (
      !tableChanged &&
      caretCellId === previousCaretCellIdRef.current &&
      hasSameIds(selectedCellIds, previousSelectedCellIdsRefValue)
    ) {
      return;
    }

    const previousSelectedCellIds = tableChanged
      ? []
      : (previousSelectedCellIdsRefValue ?? []);
    const nextSelectedCellIds = selectedCellIds ?? [];
    let tableCellElementsById = tableCellElementsByIdRef.current;

    if (tableChanged || !tableCellElementsById) {
      const nextTableCellElementsById = new Map<string, HTMLElement>();

      table
        .querySelectorAll<HTMLElement>('[data-table-cell-id]')
        .forEach((element) => {
          const cellId = element.getAttribute('data-table-cell-id');

          if (cellId) nextTableCellElementsById.set(cellId, element);
        });

      tableCellElementsById = nextTableCellElementsById;
    }

    tableCellElementsByIdRef.current = tableCellElementsById;

    if (tableChanged || caretCellId !== previousCaretCellIdRef.current) {
      if (previousCaretCellElementRef.current) {
        previousCaretCellElementRef.current.style.caretColor =
          previousCaretColorRef.current;
      }

      const nextCaretCellElement = caretCellId
        ? getSelectedCellElement(table, caretCellId, tableCellElementsById)
        : null;

      previousCaretCellElementRef.current = nextCaretCellElement;
      previousCaretCellIdRef.current = caretCellId;
      previousCaretColorRef.current =
        nextCaretCellElement?.style.caretColor ?? '';

      if (nextCaretCellElement) {
        nextCaretCellElement.style.caretColor = 'transparent';
      }
    }

    if (previousSelectedCellIds.length === 0) {
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
