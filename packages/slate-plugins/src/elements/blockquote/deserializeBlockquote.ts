import { DeserializeHtml } from 'deserializers/types';
import { getDeserializer } from 'deserializers/utils';
import { BLOCKQUOTE } from './types';

export const deserializeBlockquote = ({
  typeBlockquote = BLOCKQUOTE,
} = {}): DeserializeHtml => ({
  element: getDeserializer(typeBlockquote, ['BLOCKQUOTE']),
});
