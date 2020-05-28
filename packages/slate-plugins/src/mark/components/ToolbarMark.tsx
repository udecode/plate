import React from 'react';
import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';
import { ToolbarMarkProps } from 'mark/components/ToolbarMark.types';
import { useSlate } from 'slate-react';
import { ToolbarButton } from 'components/ToolbarButton';
import { isMarkActive } from '../queries';
import { toggleMark } from '../transforms';

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
