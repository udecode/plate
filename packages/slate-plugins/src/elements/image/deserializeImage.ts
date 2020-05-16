import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { IMAGE } from './types';

export const deserializeImage = ({
  typeImg = IMAGE,
} = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeImg, {
    tagNames: ['IMG'],
    createElement: (el) => ({
      type: typeImg,
      url: el.getAttribute('src'),
    }),
  }),
});
