import {
  PathApi,
  type OverrideEditor,
  type SlateEditor,
  type TElement,
} from 'platejs';

import type { TableConfig } from './BaseTablePlugin';

import {
  getNextTableCell,
  getPreviousTableCell,
  getTableEntries,
} from './queries';
import { getCellTypes } from './utils';
import { withApplyTable } from './withApplyTable';
import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';
import { withNormalizeTable } from './withNormalizeTable';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';
import { withTableCellSelection } from './withTableCellSelection';
import { moveSelectionFromCell } from './transforms';

const VISUAL_LINE_TOLERANCE = 1;

const getRangeClientRects = (domRange?: Pick<Range, 'getClientRects'> | null) =>
  Array.from(domRange?.getClientRects?.() ?? []).filter(
    (rect) => rect.height > 0
  );

const shouldMoveSelectionFromCell = (
  editor: SlateEditor,
  {
    blockPath,
    point,
    reverse,
  }: {
    blockPath: number[];
    point: { offset: number; path: number[] };
    reverse: boolean;
  }
) => {
  const blockRange = editor.api.range(blockPath);
  const isAtBlockEdge = reverse
    ? editor.api.isStart(point, blockPath)
    : editor.api.isEnd(point, blockPath);

  if (!blockRange) return isAtBlockEdge;

  const caretRects = getRangeClientRects(
    editor.api.toDOMRange({ anchor: point, focus: point })
  );
  const blockRects = getRangeClientRects(editor.api.toDOMRange(blockRange));

  if (caretRects.length === 0 || blockRects.length === 0) return isAtBlockEdge;

  const caretRect = caretRects.at(-1)!;
  const boundary = reverse
    ? Math.min(...blockRects.map((rect) => rect.top))
    : Math.max(...blockRects.map((rect) => rect.bottom));

  return reverse
    ? caretRect.top <= boundary + VISUAL_LINE_TOLERANCE
    : caretRect.bottom >= boundary - VISUAL_LINE_TOLERANCE;
};

export const withTable: OverrideEditor<TableConfig> = (ctx) => {
  const {
    editor,
    tf: { moveLine, selectAll, tab },
    type,
  } = ctx;
  const cellSelection = withTableCellSelection(ctx);

  return {
    api: {
      // getFragment
      ...withGetFragmentTable(ctx).api,
      ...cellSelection.api,
    },
    transforms: {
      moveLine: (options) => {
        const apply = () => {
          if (!editor.api.isCollapsed()) return;

          const cellEntry = editor.api.block({
            match: { type: getCellTypes(editor) },
          });

          if (!cellEntry) return;

          const point = editor.selection?.anchor;

          if (!point) return;

          const blockEntry = editor.api.block({ at: point });

          if (!blockEntry) return;

          const [, cellPath] = cellEntry;
          const [, blockPath] = blockEntry;

          const adjacentBlock = options.reverse
            ? editor.api.previous({ at: blockPath, block: true })
            : editor.api.next({ at: blockPath, block: true });

          if (adjacentBlock && PathApi.isAncestor(cellPath, adjacentBlock[1])) {
            return;
          }

          const shouldMoveAcrossCell = shouldMoveSelectionFromCell(editor, {
            blockPath,
            point,
            reverse: options.reverse,
          });

          if (!shouldMoveAcrossCell) {
            return;
          }

          return moveSelectionFromCell(editor, {
            reverse: options.reverse,
          });
        };

        if (apply()) return true;

        return moveLine(options);
      },
      selectAll: () => {
        const apply = () => {
          const table = editor.api.above<TElement>({ match: { type } });

          if (!table) return;

          const [, tablePath] = table;

          // select the whole table
          editor.tf.select(tablePath);

          return true;
        };

        if (apply()) return true;

        return selectAll();
      },
      tab: (options) => {
        const apply = () => {
          if (editor.selection && editor.api.isExpanded()) {
            // fix the exception of inputting Chinese when selecting multiple cells
            const tdEntries = Array.from(
              editor.api.nodes({
                at: editor.selection,
                match: { type: getCellTypes(editor) },
              })
            );

            if (tdEntries.length > 1) {
              editor.tf.collapse({
                edge: 'end',
              });

              return true;
            }
          }

          const entries = getTableEntries(editor);

          if (!entries) return;

          const { cell, row } = entries;
          const [, cellPath] = cell;

          if (options.reverse) {
            // move left with shift+tab
            const previousCell = getPreviousTableCell(
              editor,
              cell,
              cellPath,
              row
            );

            if (previousCell) {
              const [, previousCellPath] = previousCell;
              editor.tf.select(previousCellPath);
            }
          } else {
            // move right with tab
            const nextCell = getNextTableCell(editor, cell, cellPath, row);

            if (nextCell) {
              const [, nextCellPath] = nextCell;
              editor.tf.select(nextCellPath);
            }
          }

          return true;
        };

        if (apply()) return true;

        return tab(options);
      },
      // normalize
      ...withNormalizeTable(ctx).transforms,
      // delete
      ...withDeleteTable(ctx).transforms,
      // insertFragment
      ...withInsertFragmentTable(ctx).transforms,
      // insertText
      ...withInsertTextTable(ctx).transforms,
      // apply
      ...withApplyTable(ctx).transforms,
      // setFragmentData
      ...withSetFragmentDataTable(ctx).transforms,
      // addMark, removeMark, setNodes, unsetNodes
      ...cellSelection.transforms,
    },
  };
};
