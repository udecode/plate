import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getMark, isMarkActive, setMarks } from '@udecode/plate-common';
import {
  getPlatePluginType,
  useEventEditorId,
  useStoreEditorRef,
  useStoreEditorSelection,
  useStoreEditorState,
} from '@udecode/plate-core';
import {
  ToolbarButton,
  ToolbarButtonProps,
  ToolbarDropdown,
} from '@udecode/plate-toolbar';
import { BaseSelection, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ColorPicker } from '../ColorPicker/ColorPicker';

type ToolbarColorPickerProps = {
  pluginKey?: string;
  icon: ReactNode;
  selectedIcon: ReactNode;
};

export const ToolbarColorPicker = ({
  pluginKey,
  icon,
  selectedIcon,
  ...rest
}: ToolbarColorPickerProps & ToolbarButtonProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  const editorRef = useStoreEditorRef(useEventEditorId('focus'));
  const selection = useStoreEditorSelection(useEventEditorId('focus'));
  const type = getPlatePluginType(editor, pluginKey);

  const color = editorRef && getMark(editorRef, type);

  const [selectedColor, setSelectedColor] = useState<string>();

  const latestSelection = useRef<BaseSelection>();

  const updateColor = useCallback((ev: any, colorParam: string) => {
    setSelectedColor(colorParam);
  }, []);

  useEffect(() => {
    if (selection) {
      latestSelection.current = selection;
      setSelectedColor(color);
    }
  }, [color, selection]);

  return (
    <ToolbarDropdown
      control={
        <ToolbarButton
          active={!!editor?.selection && isMarkActive(editor, type)}
          icon={icon}
          {...rest}
        />
      }
      onClose={(e: MouseEvent) => {
        if (editorRef && editor && latestSelection.current) {
          e.preventDefault();

          Transforms.select(editorRef, latestSelection.current);
          ReactEditor.focus(editorRef);

          if (selectedColor) {
            setMarks(editor, { [type]: selectedColor });
          }
        }
      }}
    >
      <ColorPicker
        color={selectedColor || color}
        selectedIcon={selectedIcon}
        updateColor={updateColor}
      />
    </ToolbarDropdown>
  );
};
