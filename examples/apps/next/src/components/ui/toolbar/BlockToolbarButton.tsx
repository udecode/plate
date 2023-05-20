import React from 'react';
import {
  focusEditor,
  someNode,
  toggleNodeType,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '../../../../../../../packages/ui/toolbar/src/ToolbarButton';

export interface BlockToolbarButtonProps extends ToolbarButtonProps {
  type: string;

  inactiveType?: string;
}

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export function BlockToolbarButton({
  id,
  type,
  inactiveType,
  active: _active,
  ...props
}: BlockToolbarButtonProps) {
  const editor = usePlateEditorState(useEventPlateId(id));
  const active =
    _active ?? (!!editor?.selection && someNode(editor, { match: { type } }));

  return (
    <ToolbarButton
      active={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleNodeType(editor, { activeType: type, inactiveType });
        focusEditor(editor);
      }}
      {...props}
    />
  );
}
