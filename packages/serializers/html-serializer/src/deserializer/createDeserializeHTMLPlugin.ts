import { isBlockAboveEmpty, setNodes } from '@udecode/plate-common';
import {
  getInlineTypes,
  getPlatePluginWithOverrides,
  PlatePlugin,
  SPEditor,
  TDescendant,
  TElement,
  WithOverride,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { deserializeHTMLToDocumentFragment } from './utils/deserializeHTMLToDocumentFragment';

export interface WithDeserializeHTMLOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: PlatePlugin<T>[];

  /**
   * Function called before inserting the deserialized html.
   * Default: if the block above is empty and the first fragment node type is not inline,
   * set the selected node type to the first fragment node type.
   */
  preInsert?: (fragment: TDescendant[]) => TDescendant[];

  /**
   * Function called to insert the deserialized html.
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
 * Enables support for deserializing inserted content from HTML format to Slate format.
 */
export const withDeserializeHTML = <
  T extends ReactEditor & SPEditor = ReactEditor & SPEditor
>({
  plugins = [],
  ...options
}: WithDeserializeHTMLOptions<T> = {}): WithOverride<T> => (editor) => {
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
        !inlineTypes.includes(firstNodeType)
      ) {
        setNodes<TElement>(editor, { type: firstNodeType });
      }

      return fragment;
    },

    insert = (fragment) => {
      Transforms.insertFragment(editor, fragment);
    },
  } = options;

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    if (html) {
      const { body } = new DOMParser().parseFromString(html, 'text/html');

      let fragment = deserializeHTMLToDocumentFragment(editor, {
        plugins,
        element: body,
      });

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
 * @see {@link withDeserializeHTML}
 */
export const createDeserializeHTMLPlugin = getPlatePluginWithOverrides(
  withDeserializeHTML
);
