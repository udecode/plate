import { DeserializeHtml } from 'deserializers/types';
import { PARAGRAPH } from './types';

export const deserializeParagraph = ({
  typeP = PARAGRAPH,
} = {}): DeserializeHtml => ({
  element: {
    P: () => ({ type: typeP }),
  },
});
