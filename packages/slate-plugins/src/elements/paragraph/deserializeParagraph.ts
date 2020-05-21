import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { PARAGRAPH, ParagraphDeserializeOptions } from './types';

export const deserializeParagraph = ({
  typeP = PARAGRAPH,
}: ParagraphDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeP, { tagNames: ['P'] }),
});
