import React from 'react';

import { useEditorRef, useEditorSelector } from '@udecode/plate/react';

export const useColorDropdownMenuState = ({
  closeOnSelect = true,
  colors,
  customColors,
  nodeType,
}: {
  colors: { isBrightColor: boolean; name: string; value: string }[];
  customColors: { isBrightColor: boolean; name: string; value: string }[];
  nodeType: string;
  closeOnSelect?: boolean;
}) => {
  const editor = useEditorRef();

  const selectionDefined = useEditorSelector(
    (editor) => !!editor.selection,
    []
  );

  const color = useEditorSelector(
    (editor) => editor.api.mark(nodeType) as string,
    [nodeType]
  );

  const [selectedColor, setSelectedColor] = React.useState<string>();

  const [open, setOpen] = React.useState(false);
  const onToggle = React.useCallback(
    (value = !open) => {
      setOpen(value);
    },
    [open, setOpen]
  );

  const updateColor = React.useCallback(
    (value: string) => {
      if (editor.selection) {
        setSelectedColor(value);

        editor.tf.select(editor.selection);
        editor.tf.focus();

        editor.tf.addMarks({ [nodeType]: value });
      }
    },
    [editor, nodeType]
  );

  const updateColorAndClose = React.useCallback(
    (value: string) => {
      updateColor(value);
      closeOnSelect && onToggle();
    },
    [closeOnSelect, onToggle, updateColor]
  );

  const clearColor = React.useCallback(() => {
    if (editor.selection) {
      editor.tf.select(editor.selection);
      editor.tf.focus();

      if (selectedColor) {
        editor.tf.removeMarks(nodeType);
      }

      closeOnSelect && onToggle();
    }
  }, [editor, selectedColor, closeOnSelect, onToggle, nodeType]);

  React.useEffect(() => {
    if (selectionDefined) {
      setSelectedColor(color);
    }
  }, [color, selectionDefined]);

  return {
    clearColor,
    color,
    colors,
    customColors,
    open,
    selectedColor,
    updateColor,
    updateColorAndClose,
    onToggle,
  };
};

export const useColorDropdownMenu = ({
  open,
  onToggle,
}: ReturnType<typeof useColorDropdownMenuState>) => {
  return {
    buttonProps: {
      pressed: open,
    },
    menuProps: {
      open,
      onOpenChange: onToggle,
    },
  };
};
