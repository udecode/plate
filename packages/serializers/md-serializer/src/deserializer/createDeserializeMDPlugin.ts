import { isBlockAboveEmpty, isUrl, setNodes } from '@udecode/plate-common';
import {
  getInlineTypes,
  getSlatePluginWithOverrides,
  SlatePlugin,
  SPEditor,
  TDescendant,
  TElement,
  WithOverride,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { deserializeMD } from './utils/deserializeMD';

export interface WithDeserializeMarkdownOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: SlatePlugin<T>[];
  /**
   * Function called before inserting the deserialized markdown.
   * Default: if the block above is empty and the first fragment node type is not inline,
   * set the selected node type to the first fragment node type.
   */
  preInsert?: (fragment: TDescendant[]) => TDescendant[];

  /**
   * Function called to insert the deserialized markdown.
   * Default: Transforms.insertFragment.
   */
  insert?: (fragment: TDescendant[]) => void;

  /**
   * Function called to get a custom fragment root.
   * Default: fragment.
   */
  getFragment?: (fragment: TDescendant[]) => TDescendant[];
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

    preInsert = (fragment) => {
      const inlineTypes = getInlineTypes(editor, plugins);

      const firstNodeType = fragment[0].type as string | undefined;

      // replace the selected node type by the first block type
      if (
        isBlockAboveEmpty(editor) &&
        firstNodeType &&
        !inlineTypes.includes(firstNodeType) &&
        fragment[0].type
      ) {
        setNodes<TElement>(editor, { type: firstNodeType });
      }

      return fragment;
    },

    insert = (fragment) => {
      Transforms.insertFragment(editor, fragment);
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
      fragment = getFragment(fragment);
      fragment = preInsert(fragment);

      insert(fragment);
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
