import * as React from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { isNodeInSelection } from '../../common/queries';
import { getPreventDefaultHandler } from '../../common/utils';
import { ToolbarButton } from '../../components/ToolbarButton';
import { ToggleTypeEditor } from '../types';
import { ToolbarElementProps } from './ToolbarElement.types';

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
