import { Alignment, KEY_ALIGN, setAlign } from '@udecode/plate-alignment';
import {
  findNode,
  focusEditor,
  isCollapsed,
  isDefined,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';

export const useAlignDropdownMenuState = () => {
  const editor = usePlateEditorState();

  let value: Alignment = 'left';
  if (isCollapsed(editor?.selection)) {
    const entry = findNode(editor!, {
      match: (n) => isDefined(n[KEY_ALIGN]),
    });
    if (entry) {
      const nodeValue = entry[0][KEY_ALIGN] as string;
      if (nodeValue === 'right') value = 'right';
      if (nodeValue === 'center') value = 'center';
      if (nodeValue === 'justify') value = 'justify';
    }
  }

  return {
    value,
  };
};

export const useAlignDropdownMenu = ({
  value,
}: ReturnType<typeof useAlignDropdownMenuState>) => {
  const editor = usePlateEditorRef();

  return {
    radioGroupProps: {
      value,
      onValueChange: (newValue) => {
        setAlign(editor, {
          value: newValue as Alignment,
          key: KEY_ALIGN,
        });

        focusEditor(editor);
      },
    },
  };
};
