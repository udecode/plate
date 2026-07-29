import { BaseTablePlugin, type TableConfig } from '../BaseTablePlugin';

export const getTestTablePlugins = (
  options?: Partial<TableConfig['initialState']>
) => [
  BaseTablePlugin.configure({
    initialState: {
      disableMerge: true,
      ...options,
    },
  }),
];
