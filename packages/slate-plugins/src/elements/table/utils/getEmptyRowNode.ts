import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { TablePluginOptions } from '../types';
import { getEmptyCellNode } from './getEmptyCellNode';

export const getEmptyRowNode = (
  { header, colCount }: TablePluginOptions & { colCount: number },
  options: SlatePluginsOptions
) => {
  const { tr } = options;

  return {
    type: tr.type,
    children: Array(colCount)
      .fill(colCount)
      .map(() => getEmptyCellNode({ header }, options)),
  };
};
