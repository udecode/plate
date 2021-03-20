import {
  Deserialize,
  getNodeDeserializer,
  getPluginOptions,
  getSlateClass,
} from '@udecode/slate-plugins';
import { Editor } from 'slate';
import { ELEMENT_TAG } from './defaults';

export const useDeserializeTag = (): Deserialize => (editor: Editor) => {
  const options = getPluginOptions(editor, ELEMENT_TAG);

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
