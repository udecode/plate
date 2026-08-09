import { PLUGINS } from '@platejs/utils';
import type { PluginReference } from '@platejs/core';
import { useEditor, useEditorSelector } from '@platejs/core/react';

import { ListPlugin } from './ListPlugin';

export const useListToolbarButtonState = ({
  plugin = PLUGINS.bulletedList as string,
}: {
  plugin?: PluginReference | string;
} = {}) => {
  const pressed = useEditorSelector(
    (editor) =>
      !!editor.read.selection() &&
      editor.read.nodes.some({
        match: { type: editor.plugin(plugin).schema.type },
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
