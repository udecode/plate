import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import { MARK_HIGHLIGHT } from './types';

export const deserializeHighlight = ({
  typeHighlight = MARK_HIGHLIGHT,
}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeHighlight),
});
