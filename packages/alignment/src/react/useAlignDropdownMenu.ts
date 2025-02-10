import { useEditorRef, useSelectionFragmentProp } from '@udecode/plate/react';

import { type Alignment, setAlign } from '../index';

/** @deprecated */
export const useAlignDropdownMenuState = ({
  structuralTypes,
}: { structuralTypes?: string[] } = {}) => {
  const value = useSelectionFragmentProp({
    defaultValue: 'start',
    structuralTypes,
    getProp: (node) => node.align,
  });

  return {
    value: value as Alignment,
  };
};

/** @deprecated */
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
        });

        editor.tf.focus();
      },
    },
  };
};
