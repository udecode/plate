import React from 'react';

import { useEditorRef, useEditorSelector } from '@udecode/plate-core/react';
import { withRef } from '@udecode/react-utils';
import { focusEditor } from '@udecode/slate-react';
import { Undo2 } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export const UndoToolbarButton = withRef<typeof ToolbarButton>((props, ref) => {
  const editor = useEditorRef();
  const undoAble = useEditorSelector(
    (editor) => editor.history.undos.length > 0,
    []
  );

  return (
    <ToolbarButton
      ref={ref}
      disabled={!undoAble}
      onMouseDown={(e) => {
        e.preventDefault();
        editor.undo();
        focusEditor(editor);
      }}
      tooltip="Undo"
      {...props}
    >
      <Undo2 />
    </ToolbarButton>
  );
});
