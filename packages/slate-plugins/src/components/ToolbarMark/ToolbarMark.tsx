import * as React from 'react';
import { useSlate } from 'slate-react';
import { isMarkActive } from '../../common/queries/isMarkActive';
import { toggleMark } from '../../common/transforms/toggleMark';
import { getPreventDefaultHandler } from '../../common/utils/index';
import { ToolbarButton } from '../ToolbarButton/index';
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
