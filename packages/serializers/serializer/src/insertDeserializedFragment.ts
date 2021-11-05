import { PlateEditor, PlatePlugin, TDescendant } from '@udecode/plate-core';
import { Editor } from 'slate';

export const insertDeserializedFragment = <T = {}>(
  editor: PlateEditor<T>,
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
