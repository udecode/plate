import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { LINK } from './types';

export const deserializeLink = ({ typeLink = LINK } = {}): DeserializeHtml => ({
  element: {
    ...getElementDeserializer(typeLink, {
      tagNames: ['A'],
      createElement: (el) => ({ type: typeLink, url: el.getAttribute('href') }),
    }),
  },
});
