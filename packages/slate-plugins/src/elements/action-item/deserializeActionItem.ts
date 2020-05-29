import { DeserializeHtml } from '../../common';
import { getElementDeserializer } from '../../element/utils';
import { ACTION_ITEM, ActionItemDeserializeOptions } from './types';

export const deserializeActionItem = ({
  typeActionItem = ACTION_ITEM,
}: ActionItemDeserializeOptions = {}): DeserializeHtml => ({
  element: getElementDeserializer(typeActionItem, {
    createElement: (el) => ({
      type: typeActionItem,
      checked: el.getAttribute('data-slate-checked') === 'true',
    }),
  }),
});
