import React from 'react';
import { Plate } from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { createEditableVoidPlugin } from '@/plate/editable-voids/createEditableVoidPlugin';
import { EditableVoidElement } from '@/plate/editable-voids/EditableVoidElement';
import { editableVoidsValue } from '@/plate/editable-voids/editableVoidsValue';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createEditableVoidPlugin({
      component: EditableVoidElement,
    }),
  ],
  {
    components: plateUI,
  }
);

export default function EditableVoidsApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={editableVoidsValue}
    />
  );
}
