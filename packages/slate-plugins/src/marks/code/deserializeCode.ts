import { DeserializeHtml } from '../../common';
import { getLeafDeserializer } from '../../mark/utils';
import { CodeDeserializeOptions, MARK_CODE } from './types';

export const deserializeCode = ({
  typeCode = MARK_CODE,
}: CodeDeserializeOptions = {}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeCode, {
    tagNames: ['CODE', 'KBD'],
  }),
});
