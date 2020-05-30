import { DeserializeHtml } from '../../common';
import { getLeafDeserializer } from '../../mark/utils';
import { MARK_SUBSCRIPT, SubscriptDeserializeOptions } from './types';

export const deserializeSubscript = ({
  typeSubscript = MARK_SUBSCRIPT,
}: SubscriptDeserializeOptions = {}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeSubscript, { tagNames: ['SUB'] }),
});
