import {
  focusEditor,
  getNodeEntries,
  isBlock,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';
import { isDefined } from '@udecode/plate-common/server';

import { type Alignment, KEY_ALIGN, setAlign } from '../index';

export const useAlignDropdownMenuState = () => {
  const value: Alignment = useEditorSelector((editor) => {
    let commonAlignment: string | undefined;
    const codeBlockEntries = getNodeEntries(editor, {
      match: (n) => isBlock(editor, n),
    });
    const nodes = Array.from(codeBlockEntries);
    nodes.forEach(([node, path]) => {
      const align: string = (node[KEY_ALIGN] as string) || 'left';

      if (!isDefined(commonAlignment)) {
        commonAlignment = align;
      } else if (commonAlignment !== align) {
        commonAlignment = undefined;
      }
    });

    if (isDefined(commonAlignment)) {
      const nodeValue = commonAlignment;

      if (nodeValue === 'left') return 'left';
      if (nodeValue === 'center') return 'center';
      if (nodeValue === 'right') return 'right';
      if (nodeValue === 'end') return 'end';
      if (nodeValue === 'justify') return 'justify';
    }

    return 'left';
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
