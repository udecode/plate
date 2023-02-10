import React from 'react';
import { Alignment, KEY_ALIGN, setAlign } from '@udecode/plate-alignment';
import {
  focusEditor,
  someNode,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface AlignToolbarButtonProps extends ToolbarButtonProps {
  value: Alignment;
  pluginKey?: string;
}

export const AlignToolbarButton = ({
  id,
  value,
  pluginKey = KEY_ALIGN,
  ...props
}: AlignToolbarButtonProps) => {
  const editor = usePlateEditorState(useEventPlateId(id));

  const isLink =
    !!editor?.selection && someNode(editor, { match: { type: pluginKey } });

  return (
    <ToolbarButton
      aria-label="Align"
      active={isLink}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setAlign(editor, {
          value,
          key: pluginKey,
        });

        focusEditor(editor);
      }}
      {...props}
    />
  );
};
