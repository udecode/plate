import { DeserializeHtml } from '../../common';
import { getElementDeserializer } from '../../element/utils';
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
