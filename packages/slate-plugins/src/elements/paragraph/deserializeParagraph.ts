import { DeserializeHtml } from '@udecode/core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { PARAGRAPH, ParagraphDeserializeOptions } from './types';

export const deserializeParagraph = ({
  typeP = PARAGRAPH,
}: ParagraphDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeP, { tagNames: ['P'] }),
});
