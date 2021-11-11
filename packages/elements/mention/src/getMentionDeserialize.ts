import { getNodeDeserializer } from '@udecode/plate-common';
import {
  Deserialize,
  getPlatePluginOptions,
  getSlateClass,
} from '@udecode/plate-core';
import { ELEMENT_MENTION } from './defaults';

export const getMentionDeserialize = (key = ELEMENT_MENTION): Deserialize => (
  editor
) => {
  const options = getPlatePluginOptions(editor, key);

  return {
    element: getNodeDeserializer({
      type: options.type,
      getNode: (el) => ({
        type: options.type,
        value: el.getAttribute('data-slate-value'),
      }),
      rules: [{ className: getSlateClass(options.type) }],
      ...options.deserialize,
    }),
  };
};
