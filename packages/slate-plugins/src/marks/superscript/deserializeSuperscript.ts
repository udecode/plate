import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import { MARK_SUPERSCRIPT } from './types';

export const deserializeSuperscript = ({
  typeSuperscript = MARK_SUPERSCRIPT,
}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeSuperscript, { tagNames: ['SUP'] }),
});
