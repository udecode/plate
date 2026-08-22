import { defineBasePlugin } from '@platejs/core';
import { BaseTablePlugin } from '@platejs/table';
import type { TableCellElement } from '@platejs/table';
import { TablePlugin } from '@platejs/table/react';

type AssertFalse<T extends false> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;

type _tablePluginNotAny = AssertFalse<IsAny<typeof TablePlugin>>;
type _baseTablePluginNotAny = AssertFalse<IsAny<typeof BaseTablePlugin>>;

const canonicalCell = {
  children: [{ text: '' }],
  colSpan: 2,
  rowSpan: 3,
  type: 'tableCell',
} satisfies TableCellElement;

const stringSpanCell: TableCellElement = {
  children: [{ text: '' }],
  // @ts-expect-error Persisted spans are numbers.
  colSpan: '2',
  type: 'tableCell',
};

void canonicalCell;
void stringSpanCell;

const extendedTablePlugin = TablePlugin.extend((ctx) => {
  type _ctxNotAny = AssertFalse<IsAny<typeof ctx>>;
  type _editorNotAny = AssertFalse<IsAny<typeof ctx.editor>>;

  const table = ctx.editor.plugin(TablePlugin);
  const isSelectingCell = table.read.isSelectingCell();
  const tableNode = table.api.create({ colCount: 2, rowCount: 2 });

  void (isSelectingCell satisfies boolean);
  void tableNode;
  table.update.insert({ colCount: 2, rowCount: 2 });
  table.update.insertColumn();
  table.update.insertRow();
  table.update.remove();
  table.update.removeColumn();
  table.update.removeRow();
  table.update.setBorderSize(0, { border: 'left' });
  ctx.editor.update.table.insert({ colCount: 2, rowCount: 2 });
  ctx.editor.update.table.removeRow();

  return {
    initialState: {
      disableMerge: true,
    },
  };
});

void extendedTablePlugin;

const tableDependentPlugin = defineBasePlugin('tableDependent', {
  dependencies: [BaseTablePlugin],
}).extend(({ editor }) => ({
  api: () => ({
    createTable: () => {
      const { api } = editor.plugin(BaseTablePlugin);
      const cell = api.createCell({ header: true });
      const row = api.createRow({ colCount: 2, header: true });
      const selection = editor.read.table.getSelection();
      const table = api.create({ colCount: 2, rowCount: 2 });

      return { cell, row, selection, table };
    },
  }),
}));

const stagedTableExtension = BaseTablePlugin.extend(({ api }) => ({
  api: () => ({
    createHeaderRow: () => api.createRow({ colCount: 2, header: true }),
  }),
})).extend(({ plugin }) => ({
  update: ({ tx }) => ({
    hideLeftBorder: () => {
      tx.plugin(plugin).setBorderSize(0, { border: 'left' });

      const selection = tx.selection();
      const tableSelection = tx.table.getSelection();

      return {
        cellSelection: selection
          ? tx.table.createCellSelection(selection)
          : null,
        tableSelection,
      };
    },
  }),
}));

void tableDependentPlugin;
void stagedTableExtension;
