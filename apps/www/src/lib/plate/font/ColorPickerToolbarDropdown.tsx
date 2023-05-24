import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  focusEditor,
  getMark,
  getPluginType,
  removeMark,
  select,
  setMarks,
  useEventPlateId,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ColorPicker } from './ColorPicker';
import { ColorType } from './ColorType';
import { DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './constants';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar';
import { ToolbarButtonProps } from '@/plate/toolbar/ToolbarButtonOld';

type ColorPickerToolbarDropdownProps = {
  pluginKey: string;
  icon: ReactNode;
  colors?: ColorType[];
  customColors?: ColorType[];
  closeOnSelect?: boolean;
};

export function ColorPickerToolbarDropdown({
  id,
  pluginKey,
  icon,
  colors = DEFAULT_COLORS,
  customColors = DEFAULT_CUSTOM_COLORS,
  closeOnSelect = true,
}: ColorPickerToolbarDropdownProps & ToolbarButtonProps) {
  const editorId = useEventPlateId(id);
  const editor = usePlateEditorState(editorId);
  const editorRef = usePlateEditorRef(editorId);

  const [open, setOpen] = useState(false);

  const type = getPluginType(editorRef, pluginKey);

  const color = editorRef && (getMark(editorRef, type) as string);

  const [selectedColor, setSelectedColor] = useState<string>();

  const onToggle = useCallback(
    (value = !open) => {
      setOpen(value);
    },
    [open, setOpen]
  );

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
    <DropdownMenu open={open} modal={false} onOpenChange={onToggle}>
      <ToolbarButton asChild>
        <DropdownMenuTrigger>{icon}</DropdownMenuTrigger>
      </ToolbarButton>

      <DropdownMenuContent>
        <ColorPicker
          color={selectedColor || color}
          colors={colors}
          customColors={customColors}
          updateColor={updateColorAndClose}
          updateCustomColor={updateColor}
          clearColor={clearColor}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
