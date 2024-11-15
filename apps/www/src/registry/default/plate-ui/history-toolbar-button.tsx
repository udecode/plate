import React from 'react';

import { useEditorRef, useEditorSelector } from '@udecode/plate-core/react';
import { withRef } from '@udecode/react-utils';
import { focusEditor } from '@udecode/slate-react';
import { Redo2Icon, Undo2Icon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export const RedoToolbarButton = withRef<typeof ToolbarButton>((props, ref) => {
  const editor = useEditorRef();
  const disabled = useEditorSelector(
    (editor) => editor.history.redos.length === 0,
    []
  );

  return (
    <ToolbarButton
      ref={ref}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        editor.redo();
        focusEditor(editor);
      }}
      tooltip="Redo"
      {...props}
    >
      <Redo2Icon />
    </ToolbarButton>
  );
});

export const UndoToolbarButton = withRef<typeof ToolbarButton>((props, ref) => {
  const editor = useEditorRef();
  const disabled = useEditorSelector(
    (editor) => editor.history.undos.length === 0,
    []
  );

  return (
    <ToolbarButton
      ref={ref}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        editor.undo();
        focusEditor(editor);
      }}
      tooltip="Undo"
      {...props}
    >
      <Undo2Icon />
    </ToolbarButton>
  );
});
