import React from 'react';
import {
  ELEMENT_OL,
  ELEMENT_UL,
  getPluginType,
  ListToolbarButton,
} from '@udecode/plate';

import { Icons } from '@/plate/common/icons';
import { useMyPlateEditorRef } from '@/plate/typescript/plateTypes';

const tooltip = (content: string) => ({
  content,
});

export function ListToolbarButtons() {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ListToolbarButton
        tooltip={tooltip('Bullet List')}
        type={getPluginType(editor, ELEMENT_UL)}
        icon={<Icons.ul />}
      />
      <ListToolbarButton
        tooltip={tooltip('Ordered List')}
        type={getPluginType(editor, ELEMENT_OL)}
        icon={<Icons.ol />}
      />
    </>
  );
}
