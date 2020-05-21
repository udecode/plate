import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { CODE, CodeDeserializeOptions } from './types';

export const deserializeCode = ({
  typeCode = CODE,
}: CodeDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeCode, { tagNames: ['PRE'] }),
});
