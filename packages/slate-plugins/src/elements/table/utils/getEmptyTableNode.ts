import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { TablePluginOptions } from '../types';
import { getEmptyRowNode } from './getEmptyRowNode';

export const getEmptyTableNode = (
  { header }: TablePluginOptions,
  options: SlatePluginsOptions
) => {
  const { table } = options;

  return {
    type: table.type,
    children: [
      getEmptyRowNode({ header, colCount: 2 }, options),
      getEmptyRowNode({ header, colCount: 2 }, options),
    ],
  };
};
