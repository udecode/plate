import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlugin, getSlateClass } from '@udecode/plate-core';
import { ELEMENT_MENTION } from './defaults';

export const getMentionDeserialize = (key = ELEMENT_MENTION): Deserialize => (
  editor,
  { type }
) => {
  return {
    element: getNodeDeserializer({
      type,
      getNode: (el) => ({
        type,
        value: el.getAttribute('data-slate-value'),
      }),
      rules: [{ className: getSlateClass(type) }],
    }),
  };
};
