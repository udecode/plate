import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { TablePluginOptions } from '../types';

export const getEmptyCellNode = (
  { header }: TablePluginOptions,
  options: SlatePluginsOptions
) => {
  const { th, td, p } = options;

  return {
    type: header ? th.type : td.type,
    children: [
      {
        type: p.type,
        children: [{ text: '' }],
      },
    ],
  };
};
