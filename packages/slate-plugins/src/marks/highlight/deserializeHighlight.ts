import { DeserializeHtml } from '../../common';
import { getLeafDeserializer } from '../../mark/utils';
import { HighlightDeserializeOptions, MARK_HIGHLIGHT } from './types';

export const deserializeHighlight = ({
  typeHighlight = MARK_HIGHLIGHT,
}: HighlightDeserializeOptions = {}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeHighlight),
});
