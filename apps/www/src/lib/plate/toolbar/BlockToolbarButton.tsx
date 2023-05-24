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
} from '@/components/ui/toolbar-button';

export interface BlockToolbarButtonProps extends ToolbarButtonProps {
  nodeType: string;
  inactiveType?: string;
}

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export function BlockToolbarButton({
  id,
  nodeType,
  inactiveType,
  pressed: _pressed,
  ...props
}: BlockToolbarButtonProps) {
  const editor = usePlateEditorState(useEventPlateId(id));
  const pressed =
    _pressed ??
    (!!editor?.selection && someNode(editor, { match: { type: nodeType } }));

  return (
    <ToolbarButton
      pressed={pressed}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleNodeType(editor, { activeType: nodeType, inactiveType });
        focusEditor(editor);
      }}
      {...props}
    />
  );
}
