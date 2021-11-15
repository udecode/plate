import { cleanDocx } from '@prezly/docx-cleaner';
import {
  getPlatePluginWithOverrides,
  PlatePlugin,
  WithOverride,
} from '@udecode/plate-core';
import {
  deserializeHTMLToDocumentFragment,
  WithDeserializeHTMLOptions,
} from '@udecode/plate-html-serializer';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';

export const docxDeserializerId = 'Docx Deserializer';

/**
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const withDeserializeDocx = ({
  plugins = [],
}: WithDeserializeHTMLOptions = {}): WithOverride => (editor) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    let html = data.getData('text/html');
    const rtf = data.getData('text/rtf');

    const isEnabled = isDeserializerEnabled(
      editor,
      plugins,
      docxDeserializerId
    );

    html = cleanDocx(html, rtf);
    console.log(html);

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
 * @see {@link withDeserializeDocx}
 */
export const createDeserializeDocxPlugin = getPlatePluginWithOverrides(
  withDeserializeDocx
);
