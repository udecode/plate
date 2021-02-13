import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_PARAGRAPH } from '../../paragraph';
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
