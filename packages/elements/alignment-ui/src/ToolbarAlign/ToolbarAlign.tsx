import * as React from 'react';
import { KEYS_ALIGN, upsertAlign } from '@udecode/slate-plugins-alignment';
import {
  getPreventDefaultHandler,
  someNode,
} from '@udecode/slate-plugins-common';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@udecode/slate-plugins-toolbar';
import { useSlate } from 'slate-react';

export interface ToolbarAlignProps extends ToolbarButtonProps {
  type?: string;
  unwrapTypes?: string[];
}

export const ToolbarAlign = ({
  type,
  unwrapTypes = KEYS_ALIGN,
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
