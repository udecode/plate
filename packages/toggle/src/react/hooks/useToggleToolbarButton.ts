import { KEYS } from 'platejs';
import { useEditorRef, useEditorSelector } from 'platejs/react';

import { someToggle } from '../../lib';
import { openNextToggles } from '../transforms';

export const useToggleToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) => someToggle(editor), []);

  return {
    pressed,
  };
};

export const useToggleToolbarButton = ({
  pressed,
}: ReturnType<typeof useToggleToolbarButtonState>) => {
  const editor = useEditorRef();

  return {
    props: {
      pressed,
      onClick: () => {
        openNextToggles(editor);
        editor.tf.toggleBlock(KEYS.toggle);
        editor.tf.collapse();
        editor.tf.focus();
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
