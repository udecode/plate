'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { Plate } from '@udecode/plate-common/react';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { iframeValue } from '@/registry/default/example/values/iframe-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

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
  const editor = useCreateEditor({
    plugins: [...editorPlugins, EditableVoidPlugin],
    value: iframeValue,
  });

  return (
    <IFrame className="size-full h-[500px]">
      <Plate editor={editor}>
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </Plate>
    </IFrame>
  );
}
