import type { ExtendPlateEditorExtension } from '@platejs/core';
import { ElementApi, RangeApi } from '@platejs/plite';
import {
  KEYS,
  type TTableCellElement,
  type TTableElement,
} from '@platejs/utils';

import type { TableConfig } from './BaseTablePlugin';

import { computeCellIndices, getCellTypes } from './utils';

/** Keep table selection boundaries and cached cell indices valid. */
export const withApplyTable: ExtendPlateEditorExtension<TableConfig> = ({
  editor,
  getOptions,
  type: tableType,
}) => ({
  operations: {
    apply({ next, operation }) {
      if (operation.type === 'set_selection' && operation.newProperties) {
        const selection = editor.read.selection();
        const nextSelection = selection
          ? { ...selection, ...operation.newProperties }
          : null;

        if (
          RangeApi.isRange(nextSelection) &&
          editor.read.selection.isAcrossBlocks({
            at: nextSelection,
            match: { type: tableType },
          })
        ) {
          const anchorTable = editor.read.nodes.block({
            at: nextSelection.anchor,
            match: { type: tableType },
          });

          if (anchorTable) {
            const [, path] = anchorTable;

            if (RangeApi.isBackward(nextSelection)) {
              operation.newProperties.focus = editor.read.points.start(path);
            } else if (editor.read.points.before(path)) {
              operation.newProperties.focus = editor.read.points.end(path);
            }
          } else {
            const focusTable = editor.read.nodes.block({
              at: nextSelection.focus,
              match: { type: tableType },
            });

            if (focusTable) {
              const [, path] = focusTable;

              if (RangeApi.isBackward(nextSelection)) {
                const start = editor.read.points.start(path);

                if (start) {
                  operation.newProperties.focus =
                    editor.read.points.before(start) ?? start;
                }
              } else {
                operation.newProperties.focus = editor.read.points.end(path);
              }
            }
          }
        }
      }

      let nodeType: string | undefined;

      if (
        operation.type === 'remove_node' &&
        ElementApi.isElement(operation.node)
      ) {
        nodeType = operation.node.type;
      } else if (operation.type === 'move_node') {
        const node = editor.read.nodes.get(operation.path)?.[0];

        if (ElementApi.isElement(node)) nodeType = node.type;
      }
      const isTableOperation =
        (operation.type === 'remove_node' || operation.type === 'move_node') &&
        typeof nodeType === 'string' &&
        [editor.getType(KEYS.tr), tableType, ...getCellTypes(editor)].includes(
          nodeType
        );

      if (isTableOperation && operation.type === 'remove_node') {
        const cells = editor.read.nodes.toArray<TTableCellElement>({
          at: operation.path,
          match: { type: getCellTypes(editor) },
        });
        const cellIndices = getOptions()._cellIndices;

        cells.forEach(([cell]) => {
          if (cell.id) delete cellIndices[cell.id];
        });
      }

      next(operation);

      if (isTableOperation && nodeType !== tableType) {
        const path =
          operation.type === 'move_node' ? operation.newPath : operation.path;
        const table = editor.read.nodes.above<TTableElement>({
          at: path,
          match: { type: tableType },
        })?.[0];

        if (table) computeCellIndices(editor, { tableNode: table });
      }
    },
  },
});
