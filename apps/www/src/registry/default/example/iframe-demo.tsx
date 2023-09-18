import React, { useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { iframeValue } from '@/plate/demo/values/iframeValue';
import { Plate, PlateContent } from '@udecode/plate-common';
import { createPortal } from 'react-dom';

import { createMyPlugins, MyValue } from '@/types/plate-types';

import {
  createEditableVoidPlugin,
  EditableVoidElement,
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
      <Plate<MyValue> plugins={plugins} initialValue={iframeValue}>
        <PlateContent {...editableProps} />
      </Plate>
    </IFrame>
  );
}
