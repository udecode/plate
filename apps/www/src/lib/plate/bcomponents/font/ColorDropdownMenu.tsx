import React, { useCallback, useEffect, useState } from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  focusEditor,
  getMark,
  removeMark,
  select,
  setMarks,
  useEventPlateId,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ColorPicker } from './ColorPicker';
import { DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './constants';
import { TColor } from './TColor';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';

type ColorDropdownMenuProps = {
  id?: string;
  nodeType: string;
  colors?: TColor[];
  customColors?: TColor[];
  closeOnSelect?: boolean;
  tooltip?: string;
} & DropdownMenuProps;

export function ColorDropdownMenu({
  id,
  nodeType,
  tooltip,
  children,
  colors = DEFAULT_COLORS,
  customColors = DEFAULT_CUSTOM_COLORS,
  closeOnSelect = true,
  ...props
}: ColorDropdownMenuProps) {
  const editorId = useEventPlateId(id);
  const editor = usePlateEditorState(editorId);
  const editorRef = usePlateEditorRef(editorId);

  const color = editorRef && (getMark(editorRef, nodeType) as string);

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
      if (editorRef && editor && editor.selection) {
        setSelectedColor(value);

        select(editorRef, editor.selection);
        focusEditor(editorRef);

        setMarks(editor, { [nodeType]: value });
      }
    },
    [editor, editorRef, nodeType]
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
        removeMark(editor, { key: nodeType });
      }

      closeOnSelect && onToggle();
    }
  }, [closeOnSelect, editor, editorRef, onToggle, selectedColor, nodeType]);

  useEffect(() => {
    if (editor?.selection) {
      setSelectedColor(color);
    }
  }, [color, editor?.selection]);

  return (
    <DropdownMenu open={open} modal={false} onOpenChange={onToggle} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip={tooltip}>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
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
