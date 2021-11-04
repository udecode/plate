import { isUrl } from '@udecode/plate-common';
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
import { deserializeMD } from './utils';

export interface WithDeserializeMarkdownOptions<T = TPlateEditor> {
  plugins?: PlatePlugin<T>[];
}

export const mdDeserializerId = 'MD Deserializer';

/**
 * Enables support for deserializing content
 * from Markdown format to Slate format.
 */
export const withDeserializeMD = <T extends PlateEditor = PlateEditor>({
  plugins = [],
}: WithDeserializeMarkdownOptions<T> = {}): WithOverride<T> => (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    const isEnabled = isDeserializerEnabled(editor, plugins, mdDeserializerId);

    const { files } = data;
    if (content && isEnabled && !files?.length) {
      // if content is simply a URL pass through to not break LinkPlugin
      if (isUrl(content)) {
        return insertData(data);
      }

      const fragment = deserializeMD(editor, content);

      if (fragment.length) {
        return insertDeserializedFragment(editor, { plugins, fragment });
      }
    }

    insertData(data);
  };

  return editor;
};

/**
 * @see {@link withDeserializeMd}
 */
export const createDeserializeMDPlugin = getPlatePluginWithOverrides(
  withDeserializeMD
);
