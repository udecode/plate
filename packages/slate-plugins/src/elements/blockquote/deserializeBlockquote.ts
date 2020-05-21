import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { BLOCKQUOTE, BlockquoteDeserializeOptions } from './types';

export const deserializeBlockquote = ({
  typeBlockquote = BLOCKQUOTE,
}: BlockquoteDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeBlockquote, { tagNames: ['BLOCKQUOTE'] }),
});
