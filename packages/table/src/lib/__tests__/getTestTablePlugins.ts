import { BaseTablePlugin, type TableConfig } from '../BaseTablePlugin';

export const getTestTablePlugins = (
  options?: Partial<TableConfig['initialState']>,
  override?: (plugin: typeof BaseTablePlugin) => any
) => {
  const tablePlugin = (
    override ? override(BaseTablePlugin) : BaseTablePlugin
  ).configure({
    initialState: {
      disableMerge: true,
      ...options,
    },
  });

  return [tablePlugin];
};
