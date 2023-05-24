import React from 'react';
import { focusEditor, indent, outdent } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { ToolbarButtonOld } from '@/plate/toolbar/ToolbarButtonOld';
import { useMyPlateEditorRef } from '@/plate/typescript/plateTypes';

const tooltip = (content: string) => ({
  content,
});

export function IndentToolbarButtons() {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ToolbarButtonOld
        tooltip={tooltip('Outdent')}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          outdent(editor);

          focusEditor(editor);
        }}
        icon={<Icons.outdent />}
      />
      <ToolbarButtonOld
        tooltip={tooltip('Indent')}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          indent(editor);
          focusEditor(editor);
        }}
        icon={<Icons.indent />}
      />
    </>
  );
}
