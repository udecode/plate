import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import { MARK_CODE } from './types';

export const deserializeInlineCode = ({
  typeInlineCode = MARK_CODE,
}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeInlineCode, {
    tagNames: ['CODE', 'KBD'],
  }),
});
