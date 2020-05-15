import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import { MARK_STRIKETHROUGH } from './types';

const leaf = { [MARK_STRIKETHROUGH]: true };

export const deserializeStrikethrough = (): DeserializeHtml => ({
  leaf: {
    ...getLeafDeserializer(MARK_STRIKETHROUGH),
    SPAN: (el) => el.style.textDecoration === 'line-through' && leaf,
    DEL: () => leaf,
    S: () => leaf,
  },
});
