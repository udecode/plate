import {
  getLeafDeserializer,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { DEFAULTS_KBD } from './defaults';
import { KbdDeserializeOptions } from './types';

export const deserializeKbd = (
  options?: KbdDeserializeOptions
): DeserializeHtml => {
  const { kbd } = setDefaults(options, DEFAULTS_KBD);

  return {
    leaf: getLeafDeserializer({
      type: kbd.type,
      rules: [
        { nodeNames: ['KBD'] },
        {
          style: {
            wordWrap: 'break-word',
          },
        },
      ],
      ...options?.kbd?.deserialize,
    }),
  };
};
