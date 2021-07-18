import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getMark, MARK_COLOR, setMark } from '@udecode/slate-plugins-color';
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

export const ToolbarColorPicker = ({ icon }: { icon: ReactNode }) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));
  const editorRef = useStoreEditorRef(useEventEditorId('focus'));
  const selection = useStoreEditorSelection(useEventEditorId('focus'));
  const type = getSlatePluginType(editor, MARK_COLOR);

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
          active={!!editor?.selection && !!type && !!getMark(editor, type)}
          icon={icon}
        />
      }
      onClose={(ev: MouseEvent) => {
        if (editorRef && editor && latestSelection.current) {
          ev.preventDefault();
          Transforms.select(editorRef, latestSelection.current);
          ReactEditor.focus(editorRef);
          if (selectedColor) {
            setMark(editor, type, selectedColor);
          }
        }
      }}
    >
      <ColorPicker color={selectedColor || color} updateColor={updateColor} />
    </ToolbarDropdown>
  );
};
