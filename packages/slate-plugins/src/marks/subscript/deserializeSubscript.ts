import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getLeafDeserializer } from '../../common/utils/getLeafDeserializer';
import { MARK_SUBSCRIPT, SubscriptDeserializeOptions } from './types';

export const deserializeSubscript = ({
  typeSubscript = MARK_SUBSCRIPT,
}: SubscriptDeserializeOptions = {}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeSubscript, { tagNames: ['SUB'] }),
});
