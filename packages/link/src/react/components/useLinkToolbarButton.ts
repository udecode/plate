import { KEYS, TLinkElement } from 'platejs';
import {
  useEditorPlugin,
  useEditorRef,
  useEditorSelector,
} from 'platejs/react';

import { LinkPlugin, triggerFloatingLink } from '../index';

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
  const { editor, api } = useEditorPlugin(LinkPlugin);

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        if (!state.pressed) {
          editor.tf.focus();
          triggerFloatingLink(editor, { focused: true });
        } else {
          const node = editor.api.node<TLinkElement>({
            match: { type: editor.getType(KEYS.link) },
          });

          const endPoint = editor.api.end(node![1]);

          editor.tf.setSelection({ anchor: endPoint, focus: endPoint });
        }
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
      },
    },
  };
};
