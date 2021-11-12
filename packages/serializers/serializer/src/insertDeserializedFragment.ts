import { PlateEditor, PlatePlugin, TDescendant } from '@udecode/plate-core';
import { Editor } from 'slate';

export const insertDeserializedFragment = <T = {}, P = {}>(
  editor: PlateEditor<T>,
  {
    fragment,
    plugins,
  }: {
    fragment: TDescendant[];
    plugins: PlatePlugin<T, P>[];
  }
) => {
  Editor.withoutNormalizing(editor, () => {
    plugins.forEach((plugin) => {
      const getFragment = plugin.deserialize?.(editor, plugin).getFragment;
      if (!getFragment) return;

      fragment = getFragment(fragment);
    });

    if (!fragment.length) return;

    plugins.some((plugin) => {
      return (
        plugin.deserialize?.(editor, plugin).preInsert?.(fragment) === true
      );
    });
    editor.insertFragment(fragment);
  });
};
