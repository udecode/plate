import type { OverrideEditor, TElement } from 'platejs';

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
import { withMarkTable } from './withMarkTable';
import { withNormalizeTable } from './withNormalizeTable';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

export const withTable: OverrideEditor<TableConfig> = (ctx) => {
  const {
    editor,
    tf: { selectAll, tab },
    type,
  } = ctx;
  const mark = withMarkTable(ctx);

  return {
    api: {
      // getFragment
      ...withGetFragmentTable(ctx).api,
      ...mark.api,
    },
    transforms: {
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
      // addMark, removeMark
      ...mark.transforms,
    },
  };
};
