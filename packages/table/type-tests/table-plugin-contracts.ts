import { TablePlugin } from '@platejs/table/react';

type AssertFalse<T extends false> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;

type _tablePluginNotAny = AssertFalse<IsAny<typeof TablePlugin>>;

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
