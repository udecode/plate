import React from 'react';
import { createPlateUI, Plate } from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { createEditableVoidPlugin } from './editable-voids/createEditableVoidPlugin';
import { EditableVoidElement } from './editable-voids/EditableVoidElement';
import { editableVoidsValue } from './editable-voids/editableVoidsValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createEditableVoidPlugin({
      component: EditableVoidElement,
    }),
  ],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={editableVoidsValue}
  />
);
