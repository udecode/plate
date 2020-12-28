import {
  getLeafDeserializer,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { DEFAULTS_SUBSUPSCRIPT } from '../defaults';
import { SuperscriptDeserializeOptions } from './types';

export const deserializeSuperscript = (
  options?: SuperscriptDeserializeOptions
): DeserializeHtml => {
  const { superscript } = setDefaults(options, DEFAULTS_SUBSUPSCRIPT);

  return {
    leaf: getLeafDeserializer({
      type: superscript.type,
      rules: [
        { nodeNames: ['SUP'] },
        {
          style: {
            verticalAlign: 'super',
          },
        },
      ],
      ...options?.superscript?.deserialize,
    }),
  };
};
