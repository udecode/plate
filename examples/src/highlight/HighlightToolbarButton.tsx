import React from 'react';
import { Highlight } from '@styled-icons/boxicons-regular/Highlight';
import {
  getPluginType,
  MARK_HIGHLIGHT,
  MarkToolbarButton,
} from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

export function HighlightToolbarButton() {
  const editor = useMyPlateEditorRef();

  return (
    <MarkToolbarButton
      type={getPluginType(editor, MARK_HIGHLIGHT)}
      icon={<Highlight />}
    />
  );
}
