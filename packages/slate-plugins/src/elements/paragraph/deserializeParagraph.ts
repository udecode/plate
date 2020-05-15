import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { PARAGRAPH } from './types';

export const deserializeParagraph = ({
  typeP = PARAGRAPH,
} = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeP, { tagNames: ['P'] }),
});
