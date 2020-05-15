import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import { MARK_HIGHLIGHT } from './types';

export const deserializeStrikethrough = (): DeserializeHtml => ({
  leaf: getLeafDeserializer(MARK_HIGHLIGHT, {
    tagNames: ['DEL', 'S'],
  }),
});
