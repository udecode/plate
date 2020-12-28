import {
  getLeafDeserializer,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { DEFAULTS_SUBSUPSCRIPT } from '../defaults';
import { SubscriptDeserializeOptions } from './types';

export const deserializeSubscript = (
  options?: SubscriptDeserializeOptions
): DeserializeHtml => {
  const { subscript } = setDefaults(options, DEFAULTS_SUBSUPSCRIPT);

  return {
    leaf: getLeafDeserializer({
      type: subscript.type,
      rules: [
        { nodeNames: ['SUB'] },
        {
          style: {
            verticalAlign: 'sub',
          },
        },
      ],
      ...options?.subscript?.deserialize,
    }),
  };
};
