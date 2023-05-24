import React from 'react';
import { getPluginType, MARK_KBD } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { MarkToolbarButton } from '@/plate/toolbar/MarkToolbarButton';
import { useMyPlateEditorRef } from '@/plate/typescript/plateTypes';

export function KbdToolbarButton() {
  const editor = useMyPlateEditorRef();

  return (
    <MarkToolbarButton nodeType={getPluginType(editor, MARK_KBD)}>
      <Icons.kbd />
    </MarkToolbarButton>
  );
}
