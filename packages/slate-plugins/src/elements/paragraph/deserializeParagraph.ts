import { DeserializeHtml } from 'paste-html/types';
import { PARAGRAPH } from './types';

export const deserializeParagraph = (): DeserializeHtml => ({
  element: {
    P: () => ({ type: PARAGRAPH }),
  },
});
