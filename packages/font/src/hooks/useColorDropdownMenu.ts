import React from 'react';

import {
  focusEditor,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';
import {
  getMark,
  removeMark,
  select,
  setMarks,
} from '@udecode/plate-common/server';

export const useColorDropdownMenuState = ({
  closeOnSelect = true,
  colors,
  customColors,
  nodeType,
}: {
  closeOnSelect?: boolean;
  colors: { isBrightColor: boolean; name: string; value: string }[];
  customColors: { isBrightColor: boolean; name: string; value: string }[];
  nodeType: string;
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
    onToggle,
    open,
    selectedColor,
    updateColor,
    updateColorAndClose,
  };
};

export const useColorDropdownMenu = ({
  onToggle,
  open,
}: ReturnType<typeof useColorDropdownMenuState>) => {
  return {
    buttonProps: {
      pressed: open,
    },
    menuProps: {
      onOpenChange: onToggle,
      open,
    },
  };
};
