import { DeserializeHtml } from 'common/types';
import { getDeserializer } from 'element/utils';
import { PARAGRAPH } from './types';

export const deserializeParagraph = ({
  typeP = PARAGRAPH,
} = {}): DeserializeHtml => ({
  element: getDeserializer(typeP, ['P']),
});
