import { DeserializeHtml } from 'paste-html/types';
import { MARK_UNDERLINE } from './types';

const leaf = { [MARK_UNDERLINE]: true };

export const deserializeUnderline = (): DeserializeHtml => ({
  leaf: {
    SPAN: el => el.style.textDecoration === 'underline' && leaf,
    U: () => leaf,
  },
});
