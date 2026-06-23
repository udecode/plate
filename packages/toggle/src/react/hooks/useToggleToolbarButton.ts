import { KEYS } from 'platejs';
import { useEditorRef, useEditorSelector } from 'platejs/react';

import { someToggle } from '../../lib';
import { openNextToggles } from '../transforms/openNextToggles';

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
        const entry = editor.api.block();

        if (entry) {
          const [node, path] = entry;
          const type = node.type === KEYS.toggle ? KEYS.p : KEYS.toggle;

          editor.update((tx) => {
            tx.nodes.set({ type }, { at: path });
            tx.selection.collapse();
          });
        }

        editor.api.dom.focus();
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
