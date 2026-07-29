import { useEditorPlugin, useEditorSelector } from '@platejs/core/react';
import type { TLinkElement } from '@platejs/utils';

import { LinkPlugin } from './LinkPlugin';
import { useFloatingLinkActions } from './useFloatingLink';

export const useLinkToolbarButtonState = () => {
  const { type } = useEditorPlugin(LinkPlugin);
  const pressed = useEditorSelector((editor) => {
    const selection = editor.read.selection();

    return (
      !!selection &&
      editor.read.nodes.some({
        at: selection,
        match: { type },
      })
    );
  });

  return {
    pressed,
  };
};

export const useLinkToolbarButton = (
  state: ReturnType<typeof useLinkToolbarButtonState>
) => {
  const { editor, type } = useEditorPlugin(LinkPlugin);
  const { trigger } = useFloatingLinkActions();

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        if (state.pressed) {
          const selection = editor.read.selection();

          if (!selection) return;

          const node = editor.read.nodes.find<TLinkElement>({
            at: selection,
            match: { type },
          });

          if (!node) return;

          const endPoint = editor.read.points.end(node[1]);

          if (endPoint) {
            editor.update.selection.set(endPoint);
          }
        } else {
          editor.api.dom.focus();
          trigger({ focused: true });
        }
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
      },
    },
  };
};
