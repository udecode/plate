import { PlatePlugin, SPEditor, TDescendant } from '@udecode/plate-core';
import { Editor } from 'slate';
import { ReactEditor } from 'slate-react';

export const insertDeserializedFragment = <
  T extends SPEditor = SPEditor & ReactEditor
>(
  editor: T,
  {
    fragment,
    plugins,
  }: {
    fragment: TDescendant[];
    plugins: PlatePlugin<T>[];
  }
) => {
  Editor.withoutNormalizing(editor, () => {
    plugins.forEach(({ deserialize }) => {
      const getFragment = deserialize?.(editor).getFragment;
      if (!getFragment) return;

      fragment = getFragment(fragment);
    });

    if (!fragment.length) return;

    plugins.some(({ deserialize }) => {
      return deserialize?.(editor).preInsert?.(fragment) === true;
    });
    editor.insertFragment(fragment);
  });
};
