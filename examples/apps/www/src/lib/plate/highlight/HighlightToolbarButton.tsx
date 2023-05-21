import React from 'react';
import {
  getPluginType,
  MARK_HIGHLIGHT,
  MarkToolbarButton,
} from '@udecode/plate';

import { Icons } from '@/plate/common/icons';
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
