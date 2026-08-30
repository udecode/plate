import {
  DebugPlugin,
  Hotkeys,
  createEditorView,
  type NodeKey,
  PathApi,
} from '../../../core';
import { getSelection } from '../../../dom/plite-dom.internal';
import { failInvariant } from '../../../features/table/internal/failInvariant';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../../../features/table/lib/BaseTablePlugin';
import {
  planTableCellDrop,
  type TableDragCapture,
} from '../../../features/table/lib/internal/paste';
import {
  createTableNodeSelection,
  readTableSelection,
} from '../../../features/table/lib/internal/selection';
import { type Editor, toPlatePlugin } from '../../core';

const tableDragCaptures = new WeakMap<Editor, TableDragCapture>();
const TABLE_CELL_DRAG_MIME = 'application/x-plate-table-cell-selection';

const consumeTableDragEvent = (event: {
  preventDefault: () => void;
  stopPropagation: () => void;
}) => {
  event.preventDefault();
  event.stopPropagation();
};

export const TableCellPlugin = toPlatePlugin(BaseTableCellPlugin);

export const TableRowPlugin = toPlatePlugin(BaseTableRowPlugin, {
  dependencies: [TableCellPlugin],
});

/** Enables support for tables with React-specific features. */
export const TablePlugin = toPlatePlugin(BaseTablePlugin, {
  dependencies: [TableRowPlugin],
  shortcuts: {
    tab: {
      handler: ({ editor }) => editor.plugin(BaseTablePlugin).update.tab(),
      keys: 'tab',
      priority: 10,
    },
    untab: {
      handler: ({ editor }) =>
        editor.plugin(BaseTablePlugin).update.tab({ reverse: true }),
      keys: 'shift+tab',
      priority: 10,
    },
  },
  on: {
    copy: ({ api, event }) => {
      if (!api.writeSelection(event.clipboardData)) {
        return undefined;
      }

      event.preventDefault();
      return true;
    },
    cut: ({ api, editor, event }) => {
      if (!api.writeSelection(event.clipboardData)) {
        return undefined;
      }

      event.preventDefault();
      editor.update.fragment.delete();
      return true;
    },
    dragEnd: ({ editor }) => {
      tableDragCaptures.delete(editor);
    },
    dragOver: ({ editor, event }) => {
      if (
        !tableDragCaptures.has(editor) ||
        !Array.from(event.dataTransfer.types ?? []).includes(
          TABLE_CELL_DRAG_MIME
        )
      ) {
        return undefined;
      }

      consumeTableDragEvent(event);
      return true;
    },
    dragStart: ({ editor, event, read }) => {
      tableDragCaptures.delete(editor);

      const dragCellKey =
        (
          event.target as {
            closest?: (selector: string) => Element | null;
          } | null
        )
          ?.closest?.('[data-table-cell-drag-handle="true"]')
          ?.getAttribute('data-table-cell-drag-for') ?? undefined;

      if (!dragCellKey) return undefined;

      const source = read.selection();

      if (!source || !source.cellKeys.includes(dragCellKey as NodeKey)) {
        return undefined;
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
      const { tableKey } = source;

      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData(TABLE_CELL_DRAG_MIME, '1');
      tableDragCaptures.set(
        editor,
        Object.freeze({
          bounds: source.bounds,
          cellKeys: Object.freeze([...source.cellKeys]),
          editor,
          ...(source.root === undefined ? {} : { root: source.root }),
          tableKey,
          tablePath: Object.freeze([...source.tablePath]),
          version: source.version,
        })
      );

      return undefined;
    },
    drop: ({ api, editor, event, store }) => {
      const source = tableDragCaptures.get(editor);

      if (!source) return undefined;
      if (
        !Array.from(event.dataTransfer.types ?? []).includes(
          TABLE_CELL_DRAG_MIME
        )
      ) {
        tableDragCaptures.delete(editor);

        return undefined;
      }

      const at = editor.api.dom.resolveEventRange(event);
      const target = at
        ? createEditorView(editor, {
            ...(at.anchor.root === undefined ? {} : { root: at.anchor.root }),
          }).read((state) =>
            readTableSelection(state, {
              at,
              cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
              tableType: editor.plugin(BaseTablePlugin).schema.type,
            })
          )
        : null;

      if (!target) return undefined;

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
    mouseUp: ({ editor, read }) => {
      const domSelection = getSelection(
        editor.api.dom.findDocumentOrShadowRoot()
      );

      if (!domSelection || domSelection.rangeCount === 0) return undefined;

      const range = editor.api.dom.resolvePliteRange(domSelection, {
        exactMatch: false,
      });
      const view = range && read.selection(range);
      const selection = view && createTableNodeSelection(view);

      if (!selection) return undefined;

      editor.update.selection.set(selection);

      return true;
    },
    keyDown: ({ editor, event, read, update }) => {
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

        return !!update.moveSelection({ reverse });
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
        (read.selection()?.anchors.length ?? 0) > 1
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
          update.moveSelection({ edge: edges[key], reverse }) ||
          (shouldMoveSingleCell(key) &&
            update.moveSelection({
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
              ? update.selectAll()
              : false;

      if (handled) {
        event.preventDefault();
        event.stopPropagation();

        return true;
      }

      return undefined;
    },
  },
});
