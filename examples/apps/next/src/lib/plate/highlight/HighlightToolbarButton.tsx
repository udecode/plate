import React from 'react';
import {
  getPluginType,
  MARK_HIGHLIGHT,
  MarkToolbarButton,
} from '@udecode/plate';
import { Icons } from '../common/icons';
import { useMyPlateEditorRef } from '../../apps/next/src/lib/plate/typescript/plateTypes';

export function HighlightToolbarButton() {
  const editor = useMyPlateEditorRef();

  return (
    <MarkToolbarButton
      type={getPluginType(editor, MARK_HIGHLIGHT)}
      icon={<Icons.highlight />}
    />
  );
}
