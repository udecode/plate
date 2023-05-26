import React from 'react';
import { Plate } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { IFrame } from '@/plate/demo/iframe/IFrame';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { createEditableVoidPlugin } from '@/plate/demo/plugins/editable-voids/createEditableVoidPlugin';
import { EditableVoidElement } from '@/plate/demo/plugins/editable-voids/EditableVoidElement';
import { iframeValue } from '@/plate/demo/values/iframeValue';

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

export default function IframeApp() {
  return (
    <IFrame>
      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={iframeValue}
      />
    </IFrame>
  );
}
