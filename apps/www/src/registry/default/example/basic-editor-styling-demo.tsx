import React from 'react';

import { Plate, usePlateEditor } from '@udecode/plate-common';

import { Editor } from '@/registry/default/plate-ui/editor';

export default function BasicEditorStylingDemo() {
  const editor = usePlateEditor();

  return (
    <Plate editor={editor}>
      <Editor placeholder="Type..." />
    </Plate>
  );
}
