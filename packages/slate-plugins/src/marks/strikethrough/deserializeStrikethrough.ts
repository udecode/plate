import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import { MARK_STRIKETHROUGH } from './types';

export const deserializeStrikethrough = ({
  typeStrikethrough = MARK_STRIKETHROUGH,
}): DeserializeHtml => ({
  leaf: {
    ...getLeafDeserializer(typeStrikethrough, { tagNames: ['DEL', 'S'] }),
    SPAN: (el) =>
      el.style.textDecoration === 'line-through' && {
        [typeStrikethrough]: true,
      },
  },
});
