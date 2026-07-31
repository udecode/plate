import { BaseTablePlugin, type TableDefinition } from '../BaseTablePlugin';

export const getTestTablePlugins = (
  options?: Partial<TableDefinition['initialState']>
) => [
  BaseTablePlugin.configure({
    initialState: {
      disableMerge: true,
      ...options,
    },
  }),
];
