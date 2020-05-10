import { DeserializeHtml } from 'common/types';
import { getDeserializer } from 'element/utils';
import { IMAGE } from './types';

export const deserializeImage = ({
  typeImg = IMAGE,
} = {}): DeserializeHtml => ({
  element: getDeserializer(typeImg, ['IMG'], (el) => ({
    type: typeImg,
    url: el.getAttribute('src'),
  })),
});
