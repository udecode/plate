import { useTableValue } from './useTableStore';
import { TablePlugin } from './TablePlugin';
import {
  useEditor,
  useEditorPlugin,
  useEditorSelector,
  useElement,
} from '@platejs/core/react';
import { PathApi, type NodeKey } from '@platejs/plite';
import { useClaimEditableDOMCommit } from '@platejs/plite-react/internal';
import React from 'react';

export const useTableElement = () => {
  useClaimEditableDOMCommit();

  const editor = useEditor();
  const { store } = useEditorPlugin(TablePlugin);

  const { disableMarginLeft } = store.get();

  const element = useElement(TablePlugin);
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
  const editor = useEditor();
  const colSizeOverrides = useTableValue('colSizeOverrides');
  const tableNode = useElement(TablePlugin);

  const overriddenColSizes = useEditorSelector(
    () => {
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
    { equalityFn: (a, b) => !!a && PathApi.equals(a, b) }
  );

  return overriddenColSizes;
};

const hasSameKeys = (
  nextValue: readonly string[] | null | undefined,
  prevValue: readonly string[] | null | undefined
) => {
  if (nextValue === prevValue) return true;
  if (!nextValue || !prevValue) return !nextValue && !prevValue;
  if (nextValue.length !== prevValue.length) return false;

  for (const [index, nextKey] of nextValue.entries()) {
    if (nextKey !== prevValue[index]) return false;
  }

  return true;
};

const TABLE_CELL_SELECTED_ATTRIBUTE = 'data-table-cell-selected';

type TableSelectionDomState = Readonly<{
  caretCellKey: NodeKey | null;
  selectedCellKeys: readonly NodeKey[] | null;
}>;

const hasSameSelectionDomState = (
  nextValue: TableSelectionDomState | null | undefined,
  prevValue: TableSelectionDomState | null | undefined
) => {
  if (nextValue === prevValue) return true;
  if (!nextValue || !prevValue) return false;

  return (
    nextValue.caretCellKey === prevValue.caretCellKey &&
    hasSameKeys(nextValue.selectedCellKeys, prevValue.selectedCellKeys)
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
    `[data-table-cell-key="${escapedCellKey}"]`
  );

  if (element) {
    tableCellElementsByKey.set(cellKey, element);
  } else {
    tableCellElementsByKey.delete(cellKey);
  }

  return element;
};

export const useTableSelectionDom = (
  tableRef: React.RefObject<HTMLTableElement | null>
) => {
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
      const view = editor.plugin(TablePlugin).read.getSelection();
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
        .querySelectorAll<HTMLElement>('[data-table-cell-key]')
        .forEach((element) => {
          const cellKey = element.getAttribute('data-table-cell-key');

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
