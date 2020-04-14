import { DeserializeHtml } from 'deserializers/types';
import { IMAGE } from './types';

export const deserializeImage = (): DeserializeHtml => ({
  element: {
    IMG: el => ({
      type: IMAGE,
      url: el.getAttribute('src'),
    }),
  },
});
