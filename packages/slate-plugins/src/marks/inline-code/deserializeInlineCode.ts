import { DeserializeHtml } from 'paste-html/types';
import { MARK_CODE } from './types';

export const deserializeInlineCode = (): DeserializeHtml => ({
  leaf: {
    CODE: () => ({ [MARK_CODE]: true }),
    KBD: () => ({ [MARK_CODE]: true }),
  },
});
