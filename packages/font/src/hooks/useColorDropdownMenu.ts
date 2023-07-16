import { useCallback, useEffect, useState } from 'react';
import {
  focusEditor,
  getMark,
  removeMark,
  select,
  setMarks,
  usePlateEditorState,
} from '@udecode/plate-common';

export const useColorDropdownMenuState = ({
  nodeType,
  closeOnSelect = true,
  colors,
  customColors,
}: {
  nodeType: string;
  colors: { name: string; value: string; isBrightColor: boolean }[];
  customColors: { name: string; value: string; isBrightColor: boolean }[];
  closeOnSelect?: boolean;
}) => {
  const editor = usePlateEditorState();

  const color = editor && (getMark(editor, nodeType) as string);

  const [selectedColor, setSelectedColor] = useState<string>();

  const [open, setOpen] = useState(false);
  const onToggle = useCallback(
    (value = !open) => {
      setOpen(value);
    },
    [open, setOpen]
  );

  const updateColor = useCallback(
    (value: string) => {
      if (editor && editor && editor.selection) {
        setSelectedColor(value);

        select(editor, editor.selection);
        focusEditor(editor);

        setMarks(editor, { [nodeType]: value });
      }
    },
    [editor, nodeType]
  );

  const updateColorAndClose = useCallback(
    (value: string) => {
      updateColor(value);
      closeOnSelect && onToggle();
    },
    [closeOnSelect, onToggle, updateColor]
  );

  const clearColor = useCallback(() => {
    if (editor && editor && editor.selection) {
      select(editor, editor.selection);
      focusEditor(editor);

      if (selectedColor) {
        removeMark(editor, { key: nodeType });
      }

      closeOnSelect && onToggle();
    }
  }, [editor, selectedColor, closeOnSelect, onToggle, nodeType]);

  useEffect(() => {
    if (editor?.selection) {
      setSelectedColor(color);
    }
  }, [color, editor?.selection]);

  return {
    open,
    onToggle,
    selectedColor,
    color,
    updateColorAndClose,
    updateColor,
    clearColor,
    colors,
    customColors,
  };
};

export const useColorDropdownMenu = ({
  open,
  onToggle,
}: ReturnType<typeof useColorDropdownMenuState>) => {
  return {
    menuProps: {
      open,
      onOpenChange: onToggle,
    },
    buttonProps: {
      pressed: open,
    },
  };
};
