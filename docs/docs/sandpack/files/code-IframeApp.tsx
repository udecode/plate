export const iframeAppCode = `import React from 'react';
import { Plate } from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { createEditableVoidPlugin } from './editable-voids/createEditableVoidPlugin';
import { EditableVoidElement } from './editable-voids/EditableVoidElement';
import { IFrame } from './iframe/IFrame';
import { iframeValue } from './iframe/iframeValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

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

export default () => (
  <IFrame>
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={iframeValue}
    />
  </IFrame>
);
`;

export const iframeAppFile = {
  '/IframeApp.tsx': iframeAppCode,
};
