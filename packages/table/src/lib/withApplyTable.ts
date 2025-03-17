import {
  type OverrideEditor,
  type TElement,
  type TRange,
  RangeApi,
} from '@udecode/plate';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from './types';

import { type TableConfig, BaseTableRowPlugin } from './BaseTablePlugin';
import { overrideSelectionFromCell } from './transforms/overrideSelectionFromCell';
import { computeCellIndices, getCellTypes } from './utils';

// TODO: tests

/**
 * Selection table:
 *
 * - If anchor is in table, focus in a block before: set focus to start of table
 * - If anchor is in table, focus in a block after: set focus to end of table
 * - If focus is in table, anchor in a block before: set focus to end of table
 * - If focus is in table, anchor in a block after: set focus to the point before
 *   start of table
 */
export const withApplyTable: OverrideEditor<TableConfig> = ({
  editor,
  getOptions,
  tf: { apply },
  type: tableType,
}) => ({
  transforms: {
    apply(op) {
      if (op.type === 'set_selection' && op.newProperties) {
        const newSelection = {
          ...editor.selection,
          ...op.newProperties,
        } as TRange | null;

        if (
          RangeApi.isRange(newSelection) &&
          editor.api.isAt({
            at: newSelection,
            blocks: true,
            match: (n) => n.type === tableType,
          })
        ) {
          const anchorEntry = editor.api.block({
            at: newSelection.anchor,
            match: (n) => n.type === tableType,
          });

          if (anchorEntry) {
            const [, anchorPath] = anchorEntry;
            const isBackward = RangeApi.isBackward(newSelection);

            if (isBackward) {
              op.newProperties.focus = editor.api.start(anchorPath);
            } else {
              const pointBefore = editor.api.before(anchorPath);

              // if the table is the first block
              if (pointBefore) {
                op.newProperties.focus = editor.api.end(anchorPath);
              }
            }
          } else {
            const focusEntry = editor.api.block({
              at: newSelection.focus,
              match: (n) => n.type === tableType,
            });

            if (focusEntry) {
              const [, focusPath] = focusEntry;
              const isBackward = RangeApi.isBackward(newSelection);

              if (isBackward) {
                const startPoint = editor.api.start(focusPath)!;
                const pointBefore = editor.api.before(startPoint);
                op.newProperties.focus = pointBefore ?? startPoint;
              } else {
                op.newProperties.focus = editor.api.end(focusPath);
              }
            }
          }
        }

        overrideSelectionFromCell(editor, newSelection);
      }

      const opType =
        op.type === 'remove_node'
          ? (op.node.type as string)
          : op.type === 'move_node'
            ? editor.api.node<TElement>(op.path)?.[0].type
            : undefined;

      const isTableOperation =
        (op.type === 'remove_node' || op.type === 'move_node') &&
        opType &&
        [
          editor.getType(BaseTableRowPlugin),
          tableType,
          ...getCellTypes(editor),
        ].includes(opType as string);

      // Cleanup cell indices when removing a table cell
      if (isTableOperation && op.type === 'remove_node') {
        const cells = [
          ...editor.api.nodes<TTableCellElement>({
            at: op.path,
            match: { type: getCellTypes(editor) },
          }),
        ];

        const cellIndices = getOptions()._cellIndices;

        cells.forEach(([cell]) => {
          delete cellIndices[cell.id as string];
        });
      }

      apply(op);

      let table: TTableElement | undefined;

      if (
        isTableOperation &&
        // There is no new indices when moving/removing a table
        opType !== tableType
      ) {
        table = editor.api.node<TTableRowElement>({
          at: op.type === 'move_node' ? op.newPath : op.path,
          match: { type: tableType },
        })?.[0];

        if (table) {
          computeCellIndices(editor, {
            tableNode: table,
          });
        }
      }
    },
  },
});
