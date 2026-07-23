import { BaseTablePlugin } from '../lib/BaseTablePlugin';
import { useTableValue } from './useTableStore';
import { TablePlugin } from './TablePlugin';
import {
  useEditorPlugin,
  useEditorSelector,
  useElement,
  useElementSelector,
} from '@platejs/core/react';
import { PathApi } from '@platejs/plite';
import { useEditorReadOnly } from '@platejs/plite-react';
import { KEYS, type TTableElement } from '@platejs/utils';
import React from 'react';

export const useTableElement = () => {
  const { editor, getOptions } = useEditorPlugin(TablePlugin);

  const { disableMarginLeft } = getOptions();

  const element = useElement<TTableElement>();
  const marginLeftOverride = useTableValue('marginLeftOverride');

  const marginLeft = disableMarginLeft
    ? 0
    : (marginLeftOverride ?? element.marginLeft ?? 0);

  return {
    marginLeft,
    props: {
      onMouseDown: () => {
        // until cell dnd is supported, we collapse the selection on mouse down
        if (editor.plugin(TablePlugin).getOption('isSelectingCell')) {
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

  const overriddenColSizes = useElementSelector(
    ([tableNode]) => {
      const colSizes = editor
        .plugin(TablePlugin)
        .api.getOverriddenColumnSizes(
          tableNode,
          disableOverrides ? undefined : colSizeOverrides
        );

      if (transformColSizes) {
        return transformColSizes(colSizes);
      }

      return colSizes;
    },
    {
      key: KEYS.table,
      equalityFn: (a, b) => !!a && !!b && PathApi.equals(a, b),
    }
  );

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

export const useSelectedCells = () => {
  const readOnly = useEditorReadOnly();
  const { setOptions } = useEditorPlugin(BaseTablePlugin);
  const selectionState = useEditorSelector(
    (editor) => {
      if (readOnly) {
        return { selectedCellIds: null, selectedContent: null };
      }

      const selectedCellIds = editor
        .plugin(TablePlugin)
        .api.getSelectedCellIds();

      return {
        selectedCellIds,
        selectedContent: selectedCellIds ? editor.read.children() : null,
      };
    },
    {
      equalityFn: (nextValue, prevValue) =>
        !!nextValue &&
        nextValue.selectedContent === prevValue.selectedContent &&
        hasSameIds(nextValue.selectedCellIds, prevValue.selectedCellIds),
    }
  );

  React.useLayoutEffect(() => {
    const nextSelectedCellIds = selectionState.selectedCellIds;

    setOptions((draft) => {
      const selectionOverrides = draft._selectionOverrides ?? {};

      if (
        !hasSameIds(selectionOverrides.cellIds, nextSelectedCellIds) ||
        selectionOverrides.tableIds !== undefined
      ) {
        draft._selectionOverrides = { cellIds: nextSelectedCellIds };
      }

      draft._selectionVersion = (draft._selectionVersion ?? 0) + 1;
    });
  }, [selectionState, setOptions]);
};

const TABLE_CELL_SELECTED_ATTRIBUTE = 'data-table-cell-selected';
const TABLE_SELECTING_ATTRIBUTE = 'data-table-selecting';

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
  const previousSelectedCellIdsRef = React.useRef<string[] | null>(null);
  const tableCellElementsByIdRef = React.useRef<Map<
    string,
    HTMLElement
  > | null>(null);
  const selectedCellIds = useEditorSelector(
    (editor) => editor.plugin(TablePlugin).api.getSelectedCellIds(),
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
