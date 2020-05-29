import { DeserializeHtml } from '../../common';
import { getLeafDeserializer } from '../../mark/utils';
import { MARK_UNDERLINE, UnderlineDeserializeOptions } from './types';

export const deserializeUnderline = ({
  typeUnderline = MARK_UNDERLINE,
}: UnderlineDeserializeOptions = {}): DeserializeHtml => ({
  leaf: {
    SPAN: (el) =>
      el.style.textDecoration === 'underline' && { [typeUnderline]: true },
    ...getLeafDeserializer(typeUnderline, { tagNames: ['U'] }),
  },
});
