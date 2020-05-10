import { DeserializeHtml } from 'common/types';
import { LINK } from './types';

export const deserializeLink = ({ typeLink = LINK } = {}): DeserializeHtml => ({
  element: {
    A: (el) => ({ type: typeLink, url: el.getAttribute('href') }),
  },
});
