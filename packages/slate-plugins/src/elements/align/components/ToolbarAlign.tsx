import * as React from 'react';
import { useSlate } from 'slate-react';
import { isNodeTypeIn } from '../../../common/queries/isNodeTypeIn';
import { getPreventDefaultHandler } from '../../../common/utils/getPreventDefaultHandler';
import { ToolbarButton } from '../../../components/ToolbarButton/ToolbarButton';
import { ToolbarButtonProps } from '../../../components/ToolbarButton/ToolbarButton.types';
import { upsertAlign } from '../transforms/upsertAlign';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from '../types';

export interface ToolbarAlignProps extends ToolbarButtonProps {
  type?: string;
  unwrapTypes?: string[];
}

export const ToolbarAlign = ({
  type,
  unwrapTypes = [ALIGN_LEFT, ALIGN_CENTER, ALIGN_RIGHT],
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
