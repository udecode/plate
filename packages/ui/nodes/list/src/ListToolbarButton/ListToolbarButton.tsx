import React from 'react';
import {
  getPreventDefaultHandler,
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ELEMENT_UL, getListItemEntry, toggleList } from '@udecode/plate-list';
import {
  BlockToolbarButton,
  ToolbarButtonProps,
} from '@udecode/plate-ui-toolbar';

export const ListToolbarButton = withPlateEventProvider(
  ({
    id,
    type = ELEMENT_UL,
    ...props
  }: ToolbarButtonProps & { type?: string }) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

    const res = !!editor?.selection && getListItemEntry(editor);

    return (
      <BlockToolbarButton
        active={!!res && res.list[0].type === type}
        type={type}
        onMouseDown={
          editor &&
          getPreventDefaultHandler(toggleList, editor, {
            type,
          })
        }
        {...props}
      />
    );
  }
);
