import { DeserializeHtml } from 'paste-html/types';
import { MARK_ITALIC } from './types';

const leaf = { [MARK_ITALIC]: true };

export const deserializeItalic = (): DeserializeHtml => ({
  leaf: {
    SPAN: el => el.style.fontStyle === 'italic' && leaf,
    EM: () => leaf,
    I: () => leaf,
  },
});
