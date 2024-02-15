import {
  findNode,
  focusEditor,
  isCollapsed,
  isDefined,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';

import { Alignment, KEY_ALIGN, setAlign } from '../index';

export const useAlignDropdownMenuState = () => {
  const value: Alignment = useEditorSelector((editor) => {
    if (isCollapsed(editor.selection)) {
      const entry = findNode(editor, {
        match: (n) => isDefined(n[KEY_ALIGN]),
      });

      if (entry) {
        const nodeValue = entry[0][KEY_ALIGN] as string;
        if (nodeValue === 'left') return 'left';
        if (nodeValue === 'center') return 'center';
        if (nodeValue === 'right') return 'right';
        if (nodeValue === 'end') return 'end';
        if (nodeValue === 'justify') return 'justify';
      }
    }

    return 'start';
  }, []);

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
