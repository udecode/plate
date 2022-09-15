import React from 'react';
import { FormatIndentDecrease } from '@styled-icons/material/FormatIndentDecrease';
import { FormatIndentIncrease } from '@styled-icons/material/FormatIndentIncrease';
import { indent, outdent, ToolbarButton } from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

export const IndentToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ToolbarButton
        onMouseDown={(e) => {
          if (!editor) return;

          outdent(editor);
          e.preventDefault();
        }}
        icon={<FormatIndentDecrease />}
      />
      <ToolbarButton
        onMouseDown={(e) => {
          if (!editor) return;

          indent(editor);
          e.preventDefault();
        }}
        icon={<FormatIndentIncrease />}
      />
    </>
  );
};
