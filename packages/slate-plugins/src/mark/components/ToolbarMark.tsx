import * as React from 'react';
import { useSlate } from 'slate-react';
import { getPreventDefaultHandler } from '../../common/utils';
import { ToolbarButton } from '../../components/ToolbarButton';
import { isMarkActive } from '../queries';
import { toggleMark } from '../transforms';
import { ToolbarMarkProps } from './ToolbarMark.types';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export const ToolbarMark = ({ type, clear, ...props }: ToolbarMarkProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={isMarkActive(editor, type)}
      onMouseDown={getPreventDefaultHandler(toggleMark, editor, type, clear)}
      {...props}
    />
  );
};
