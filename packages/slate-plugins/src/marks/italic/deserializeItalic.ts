import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getLeafDeserializer } from '../../common/utils/getLeafDeserializer';
import { ItalicDeserializeOptions, MARK_ITALIC } from './types';

export const deserializeItalic = ({
  typeItalic = MARK_ITALIC,
}: ItalicDeserializeOptions = {}): DeserializeHtml => ({
  leaf: {
    SPAN: (el) => el.style.fontStyle === 'italic' && { [typeItalic]: true },
    ...getLeafDeserializer(typeItalic, { tagNames: ['EM', 'I'] }),
  },
});
