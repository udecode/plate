import { useEditor, useEditorSelector } from '@platejs/core/react';

import { LinkPlugin } from './LinkPlugin';
import { useFloatingLinkActions } from './useFloatingLink';

export const useLinkToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) => {
    const selection = editor.read.selection();

    return (
      !!selection &&
      editor.read.nodes.some({
        at: selection,
        type: LinkPlugin,
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
  const editor = useEditor();
  const { trigger } = useFloatingLinkActions();

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        if (state.pressed) {
          const selection = editor.read.selection();

          if (!selection) return;

          const node = editor.read.nodes.find({
            at: selection,
            type: LinkPlugin,
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
