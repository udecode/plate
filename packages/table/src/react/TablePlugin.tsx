import { DebugPlugin, Hotkeys } from '@platejs/core';
import { type PlateEditor, toPlatePlugin } from '@platejs/core/react';
import { PathApi } from '@platejs/plite';
import { getSelection } from '@platejs/plite-dom';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../lib/BaseTablePlugin';
import {
  planTableCellDrop,
  type TableDragCapture,
} from '../lib/internal/paste';

const tableDragCaptures = new WeakMap<PlateEditor, TableDragCapture>();
const TABLE_CELL_DRAG_MIME = 'application/x-plate-table-cell-selection';

const consumeTableDragEvent = (event: {
  preventDefault: () => void;
  stopPropagation: () => void;
}) => {
  event.preventDefault();
  event.stopPropagation();
};

export const TableRowPlugin = toPlatePlugin(BaseTableRowPlugin);

export const TableCellPlugin = toPlatePlugin(BaseTableCellPlugin);

export const TableCellHeaderPlugin = toPlatePlugin(BaseTableCellHeaderPlugin);

/** Enables support for tables with React-specific features. */
export const TablePlugin = toPlatePlugin(BaseTablePlugin, {
  dependencies: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
  handlers: {
    onCopy: ({ api, event }) => {
      if (!api.writeSelection(event.clipboardData)) {
        return;
      }

      event.preventDefault();
      return true;
    },
    onCut: ({ api, editor, event }) => {
      if (!api.writeSelection(event.clipboardData)) {
        return;
      }

      event.preventDefault();
      editor.update.fragment.delete();
      return true;
    },
    onDragEnd: ({ editor }) => {
      tableDragCaptures.delete(editor);
    },
    onDragStart: ({ editor, event, read }) => {
      tableDragCaptures.delete(editor);

      const dragCellId =
        (
          event.target as {
            closest?: (selector: string) => Element | null;
          } | null
        )
          ?.closest?.('[data-table-cell-drag-handle="true"]')
          ?.getAttribute('data-table-cell-drag-for') ?? undefined;

      if (!dragCellId) return;

      const source = read.getSelection();

      if (!source || !source.cellIds.includes(dragCellId)) {
        return;
      }
      if (!source.complete || source.grid.problems.length > 0) {
        consumeTableDragEvent(event);
        editor
          .plugin(DebugPlugin)
          .api.warn(
            'Table drag/drop rejected before mutation.',
            'TABLE_MUTATION_DIAGNOSTIC',
            { kind: 'invalid', reason: 'invalid-grid' }
          );

        return true;
      }
      if (source.cellIds.length !== source.anchors.length) {
        consumeTableDragEvent(event);
        editor
          .plugin(DebugPlugin)
          .api.warn(
            'Table drag/drop rejected before mutation.',
            'TABLE_MUTATION_DIAGNOSTIC',
            { kind: 'invalid', reason: 'missing-cell-id' }
          );

        return true;
      }

      const tableId =
        typeof source.table.id === 'string' ? source.table.id : undefined;

      if (!tableId) {
        consumeTableDragEvent(event);
        editor
          .plugin(DebugPlugin)
          .api.warn(
            'Table drag/drop rejected before mutation.',
            'TABLE_MUTATION_DIAGNOSTIC',
            { kind: 'invalid', reason: 'missing-table-id' }
          );

        return true;
      }

      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData(TABLE_CELL_DRAG_MIME, '1');
      tableDragCaptures.set(
        editor,
        Object.freeze({
          bounds: source.bounds,
          cellIds: Object.freeze([...source.cellIds]),
          editor,
          ...(source.root === undefined ? {} : { root: source.root }),
          tableId,
          tablePath: Object.freeze([...source.tablePath]),
          version: source.version,
        })
      );
    },
    onDrop: ({ api, editor, event, read, store }) => {
      const source = tableDragCaptures.get(editor);

      if (!source) return;
      if (
        !Array.from(event.dataTransfer.types ?? []).includes(
          TABLE_CELL_DRAG_MIME
        )
      ) {
        tableDragCaptures.delete(editor);

        return;
      }

      const at = editor.api.dom.resolveEventRange(event);
      const target = at ? read.getSelection(at) : null;

      if (!target) return;

      tableDragCaptures.delete(editor);
      consumeTableDragEvent(event);

      const result = planTableCellDrop(editor, {
        copy:
          event.dataTransfer.dropEffect === 'copy' ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey,
        createCell: api.createCell,
        createRow: api.createRow,
        disableExpand: !!store.get().disableExpandOnInsert,
        source,
        target,
      });

      if (result.kind !== 'plan') {
        editor
          .plugin(DebugPlugin)
          .api.warn(
            'Table drag/drop rejected before mutation.',
            'TABLE_MUTATION_DIAGNOSTIC',
            result
          );

        return true;
      }

      editor.update({ history: 'new-batch', tags: 'paste' }, (tx) => {
        tx.changes.apply(result.change);
        tx.selection.set(result.selection);
      });

      return true;
    },
    onMouseUp: ({ editor, read }) => {
      const domSelection = getSelection(
        editor.api.dom.findDocumentOrShadowRoot()
      );

      if (!domSelection || domSelection.rangeCount === 0) return;

      const range = editor.api.dom.resolvePliteRange(domSelection, {
        exactMatch: false,
      });
      const selection = range && read.createCellSelection(range);

      if (!selection) return;

      editor.update.selection.set(selection);

      return true;
    },
    onKeyDown: ({ api, editor, event, read, update }) => {
      if (event.defaultPrevented) return;

      const cellTypes = api.getCellTypes();
      const getMoveContext = (point = editor.read.selection()?.anchor) => {
        if (
          !point ||
          !editor.read.selection.isWithinBlock({ match: { type: cellTypes } })
        ) {
          return;
        }

        const cellEntry = editor.read.nodes.above({
          at: point,
          match: { type: cellTypes },
        });
        const blockEntry = editor.read.nodes.block({ at: point });

        if (!cellEntry || !blockEntry) return;

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
              match: (node) => editor.read.nodes.isBlock(node),
            })
          : editor.read.nodes.next({
              at: blockPath,
              match: (node) => editor.read.nodes.isBlock(node),
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

        const caretRect = caretRects.at(-1)!;
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

        return !!update.moveSelection({ reverse });
      };
      const edges = {
        'shift+down': 'bottom',
        'shift+left': 'left',
        'shift+right': 'right',
        'shift+up': 'top',
      } as const;
      const shouldMoveSingleCell = (key: keyof typeof edges) => {
        const context = getMoveContext(editor.read.selection()?.focus);

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
        event.which === 229 &&
        editor.read.selection() &&
        editor.read.selection.isExpanded() &&
        read.isSelectingCell()
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

      for (const key of Object.keys(extended) as (keyof typeof extended)[]) {
        if (!extended[key]) continue;

        const reverse = key === 'shift+up';
        const handled =
          update.moveSelection({ edge: edges[key], reverse }) ||
          (shouldMoveSingleCell(key) &&
            update.moveSelection({
              at: editor.read.selection()!,
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

      const handled = Hotkeys.isMoveLineBackward(event)
        ? moveLine(true)
        : Hotkeys.isMoveLineForward(event)
          ? moveLine(false)
          : Hotkeys.isUntab(editor, event)
            ? update.tab({ reverse: true })
            : Hotkeys.isTab(editor, event)
              ? update.tab()
              : Hotkeys.isSelectAll(event)
                ? update.selectAll()
                : false;

      if (handled) {
        event.preventDefault();
        event.stopPropagation();

        return true;
      }
    },
  },
});
