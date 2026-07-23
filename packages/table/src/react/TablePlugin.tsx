import { Hotkeys } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';
import { PathApi } from '@platejs/plite';

import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../lib/BaseTablePlugin';

export const TableRowPlugin = toPlatePlugin(BaseTableRowPlugin);

export const TableCellPlugin = toPlatePlugin(BaseTableCellPlugin);

export const TableCellHeaderPlugin = toPlatePlugin(BaseTableCellHeaderPlugin);

/** Enables support for tables with React-specific features. */
export const TablePlugin = toPlatePlugin(BaseTablePlugin, {
  handlers: {
    onCopy: ({ editor, event }) => {
      if (
        !editor.plugin(BaseTablePlugin).api.writeSelection(event.clipboardData)
      ) {
        return;
      }

      event.preventDefault();
      return true;
    },
    onCut: ({ editor, event }) => {
      if (
        !editor.plugin(BaseTablePlugin).api.writeSelection(event.clipboardData)
      ) {
        return;
      }

      event.preventDefault();
      editor.update.fragment.delete();
      return true;
    },
    onKeyDown: ({ editor, event }) => {
      if (event.defaultPrevented) return;

      const table = editor.plugin(BaseTablePlugin);
      const cellTypes = table.api.getCellTypes();
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

        return !!table.update.moveSelection({ reverse });
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
        editor.read.selection.isExpanded()
      ) {
        const cells = editor.read.nodes.toArray({
          at: editor.read.selection()!,
          match: { type: cellTypes },
        });

        if (cells.length > 1) {
          editor.update.selection.collapse({ edge: 'end' });
          return;
        }
      }

      const extended = {
        'shift+down': Hotkeys.isExtendDownward(event),
        'shift+left': Hotkeys.isExtendBackward(event),
        'shift+right': Hotkeys.isExtendForward(event),
        'shift+up': Hotkeys.isExtendUpward(event),
      };

      (Object.keys(extended) as (keyof typeof extended)[]).forEach((key) => {
        if (!extended[key]) return;

        const reverse = key === 'shift+up';
        const handled =
          table.update.moveSelection({ edge: edges[key], reverse }) ||
          (shouldMoveSingleCell(key) &&
            table.update.moveSelection({
              at: editor.read.selection()!,
              edge: edges[key],
              fromOneCell: true,
              reverse,
            }));

        if (handled) {
          event.preventDefault();
          event.stopPropagation();
        }
      });

      const handled = Hotkeys.isMoveLineBackward(event)
        ? moveLine(true)
        : Hotkeys.isMoveLineForward(event)
          ? moveLine(false)
          : Hotkeys.isUntab(editor, event)
            ? table.update.tab({ reverse: true })
            : Hotkeys.isTab(editor, event)
              ? table.update.tab()
              : Hotkeys.isSelectAll(event)
                ? table.update.selectAll()
                : false;

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
  },
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
});
