import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getMark, isMarkActive, setMarks } from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  useEventEditorId,
  useStoreEditorRef,
  useStoreEditorSelection,
  useStoreEditorState,
} from '@udecode/slate-plugins-core';
import { ToolbarButton, ToolbarDropdown } from '@udecode/slate-plugins-toolbar';
import { BaseSelection, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ColorPicker } from '../ColorPicker/ColorPicker';

export const ToolbarColorPicker = ({
  pluginKey,
  icon,
}: {
  pluginKey?: string;
  icon: ReactNode;
}) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  const editorRef = useStoreEditorRef(useEventEditorId('focus'));
  const selection = useStoreEditorSelection(useEventEditorId('focus'));
  const type = getSlatePluginType(editor, pluginKey);

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
      <ColorPicker color={selectedColor || color} updateColor={updateColor} />
    </ToolbarDropdown>
  );
};
