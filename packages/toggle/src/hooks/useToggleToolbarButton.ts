import {
  focusEditor,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';
import {
  type PlateEditor,
  type Value,
  collapseSelection,
  toggleNodeType,
} from '@udecode/plate-common/server';

import { someToggle } from '../queries/someToggle';
import { openNextToggles } from '../transforms';
import { ELEMENT_TOGGLE } from '../types';

export const useToggleToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) => someToggle(editor), []);

  return {
    pressed,
  };
};

export const useToggleToolbarButton = ({
  pressed,
}: ReturnType<typeof useToggleToolbarButtonState>) => {
  const editor = useEditorRef<Value, PlateEditor<Value>>();

  return {
    props: {
      onClick: () => {
        openNextToggles(editor);
        toggleNodeType(editor, { activeType: ELEMENT_TOGGLE });
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
