import { collapseSelection } from '@udecode/plate-common';
import {
  focusEditor,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common/react';

import { someToggle } from '../../lib';
import { TogglePlugin } from '../TogglePlugin';
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
      onClick: () => {
        openNextToggles(editor);
        editor.tf.toggle.block({ type: TogglePlugin.key });
        collapseSelection(editor);
        focusEditor(editor);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      pressed,
    },
  };
};
