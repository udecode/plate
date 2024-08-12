'use client';

import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { Editor } from '@/registry/default/plate-ui/editor';

export default function EditorDisabled() {
  const editor = usePlateEditor();

  return (
    <div className="mt-[72px] p-10">
      <Plate editor={editor}>
        <Editor disabled placeholder="Type your message here." />
      </Plate>
    </div>
  );
}
