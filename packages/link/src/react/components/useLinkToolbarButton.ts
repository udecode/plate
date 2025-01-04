import { useEditorRef, useEditorSelector } from '@udecode/plate-common/react';

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
        triggerFloatingLink(editor, { focused: true });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
      },
    },
  };
};
