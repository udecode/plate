import { setDefaults } from '@udecode/slate-plugins-common';
import { DEFAULTS_PARAGRAPH } from '../../paragraph/defaults';
import { ParagraphPluginOptions } from '../../paragraph/types';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

export const getEmptyCellNode = (
  options?: TableOptions & ParagraphPluginOptions & { header?: boolean }
) => {
  const { th, td, header, p } = setDefaults(options, {
    ...DEFAULTS_TABLE,
    ...DEFAULTS_PARAGRAPH,
  });

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
