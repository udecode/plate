import * as React from 'react';
import {
  getPreventDefaultHandler,
  isNodeTypeIn,
} from '@udecode/slate-plugins-common';
import { useSlate } from 'slate-react';
import { ToolbarButton } from '../../../components/ToolbarButton/ToolbarButton';
import { ToolbarButtonProps } from '../../../components/ToolbarButton/ToolbarButton.types';
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
} from '../defaults';
import { upsertAlign } from '../transforms/upsertAlign';

export interface ToolbarAlignProps extends ToolbarButtonProps {
  type?: string;
  unwrapTypes?: string[];
}

export const ToolbarAlign = ({
  type,
  unwrapTypes = [ELEMENT_ALIGN_LEFT, ELEMENT_ALIGN_CENTER, ELEMENT_ALIGN_RIGHT],
  ...props
}: ToolbarAlignProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={!!type && isNodeTypeIn(editor, type)}
      onMouseDown={getPreventDefaultHandler(upsertAlign, editor, {
        type,
        unwrapTypes,
      })}
      {...props}
    />
  );
};
