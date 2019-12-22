import { DeserializeHtml } from 'slate-plugins/paste-html/types';
import { MARK_UNDERLINE } from './types';

export const deserializeUnderline = (): DeserializeHtml => ({
  leaf: {
    U: () => ({ [MARK_UNDERLINE]: true }),
  },
});
