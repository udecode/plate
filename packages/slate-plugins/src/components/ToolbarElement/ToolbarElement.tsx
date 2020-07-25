import * as React from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { ToggleTypeEditor } from '../../common/plugins/toggle-type/withToggleType';
import { isNodeTypeIn } from '../../common/queries/index';
import { getPreventDefaultHandler } from '../../common/utils/index';
import { ToolbarButton } from '../ToolbarButton/index';
import { ToolbarElementProps } from './ToolbarElement.types';

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export const ToolbarElement = ({ type, ...props }: ToolbarElementProps) => {
  const editor = useSlate() as ReactEditor & ToggleTypeEditor;

  return (
    <ToolbarButton
      active={isNodeTypeIn(editor, type)}
      onMouseDown={getPreventDefaultHandler(editor.toggleType, type)}
      {...props}
    />
  );
};
