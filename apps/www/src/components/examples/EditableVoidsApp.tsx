import React from 'react';
import { Plate } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { createEditableVoidPlugin } from '@/plate/demo/plugins/editable-voids/createEditableVoidPlugin';
import { EditableVoidElement } from '@/plate/demo/plugins/editable-voids/EditableVoidElement';
import { editableVoidsValue } from '@/plate/demo/values/editableVoidsValue';

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
