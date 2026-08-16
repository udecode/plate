import type { PluginReference } from '@platejs/core';
import { useEditor, useEditorSelector } from '@platejs/core/react';

import { BulletedListPlugin, ListPlugin } from './ListPlugin';

export const useListToolbarButtonState = ({
  plugin = BulletedListPlugin,
}: {
  plugin?: PluginReference | string;
} = {}) => {
  const pressed = useEditorSelector(
    (editor) =>
      !!editor.read.selection() &&
      editor.read.nodes.some({
        type:
          typeof plugin === 'string'
            ? editor.plugin(plugin).schema.type
            : plugin,
      })
  );

  return {
    plugin,
    pressed,
  };
};

export const useListToolbarButton = (
  state: ReturnType<typeof useListToolbarButtonState>
) => {
  const editor = useEditor();

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        editor.plugin(ListPlugin).update.toggle({
          type: editor.plugin(state.plugin).schema.type,
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
