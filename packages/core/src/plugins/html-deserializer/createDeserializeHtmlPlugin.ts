import { createPluginFactory } from '../../utils/createPluginFactory';
import { deserializeHtml } from './utils/deserializeHtml';

export const KEY_DESERIALIZE_HTML = 'deserializeHtml';

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const createDeserializeHtmlPlugin = createPluginFactory({
  key: KEY_DESERIALIZE_HTML,
  then: (editor) => ({
    editor: {
      insertData: {
        format: 'text/html',
        getFragment: ({ data }) => {
          const { body } = new DOMParser().parseFromString(data, 'text/html');
          return deserializeHtml(editor, {
            element: body,
          });
        },
      },
    },
  }),
});
