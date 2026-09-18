import type React from 'react';

import {
  ElementApi,
  Hotkeys,
  type NodeKey,
  NodeApi,
  PathApi,
  RangeApi,
  SelectionApi,
  TextApi,
} from '../../../core';
import { getSelection } from '../../../dom/plite-dom.internal';
import { failInvariant } from '../../../features/table/internal/failInvariant';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../../../features/table/lib/BaseTablePlugin';
import {
  createTableNodeSelection,
  getTableSelectionExpansion,
  getTableSelectionNeighbor,
  projectTableSelection,
  readTableSelection,
  type TableSelectionView,
} from '../../../features/table/lib/internal/selection';
import {
  type Editor,
  toReactPlugin,
  useEditor,
  useIsomorphicLayoutEffect,
  useModelEditor,
} from '../../core';
import { useEditorContext } from '../../internal/plite-components';
import {
  useClaimEditableDOMCommit,
  useEditorRuntimeState,
} from '../../plite-react';
import {
  getTableSelectionCellRef,
  updateTableSelectionHostState,
} from './tableSelectionHostBinding.internal';

const csvSpecialCharacterPattern = /[",\r\n]/;
const escapeCsvField = (value: string) =>
  csvSpecialCharacterPattern.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value;

const readInternalSelection = (
  editor: Editor,
  at?: Parameters<typeof readTableSelection>[1]['at']
) =>
  editor.read((state) =>
    readTableSelection(state, {
      at,
      cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
      selection: state.selection(),
      tableType: editor.plugin(BaseTablePlugin).schema.type,
    })
  );

const writeTableSelection = (
  editor: Editor,
  data: Pick<DataTransfer, 'getData' | 'setData'>
): 'rejected' | 'unhandled' | 'written' => {
  const view = readInternalSelection(editor);

  if (!view || view.cellEntries.length <= 1) return 'unhandled';
  const selectedArea = view.anchors.reduce(
    (area, anchor) => area + anchor.colSpan * anchor.rowSpan,
    0
  );
  const boundsArea =
    (view.bounds.maxCol - view.bounds.minCol + 1) *
    (view.bounds.maxRow - view.bounds.minRow + 1);

  if (!view.complete || selectedArea !== boundsArea) return 'rejected';
  const rows = projectTableSelection(view).children;
  const values = rows.map((row) =>
    NodeApi.isElement(row)
      ? row.children.map((cell) => NodeApi.string(cell))
      : []
  );
  const csv = `${values
    .map((row) => row.map(escapeCsvField).join(','))
    .join('\n')}\n`;
  const tsv = `${values.map((row) => row.join('\t')).join('\n')}\n`;

  try {
    editor.api.dom.clipboard.writeSlice(data, {
      formats: {
        'text/csv': csv,
        'text/plain': tsv,
        'text/tab-separated-values': tsv,
        'text/tsv': tsv,
      },
      slice: editor.read.slice.export(),
    });
  } catch {
    return 'rejected';
  }

  return 'written';
};

const getTableAnchorPoint = (
  view: TableSelectionView,
  anchor: TableSelectionView['anchor']
) => {
  const [text, path] = NodeApi.first(anchor.cell, []);

  return TextApi.isText(text)
    ? {
        offset: 0,
        path: view.tablePath.concat(anchor.path, path),
        ...(view.root === undefined ? {} : { root: view.root }),
      }
    : undefined;
};

const moveTableSelection = (
  editor: Editor,
  {
    at,
    edge,
    fromOneCell,
    reverse,
  }: {
    at?: Parameters<typeof readTableSelection>[1]['at'];
    edge?: 'bottom' | 'left' | 'right' | 'top';
    fromOneCell?: boolean;
    reverse?: boolean;
  } = {}
) => {
  let handled = false;

  editor.update((tx) => {
    const view = readTableSelection(tx, {
      at,
      cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
      selection: tx.selection(),
      tableType: editor.plugin(BaseTablePlugin).schema.type,
    });

    if (!view) return;
    if (edge) {
      if (view.anchors.length <= (fromOneCell ? 0 : 1)) return;
      const expansion = getTableSelectionExpansion(view, edge);

      if (!expansion) return;
      const anchor = getTableAnchorPoint(view, expansion.anchor);
      const focus = getTableAnchorPoint(view, expansion.focus);

      if (!anchor || !focus) return;
      const range = { anchor, focus };
      const expanded = readTableSelection(tx, {
        at: range,
        cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
        selection: tx.selection(),
        tableType: editor.plugin(BaseTablePlugin).schema.type,
      });

      tx.selection.set(
        (expanded && createTableNodeSelection(expanded)) ?? range
      );
      handled = true;
      return;
    }

    const target = getTableSelectionNeighbor(
      view.context,
      view.anchor,
      reverse ? 'above' : 'below'
    );

    if (target) {
      const point = getTableAnchorPoint(view, target);

      if (point) tx.selection.set(point);
      handled = true;
      return;
    }

    const rootNode = {
      children: view.root === undefined ? tx.children() : tx.root(view.root),
      type: '__table_root__',
    };
    const texts = [...NodeApi.texts(rootNode)];
    const nextTablePath = PathApi.next(view.tablePath);
    const text = reverse
      ? texts
          .reverse()
          .find(([, path]) => PathApi.isBefore(path, view.tablePath))
      : texts.find(([, path]) => !PathApi.isBefore(path, nextTablePath));

    if (!text) return;
    const point = {
      offset: reverse ? text[0].text.length : 0,
      path: text[1],
      ...(view.root === undefined ? {} : { root: view.root }),
    };

    tx.selection.set({ anchor: point, focus: point });
    handled = true;
  });

  return handled;
};

const selectAllTable = (editor: Editor) => {
  let handled = false;

  editor.update((tx) => {
    const selection = tx.selection();
    const currentView = readTableSelection(tx, {
      cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
      selection,
      tableType: editor.plugin(BaseTablePlugin).schema.type,
    });
    const tablePath =
      currentView?.tablePath ?? tx.nodes.above({ type: BaseTablePlugin })?.[1];

    if (!tablePath) return;
    const range = tx.ranges.get(tablePath);

    if (!range) return;
    const allCellsSelected =
      selection &&
      SelectionApi.isNode(selection) &&
      !!currentView &&
      currentView.anchors.length === currentView.context.grid.anchors.length;

    if ((selection && RangeApi.equals(selection, range)) || allCellsSelected) {
      const documentRange = tx.ranges.get([]);

      if (documentRange) tx.selection.set(documentRange);
      handled = true;
      return;
    }
    const view = readTableSelection(tx, {
      at: range,
      cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
      selection,
      tableType: editor.plugin(BaseTablePlugin).schema.type,
    });

    tx.selection.set((view && createTableNodeSelection(view)) ?? range);
    handled = true;
  });

  return handled;
};

const tabTable = (editor: Editor, reverse = false) => {
  let handled = false;

  editor.update((tx) => {
    const selection = tx.selection();
    const view = readTableSelection(tx, {
      cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
      selection,
      tableType: editor.plugin(BaseTablePlugin).schema.type,
    });

    if (selection && (view?.anchors.length ?? 0) > 1) {
      tx.selection.collapse({ edge: 'end' });
      handled = true;
      return;
    }
    const cell = tx.nodes.find({
      match: (node) =>
        ElementApi.isElement(node) &&
        node.type === editor.plugin(BaseTableCellPlugin).schema.type,
    });

    if (!cell || !view) return;
    const anchor = view.context.anchorAtPath(cell[1]);
    const target =
      anchor &&
      getTableSelectionNeighbor(
        view.context,
        anchor,
        reverse ? 'previous' : 'next'
      );
    const targetEntry = target && view.context.entryAt(target.row, target.col);

    if (targetEntry) {
      const point = tx.points.start(targetEntry[1]);

      if (point) tx.selection.set(point);
      handled = true;
      return;
    }
    if (!reverse) {
      handled = tx.plugin(BaseTablePlugin).insertRow({
        at: cell[1],
        select: true,
      });
    }
  });

  return handled;
};

export const TableCellPlugin = toReactPlugin(BaseTableCellPlugin);

export const TableRowPlugin = toReactPlugin(BaseTableRowPlugin, {
  dependencies: [TableCellPlugin],
});

type TableSelectionHostState = Readonly<{
  anchorKey: NodeKey | null;
  ownsSelection: boolean;
  selectedKeys: readonly NodeKey[];
}>;

const hasSameKeys = (
  nextValue: readonly NodeKey[],
  previousValue: readonly NodeKey[]
) => {
  if (nextValue === previousValue) return true;
  if (nextValue.length !== previousValue.length) return false;

  return nextValue.every((key, index) => key === previousValue[index]);
};

const hasSameTableSelectionHostState = (
  nextValue: TableSelectionHostState | null | undefined,
  previousValue: TableSelectionHostState | null | undefined
) =>
  nextValue === previousValue ||
  (!!nextValue &&
    !!previousValue &&
    nextValue.anchorKey === previousValue.anchorKey &&
    nextValue.ownsSelection === previousValue.ownsSelection &&
    hasSameKeys(nextValue.selectedKeys, previousValue.selectedKeys));

const readTableSelectionHostState = (
  editor: Editor
): TableSelectionHostState => {
  const ownsSelection = editor.read.selection() !== null;
  const view = editor.plugin(TablePlugin).read.selection();
  const isExpanded = !!view && view.cells.length > 1;

  if (!isExpanded) {
    return { anchorKey: null, ownsSelection, selectedKeys: [] };
  }

  return {
    anchorKey: view.anchor,
    ownsSelection,
    selectedKeys: view.cells.flatMap(([, path]) => {
      const key = editor.key(
        view.root === undefined ? path : { offset: 0, path, root: view.root }
      );

      return key ? [key] : [];
    }),
  };
};

function TableSelectionHostEffect() {
  useClaimEditableDOMCommit();

  const editor = useEditor();
  const modelEditor = useModelEditor();
  const viewEditor = useEditorContext();
  const modelState = useEditorRuntimeState(
    modelEditor,
    () => readTableSelectionHostState(modelEditor),
    { equalityFn: hasSameTableSelectionHostState }
  );
  const editorState = useEditorRuntimeState(
    editor,
    () => readTableSelectionHostState(editor),
    { equalityFn: hasSameTableSelectionHostState }
  );
  const state = editorState.ownsSelection ? editorState : modelState;

  useIsomorphicLayoutEffect(() => {
    updateTableSelectionHostState(viewEditor, state);
  }, [state, viewEditor]);
  useIsomorphicLayoutEffect(
    () => () => {
      // Ref lifetimes own hosts; effect replay only resets their selection paint.
      updateTableSelectionHostState(viewEditor, {
        anchorKey: null,
        selectedKeys: [],
      });
    },
    [viewEditor]
  );

  return null;
}

/** Enables support for tables with React-specific features. */
export const TablePlugin = toReactPlugin(BaseTablePlugin, {
  dependencies: [TableRowPlugin],
  shortcuts: {
    tab: {
      handler: ({ editor }) => tabTable(editor),
      keys: 'tab',
      priority: 10,
    },
    untab: {
      handler: ({ editor }) => tabTable(editor, true),
      keys: 'shift+tab',
      priority: 10,
    },
  },
  on: {
    copy: ({ editor, event }) => {
      const result = writeTableSelection(editor, event.clipboardData);

      if (result === 'unhandled') return undefined;

      event.preventDefault();
      return true;
    },
    cut: ({ editor, event }) => {
      const result = writeTableSelection(editor, event.clipboardData);

      if (result === 'unhandled') return undefined;

      event.preventDefault();
      if (result === 'rejected') return true;
      editor.update.fragment.delete();
      return true;
    },
    mouseUp: ({ editor }) => {
      const domSelection = getSelection(
        editor.api.dom.findDocumentOrShadowRoot()
      );

      if (!domSelection || domSelection.rangeCount === 0) return undefined;

      const range = editor.api.dom.resolveRange(domSelection, {
        exactMatch: false,
      });
      const view = range && readInternalSelection(editor, range);
      const selection = view && createTableNodeSelection(view);

      if (!selection) return undefined;

      editor.update.selection.set(selection);

      return true;
    },
    keyDown: ({ editor, event, read }) => {
      if (event.defaultPrevented) return undefined;

      const selection = editor.read.selection();

      const getMoveContext = (point = selection?.anchor) => {
        if (
          !point ||
          !editor.read.selection.isWithinBlock({ type: TableCellPlugin })
        ) {
          return undefined;
        }

        const cellEntry = editor.read.nodes.above({
          at: point,
          type: TableCellPlugin,
        });
        const blockEntry = editor.read.nodes.block({ at: point });

        if (!cellEntry || !blockEntry) return undefined;

        return {
          blockPath: blockEntry[1],
          cellPath: cellEntry[1],
          point,
        };
      };
      const hasAdjacentBlock = ({
        blockPath,
        cellPath,
        reverse,
      }: NonNullable<ReturnType<typeof getMoveContext>> & {
        reverse: boolean;
      }) => {
        const adjacentBlock = reverse
          ? editor.read.nodes.previous({
              at: blockPath,
              match: (node) => editor.read.schema.isBlock(node),
            })
          : editor.read.nodes.next({
              at: blockPath,
              match: (node) => editor.read.schema.isBlock(node),
            });

        return (
          !!adjacentBlock && PathApi.isAncestor(cellPath, adjacentBlock[1])
        );
      };
      const shouldMove = ({
        blockPath,
        point,
        reverse,
      }: Pick<
        NonNullable<ReturnType<typeof getMoveContext>>,
        'blockPath' | 'point'
      > & {
        reverse: boolean;
      }) => {
        const blockRange = editor.read.ranges.get(blockPath);
        const isAtBlockEdge = reverse
          ? editor.read.points.isStart(point, blockPath)
          : editor.read.points.isEnd(point, blockPath);

        if (!blockRange) return isAtBlockEdge;

        const getRects = (
          domRange?: Pick<globalThis.Range, 'getClientRects'> | null
        ) =>
          Array.from(domRange?.getClientRects?.() ?? []).filter(
            (rect) => rect.height > 0
          );
        const caretRects = getRects(
          editor.api.dom.resolveDOMRange({ anchor: point, focus: point })
        );
        const blockRects = getRects(editor.api.dom.resolveDOMRange(blockRange));

        if (caretRects.length === 0 || blockRects.length === 0) {
          return isAtBlockEdge;
        }

        const caretRect =
          caretRects.at(-1) ?? failInvariant('Expected value to be defined');
        const boundary = reverse
          ? Math.min(...blockRects.map((rect) => rect.top))
          : Math.max(...blockRects.map((rect) => rect.bottom));

        return reverse
          ? caretRect.top <= boundary + 1
          : caretRect.bottom >= boundary - 1;
      };
      const moveLine = (reverse: boolean) => {
        if (!editor.read.selection.isCollapsed()) return false;

        const context = getMoveContext();

        if (!context) return false;
        if (hasAdjacentBlock({ ...context, reverse })) return false;
        if (!shouldMove({ ...context, reverse })) return false;

        return moveTableSelection(editor, { reverse });
      };
      const edges = {
        'shift+down': 'bottom',
        'shift+left': 'left',
        'shift+right': 'right',
        'shift+up': 'top',
      } as const;
      const shouldMoveSingleCell = (key: keyof typeof edges) => {
        const context = getMoveContext(selection?.focus);

        if (!context) return false;

        const { blockPath, cellPath, point } = context;

        if (key === 'shift+left') {
          return editor.read.points.isStart(point, cellPath);
        }
        if (key === 'shift+right') {
          return editor.read.points.isEnd(point, cellPath);
        }

        const reverse = key === 'shift+up';

        if (hasAdjacentBlock({ blockPath, cellPath, point, reverse })) {
          return false;
        }

        return shouldMove({ blockPath, point, reverse });
      };

      if (
        // oxlint-disable-next-line typescript/no-deprecated -- [P1 local-invariant] Safari IME exposes composition code 229 through which when cell selection is active.
        event.which === 229 &&
        (read.selection()?.cells.length ?? 0) > 1
      ) {
        editor.update.selection.collapse({ edge: 'end' });

        return true;
      }

      const extended = {
        'shift+down': Hotkeys.isExtendDownward(event),
        'shift+left': Hotkeys.isExtendBackward(event),
        'shift+right': Hotkeys.isExtendForward(event),
        'shift+up': Hotkeys.isExtendUpward(event),
      };

      for (const key of Object.keys(extended) as Array<keyof typeof extended>) {
        if (!extended[key]) continue;

        const reverse = key === 'shift+up';
        const handled =
          moveTableSelection(editor, { edge: edges[key], reverse }) ||
          (shouldMoveSingleCell(key) &&
            moveTableSelection(editor, {
              at: selection ?? failInvariant('Expected value to be defined'),
              edge: edges[key],
              fromOneCell: true,
              reverse,
            }));

        if (handled) {
          event.preventDefault();
          event.stopPropagation();

          return true;
        }
      }

      const handled =
        Hotkeys.isMoveUpward(event) || Hotkeys.isMoveLineBackward(event)
          ? moveLine(true)
          : Hotkeys.isMoveDownward(event) || Hotkeys.isMoveLineForward(event)
            ? moveLine(false)
            : Hotkeys.isSelectAll(event)
              ? selectAllTable(editor)
              : false;

      if (handled) {
        event.preventDefault();
        event.stopPropagation();

        return true;
      }

      return undefined;
    },
  },
}).extend({
  inject: {
    nodeProps: {
      transformProps: (context) => {
        const { editor, element } = context;

        if (!element) return undefined;

        const key = editor.key(element);

        if (!key) return undefined;

        return {
          ref: getTableSelectionCellRef(
            editor,
            key,
            (
              context as typeof context & {
                attributes?: { ref?: React.Ref<HTMLElement> };
              }
            ).attributes?.ref
          ),
        };
      },
    },
  },
  slots: { afterEditable: TableSelectionHostEffect },
  targetPlugins: [TableCellPlugin],
});
