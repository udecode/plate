export const iframeAppCode = `import React from 'react';
import { createPlateUI, Plate } from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { createEditableVoidPlugin } from './editable-voids/createEditableVoidPlugin';
import { EditableVoidElement } from './editable-voids/EditableVoidElement';
import { IFrame } from './iframe/IFrame';
import { iframeValue } from './iframe/iframeValue';
import { createMyPlugins } from './typescript/plateTypes';

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
  <IFrame>
    <Plate
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
