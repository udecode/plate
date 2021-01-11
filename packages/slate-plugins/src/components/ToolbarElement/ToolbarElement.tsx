import * as React from 'react';
import { useSlate } from 'slate-react';
import { hasNodeByType } from '../../common/queries/index';
import { toggleNodeType } from '../../common/transforms/toggleNodeType';
import { getPreventDefaultHandler } from '../../common/utils/index';
import { ToolbarButton } from '../ToolbarButton/index';
import { ToolbarElementProps } from './ToolbarElement.types';

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export const ToolbarElement = ({
  type,
  inactiveType,
  ...props
}: ToolbarElementProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={hasNodeByType(editor, type)}
      onMouseDown={getPreventDefaultHandler(toggleNodeType, editor, {
        activeType: type,
        inactiveType,
      })}
      {...props}
    />
  );
};
