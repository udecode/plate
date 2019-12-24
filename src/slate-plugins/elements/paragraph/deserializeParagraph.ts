import { DeserializeHtml } from 'slate-plugins';
import { PARAGRAPH } from './types';

export const deserializeParagraph = (): DeserializeHtml => ({
  element: {
    P: () => ({ type: PARAGRAPH }),
  },
});
