import React from 'react';

import { useEditorRef, useEditorSelector } from '@udecode/plate-core/react';
import { withRef } from '@udecode/react-utils';
import { focusEditor } from '@udecode/slate-react';
import { Redo2 } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export const RedoToolbarButton = withRef<typeof ToolbarButton>((props, ref) => {
  const editor = useEditorRef();
  const redoAble = useEditorSelector(
    (editor) => editor.history.redos.length > 0,
    []
  );

  return (
    <ToolbarButton
      ref={ref}
      disabled={!redoAble}
      onMouseDown={(e) => {
        e.preventDefault();
        editor.redo();
        focusEditor(editor);
      }}
      tooltip="Redo"
      {...props}
    >
      <Redo2 />
    </ToolbarButton>
  );
});
