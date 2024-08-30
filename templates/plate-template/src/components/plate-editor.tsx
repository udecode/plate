'use client';

import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { Editor } from '@/components/plate-ui/editor';

export function PlateEditor() {
  const editor = usePlateEditor({
    id: 'plate-editor',
    plugins: [],
    value: [
      {
        id: '1',
        type: 'p',
        children: [{ text: '' }],
      },
    ],
  });

  return (
    <Plate editor={editor}>
      <Editor placeholder="Type your message here." />
    </Plate>
  );
}
