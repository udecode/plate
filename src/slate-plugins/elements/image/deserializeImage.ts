import { DeserializeHtml } from 'slate-plugins';
import { IMAGE } from './types';

export const deserializeImage = (): DeserializeHtml => ({
  element: {
    IMG: el => ({
      type: IMAGE,
      url: el.getAttribute('src'),
    }),
  },
});
