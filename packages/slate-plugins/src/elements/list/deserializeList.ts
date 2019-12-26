import { DeserializeHtml } from 'paste-html/types';
import { ListType } from './types';

export const deserializeList = (): DeserializeHtml => ({
  element: {
    UL: () => ({ type: ListType.UL_LIST }),
    OL: () => ({ type: ListType.OL_LIST }),
    LI: () => ({ type: ListType.LIST_ITEM }),
  },
});
