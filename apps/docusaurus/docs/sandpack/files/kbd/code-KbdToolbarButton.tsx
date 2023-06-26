export const kbdToolbarButtonCode = `import React from 'react';
import { Keyboard } from '@styled-icons/material/Keyboard';
import { getPluginType, MARK_KBD, MarkToolbarButton } from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

export const KbdToolbarButton = () => {
  const editor = useMyPlateEditorRef();

  return (
    <MarkToolbarButton
      type={getPluginType(editor, MARK_KBD)}
      icon={<Keyboard />}
    />
  );
};
`;

export const kbdToolbarButtonFile = {
  '/kbd/KbdToolbarButton.tsx': kbdToolbarButtonCode,
};
