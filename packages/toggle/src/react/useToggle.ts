import {
  useEditor,
  useEditorPlugin,
  useEditorSelector,
  usePluginStore,
} from '@platejs/core/react';
import { type Element, ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseTogglePlugin } from '../lib/BaseTogglePlugin';
import { TogglePlugin } from './TogglePlugin';

export const useIsVisible = (elementId: string) =>
  !usePluginStore(TogglePlugin, 'isClosed', elementId);

export const useToggleButtonState = (toggleId: string) => {
  const openIds = usePluginStore(BaseTogglePlugin, 'openIds');

  return {
    open: openIds.has(toggleId),
    toggleId,
  };
};

export const useToggleButton = (
  state: ReturnType<typeof useToggleButtonState>
) => {
  const { api } = useEditorPlugin(BaseTogglePlugin);

  return {
    ...state,
    buttonProps: {
      onClick: (event: React.MouseEvent) => {
        event.preventDefault();
        api.toggleIds([state.toggleId]);
      },
      onMouseDown: (event: React.MouseEvent) => {
        event.preventDefault();
      },
    },
  };
};

export const useToggleToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) =>
    editor.plugin(BaseTogglePlugin).read.isActive()
  );

  return { pressed };
};

export const useToggleToolbarButton = ({
  pressed,
}: ReturnType<typeof useToggleToolbarButtonState>) => {
  const editor = useEditor();

  return {
    props: {
      pressed,
      onClick: () => {
        editor.plugin(BaseTogglePlugin).api.toggleIds(
          editor.read.nodes
            .toArray<Element>({
              match: (node) =>
                ElementApi.isElement(node) && editor.read.nodes.isBlock(node),
              mode: 'lowest',
            })
            .flatMap(([node]) =>
              typeof node.id === 'string' ? [node.id] : []
            ),
          true
        );
        editor.update((tx) => {
          tx.blocks.toggle(KEYS.toggle);
          tx.selection.collapse();
        });
        editor.api.dom.focus();
      },
      onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
    },
  };
};
