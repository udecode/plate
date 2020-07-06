import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
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
