import { DeserializeHtml } from '../../common';
import { getLeafDeserializer } from '../../mark/utils';
import { MARK_SUPERSCRIPT, SuperscriptDeserializeOptions } from './types';

export const deserializeSuperscript = ({
  typeSuperscript = MARK_SUPERSCRIPT,
}: SuperscriptDeserializeOptions = {}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeSuperscript, { tagNames: ['SUP'] }),
});
