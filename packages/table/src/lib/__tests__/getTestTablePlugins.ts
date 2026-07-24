import { BaseTablePlugin, type TableConfig } from '../BaseTablePlugin';

export const getTestTablePlugins = (
  options?: Partial<TableConfig['options']>,
  override?: (plugin: typeof BaseTablePlugin) => any
) => {
  const tablePlugin = (
    override ? override(BaseTablePlugin) : BaseTablePlugin
  ).configure({
    options: {
      disableMerge: true,
      ...options,
    },
  });

  return [tablePlugin];
};
