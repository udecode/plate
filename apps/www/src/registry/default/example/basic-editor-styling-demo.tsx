import React from 'react';
import { Plate } from '@udecode/plate-common';

import { Editor } from '@/registry/default/plate-ui/editor';

export default function BasicEditorStylingDemo() {
  return (
    <Plate>
      <Editor placeholder="Type..." />
    </Plate>
  );
}
