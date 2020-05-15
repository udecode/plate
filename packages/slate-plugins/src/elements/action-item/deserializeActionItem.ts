import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { ACTION_ITEM } from 'elements/action-item/types';

export const deserializeActionItem = ({
  typeActionItem = ACTION_ITEM,
} = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeActionItem, {
    createElement: (el) => ({
      type: typeActionItem,
      checked: el.getAttribute('data-slate-checked') === 'true',
    }),
  }),
});
