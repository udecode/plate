import React from 'react';
import { Alignment, KEY_ALIGN, setAlign } from '@udecode/plate-alignment';
import {
  getPreventDefaultHandler,
  isCollapsed,
  someNode,
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface AlignToolbarButtonProps extends ToolbarButtonProps {
  value: Alignment;
  pluginKey?: string;
}

export const AlignToolbarButton = withPlateEventProvider(
  ({ id, value, pluginKey = KEY_ALIGN, ...props }: AlignToolbarButtonProps) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

    return (
      <ToolbarButton
        active={
          isCollapsed(editor?.selection) &&
          someNode(editor!, { match: { [pluginKey]: value } })
        }
        onMouseDown={
          editor
            ? getPreventDefaultHandler(setAlign, editor, {
                value,
                key: pluginKey,
              })
            : undefined
        }
        {...props}
      />
    );
  }
);
