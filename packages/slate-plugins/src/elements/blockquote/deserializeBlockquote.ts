import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { BLOCKQUOTE } from './types';

export const deserializeBlockquote = ({
  typeBlockquote = BLOCKQUOTE,
} = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeBlockquote, { tagNames: ['BLOCKQUOTE'] }),
});
