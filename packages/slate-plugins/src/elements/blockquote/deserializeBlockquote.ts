import { DeserializeHtml, getElementDeserializer } from '@udecode/core';
import { BLOCKQUOTE, BlockquoteDeserializeOptions } from './types';

export const deserializeBlockquote = ({
  typeBlockquote = BLOCKQUOTE,
}: BlockquoteDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeBlockquote, { tagNames: ['BLOCKQUOTE'] }),
});
