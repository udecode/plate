import {
  getLeafDeserializer,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { DeserializeHtml } from '@udecode/slate-plugins-core';
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
      ...options?.code?.deserialize,
    }),
  };
};
