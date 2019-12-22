import { DeserializeHtml } from 'slate-plugins/paste-html/types';
import { IMAGE } from './types';

export const deserializeImage = (): DeserializeHtml => ({
  element: {
    IMG: (el: any) => {
      console.log('whatt');
      return { type: IMAGE, url: el.getAttribute('src') };
    },
  },
});
