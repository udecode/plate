export const indentToolbarButtonsCode = `import React from 'react';
import { FormatIndentDecrease } from '@styled-icons/material/FormatIndentDecrease';
import { FormatIndentIncrease } from '@styled-icons/material/FormatIndentIncrease';
import { focusEditor, indent, outdent, ToolbarButton } from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

const tooltip = (content: string) => ({
  content,
});

export const IndentToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ToolbarButton
        tooltip={tooltip('Outdent')}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          outdent(editor);

          focusEditor(editor);
        }}
        icon={<FormatIndentDecrease />}
      />
      <ToolbarButton
        tooltip={tooltip('Indent')}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          indent(editor);
          focusEditor(editor);
        }}
        icon={<FormatIndentIncrease />}
      />
    </>
  );
};
`;

export const indentToolbarButtonsFile = {
  '/indent/IndentToolbarButtons.tsx': indentToolbarButtonsCode,
};
