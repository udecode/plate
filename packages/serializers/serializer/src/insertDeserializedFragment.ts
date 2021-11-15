import { PlateEditor, TDescendant } from '@udecode/plate-core';
import { Editor } from 'slate';

export const insertDeserializedFragment = <T = {}>(
  editor: PlateEditor<T>,
  {
    fragment,
  }: {
    fragment: TDescendant[];
  }
) => {
  Editor.withoutNormalizing(editor, () => {
    editor.plugins.forEach((plugin) => {
      const getFragment = plugin.deserialize?.(editor, plugin).getFragment;
      if (!getFragment) return;

      fragment = getFragment(fragment);
    });

    if (!fragment.length) return;

    editor.plugins.some((plugin) => {
      return (
        plugin.deserialize?.(editor, plugin).preInsert?.(fragment) === true
      );
    });
    editor.insertFragment(fragment);
  });
};
