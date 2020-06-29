import { DeserializeHtml } from '@udecode/core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { IMAGE, ImageDeserializeOptions } from './types';

export const deserializeImage = ({
  typeImg = IMAGE,
}: ImageDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeImg, {
    tagNames: ['IMG'],
    createElement: (el) => ({
      type: typeImg,
      url: el.getAttribute('src'),
    }),
  }),
});
