import {
  focusEditor,
  getBlockAbove,
  getPluginInjectProps,
  isCollapsed,
  TElement,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';

import { KEY_LINE_HEIGHT, setLineHeight } from '../index';

export const useLineHeightDropdownMenuState = () => {
  const editor = useEditorRef();
  const { validNodeValues: values = [], defaultNodeValue } =
    getPluginInjectProps(editor, KEY_LINE_HEIGHT);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const value: string | undefined = useEditorSelector((editor) => {
    if (isCollapsed(editor.selection)) {
      const entry = getBlockAbove<TElement>(editor);
      if (entry) {
        return (
          values.find((item) => item === entry[0][KEY_LINE_HEIGHT]) ??
          defaultNodeValue
        );
      }
    }
  }, []);

  return {
    value,
    values,
  };
};

export const useLineHeightDropdownMenu = ({
  value,
}: ReturnType<typeof useLineHeightDropdownMenuState>) => {
  const editor = useEditorRef();

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
