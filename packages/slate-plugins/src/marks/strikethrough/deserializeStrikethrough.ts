import { DeserializeHtml } from '../../common';
import { getLeafDeserializer } from '../../mark/utils';
import { MARK_STRIKETHROUGH, StrikethroughDeserializeOptions } from './types';

export const deserializeStrikethrough = ({
  typeStrikethrough = MARK_STRIKETHROUGH,
}: StrikethroughDeserializeOptions = {}): DeserializeHtml => ({
  leaf: {
    ...getLeafDeserializer(typeStrikethrough, { tagNames: ['DEL', 'S'] }),
    SPAN: (el) =>
      el.style.textDecoration === 'line-through' && {
        [typeStrikethrough]: true,
      },
  },
});
