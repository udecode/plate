import { DeserializeHtml } from 'deserializers/types';
import { getDeserializer } from 'deserializers/utils';
import { IMAGE } from './types';

export const deserializeImage = ({
  typeImg = IMAGE,
} = {}): DeserializeHtml => ({
  element: getDeserializer(typeImg, ['IMG'], (el) => ({
    type: typeImg,
    url: el.getAttribute('src'),
  })),
});
