import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import {
  MARK_SUBSCRIPT,
  SubscriptDeserializeOptions,
} from 'marks/subscript/types';

export const deserializeSubscript = ({
  typeSubscript = MARK_SUBSCRIPT,
}: SubscriptDeserializeOptions = {}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeSubscript, { tagNames: ['SUB'] }),
});
