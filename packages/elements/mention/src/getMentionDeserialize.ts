import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getSlateClass } from '@udecode/plate-core';
import { MentionPlugin } from './types';

export const getMentionDeserialize = (): Deserialize<{}, MentionPlugin> => (
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
