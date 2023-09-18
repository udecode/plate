import {
  findNode,
  focusEditor,
  isCollapsed,
  isDefined,
  useEditorRef,
  useEditorState,
} from '@udecode/plate-common';

import { Alignment, KEY_ALIGN, setAlign } from '../index';

export const useAlignDropdownMenuState = () => {
  const editor = useEditorState();

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
  const editor = useEditorRef();

  return {
    radioGroupProps: {
      value,
      onValueChange: (newValue: string) => {
        setAlign(editor, {
          value: newValue as Alignment,
          key: KEY_ALIGN,
        });

        focusEditor(editor);
      },
    },
  };
};
