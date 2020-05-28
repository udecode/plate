import React from 'react';
import { isNodeInSelection } from 'common/queries';
import { getPreventDefaultHandler } from 'common/utils';
import { ToolbarElementProps } from 'element/components/ToolbarElement.types';
import { ToggleTypeEditor } from 'element/types';
import { ReactEditor, useSlate } from 'slate-react';
import { ToolbarButton } from 'components/ToolbarButton';

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export const ToolbarElement = ({ type, ...props }: ToolbarElementProps) => {
  const editor = useSlate() as ReactEditor & ToggleTypeEditor;

  return (
    <ToolbarButton
      active={isNodeInSelection(editor, type)}
      onMouseDown={getPreventDefaultHandler(editor.toggleType, type)}
      {...props}
    />
  );
};
