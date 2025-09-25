import { type TLinkElement, KEYS } from 'platejs';
import { useEditorRef, useEditorSelector } from 'platejs/react';

import { triggerFloatingLink } from '../index';

export const useLinkToolbarButtonState = () => {
  const pressed = useEditorSelector(
    (editor) =>
      !!editor?.selection &&
      editor.api.some({
        match: { type: editor.getType(KEYS.link) },
      }),
    []
  );

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
          // select the link if it is already pressed
          const node = editor.api.node<TLinkElement>({
            match: { type: editor.getType(KEYS.link) },
          });

          const endPoint = editor.api.end(node![1]);

          editor.tf.setSelection({ anchor: endPoint, focus: endPoint });
        } else {
          editor.tf.focus();
          triggerFloatingLink(editor, { focused: true });
        }
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
      },
    },
  };
};
