import { isBlockAboveEmpty, isUrl, setNodes } from '@udecode/plate-common';
import {
  getInlineTypes,
  getPlatePluginWithOverrides,
  PlatePlugin,
  SPEditor,
  WithOverride,
} from '@udecode/plate-core';
import { insertDeserializedFragment } from '@udecode/plate-serializer';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { deserializeMD } from './utils/deserializeMD';

export interface WithDeserializeMarkdownOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: PlatePlugin<T>[];
}

/**
 * Enables support for deserializing content
 * from Markdown format to Slate format.
 */
export const withDeserializeMD = <
  T extends ReactEditor & SPEditor = ReactEditor & SPEditor
>({
  plugins = [],
}: WithDeserializeMarkdownOptions<T> = {}): WithOverride<T> => (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    if (content) {
      // if content is simply a URL, pass through to not break LinkPlugin
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
