import { DeserializeHtml } from 'common/types';
import { getLeafDeserializer } from 'mark/utils';
import { MARK_ITALIC } from './types';

export const deserializeItalic = ({
  typeItalic = MARK_ITALIC,
} = {}): DeserializeHtml => ({
  leaf: {
    SPAN: (el) => el.style.fontStyle === 'italic' && { [typeItalic]: true },
    ...getLeafDeserializer(typeItalic, { tagNames: ['EM', 'I'] }),
  },
});
