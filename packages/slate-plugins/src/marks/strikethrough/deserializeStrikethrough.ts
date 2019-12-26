import { DeserializeHtml } from 'paste-html/types';
import { MARK_STRIKETHROUGH } from './types';

const leaf = { [MARK_STRIKETHROUGH]: true };

export const deserializeStrikethrough = (): DeserializeHtml => ({
  leaf: {
    SPAN: el => el.style.textDecoration === 'line-through' && leaf,
    DEL: () => leaf,
    S: () => leaf,
  },
});
