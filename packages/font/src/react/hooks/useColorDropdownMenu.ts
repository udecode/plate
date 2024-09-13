import React from 'react';

import { getMark, removeMark, select, setMarks } from '@udecode/plate-common';
import {
  focusEditor,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common/react';

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
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (editor) => !!editor.selection,
    []
  );

  const color = useEditorSelector(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (editor) => getMark(editor, nodeType) as string,
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

        select(editor, editor.selection);
        focusEditor(editor);

        setMarks(editor, { [nodeType]: value });
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
      select(editor, editor.selection);
      focusEditor(editor);

      if (selectedColor) {
        removeMark(editor, { key: nodeType });
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
