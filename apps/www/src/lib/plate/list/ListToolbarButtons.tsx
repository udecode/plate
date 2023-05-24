import React from 'react';
import { ELEMENT_OL, ELEMENT_UL, getPluginType } from '@udecode/plate';
import { ListToolbarButton } from './ListToolbarButton';

import { Icons } from '@/components/icons';
import { useMyPlateEditorRef } from '@/plate/typescript/plateTypes';

export function ListToolbarButtons() {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ListToolbarButton
        tooltip="Bullet List"
        nodeType={getPluginType(editor, ELEMENT_UL)}
      >
        <Icons.ul />
      </ListToolbarButton>
      <ListToolbarButton
        tooltip="Ordered List"
        nodeType={getPluginType(editor, ELEMENT_OL)}
      >
        <Icons.ol />
      </ListToolbarButton>
    </>
  );
}
