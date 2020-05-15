import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { CODE } from './types';

export const deserializeCode = ({ typeCode = CODE } = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeCode, { tagNames: ['PRE'] }),
});
