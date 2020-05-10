import { DeserializeHtml } from 'common/types';
import { getDeserializer } from 'element/utils';
import { BLOCKQUOTE } from './types';

export const deserializeBlockquote = ({
  typeBlockquote = BLOCKQUOTE,
} = {}): DeserializeHtml => ({
  element: getDeserializer(typeBlockquote, ['BLOCKQUOTE']),
});
