import * as React from 'react';
import {
  Alignment,
  KEYS_ALIGN,
  setAlign,
  upsertAlign,
} from '@udecode/plate-alignment';
import { getPreventDefaultHandler, someNode } from '@udecode/plate-common';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface ToolbarAlignProps extends ToolbarButtonProps {
  align: Alignment;
}

export const ToolbarAlign = ({
  align,
  unwrapTypes = KEYS_ALIGN,
  ...props
}: ToolbarAlignProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  return (
    <ToolbarButton
      // active={
      //   !!editor?.selection && !!type && someNode(editor, { match: { type } })
      // }
      onMouseDown={
        editor
          ? getPreventDefaultHandler(setAlign, editor, {
              align,

              // type,
              // unwrapTypes,
            })
          : undefined
      }
      {...props}
    />
  );
};
