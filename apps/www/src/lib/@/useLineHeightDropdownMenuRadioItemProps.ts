import {
  getPluginInjectProps,
  isBlock,
  KEY_LINE_HEIGHT,
  TElement,
} from '@udecode/plate';
import {
  findNode,
  focusEditor,
  isCollapsed,
  useEventPlateId,
} from '@udecode/plate-common';
import { setLineHeight } from '@udecode/plate-line-height';

import { useMyPlateEditorState } from '@/types/plate.types';

export const useLineHeightDropdownMenuRadioItemProps = () => {
  const editor = useMyPlateEditorState(useEventPlateId());
  const { validNodeValues: values = [], defaultNodeValue } =
    getPluginInjectProps(editor, KEY_LINE_HEIGHT);
  let value: string = defaultNodeValue;

  if (isCollapsed(editor?.selection)) {
    const entry = findNode<TElement>(editor!, {
      match: (n) => isBlock(editor, n),
    });
    if (entry) {
      value =
        values.find((item) => item === entry[0][KEY_LINE_HEIGHT]) ??
        defaultNodeValue;
    }
  }

  return {
    value,
    onValueChange: (newValue) => {
      setLineHeight(editor, {
        value: Number(newValue),
      });
      focusEditor(editor);
    },
  };
};
