import type { TElement } from '@udecode/plate';

import { useEditorRef, useEditorSelector } from '@udecode/plate/react';

import { BaseLineHeightPlugin, setLineHeight } from '../../index';

export const useLineHeightDropdownMenuState = () => {
  const editor = useEditorRef();
  const { defaultNodeValue, validNodeValues: values = [] } =
    editor.getInjectProps(BaseLineHeightPlugin);

  const value: string | undefined = useEditorSelector((editor) => {
    if (editor.api.isCollapsed()) {
      const entry = editor.api.block<TElement>();

      if (entry) {
        return (
          values.find((item) => item === entry[0][BaseLineHeightPlugin.key]) ??
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
        editor.tf.focus();
      },
    },
  };
};
