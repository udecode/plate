import {
  getSlatePluginWithOverrides,
  SlatePlugin,
  SPEditor,
  WithOverride,
} from '@udecode/slate-plugins-core';
import { insertDeserializedFragment } from '@udecode/slate-plugins-serializer';
import { ReactEditor } from 'slate-react';

export interface WithDeserializeAstOptions<
  T extends SPEditor = SPEditor & ReactEditor
> {
  plugins?: SlatePlugin<T>[];
}

/**
 * Enables support for deserializing inserted content from Slate Ast format to Slate format
 * while apply a small bug fix.
 */
export const withDeserializeAst = <
  T extends ReactEditor & SPEditor = ReactEditor & SPEditor
>({ plugins = [] }: WithDeserializeAstOptions<T> = {}): WithOverride<T> => (
  editor
) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const ast = data.getData('application/x-slate-fragment');

    if (ast) {
      const decoded = decodeURIComponent(window.atob(ast));
      const fragment = JSON.parse(decoded);

      if (fragment.length) {
        return insertDeserializedFragment(editor, { fragment, plugins });
      }
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
