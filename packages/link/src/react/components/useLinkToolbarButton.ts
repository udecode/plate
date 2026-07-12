import { useEditorRef, useEditorSelector } from '@platejs/core/react';
import type { TLinkElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

import { triggerFloatingLink } from '../index';

export const useLinkToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) => {
    const selection = editor.read.selection();

    return (
      !!selection &&
      editor.read.nodes.some({
        at: selection,
        match: { type: editor.getType(KEYS.link) },
      })
    );
  }, []);

  return {
    pressed,
  };
};

export const useLinkToolbarButton = (
  state: ReturnType<typeof useLinkToolbarButtonState>
) => {
  const editor = useEditorRef();

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        if (state.pressed) {
          const selection = editor.read.selection();

          if (!selection) return;

          const node = editor.read.nodes.find<TLinkElement>({
            at: selection,
            match: { type: editor.getType(KEYS.link) },
          });

          if (!node) return;

          const endPoint = editor.read.points.end(node[1]);

          if (endPoint) {
            editor.update.selection.set(endPoint);
          }
        } else {
          editor.api.dom.focus();
          triggerFloatingLink(editor, { focused: true });
        }
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
      },
    },
  };
};
