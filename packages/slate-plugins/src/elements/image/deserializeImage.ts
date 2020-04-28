import { DeserializeHtml } from 'deserializers/types';
import { IMAGE } from './types';

export const deserializeImage = ({
  typeImg = IMAGE,
} = {}): DeserializeHtml => ({
  element: {
    IMG: (el) => ({
      type: typeImg,
      url: el.getAttribute('src'),
    }),
  },
});
