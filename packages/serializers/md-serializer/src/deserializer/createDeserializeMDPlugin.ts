import {
  isBlockAboveEmpty,
  isUrl,
  setNodes,
} from '@udecode/slate-plugins-common';
import {
  getInlineTypes,
  getSlatePluginWithOverrides,
  SlatePlugin,
  SPEditor,
  TDescendant,
  TElement,
  WithOverride,
} from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { deserializeMD } from './utils/deserializeMD';

export interface WithDeserializeMarkdownOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: SlatePlugin<T>[];
  /**
   * Function called to cleanup and insert the deserialized markdown.
   * Default: if the block above is empty and the first fragment node type is not inline,
   * set the selected node type to the first fragment node type.
   * Then call Transforms.insertFragment.
   */
  insert?: (editor: T, fragment: TDescendant[]) => TDescendant[];

  /**
   * Function called to get a custom fragment root.
   * Default: fragment.
   */
  getFragment?: (editor: T, fragment: TDescendant[]) => TDescendant[];
}

/**
 * Enables support for deserializing content
 * from Markdown format to Slate format.
 */
export const withDeserializeMD = <
  T extends ReactEditor & SPEditor = ReactEditor & SPEditor
>({
  plugins = [],
  ...options
}: WithDeserializeMarkdownOptions<T> = {}): WithOverride<T> => (editor) => {
  const { insertData } = editor;

  const {
    getFragment = (fragment) => {
      return fragment;
    },

    insert = (_editor, fragment) => {
      const inlineTypes = getInlineTypes(_editor, plugins);

      const firstNodeType = fragment[0].type as string | undefined;

      // replace the selected node type by the first block type
      if (
        isBlockAboveEmpty(_editor) &&
        firstNodeType &&
        !inlineTypes.includes(firstNodeType) &&
        fragment[0].type
      ) {
        setNodes<TElement>(_editor, { type: firstNodeType });
      }
      Transforms.insertFragment(_editor, fragment);

      return fragment;
    },
  } = options;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    if (content) {
      // if content is simply a URL, pass through to not break LinkPlugin
      if (isUrl(content)) {
        insertData(data);
        return;
      }

      let fragment = deserializeMD(editor, content);

      if (!fragment.length) {
        insertData(data);
        return;
      }
      Editor.withoutNormalizing(editor, () => {
        fragment = getFragment(editor, fragment);
        fragment = insert(editor, fragment);
      });
      return;
    }

    insertData(data);
  };

  return editor;
};

/**
 * @see {@link withDeserializeMd}
 */
export const createDeserializeMDPlugin = getSlatePluginWithOverrides(
  withDeserializeMD
);
