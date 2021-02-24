import * as React from 'react';
import {
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  ELEMENT_ALIGN_RIGHT,
  getPreventDefaultHandler,
  someNode,
  upsertAlign,
} from '@udecode/slate-plugins';
import { useSlate } from 'slate-react';
import { ToolbarButton } from '../ToolbarButton/ToolbarButton';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

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
