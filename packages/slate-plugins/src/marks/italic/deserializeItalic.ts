import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getLeafDeserializer } from '../../common/utils/getLeafDeserializer';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_ITALIC } from './defaults';
import { ItalicDeserializeOptions } from './types';

export const deserializeItalic = (
  options?: ItalicDeserializeOptions
): DeserializeHtml => {
  const { italic } = setDefaults(options, DEFAULTS_ITALIC);

  return {
    leaf: getLeafDeserializer({
      type: italic.type,
      rules: [
        { nodeNames: ['EM', 'I'] },
        {
          style: {
            fontStyle: 'italic',
          },
        },
      ],
    }),
  };
};
