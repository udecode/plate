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
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { deserializeCSV } from './utils';

export interface WithDeserializeCSVOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: SlatePlugin<T>[];
  /**
   * Function called to cleanup and insert the deserialized csv.
   * Default: if the block above is empty and the first fragment node type is not inline,
   * set the selected node type to the first fragment node type.
   * Then call Transforms.insertFragment.
   */
  insert?: (editor: T, fragment: TDescendant[]) => void;

  /**
   * Function called to get a custom fragment root.
   * Default: fragment.
   */
  getFragment?: (editor: T, fragment: TDescendant[]) => TDescendant[];
}

/**
 * Enables support for deserializing content
 * from CSV format to Slate format.
 */
export const withDeserializeCSV = <
  T extends ReactEditor & SPEditor = ReactEditor & SPEditor
>({
  plugins = [],
  ...options
}: WithDeserializeCSVOptions<T> = {}): WithOverride<T> => (editor) => {
  const { insertData } = editor;

  const {
    getFragment = (_editor, fragment) => {
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
    },
  } = options;

  editor.insertData = (data) => {
    const content = data.getData('text/plain');

    if (content) {
      let fragment = deserializeCSV(editor, content, true);

      if (!fragment) {
        insertData(data);
        return;
      }
      Editor.withoutNormalizing(editor, () => {
        fragment = getFragment(editor, fragment as TElement[]);
        insert(editor, fragment);
      });
      return;
    }
    insertData(data);
  };

  return editor;
};

/**
 * @see {@link withDeserializeCSV}
 */
export const createDeserializeCSVPlugin = getSlatePluginWithOverrides(
  withDeserializeCSV
);
