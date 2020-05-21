import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import { InlineCodeDeserializeOptions, MARK_CODE } from './types';

export const deserializeInlineCode = ({
  typeInlineCode = MARK_CODE,
}: InlineCodeDeserializeOptions = {}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeInlineCode, {
    tagNames: ['CODE', 'KBD'],
  }),
});
