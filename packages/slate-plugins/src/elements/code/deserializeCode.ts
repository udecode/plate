import { DeserializeHtml } from 'deserializers/types';
import { CODE } from './types';

export const deserializeCode = ({ typeCode = CODE } = {}): DeserializeHtml => ({
  element: {
    PRE: () => ({ type: typeCode }),
  },
});
