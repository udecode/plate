import React from 'react';
import { focusEditor, indent, outdent } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMyPlateEditorRef } from '@/plate/typescript/plateTypes';

export function IndentToolbarButtons() {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ToolbarButton
        tooltip="Outdent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          outdent(editor);

          focusEditor(editor);
        }}
      >
        <Icons.outdent />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Indent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          indent(editor);
          focusEditor(editor);
        }}
      >
        <Icons.indent />
      </ToolbarButton>
    </>
  );
}
