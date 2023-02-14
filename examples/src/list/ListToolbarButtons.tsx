import React from 'react';
import { FormatListBulleted } from '@styled-icons/material/FormatListBulleted';
import { FormatListNumbered } from '@styled-icons/material/FormatListNumbered';
import {
  ELEMENT_OL,
  ELEMENT_UL,
  getPluginType,
  ListToolbarButton,
} from '@udecode/plate';
import { useMyPlateEditorRef } from '../typescript/plateTypes';

export const ListToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <ListToolbarButton
        tooltip={{ content: 'Bullet List' }}
        type={getPluginType(editor, ELEMENT_UL)}
        icon={<FormatListBulleted />}
      />
      <ListToolbarButton
        tooltip={{ content: 'Ordered List' }}
        type={getPluginType(editor, ELEMENT_OL)}
        icon={<FormatListNumbered />}
      />
    </>
  );
};
