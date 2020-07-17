import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getLeafDeserializer } from '../../../common/utils/getLeafDeserializer';
import { setDefaults } from '../../../common/utils/setDefaults';
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
    }),
  };
};
