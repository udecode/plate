import { useEditorRef, useEditorSelector } from '@udecode/plate/react';

import { LinkPlugin, triggerFloatingLink } from '../index';

export const useLinkToolbarButtonState = () => {
  const pressed = useEditorSelector(
    (editor) =>
      !!editor?.selection &&
      editor.api.some({
        match: { type: editor.getType(LinkPlugin) },
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
        editor.tf.focus();
        triggerFloatingLink(editor, { focused: true });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
      },
    },
  };
};
