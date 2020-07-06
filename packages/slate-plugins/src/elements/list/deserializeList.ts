import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { ListDeserializeOptions, ListType } from './types';

export const deserializeList = ({
  typeUl = ListType.UL,
  typeOl = ListType.OL,
  typeLi = ListType.LI,
}: ListDeserializeOptions = {}): DeserializeHtml => ({
  element: {
    ...getElementDeserializer(typeUl, { tagNames: ['UL'] }),
    ...getElementDeserializer(typeOl, { tagNames: ['OL'] }),
    ...getElementDeserializer(typeLi, { tagNames: ['LI'] }),
  },
});
