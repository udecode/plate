import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import { MARK_UNDERLINE } from './types';

export const deserializeUnderline = ({
  typeUnderline = MARK_UNDERLINE,
} = {}): DeserializeHtml => ({
  leaf: {
    SPAN: (el) =>
      el.style.textDecoration === 'underline' && { [typeUnderline]: true },
    ...getLeafDeserializer(typeUnderline, { tagNames: ['U'] }),
  },
});
