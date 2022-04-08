import React from 'react';
import { addComment, ELEMENT_COMMENT } from '@udecode/plate-comments';
import {
  getPluginType,
  someNode,
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export const AddCommentToolbarButton = withPlateEventProvider(
  ({ id, ...props }: ToolbarButtonProps) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

    const type = getPluginType(editor, ELEMENT_COMMENT);
    const isComment =
      !!editor?.selection && someNode(editor, { match: { type } });

    return (
      <ToolbarButton
        active={isComment}
        onMouseDown={async (event) => {
          if (!editor) return;

          event.preventDefault();
          addComment(editor);
        }}
        {...props}
      />
    );
  }
);
