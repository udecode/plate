import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import {
  ALIGN_CENTER,
  ALIGN_LEFT,
  ALIGN_RIGHT,
  AlignDeserializeOptions,
} from './types';

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
