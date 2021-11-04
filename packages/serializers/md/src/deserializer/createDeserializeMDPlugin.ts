import { isUrl } from '@udecode/plate-common';
import {
  getPlatePluginWithOverrides,
  PlatePlugin,
  WithOverride,
} from '@udecode/plate-core';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { deserializeMD } from './utils';

export interface WithDeserializeMarkdownOptions {
  plugins?: PlatePlugin[];
}

export const mdDeserializerId = 'MD Deserializer';

/**
 * Enables support for deserializing content
 * from Markdown format to Slate format.
 */
export const withDeserializeMD = ({
  plugins = [],
}: WithDeserializeMarkdownOptions = {}): WithOverride => (editor) => {
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
