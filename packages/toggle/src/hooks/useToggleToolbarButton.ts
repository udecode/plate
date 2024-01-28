import {
  collapseSelection,
  focusEditor,
  PlateEditor,
  toggleNodeType,
  useEditorRef,
  useEditorSelector,
  Value,
} from '@udecode/plate-common';

import { someToggle } from '../queries/someToggle';
import { openFutureToggles } from '../transforms';
import { ELEMENT_TOGGLE, ToggleEditor } from '../types';

export const useToggleToolbarButtonState = () => {
  const pressed = useEditorSelector((editor) => someToggle(editor), []);

  return {
    pressed,
  };
};

export const useToggleToolbarButton = ({
  pressed,
}: ReturnType<typeof useToggleToolbarButtonState>) => {
  const editor = useEditorRef<Value, PlateEditor<Value> & ToggleEditor>();

  return {
    props: {
      pressed,
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: () => {
        openFutureToggles(editor);
        toggleNodeType(editor, { activeType: ELEMENT_TOGGLE });
        collapseSelection(editor);
        focusEditor(editor);
      },
    },
  };
};
