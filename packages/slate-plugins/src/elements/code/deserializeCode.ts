import { DeserializeHtml } from 'deserializers/types';
import { getDeserializer } from 'deserializers/utils';
import { CODE } from './types';

export const deserializeCode = ({ typeCode = CODE } = {}): DeserializeHtml => ({
  element: getDeserializer(typeCode, ['PRE']),
});
