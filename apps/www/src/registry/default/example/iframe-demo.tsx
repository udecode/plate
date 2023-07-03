import React, { useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { iframeValue } from '@/plate/demo/values/iframeValue';
import { Plate } from '@udecode/plate-common';
import { createPortal } from 'react-dom';

import { MyValue, createMyPlugins } from '@/types/plate-types';

import {
  EditableVoidElement,
  createEditableVoidPlugin,
} from './editable-voids-demo';

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

export function IFrame({ children, ...props }: any) {
  const [contentRef, setContentRef] = useState<any>(null);
  const mountNode =
    contentRef &&
    contentRef.contentWindow &&
    contentRef.contentWindow.document.body;

  return (
    // eslint-disable-next-line jsx-a11y/iframe-has-title
    <iframe {...props} ref={setContentRef}>
      {mountNode && createPortal(React.Children.only(children), mountNode)}
    </iframe>
  );
}

export default function IframeDemo() {
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
