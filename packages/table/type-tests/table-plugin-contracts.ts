import { TablePlugin } from '@platejs/table/react';

type AssertFalse<T extends false> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;

type _tablePluginNotAny = AssertFalse<IsAny<typeof TablePlugin>>;

const configuredTablePlugin = TablePlugin.configure((ctx) => {
  type _ctxNotAny = AssertFalse<IsAny<typeof ctx>>;
  type _editorNotAny = AssertFalse<IsAny<typeof ctx.editor>>;

  const isSelectingCell: boolean = ctx.editor
    .getApi(TablePlugin)
    .table.isSelectingCell();

  void isSelectingCell;

  return {
    options: {
      disableMerge: true,
    },
  };
});

void configuredTablePlugin;
