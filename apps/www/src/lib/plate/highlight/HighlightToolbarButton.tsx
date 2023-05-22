import React from 'react';
import { getPluginType, MARK_HIGHLIGHT } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { MarkToolbarButton } from '@/plate/toolbar/MarkToolbarButton';
import { useMyPlateEditorRef } from '@/plate/typescript/plateTypes';

export function HighlightToolbarButton() {
  const editor = useMyPlateEditorRef();

  return (
    <MarkToolbarButton
      type={getPluginType(editor, MARK_HIGHLIGHT)}
      icon={<Icons.highlight />}
    />
  );
}
