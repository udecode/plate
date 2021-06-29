import { isBlockAboveEmpty, setNodes } from '@udecode/slate-plugins-common';
import {
  getInlineTypes,
  getSlatePluginWithOverrides,
  SlatePlugin,
  SPEditor,
  TDescendant,
  TElement,
  WithOverride,
} from '@udecode/slate-plugins-core';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { deserializeMD } from './utils/deserializeMD';

export interface WithDeserializeMDOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: SlatePlugin<T>[];

  /**
   * Function called before inserting the deserialized md.
   * Default: if the block above is empty and the first fragment node type is not inline,
   * set the selected node type to the first fragment node type.
   */
  preInsert?: (fragment: TDescendant[]) => TDescendant[];

  /**
   * Function called to insert the deserialized md.
   * Default: Transforms.insertFragment.
   */
  insert?: (fragment: TDescendant[]) => void;
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
}: WithDeserializeMDOptions<T> = {}): WithOverride<T> => (editor) => {
  const { insertData } = editor;

  const {
    preInsert = (fragment) => {
      const inlineTypes = getInlineTypes(editor, plugins);

      const firstNodeType = fragment[0].type as string | undefined;

      // replace the selected node type by the first block type
      if (
        isBlockAboveEmpty(editor) &&
        firstNodeType &&
        !inlineTypes.includes(firstNodeType)
      ) {
        setNodes<TElement>(editor, { type: fragment[0].type });
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
      let fragment = deserializeMD(editor, content);

      if (!fragment.length) return;

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
