import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getLeafDeserializer } from '../../common/utils/getLeafDeserializer';
import { HighlightDeserializeOptions, MARK_HIGHLIGHT } from './types';

export const deserializeHighlight = ({
  typeHighlight = MARK_HIGHLIGHT,
}: HighlightDeserializeOptions = {}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeHighlight, {
    tagNames: ['MARK'],
  }),
});
