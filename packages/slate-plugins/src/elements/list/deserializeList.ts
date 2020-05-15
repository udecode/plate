import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { ListType, ListTypeOptions } from './types';

export const deserializeList = ({
  typeUl = ListType.UL,
  typeOl = ListType.OL,
  typeLi = ListType.LI,
}: ListTypeOptions = {}): DeserializeHtml => ({
  element: {
    ...getElementDeserializer(typeUl, { tagNames: ['UL'] }),
    ...getElementDeserializer(typeOl, { tagNames: ['OL'] }),
    ...getElementDeserializer(typeLi, { tagNames: ['LI'] }),
  },
});
