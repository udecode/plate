import React from 'react';
import { FormatIndentDecrease } from '@styled-icons/material/FormatIndentDecrease';
import { FormatIndentIncrease } from '@styled-icons/material/FormatIndentIncrease';
import { indent, outdent, ToolbarButton } from '@udecode/plate';
import { focusEditor } from '@udecode/plate-core';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

export const IndentToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ToolbarButton
        aria-label="Indent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          outdent(editor);

          focusEditor(editor);
        }}
        icon={<FormatIndentDecrease />}
      />
      <ToolbarButton
        aria-label="Outdent"
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
