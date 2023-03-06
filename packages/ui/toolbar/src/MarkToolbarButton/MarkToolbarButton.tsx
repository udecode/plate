import React from 'react';
import {
  focusEditor,
  isMarkActive,
  toggleMark,
  useEventPlateId,
  usePlateEditorState,
  Value,
  
} from '@udecode/plate-core';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { MarkToolbarButtonProps } from './MarkToolbarButton.types';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export const MarkToolbarButton = <V extends Value>({
  id,
  type,
  clear,
  active: _active,
  ...props
}: MarkToolbarButtonProps<V>) => {
  const editor = usePlateEditorState(useEventPlateId(id));
  const active =
    _active ?? (!!editor?.selection && isMarkActive(editor, type!));
  return (
    <ToolbarButton
      active={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleMark(editor, { key: type!, clear });
        focusEditor(editor);
      }}
      {...props}
    />
  );
};
