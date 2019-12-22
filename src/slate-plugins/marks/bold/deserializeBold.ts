import { DeserializeHtml } from 'slate-plugins/paste-html/types';
import { MARK_BOLD } from './types';

export const deserializeBold = (): DeserializeHtml => ({
  leaf: {
    STRONG: () => ({ [MARK_BOLD]: true }),
  },
});
