import { DeserializeHtml, getElementDeserializer } from '@udecode/core';
import { LINK, LinkDeserializeOptions } from './types';

export const deserializeLink = ({
  typeLink = LINK,
}: LinkDeserializeOptions = {}): DeserializeHtml => ({
  element: {
    ...getElementDeserializer(typeLink, {
      tagNames: ['A'],
      createElement: (el) => ({ type: typeLink, url: el.getAttribute('href') }),
    }),
  },
});
