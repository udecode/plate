import { DeserializeHtml } from 'slate-plugins';
import { LINK } from './types';

export const deserializeLink = (): DeserializeHtml => ({
  element: {
    A: el => ({ type: LINK, url: el.getAttribute('href') }),
  },
});
