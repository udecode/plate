import {
  Deserialize,
  getNodeDeserializer,
  getSlateClass,
  getSlatePluginOptions,
} from '@udecode/slate-plugins';
import { ELEMENT_TAG } from './defaults';

export const getTagDeserialize = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, ELEMENT_TAG);

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
