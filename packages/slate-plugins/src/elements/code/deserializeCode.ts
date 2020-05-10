import { DeserializeHtml } from 'common/types';
import { getDeserializer } from 'element/utils';
import { CODE } from './types';

export const deserializeCode = ({ typeCode = CODE } = {}): DeserializeHtml => ({
  element: getDeserializer(typeCode, ['PRE']),
});
