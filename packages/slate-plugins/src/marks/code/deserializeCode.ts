import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getLeafDeserializer } from '../../common/utils/getLeafDeserializer';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_CODE } from './defaults';
import { CodeDeserializeOptions } from './types';

export const deserializeCode = (
  options?: CodeDeserializeOptions
): DeserializeHtml => {
  const { code } = setDefaults(options, DEFAULTS_CODE);

  return {
    leaf: getLeafDeserializer({
      type: code.type,
      rules: [
        { nodeNames: ['CODE'] },
        {
          style: {
            wordWrap: 'break-word',
          },
        },
      ],
    }),
  };
};
