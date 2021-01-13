import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_ALIGN } from './defaults';
import { AlignDeserializeOptions } from './types';

export const deserializeAlign = (
  options?: AlignDeserializeOptions
): DeserializeHtml => {
  const { align_center, align_right, align_justify } = setDefaults(
    options,
    DEFAULTS_ALIGN
  );

  return {
    element: [
      ...getElementDeserializer({
        type: align_center.type,
        rules: [
          { className: align_center.rootProps.className },
          {
            nodeNames: 'DIV',
            style: {
              textAlign: 'center',
            },
          },
        ],
        ...options?.align_center?.deserialize,
      }),
      ...getElementDeserializer({
        type: align_right.type,
        rules: [
          { className: align_right.rootProps.className },
          {
            nodeNames: 'DIV',
            style: {
              textAlign: 'right',
            },
          },
        ],
        ...options?.align_right?.deserialize,
      }),
      ...getElementDeserializer({
        type: align_justify.type,
        rules: [
          { className: align_justify.rootProps.className },
          {
            nodeNames: 'DIV',
            style: {
              textAlign: 'justify',
            },
          },
        ],
        ...options?.align_justify?.deserialize,
      }),
    ],
  };
};
