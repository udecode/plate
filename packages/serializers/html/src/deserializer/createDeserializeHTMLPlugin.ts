import {
  getPlatePluginWithOverrides,
  PlateEditor,
  PlatePlugin,
  WithOverride,
} from '@udecode/plate-core';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { ReactEditor } from 'slate-react';
import { deserializeHTMLToDocumentFragment } from './utils/deserializeHTMLToDocumentFragment';

export interface WithDeserializeHTMLOptions<T = TPlateEditor> {
  plugins?: PlatePlugin<T>[];
}

export const htmlDeserializerId = 'HTML Deserializer';

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const withDeserializeHTML = <T extends PlateEditor = PlateEditor>({
  plugins = [],
}: WithDeserializeHTMLOptions<T> = {}): WithOverride<T> => (editor) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    const isEnabled = isDeserializerEnabled(
      editor,
      plugins,
      htmlDeserializerId
    );

    if (html && isEnabled) {
      const { body } = new DOMParser().parseFromString(html, 'text/html');

      const fragment = deserializeHTMLToDocumentFragment(editor, {
        plugins,
        element: body,
      });

      if (fragment.length) {
        return insertDeserializedFragment(editor, { fragment, plugins });
      }
    }

    insertData(data);
  };

  return editor;
};

/**
 * @see {@link withDeserializeHTML}
 */
export const createDeserializeHTMLPlugin = getPlatePluginWithOverrides(
  withDeserializeHTML
);
