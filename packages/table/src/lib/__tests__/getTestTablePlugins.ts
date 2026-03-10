import { BaseTablePlugin, type TableConfig } from '../BaseTablePlugin';

export const getTestTablePlugins = (
  options?: Partial<TableConfig['options']>,
  override?: (plugin: typeof BaseTablePlugin) => any
) => {
  let tablePlugin = BaseTablePlugin.configure({
    options: {
      disableMerge: true,
      ...options,
    },
  });

  if (override) {
    tablePlugin = override(tablePlugin);
  }

  return [tablePlugin];
};
