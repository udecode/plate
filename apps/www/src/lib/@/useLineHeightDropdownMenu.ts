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
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';
import { setLineHeight } from '@udecode/plate-line-height';

export const useLineHeightDropdownMenuState = () => {
  const editor = usePlateEditorState();
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
    values,
  };
};

export const useLineHeightDropdownMenu = ({
  value,
}: ReturnType<typeof useLineHeightDropdownMenuState>) => {
  const editor = usePlateEditorRef();

  return {
    radioGroupProps: {
      value,
      onValueChange: (newValue) => {
        setLineHeight(editor, {
          value: Number(newValue),
        });
        focusEditor(editor);
      },
    },
  };
};
