import { DeserializeHtml } from '@udecode/core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { AlignDeserializeOptions, ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from './types';

export const deserializeAlign = ({
  typeAlignLeft = ALIGN_LEFT,
  typeAlignCenter = ALIGN_CENTER,
  typeAlignRight = ALIGN_RIGHT,
}: AlignDeserializeOptions = {}): DeserializeHtml => ({
  element: {
    ...getElementDeserializer(typeAlignLeft, { tagNames: ['DIV'] }),
    ...getElementDeserializer(typeAlignRight, { tagNames: ['DIV'] }),
    ...getElementDeserializer(typeAlignCenter, { tagNames: ['DIV'] }),
  },
});
