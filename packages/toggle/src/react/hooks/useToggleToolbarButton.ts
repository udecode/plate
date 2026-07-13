import {
  type PlateEditor,
  useEditorRef,
  useEditorSelector,
} from '@platejs/core/react';
import type { Value } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { someToggle } from '../../lib';
import type { ToggleConfig } from '../TogglePlugin';
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
  const editor = useEditorRef<PlateEditor<Value, ToggleConfig>>();

  return {
    props: {
      pressed,
      onClick: () => {
        openNextToggles(editor);
        editor.update((tx) => {
          tx.blocks.toggle(KEYS.toggle);
          tx.selection.collapse();
        });
        editor.api.dom.focus();
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
