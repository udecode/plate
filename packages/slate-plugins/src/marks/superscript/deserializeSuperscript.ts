import { DeserializeHtml } from 'common/types';
import { MARK_SUPERSCRIPT } from './types';

const leaf = { [MARK_SUPERSCRIPT]: true };

export const deserializeSuperscript = (): DeserializeHtml => ({
  leaf: {
    SUP: () => leaf,
  },
});
