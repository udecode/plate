import React from 'react';
import { getPluginType, MARK_KBD, MarkToolbarButton } from '@udecode/plate';
import { Icons } from '../common/icons';
import { useMyPlateEditorRef } from '../../apps/next/src/lib/plate/typescript/plateTypes';

export function KbdToolbarButton() {
  const editor = useMyPlateEditorRef();

  return (
    <MarkToolbarButton
      type={getPluginType(editor, MARK_KBD)}
      icon={<Icons.kbd />}
    />
  );
}
