import { DeserializeHtml } from 'slate-plugins/paste-html/types';
import { MARK_ITALIC } from './types';

export const deserializeItalic = (): DeserializeHtml => ({
  leaf: {
    EM: () => ({ [MARK_ITALIC]: true }),
    I: () => ({ [MARK_ITALIC]: true }),
  },
});
