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
import { deserializeHTMLToDocumentFragment } from './utils/deserializeHTMLToDocumentFragment';

export interface WithDeserializeHTMLOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: SlatePlugin<T>[];

  /**
   * Function called to cleanup and insert the deserialized html.
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
    getFragment = (_editor, fragment) => {
      return fragment;
    },

    insert = (_editor, fragment) => {
      const inlineTypes = getInlineTypes(editor, plugins);

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
      Transforms.insertFragment(editor, fragment);
      return fragment;
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
 * @see {@link withDeserializeHTML}
 */
export const createDeserializeHTMLPlugin = getSlatePluginWithOverrides(
  withDeserializeHTML
);
