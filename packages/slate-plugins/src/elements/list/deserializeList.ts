import { DeserializeHtml } from 'deserializers/types';
import { ListType, ListTypeOptions } from './types';

export const deserializeList = ({
  typeUl = ListType.UL,
  typeOl = ListType.OL,
  typeLi = ListType.LI,
}: ListTypeOptions = {}): DeserializeHtml => ({
  element: {
    UL: () => ({ type: typeUl }),
    OL: () => ({ type: typeOl }),
    LI: () => ({ type: typeLi }),
  },
});
