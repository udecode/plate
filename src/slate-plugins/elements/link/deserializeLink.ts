import { DeserializeHtml } from 'slate-plugins/paste-html/types';
import { LINK } from './types';

export const deserializeLink = (): DeserializeHtml => ({
  element: {
    A: (el: any) => ({ type: LINK, url: el.getAttribute('href') }),
  },
});
