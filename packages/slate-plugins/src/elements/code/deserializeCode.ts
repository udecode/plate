import { DeserializeHtml } from 'paste-html/types';
import { CODE } from './types';

export const deserializeCode = (): DeserializeHtml => ({
  element: {
    PRE: () => ({ type: CODE }),
  },
});
