import { createBasePlugin } from '@platejs/core';
import { BaseTablePlugin } from '@platejs/table';
import { TablePlugin } from '@platejs/table/react';
import type { TTableCellElement } from '@platejs/utils';

type AssertFalse<T extends false> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;

type _tablePluginNotAny = AssertFalse<IsAny<typeof TablePlugin>>;
type _baseTablePluginNotAny = AssertFalse<IsAny<typeof BaseTablePlugin>>;

const canonicalCell = {
  children: [{ text: '' }],
  colSpan: 2,
  rowSpan: 3,
  type: 'td',
} satisfies TTableCellElement;

const stringSpanCell: TTableCellElement = {
  children: [{ text: '' }],
  // @ts-expect-error Persisted spans are numbers.
  colSpan: '2',
  type: 'td',
};

void canonicalCell;
void stringSpanCell;

const extendedTablePlugin = TablePlugin.extend((ctx) => {
  type _ctxNotAny = AssertFalse<IsAny<typeof ctx>>;
  type _editorNotAny = AssertFalse<IsAny<typeof ctx.editor>>;

  const table = ctx.editor.plugin(TablePlugin);
  const isSelectingCell = table.api.isSelectingCell();
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
    options: {
      disableMerge: true,
    },
  };
});

void extendedTablePlugin;

const tableDependentPlugin = createBasePlugin({
  dependencies: [BaseTablePlugin],
  key: 'tableDependent',
}).extendApi(({ editor }) => ({
  createTable: () => {
    const cell = editor.api.table.createCell({ header: true });
    const row = editor.api.table.createRow({ colCount: 2, header: true });
    const selection = editor.api.table.getSelection();
    const table = editor.api.table.create({ colCount: 2, rowCount: 2 });

    return { cell, row, selection, table };
  },
}));

const stagedTableExtension = BaseTablePlugin.extendApi(({ api }) => ({
  createHeaderRow: () => api.createRow({ colCount: 2, header: true }),
})).extendTx(({ api, plugin }) => (tx) => ({
  hideLeftBorder: () => {
    tx[plugin.key].setBorderSize(0, { border: 'left' });

    const selection = tx.selection();
    const tableSelection = api.getSelection(undefined, tx);

    return {
      cellSelection: selection ? api.createCellSelection(selection, tx) : null,
      tableSelection,
    };
  },
}));

void tableDependentPlugin;
void stagedTableExtension;
