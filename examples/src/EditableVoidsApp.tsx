import React from 'react';
import { Plate } from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { createEditableVoidPlugin } from './editable-voids/createEditableVoidPlugin';
import { EditableVoidElement } from './editable-voids/EditableVoidElement';
import { editableVoidsValue } from './editable-voids/editableVoidsValue';

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
