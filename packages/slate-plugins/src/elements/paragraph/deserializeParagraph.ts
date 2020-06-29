import { DeserializeHtml, getElementDeserializer } from '@udecode/core';
import { PARAGRAPH, ParagraphDeserializeOptions } from './types';

export const deserializeParagraph = ({
  typeP = PARAGRAPH,
}: ParagraphDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeP, { tagNames: ['P'] }),
});
