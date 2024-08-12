import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks';
import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { editableProps } from '@/plate/demo/editableProps';
import { PlateUI } from '@/plate/demo/plate-ui';
import { iframeValue } from '@/plate/demo/values/iframeValue';
import { Editor } from '@/registry/default/plate-ui/editor';

import { EditableVoidPlugin } from './editable-voids-demo';

export function IFrame({ children, ...props }: any) {
  const [contentRef, setContentRef] = useState<any>(null);
  const mountNode = contentRef?.contentWindow?.document.body;

  return (
    // eslint-disable-next-line jsx-a11y/iframe-has-title
    <iframe {...props} ref={setContentRef}>
      {mountNode && createPortal(React.Children.only(children), mountNode)}
    </iframe>
  );
}

export default function IframeDemo() {
  const editor = usePlateEditor({
    override: { components: PlateUI },
    plugins: [BasicElementsPlugin, BasicMarksPlugin, EditableVoidPlugin],
    value: iframeValue,
  });

  return (
    <IFrame className="p-10">
      <Plate editor={editor}>
        <Editor {...editableProps} />
      </Plate>
    </IFrame>
  );
}
