import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  focusEditor,
  getMark,
  getPluginType,
  isMarkActive,
  removeMark,
  select,
  setMarks,
  useEventPlateId,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';
import {
  ToolbarButton,
  ToolbarButtonProps,
  ToolbarDropdown,
} from '@udecode/plate-ui-toolbar';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { ColorType } from '../ColorPicker/ColorType';
import { DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './constants';

type ColorPickerToolbarDropdownProps = {
  pluginKey: string;
  icon: ReactNode;
  selectedIcon: ReactNode;
  colors?: ColorType[];
  customColors?: ColorType[];
  closeOnSelect?: boolean;
};

export function ColorPickerToolbarDropdown({
  id,
  pluginKey,
  icon,
  selectedIcon,
  colors = DEFAULT_COLORS,
  customColors = DEFAULT_CUSTOM_COLORS,
  closeOnSelect = true,
  ...rest
}: ColorPickerToolbarDropdownProps & ToolbarButtonProps) {
  const editorId = useEventPlateId(id);
  const editor = usePlateEditorState(editorId);
  const editorRef = usePlateEditorRef(editorId);

  const [open, setOpen] = useState(false);

  const type = getPluginType(editorRef, pluginKey);

  const color = editorRef && (getMark(editorRef, type) as string);

  const [selectedColor, setSelectedColor] = useState<string>();

  const onToggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const updateColor = useCallback(
    (value: string) => {
      if (editorRef && editor && editor.selection) {
        setSelectedColor(value);

        select(editorRef, editor.selection);
        focusEditor(editorRef);

        setMarks(editor, { [type]: value });
      }
    },
    [editor, editorRef, type]
  );

  const updateColorAndClose = useCallback(
    (value: string) => {
      updateColor(value);
      closeOnSelect && onToggle();
    },
    [closeOnSelect, onToggle, updateColor]
  );

  const clearColor = useCallback(() => {
    if (editorRef && editor && editor.selection) {
      select(editorRef, editor.selection);
      focusEditor(editorRef);

      if (selectedColor) {
        removeMark(editor, { key: type });
      }

      closeOnSelect && onToggle();
    }
  }, [closeOnSelect, editor, editorRef, onToggle, selectedColor, type]);

  useEffect(() => {
    if (editor?.selection) {
      setSelectedColor(color);
    }
  }, [color, editor?.selection]);

  return (
    <ToolbarDropdown
      control={
        <ToolbarButton
          active={!!editor?.selection && isMarkActive(editor, type)}
          icon={icon}
          {...rest}
        />
      }
      open={open}
      onOpen={onToggle}
      onClose={onToggle}
    >
      <ColorPicker
        color={selectedColor || color}
        colors={colors}
        customColors={customColors}
        selectedIcon={selectedIcon}
        updateColor={updateColorAndClose}
        updateCustomColor={updateColor}
        clearColor={clearColor}
        open={open}
      />
    </ToolbarDropdown>
  );
}
