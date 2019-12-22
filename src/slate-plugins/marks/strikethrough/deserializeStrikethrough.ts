import { DeserializeHtml } from 'slate-plugins/paste-html/types';
import { MARK_STRIKETHROUGH } from './types';

export const deserializeStrikethrough = (): DeserializeHtml => ({
  leaf: {
    DEL: () => ({ [MARK_STRIKETHROUGH]: true }),
    S: () => ({ [MARK_STRIKETHROUGH]: true }),
  },
});
