import * as React from 'react';
import { useSlate } from 'slate-react';
import { someNode } from '../../../common/queries/someNode';
import { getPreventDefaultHandler } from '../../../common/utils/getPreventDefaultHandler';
import { ToolbarButton } from '../../../components/ToolbarButton/ToolbarButton';
import { ToolbarButtonProps } from '../../../components/ToolbarButton/ToolbarButton.types';
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
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
  unwrapTypes = [
    ELEMENT_ALIGN_LEFT,
    ELEMENT_ALIGN_CENTER,
    ELEMENT_ALIGN_RIGHT,
    ELEMENT_ALIGN_JUSTIFY,
  ],
  ...props
}: ToolbarAlignProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={!!type && someNode(editor, { match: { type } })}
      onMouseDown={getPreventDefaultHandler(upsertAlign, editor, {
        type,
        unwrapTypes,
      })}
      {...props}
    />
  );
};
