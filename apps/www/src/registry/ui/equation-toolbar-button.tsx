'use client';

import * as React from 'react';

import { insertInlineEquation } from '@udecode/plate-math';
import { useEditorRef } from '@udecode/plate/react';
import { RadicalIcon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function InlineEquationToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        insertInlineEquation(editor);
      }}
      tooltip="Mark as equation"
    >
      <RadicalIcon />
    </ToolbarButton>
  );
}
