import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getLeafDeserializer } from '../../common/utils/getLeafDeserializer';
import { CodeDeserializeOptions, MARK_CODE } from './types';

export const deserializeCode = ({
  typeCode = MARK_CODE,
}: CodeDeserializeOptions = {}): DeserializeHtml => ({
  leaf: getLeafDeserializer(typeCode, {
    tagNames: ['CODE', 'KBD'],
  }),
});
