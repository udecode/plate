import React from 'react';
import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
  useEventPlateId,
  usePlateEditorState,
  Value,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { MarkToolbarButtonProps } from './MarkToolbarButton.types';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export const MarkToolbarButton = withPlateEventProvider(
  <V extends Value>({
    id,
    type,
    clear,
    ...props
  }: MarkToolbarButtonProps<V>) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

    return (
      <ToolbarButton
        active={!!editor?.selection && isMarkActive(editor, type!)}
        onMouseDown={
          editor
            ? getPreventDefaultHandler(toggleMark, editor, { key: type, clear })
            : undefined
        }
        {...props}
      />
    );
  }
);
