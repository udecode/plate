import {
  focusEditor,
  getBlockAbove,
  getPluginInjectProps,
  isCollapsed,
  TElement,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';

import { KEY_LINE_HEIGHT, setLineHeight } from '../index';

export const useLineHeightDropdownMenuState = () => {
  const editor = usePlateEditorState();
  const { validNodeValues: values = [], defaultNodeValue } =
    getPluginInjectProps(editor, KEY_LINE_HEIGHT);
  let value: string = defaultNodeValue;

  if (isCollapsed(editor?.selection)) {
    const entry = getBlockAbove<TElement>(editor);
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
      onValueChange: (newValue: string) => {
        setLineHeight(editor, {
          value: Number(newValue),
        });
        focusEditor(editor);
      },
    },
  };
};
