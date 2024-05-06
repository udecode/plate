import {
  focusEditor,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';
import { findNode, isCollapsed, isDefined } from '@udecode/plate-common/server';

import { type Alignment, KEY_ALIGN, setAlign } from '../index';

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
      onValueChange: (newValue: string) => {
        setAlign(editor, {
          key: KEY_ALIGN,
          value: newValue as Alignment,
        });

        focusEditor(editor);
      },
      value,
    },
  };
};
