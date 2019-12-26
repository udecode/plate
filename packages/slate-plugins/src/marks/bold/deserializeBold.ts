import { DeserializeHtml } from 'paste-html/types';
import { MARK_BOLD } from './types';

const leaf = { [MARK_BOLD]: true };

export const deserializeBold = (): DeserializeHtml => ({
  leaf: {
    SPAN: el => ['600', '700', 'bold'].includes(el.style.fontWeight) && leaf,
    STRONG: () => leaf,
  },
});
