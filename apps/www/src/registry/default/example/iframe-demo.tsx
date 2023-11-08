import React, { useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { iframeValue } from '@/plate/demo/values/iframeValue';
import { Plate } from '@udecode/plate-common';
import { createPlugins } from '@udecode/plate-core';
import { createPortal } from 'react-dom';

import { Editor } from '@/registry/default/plate-ui/editor';

import {
  createEditableVoidPlugin,
  EditableVoidElement,
} from './editable-voids-demo';

const plugins = createPlugins(
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
    <IFrame className="p-10">
      <Plate plugins={plugins} initialValue={iframeValue}>
        <Editor {...editableProps} />
      </Plate>
    </IFrame>
  );
}
