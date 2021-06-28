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

export interface WithDeserializeAstOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: SlatePlugin<T>[];

  /**
   * Function called before inserting the deserialized html.
   * Default: if the block above is empty and the first fragment node type is not inline,
   * set the selected node type to the first fragment node type.
   */
  preInsert?: (fragment: TDescendant[]) => TDescendant[];

  /**
   * Function called to insert the cleaned up ast.
   * Default: Transforms.setNodes.
   */
  insert?: (fragment: TDescendant[]) => void;
}

/**
 * Enables support for deserializing inserted content from Slate Ast format to Slate format
 * while apply a small bug fix.
 */
export const withDeserializeAst = <
  T extends ReactEditor & SPEditor = ReactEditor & SPEditor
>({
  plugins = [],
  ...options
}: WithDeserializeAstOptions<T> = {}): WithOverride<T> => (editor) => {
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
      Transforms.insertNodes<TElement>(editor, fragment as any);
    },
  } = options;

  editor.insertData = (data: DataTransfer) => {
    const ast = data.getData('application/x-slate-fragment');

    if (ast) {
      const decoded = decodeURIComponent(window.atob(ast));
      let fragment = JSON.parse(decoded);

      fragment = preInsert(fragment);

      insert(fragment);
      return;
    }
    insertData(data);
  };

  return editor;
};

/**
 * @see {@link withDeserializeAst}
 */
export const createDeserializeAstPlugin = getSlatePluginWithOverrides(
  withDeserializeAst
);
