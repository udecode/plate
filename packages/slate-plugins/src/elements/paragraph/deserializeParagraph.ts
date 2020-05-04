import { DeserializeHtml } from 'deserializers/types';
import { getDeserializer } from 'deserializers/utils';
import { PARAGRAPH } from './types';

export const deserializeParagraph = ({
  typeP = PARAGRAPH,
} = {}): DeserializeHtml => ({
  element: getDeserializer(typeP, ['P']),
});
